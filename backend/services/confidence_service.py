import logging
from typing import List, Tuple
from core.config import settings

logger = logging.getLogger(__name__)

class ConfidenceService:
    def __init__(self, threshold: float = None):
        self.threshold = threshold if threshold is not None else settings.CONFIDENCE_THRESHOLD
    
    def evaluate(self, reranked_chunks: List[dict]) -> Tuple[float, bool]:
        """Calculate confidence from reranker scores.
        confidence = weighted average of top chunk scores.
        Returns (confidence_score, should_generate). 
        should_generate = confidence >= threshold."""
        if not reranked_chunks:
            return 0.0, False
            
        # simple weighted average of top 3 chunks or all if less
        top_n = min(3, len(reranked_chunks))
        weights = [0.6, 0.3, 0.1][:top_n]
        # Normalize weights if less than 3 chunks
        weight_sum = sum(weights)
        weights = [w/weight_sum for w in weights]
        
        confidence_score = 0.0
        for i in range(top_n):
            # Using reranker score which can be arbitrary based on model, 
            # ideally normalized through a sigmoid if needed, assuming it's roughly 0-1 for standard CE
            score = reranked_chunks[i].get('reranker_score', 0.0)
            confidence_score += score * weights[i]
            
        should_generate = confidence_score >= self.threshold
        logger.info(f"Confidence score: {confidence_score:.4f}, Threshold: {self.threshold}, Generate: {should_generate}")
        
        return confidence_score, should_generate
