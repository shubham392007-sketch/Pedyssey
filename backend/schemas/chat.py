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
    document_ids: Optional[List[str]] = None
    session_id: Optional[str] = None
    stream: Optional[bool] = True
    mode: Optional[str] = "quick"  # quick, think, deep_research, study, research, explain, compare, analyze, verify
    action: Optional[str] = None  # summarize, quiz, flashcards, tutor, extract, review, write, translate
    explain_level: Optional[str] = "technical"  # beginner, intermediate, technical, expert
    target_language: Optional[str] = "hindi"
    quiz_config: Optional[dict] = None
    custom_payload: Optional[dict] = None

    model_config = ConfigDict(from_attributes=True)


class ChatResponse(BaseModel):
    answer: str
    confidence: float
    confidence_level: Optional[str] = None
    category: Optional[str] = None
    citations: List[CitationSchema]
    session_id: str
    message_id: str
    mode: Optional[str] = "quick"
    action: Optional[str] = None
    explain_level: Optional[str] = None
    duration_seconds: Optional[float] = None
    evidence_quality: Optional[str] = None  # STRONG EVIDENCE, MODERATE EVIDENCE, LIMITED EVIDENCE, INSUFFICIENT EVIDENCE
    follow_ups: Optional[List[str]] = None
    structured_data: Optional[dict] = None

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
    confidence: Optional[float] = None
    confidence_level: Optional[str] = None
    category: Optional[str] = None
    citations: Optional[List[CitationSchema]] = None
    mode: Optional[str] = "quick"
    action: Optional[str] = None
    explain_level: Optional[str] = None
    duration_seconds: Optional[float] = None
    evidence_quality: Optional[str] = None
    follow_ups: Optional[List[str]] = None
    structured_data: Optional[dict] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChatHistoryResponse(BaseModel):
    session: ChatSessionResponse
    messages: List[ChatMessageResponse]

    model_config = ConfigDict(from_attributes=True)
