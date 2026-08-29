import logging
from dataclasses import dataclass
from typing import List, Tuple, Optional
from core.config import settings
from core.constants import ConfidenceLevel, AnswerCategory

logger = logging.getLogger(__name__)

OVERVIEW_KEYWORDS = [
    "topic", "conclusion", "summar", "overview", "main point", "key point",
    "about", "what is this", "explain this", "takeaway", "findings", "objective",
    "purpose", "abstract", "describe this", "what does this", "what are the",
    "notes", "quiz", "flashcard", "compare", "table", "definition", "equation"
]


@dataclass
class ConfidenceEvaluation:
    score: float
    level: ConfidenceLevel
    category: AnswerCategory
    should_generate: bool
    is_unrelated: bool


class ConfidenceService:
    def __init__(self, threshold: float = None):
        self.threshold = threshold if threshold is not None else 0.05
    
    def evaluate_detailed(
        self, 
        reranked_chunks: List[dict], 
        query: Optional[str] = None
    ) -> ConfidenceEvaluation:
        """Perform multi-signal confidence assessment and classify into Category A/B/C/D.
        
        - Category A (High Confidence): Direct answer present in PDF.
        - Category B (Medium Confidence): Partial information in PDF + supplementary context.
        - Category C (Low Confidence / On-topic): Not explicitly in PDF, general domain explanation.
        - Category D (Low Confidence / Unrelated): Completely off-topic question, reject cleanly.
        """
        if not reranked_chunks:
            return ConfidenceEvaluation(
                score=0.0,
                level=ConfidenceLevel.LOW,
                category=AnswerCategory.CATEGORY_D,
                should_generate=False,
                is_unrelated=True
            )
            
        is_overview = False
        if query:
            q_lower = query.lower()
            if any(k in q_lower for k in OVERVIEW_KEYWORDS):
                is_overview = True

        # 1. Summary / Overview queries on active documents
        if is_overview:
            return ConfidenceEvaluation(
                score=0.95,
                level=ConfidenceLevel.HIGH,
                category=AnswerCategory.CATEGORY_A,
                should_generate=True,
                is_unrelated=False
            )
                
        # 2. Weighted average of top chunk scores (0.0 to 1.0)
        top_n = min(3, len(reranked_chunks))
        weights = [0.6, 0.3, 0.1][:top_n]
        weight_sum = sum(weights)
        weights = [w / weight_sum for w in weights]
        
        confidence_score = 0.0
        for i in range(top_n):
            score = reranked_chunks[i].get('reranker_score', 0.0)
            confidence_score += score * weights[i]
            
        # Top candidate raw logit
        top_raw = reranked_chunks[0].get('raw_reranker_score', -12.0)
        logger.info(f"Evaluating query intent: top_raw={top_raw:.2f}, conf_score={confidence_score:.6f}")
        
        # 3. Categorization logic
        # If top raw score is strongly negative (< -8.5) and not overview -> Category D (Unrelated)
        if top_raw < -8.5:
            logger.info(f"Top raw score {top_raw:.2f} < -8.5 -> Category D (Unrelated)")
            return ConfidenceEvaluation(
                score=confidence_score,
                level=ConfidenceLevel.LOW,
                category=AnswerCategory.CATEGORY_D,
                should_generate=False,
                is_unrelated=True
            )
            
        # Category A: High Confidence (raw score >= -0.5 or confidence >= 0.55)
        if top_raw >= -0.5 or confidence_score >= 0.55:
            return ConfidenceEvaluation(
                score=max(confidence_score, 0.85),
                level=ConfidenceLevel.HIGH,
                category=AnswerCategory.CATEGORY_A,
                should_generate=True,
                is_unrelated=False
            )
            
        # Category B: Medium Confidence (partial in PDF, raw score between -5.0 and -0.5)
        if top_raw >= -5.0 or confidence_score >= 0.15:
            return ConfidenceEvaluation(
                score=max(confidence_score, 0.55),
                level=ConfidenceLevel.MEDIUM,
                category=AnswerCategory.CATEGORY_B,
                should_generate=True,
                is_unrelated=False
            )
            
        # Category C: Low Confidence on-topic (-8.5 <= top_raw < -5.0)
        return ConfidenceEvaluation(
            score=confidence_score,
            level=ConfidenceLevel.LOW,
            category=AnswerCategory.CATEGORY_C,
            should_generate=True,
            is_unrelated=False
        )

    def evaluate(self, reranked_chunks: List[dict], query: Optional[str] = None) -> Tuple[float, bool]:
        """Legacy helper returning (score, should_generate)."""
        res = self.evaluate_detailed(reranked_chunks, query)
        return res.score, res.should_generate
