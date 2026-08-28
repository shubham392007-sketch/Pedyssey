import logging
from typing import List, Tuple, Optional
from core.config import settings

logger = logging.getLogger(__name__)

OVERVIEW_KEYWORDS = [
    "topic", "conclusion", "summar", "overview", "main point", "key point",
    "about", "what is this", "explain this", "takeaway", "findings", "objective",
    "purpose", "abstract", "describe this", "what does this", "what are the"
]


class ConfidenceService:
    def __init__(self, threshold: float = None):
        self.threshold = threshold if threshold is not None else 0.05
    
    def evaluate(self, reranked_chunks: List[dict], query: Optional[str] = None) -> Tuple[float, bool]:
        """Calculate confidence from reranker scores and query intent.
        Returns (confidence_score, should_generate)."""
        if not reranked_chunks:
            return 0.0, False
            
        # 1. Summary / Overview queries on active documents should always generate
        if query:
            q_lower = query.lower()
            if any(k in q_lower for k in OVERVIEW_KEYWORDS):
                return 0.95, True
                
        # 2. Weighted average of top chunk scores
        top_n = min(3, len(reranked_chunks))
        weights = [0.6, 0.3, 0.1][:top_n]
        weight_sum = sum(weights)
        weights = [w / weight_sum for w in weights]
        
        confidence_score = 0.0
        for i in range(top_n):
            score = reranked_chunks[i].get('reranker_score', 0.0)
            confidence_score += score * weights[i]
            
        # 3. Check top candidate raw logit
        top_raw = reranked_chunks[0].get('raw_reranker_score', 0.0)
        
        # If top raw score is extremely negative (< -11.5) and not an overview query,
        # it indicates zero relevance to the document text (e.g. asking cookie recipes on physics notes).
        should_generate = (top_raw > -11.5) or (confidence_score >= self.threshold)
        logger.info(f"Confidence score: {confidence_score:.4f} (raw top: {top_raw:.2f}), Generate: {should_generate}")
        
        return confidence_score, should_generate
