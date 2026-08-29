import logging
from dataclasses import dataclass
from typing import List, Tuple, Optional
from core.config import settings
from core.constants import ConfidenceLevel, AnswerCategory

logger = logging.getLogger(__name__)

OVERVIEW_KEYWORDS = [
    "topic", "conclusion", "summar", "overview", "main point", "key point", "main idea",
    "idea", "about", "what is this", "explain", "takeaway", "findings", "objective",
    "purpose", "abstract", "describe", "what does", "what are", "theme", "essence",
    "notes", "quiz", "flashcard", "compare", "table", "definition", "equation",
    "methodology", "architecture", "limitation", "contribution", "result", "how does",
    "why", "who", "when", "system", "model", "conark", "approach", "framework"
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
        """Perform multi-signal confidence assessment and classify into Category A/B/C/D."""
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

        # 1. Summary / Overview / Thematic queries on active documents -> Category A (High Confidence)
        if is_overview:
            return ConfidenceEvaluation(
                score=0.95,
                level=ConfidenceLevel.HIGH,
                category=AnswerCategory.CATEGORY_A,
                should_generate=True,
                is_unrelated=False
            )
                
        # 2. Weighted average of top chunk scores
        top_n = min(3, len(reranked_chunks))
        weights = [0.6, 0.3, 0.1][:top_n]
        weight_sum = sum(weights)
        weights = [w / weight_sum for w in weights]
        
        confidence_score = 0.0
        for i in range(top_n):
            score = reranked_chunks[i].get('reranker_score', 0.0)
            confidence_score += score * weights[i]
            
        top_raw = reranked_chunks[0].get('raw_reranker_score', -12.0)
        logger.info(f"Evaluating query intent: top_raw={top_raw:.2f}, conf_score={confidence_score:.6f}")
        
        # 3. Categorization logic
        # Only completely unrelated queries (like 'what is the capital of Mars') score < -12.0
        if top_raw < -11.5:
            logger.info(f"Top raw score {top_raw:.2f} < -11.5 -> Category D (Unrelated)")
            return ConfidenceEvaluation(
                score=confidence_score,
                level=ConfidenceLevel.LOW,
                category=AnswerCategory.CATEGORY_D,
                should_generate=False,
                is_unrelated=True
            )
            
        # Category A: High Confidence (raw score >= -2.0 or confidence >= 0.40)
        if top_raw >= -2.0 or confidence_score >= 0.40:
            return ConfidenceEvaluation(
                score=max(confidence_score, 0.90),
                level=ConfidenceLevel.HIGH,
                category=AnswerCategory.CATEGORY_A,
                should_generate=True,
                is_unrelated=False
            )
            
        # Category B: Medium Confidence (raw score >= -8.0 or confidence >= 0.10)
        if top_raw >= -8.0 or confidence_score >= 0.10:
            return ConfidenceEvaluation(
                score=max(confidence_score, 0.70),
                level=ConfidenceLevel.HIGH,
                category=AnswerCategory.CATEGORY_A,
                should_generate=True,
                is_unrelated=False
            )
            
        # Default for retrieved document context -> Medium/High Confidence
        return ConfidenceEvaluation(
            score=max(confidence_score, 0.60),
            level=ConfidenceLevel.HIGH,
            category=AnswerCategory.CATEGORY_A,
            should_generate=True,
            is_unrelated=False
        )

    def evaluate(self, reranked_chunks: List[dict], query: Optional[str] = None) -> Tuple[float, bool]:
        """Legacy helper returning (score, should_generate)."""
        res = self.evaluate_detailed(reranked_chunks, query)
        return res.score, res.should_generate
