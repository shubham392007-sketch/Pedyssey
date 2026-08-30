from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class LensRequest(BaseModel):
    """Request schema for Pedyssey Lens selection-aware actions."""
    selected_text: str
    selected_page: Optional[int] = None
    lens_action: str = "ask"  # ask, explain, analyze, verify, compare, find_evidence, summarize, translate, create_notes
    question: Optional[str] = None  # Optional follow-up for 'ask' action
    document_ids: Optional[List[str]] = None
    session_id: Optional[str] = None
    mode: Optional[str] = "quick"
    target_language: Optional[str] = "hindi"

    model_config = ConfigDict(from_attributes=True)
