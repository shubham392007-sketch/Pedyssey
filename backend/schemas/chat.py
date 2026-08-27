from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class CitationSchema(BaseModel):
    document_id: str
    filename: str
    page_start: int
    page_end: int
    chunk_id: str
    text_preview: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ChatRequest(BaseModel):
    question: str
    document_ids: List[str]
    session_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ChatResponse(BaseModel):
    answer: str
    confidence: float
    citations: List[CitationSchema]
    session_id: str
    message_id: str

    model_config = ConfigDict(from_attributes=True)

class ChatSessionResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int

    model_config = ConfigDict(from_attributes=True)

class ChatMessageResponse(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    citations: Optional[List[CitationSchema]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ChatHistoryResponse(BaseModel):
    session: ChatSessionResponse
    messages: List[ChatMessageResponse]

    model_config = ConfigDict(from_attributes=True)
