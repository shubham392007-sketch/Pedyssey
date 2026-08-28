import logging
import math
from typing import List, Optional
import torch
from sentence_transformers import CrossEncoder
from core.config import settings

logger = logging.getLogger(__name__)


class RerankingService:
    def __init__(self):
        self._model: Optional[CrossEncoder] = None
        self._model_name = settings.RERANKER_MODEL
        self._device = self._get_device()
        
    def _get_device(self) -> str:
        if torch.cuda.is_available():
            return "cuda"
        elif torch.backends.mps.is_available():
            return "mps"
        return "cpu"
    
    def _load_model(self):
        """Lazy load cross-encoder."""
        if self._model is None:
            logger.info(f"Loading reranker model {self._model_name} on {self._device}...")
            self._model = CrossEncoder(self._model_name, device=self._device)
            logger.info("Reranker model loaded successfully.")
    
    def rerank(self, query: str, chunks: List[dict], top_k: int = 5) -> List[dict]:
        """Create (query, chunk_text) pairs, score with cross-encoder, normalize with sigmoid, sort descending.
        Return top_k chunks with reranker_score added."""
        if not chunks:
            return []
            
        self._load_model()
        
        pairs = [[query, chunk.get('text', '')] for chunk in chunks]
        scores = self._model.predict(pairs)
        
        for chunk, score in zip(chunks, scores):
            raw_val = float(score)
            chunk['raw_reranker_score'] = raw_val
            # Sigmoid normalization for MS-MARCO CrossEncoder logits (-12 to +12)
            try:
                sigmoid_val = 1.0 / (1.0 + math.exp(-raw_val))
            except OverflowError:
                sigmoid_val = 0.0 if raw_val < 0 else 1.0
            chunk['reranker_score'] = float(sigmoid_val)
            
        reranked_chunks = sorted(chunks, key=lambda x: x['reranker_score'], reverse=True)
        return reranked_chunks[:top_k]
    
    def is_loaded(self) -> bool:
        return self._model is not None
