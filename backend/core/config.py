import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "Pedyssey"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    HOST: str = "127.0.0.1"
    PORT: int = 8001
    
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    DOCUMENTS_DIR: Path = DATA_DIR / "documents"
    PROCESSED_DIR: Path = DATA_DIR / "processed"
    INDEXES_DIR: Path = DATA_DIR / "indexes"
    DATABASE_DIR: Path = DATA_DIR / "database"
    LOGS_DIR: Path = DATA_DIR / "logs"
    
    @property
    def DATABASE_URL(self) -> str:
        return f"sqlite+aiosqlite:///{self.DATABASE_DIR}/pedyssey.db"
    
    MODELS_DIR: Path = BASE_DIR / "models"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    EMBEDDING_DIMENSION: int = 384
    EMBEDDING_BATCH_SIZE: int = 32
    RERANKER_MODEL: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"
    
    # Ollama Local LLM Configuration
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "qwen3:8b"
    OLLAMA_TIMEOUT: int = 300
    OLLAMA_NUM_CTX: int = 16384
    OLLAMA_NUM_PREDICT: int = 4096
    
    # Optional alias for backward compatibility
    @property
    def LLM_MODEL(self) -> str:
        return self.OLLAMA_MODEL

    LLM_TEMPERATURE: float = 0.2
    LLM_TOP_P: float = 0.9
    CHUNK_TARGET_SIZE: int = 500
    CHUNK_OVERLAP: int = 100
    CHUNK_MIN_SIZE: int = 100
    CHUNK_MAX_SIZE: int = 700
    RETRIEVAL_TOP_K: int = 25
    RERANK_TOP_K: int = 8
    RRF_K: int = 60
    CONFIDENCE_THRESHOLD: float = 0.3
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    MAX_PAGE_COUNT: int = 500
    OCR_DPI: int = 300
    OCR_ENGINE: str = "tesseract"
    TEXT_QUALITY_THRESHOLD: float = 0.3
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8001", "http://127.0.0.1:8001"]

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parent.parent / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    def ensure_directories(self) -> None:
        self.DATA_DIR.mkdir(parents=True, exist_ok=True)
        self.DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)
        self.PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
        self.INDEXES_DIR.mkdir(parents=True, exist_ok=True)
        self.DATABASE_DIR.mkdir(parents=True, exist_ok=True)
        self.LOGS_DIR.mkdir(parents=True, exist_ok=True)
        self.MODELS_DIR.mkdir(parents=True, exist_ok=True)

settings = Settings()
settings.ensure_directories()
