import uuid
import json
import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from database.database import get_db, async_session_factory
from database.models import ChatSession, ChatMessage
from schemas.chat import (
    ChatRequest, ChatResponse, ChatHistoryResponse,
    ChatSessionResponse, ChatMessageResponse, CitationSchema,
)
from core.constants import MessageRole
from services import rag_service

router = APIRouter(prefix="/chat", tags=["chat"])
logger = logging.getLogger(__name__)


@router.post("/", response_model=ChatResponse)
@router.post("/ask-sync", response_model=ChatResponse)
async def chat_sync(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    """Synchronous chat endpoint that executes full RAG pipeline and returns answer with citations."""
    session_id = request.session_id or str(uuid.uuid4())
    
    # Ensure chat session exists
    res = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
    session = res.scalars().first()
    if not session:
        session = ChatSession(id=session_id, title=request.question[:40] if request.question else "New Conversation")
        db.add(session)
        await db.commit()
        
    user_msg_id = str(uuid.uuid4())
    user_msg = ChatMessage(
        id=user_msg_id,
        session_id=session_id,
        role=MessageRole.USER,
        content=request.question,
    )
    db.add(user_msg)
    await db.commit()
    
    try:
        rag_result = await rag_service.answer(
            question=request.question,
            document_ids=request.document_ids,
            session_id=session_id,
        )
        answer = rag_result.get("answer", "")
        confidence = float(rag_result.get("confidence", 0.0))
        raw_citations = rag_result.get("citations", [])
    except Exception as e:
        logger.error(f"RAG error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")
        
    assistant_msg_id = str(uuid.uuid4())
    assistant_msg = ChatMessage(
        id=assistant_msg_id,
        session_id=session_id,
        role=MessageRole.ASSISTANT,
        content=answer,
        citations_json=json.dumps(raw_citations),
    )
    db.add(assistant_msg)
    await db.commit()
    
    citation_objs = [CitationSchema.model_validate(c) for c in raw_citations]
    
    return ChatResponse(
        answer=answer,
        confidence=confidence,
        confidence_level=rag_result.get("confidence_level"),
        category=rag_result.get("category"),
        citations=citation_objs,
        session_id=session_id,
        message_id=assistant_msg_id,
    )


@router.post("/ask")
@router.post("/stream")
async def chat_stream(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    """Server-Sent Events streaming chat endpoint.
    Yields events: retrieving, reranking, generating, token, citations, complete, [DONE].
    Saves complete conversation to SQLite asynchronously."""
    session_id = request.session_id or str(uuid.uuid4())
    
    # Ensure chat session exists
    res = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
    session = res.scalars().first()
    if not session:
        session = ChatSession(id=session_id, title=request.question[:40] if request.question else "New Conversation")
        db.add(session)
        await db.commit()
        
    user_msg_id = str(uuid.uuid4())
    user_msg = ChatMessage(
        id=user_msg_id,
        session_id=session_id,
        role=MessageRole.USER,
        content=request.question,
    )
    db.add(user_msg)
    await db.commit()

    async def sse_event_generator():
        accumulated_answer = []
        captured_citations = []

        try:
            async for raw_chunk in rag_service.answer_stream(
                question=request.question,
                document_ids=request.document_ids,
                session_id=session_id,
            ):
                # raw_chunk is a json line or SSE line from rag_service
                # Parse to extract event and payload
                try:
                    payload = json.loads(raw_chunk.strip())
                    event_type = payload.get("event")
                    event_data = payload.get("data")
                    
                    if event_type == "token" and event_data:
                        accumulated_answer.append(event_data)
                        # Format as SSE for frontend
                        yield f"data: {json.dumps({'content': event_data, 'event': 'token'})}\n\n"
                    elif event_type == "citations" and event_data:
                        captured_citations = event_data
                        yield f"data: {json.dumps({'citations': event_data, 'event': 'citations'})}\n\n"
                    else:
                        yield f"data: {json.dumps(payload)}\n\n"
                except Exception:
                    yield f"data: {json.dumps({'content': raw_chunk, 'event': 'token'})}\n\n"
                    accumulated_answer.append(raw_chunk)

            # Persist assistant response to database
            final_text = "".join(accumulated_answer)
            async with async_session_factory() as save_db:
                assistant_msg = ChatMessage(
                    id=str(uuid.uuid4()),
                    session_id=session_id,
                    role=MessageRole.ASSISTANT,
                    content=final_text,
                    citations_json=json.dumps(captured_citations) if captured_citations else None,
                )
                save_db.add(assistant_msg)
                await save_db.commit()

            yield "data: [DONE]\n\n"
        except Exception as e:
            logger.error(f"Stream error: {e}", exc_info=True)
            yield f"data: {json.dumps({'error': str(e), 'event': 'error'})}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        sse_event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
        }
    )


@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessageResponse])
@router.get("/{session_id}/messages", response_model=List[ChatMessageResponse])
async def get_messages(session_id: str, db: AsyncSession = Depends(get_db)):
    """Get all messages for a given session."""
    res = await db.execute(
        select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc())
    )
    messages = res.scalars().all()
    out = []
    for m in messages:
        c_list = []
        if m.citations_json:
            try:
                c_raw = json.loads(m.citations_json)
                c_list = [CitationSchema.model_validate(c) for c in c_raw]
            except Exception:
                pass
        out.append(ChatMessageResponse(
            id=m.id,
            session_id=m.session_id,
            role=m.role,
            content=m.content,
            citations=c_list if c_list else None,
            created_at=m.created_at,
        ))
    return out


@router.get("/{session_id}", response_model=ChatHistoryResponse)
async def get_history(session_id: str, db: AsyncSession = Depends(get_db)):
    """Get full chat history with session header and all messages."""
    s_res = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
    session = s_res.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    res = await db.execute(
        select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc())
    )
    messages = res.scalars().all()
    
    msg_responses = []
    for m in messages:
        c_list = []
        if m.citations_json:
            try:
                c_raw = json.loads(m.citations_json)
                c_list = [CitationSchema.model_validate(c) for c in c_raw]
            except Exception:
                pass
        msg_responses.append(ChatMessageResponse(
            id=m.id,
            session_id=m.session_id,
            role=m.role,
            content=m.content,
            citations=c_list if c_list else None,
            created_at=m.created_at,
        ))

    session_resp = ChatSessionResponse(
        id=session.id,
        title=session.title,
        created_at=session.created_at,
        updated_at=session.updated_at,
        message_count=len(messages),
    )
    return ChatHistoryResponse(
        session=session_resp,
        messages=msg_responses,
    )


@router.delete("/sessions/{session_id}")
@router.delete("/{session_id}")
async def delete_session(session_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a chat session and all its messages."""
    s_res = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
    session = s_res.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    await db.execute(delete(ChatMessage).where(ChatMessage.session_id == session_id))
    await db.delete(session)
    await db.commit()
    
    return {"message": f"Chat session {session_id} deleted successfully."}
