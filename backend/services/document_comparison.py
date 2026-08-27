import logging
from typing import List, Dict
from core.constants import SYSTEM_PROMPT

logger = logging.getLogger(__name__)

class DocumentComparisonService:
    def is_comparison_query(self, question: str) -> bool:
        """Detect if query involves comparison (contains 'compare', 'difference', 'similar', etc.)"""
        keywords = ['compare', 'comparison', 'difference', 'differences', 
                    'similar', 'similarities', 'versus', 'vs', 'better than']
        q_lower = question.lower()
        return any(keyword in q_lower for keyword in keywords)
    
    def build_comparison_prompt(self, question: str, context: str, 
                                 doc_names: List[str]) -> List[Dict[str, str]]:
        """Build specialized comparison prompt that instructs LLM to structure
        answer as a comparison across the named documents."""
        
        docs_str = ", ".join(doc_names)
        
        user_content = f"""Context Information from documents ({docs_str}):
---------------------
{context}
---------------------

Question: {question}

Please provide a detailed comparison based strictly on the provided context. 
Structure your answer to highlight similarities and differences between the documents where applicable.
Ensure you cite the sources accurately."""

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content}
        ]
        return messages
