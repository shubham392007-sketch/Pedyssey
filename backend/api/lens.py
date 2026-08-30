import uuid
import json
import logging
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.database import get_db, async_session_factory
from database.models import ChatSession, ChatMessage
from schemas.lens import LensRequest
from core.constants import MessageRole
from services import retrieval_service, reranking_service, confidence_service, context_builder, ollama_service, citation_service
from services.lens_service import LensService

router = APIRouter(prefix="/lens", tags=["lens"])
logger = logging.getLogger(__name__)

# Initialize lens_service at module level
lens_service = LensService(
    retrieval=retrieval_service,
    reranker=reranking_service,
    confidence=confidence_service,
    context_builder=context_builder,
    llm=ollama_service,
    citation=citation_service,
)

@router.post("/action")
async def action(request: LensRequest, db: AsyncSession = Depends(get_db)):
    """Server-Sent Events streaming lens endpoint."""
    session_id = request.session_id or str(uuid.uuid4())
    
    try:
        res = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
        session = res.scalars().first()
        if not session:
            title_text = request.selected_text[:40] if request.selected_text else "Lens Action"
            session = ChatSession(id=session_id, title=title_text)
            db.add(session)
            await db.commit()
            
        action_label, _ = lens_service.get_action_instruction(request.lens_action, request.target_language)
        page_str = f"p.{request.selected_page}" if request.selected_page else "Unknown"
        user_msg_content = f'[Lens · {action_label} · {page_str}] "{request.selected_text[:100]}..."'
        if request.question:
            user_msg_content += f'\n\nFollow-up: {request.question}'
            
        user_msg = ChatMessage(
            id=str(uuid.uuid4()),
            session_id=session_id,
            role=MessageRole.USER,
            content=user_msg_content,
        )
        db.add(user_msg)
        await db.commit()
    except Exception as e:
        logger.warning(f"Could not persist initial user chat session/message: {e}")

    async def sse_event_generator():
        accumulated_answer = []
        captured_citations = []

        try:
            async for raw_chunk in lens_service.action_stream(
                selected_text=request.selected_text,
                selected_page=request.selected_page,
                lens_action=request.lens_action,
                question=request.question,
                document_ids=request.document_ids,
                session_id=session_id,
                mode=request.mode,
                target_language=request.target_language,
            ):
                try:
                    payload = json.loads(raw_chunk.strip())
                    event_type = payload.get("event")
                    event_data = payload.get("data")
                    
                    if event_type == "token" and event_data:
                        accumulated_answer.append(event_data)
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
