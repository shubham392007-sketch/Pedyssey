import logging
from typing import List, Optional
import numpy as np
import torch
from sentence_transformers import SentenceTransformer
from core.config import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self._model: Optional[SentenceTransformer] = None
        self._model_name = settings.EMBEDDING_MODEL
        self._device = self._get_device()
    
    def _get_device(self) -> str:
        if torch.cuda.is_available():
            return "cuda"
        elif torch.backends.mps.is_available():
            return "mps"
        return "cpu"

    def _load_model(self):
        """Lazy load SentenceTransformer. Auto-detect device (cuda > mps > cpu)."""
        if self._model is None:
            logger.info(f"Loading embedding model {self._model_name} on {self._device}...")
            self._model = SentenceTransformer(self._model_name, device=self._device)
            logger.info("Embedding model loaded successfully.")

    def encode(self, texts: List[str], batch_size: int = 32, show_progress: bool = False) -> np.ndarray:
        """Encode texts into embeddings. Returns numpy array of shape (n, dim)."""
        self._load_model()
        return self._model.encode(texts, batch_size=batch_size, show_progress_bar=show_progress, convert_to_numpy=True)

    def encode_query(self, query: str) -> np.ndarray:
        """Encode a single query. Returns 1D array."""
        self._load_model()
        return self._model.encode([query], convert_to_numpy=True)[0]

    def get_dimension(self) -> int:
        return settings.EMBEDDING_DIMENSION

    def get_model_name(self) -> str:
        return self._model_name

    def is_loaded(self) -> bool:
        return self._model is not None
