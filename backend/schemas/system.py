from typing import Optional, Dict
from pydantic import BaseModel, ConfigDict

class ComponentStatus(BaseModel):
    name: str
    status: str  # "ready" | "loading" | "error" | "offline"
    detail: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class SystemStatusResponse(BaseModel):
    backend: ComponentStatus
    database: ComponentStatus
    vector_store: ComponentStatus
    embedding_model: ComponentStatus
    reranker: ComponentStatus
    ollama: ComponentStatus
    llm_model: ComponentStatus
    offline_mode: bool

    model_config = ConfigDict(from_attributes=True)

class ModelInfo(BaseModel):
    name: str
    status: str
    dimension: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class ModelsResponse(BaseModel):
    embedding: ModelInfo
    reranker: ModelInfo
    llm: ModelInfo

    model_config = ConfigDict(from_attributes=True)

class SettingsRequest(BaseModel):
    embedding_model: Optional[str] = None
    reranker_model: Optional[str] = None
    llm_model: Optional[str] = None
    chunk_size: Optional[int] = None
    chunk_overlap: Optional[int] = None
    theme: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class SettingsResponse(BaseModel):
    settings: Dict[str, str]

    model_config = ConfigDict(from_attributes=True)
