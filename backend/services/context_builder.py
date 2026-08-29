import logging
from typing import List, Dict, Optional
from core.constants import SYSTEM_PROMPT, AnswerCategory, ConfidenceLevel

logger = logging.getLogger(__name__)


class ContextBuilder:
    def build_context(self, chunks: List[dict]) -> str:
        """Format evidence chunks into structured context with delimiters for Ollama.
        
        Example format:
        SOURCE 1
        Document: Transformer_Notes.pdf
        Pages: 12-14

        [Text]

        --------------------------------

        SOURCE 2
        Document: AI_Research.pdf
        Pages: 20-21

        [Text]
        """
        if not chunks:
            return "No relevant document context found."
            
        context_parts = []
        for i, chunk in enumerate(chunks, 1):
            filename = chunk.get('filename', 'document.pdf')
            page_start = chunk.get('page_start', 1)
            page_end = chunk.get('page_end', page_start)
            
            pages_str = f"{page_start}" if page_start == page_end else f"{page_start}-{page_end}"
            text = chunk.get('text', '').strip()
            
            part = f"""SOURCE {i}
Document: {filename}
Pages: {pages_str}

{text}"""
            context_parts.append(part)
            
        return "\n\n--------------------------------\n\n".join(context_parts)
    
    def build_prompt(
        self, 
        question: str, 
        context: str, 
        category: AnswerCategory = AnswerCategory.CATEGORY_A,
        confidence_level: ConfidenceLevel = ConfidenceLevel.HIGH
    ) -> List[Dict[str, str]]:
        """Build chat messages list for Ollama with category-tailored instructions."""
        
        if category == AnswerCategory.CATEGORY_B:
            category_instruction = (
                "Instructions:\n"
                "1. Answer using the information available in the retrieved document context as your primary ground truth.\n"
                "2. Provide any supplementary conceptual background clearly separated under the heading 'Additional Context:'.\n"
                "3. Never claim supplementary background exists in the PDF."
            )
        elif category == AnswerCategory.CATEGORY_C:
            category_instruction = (
                "Instructions:\n"
                "1. The exact answer is not explicitly available in the retrieved excerpts, though the subject is related to the document domain.\n"
                "2. State explicitly: 'This information is not explicitly available in the uploaded documents.'\n"
                "3. Follow with: 'Based on general knowledge related to the document topic:' and provide a helpful, factual explanation."
            )
        else:
            # Category A: Fully in PDF
            category_instruction = (
                "Instructions:\n"
                "1. Answer the user's question directly, clearly, and accurately based strictly on the retrieved document context.\n"
                "2. Structure your response with clean markdown (bullet points, bold key terms, or structured sections).\n"
                "3. Maintain high answer quality comparable to a research assistant. Avoid circular repetition."
            )

        user_content = f"""Retrieved Document Context:
========================================
{context}
========================================

Question:
{question}

{category_instruction}"""

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content}
        ]
        return messages
