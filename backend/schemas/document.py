from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    status: str

    model_config = ConfigDict(from_attributes=True)

class DocumentResponse(BaseModel):
    id: str
    filename: str
    file_path: str
    file_size: int
    page_count: int
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    processed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int

    model_config = ConfigDict(from_attributes=True)

class ProcessingStatusResponse(BaseModel):
    document_id: str
    status: str
    current_stage: Optional[str] = None
    current_page: Optional[int] = None
    total_pages: Optional[int] = None
    progress: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)
