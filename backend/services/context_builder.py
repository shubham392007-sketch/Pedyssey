import logging
from typing import List, Dict, Optional
from core.constants import SYSTEM_PROMPT, AnswerCategory, ConfidenceLevel

logger = logging.getLogger(__name__)


class ContextBuilder:
    def build_context(self, chunks: List[dict]) -> str:
        """Format evidence chunks into structured context with delimiters for Ollama.
        
        Example format (Section 18):
        SOURCE 1
        Document: research.pdf
        Pages: 42-43
        Chunk ID: doc_001_chunk_143

        [retrieved text]

        --------------------------------

        SOURCE 2
        Document: research.pdf
        Pages: 50-51
        Chunk ID: doc_001_chunk_159

        [retrieved text]
        """
        if not chunks:
            return "No relevant document context found."
            
        context_parts = []
        for i, chunk in enumerate(chunks, 1):
            filename = chunk.get('filename', 'document.pdf')
            page_start = chunk.get('page_start', 1)
            page_end = chunk.get('page_end', page_start)
            chunk_id = chunk.get('chunk_id', f'chunk_{i}')
            
            pages_str = f"{page_start}" if page_start == page_end else f"{page_start}-{page_end}"
            text = chunk.get('text', '').strip()
            
            part = f"""SOURCE {i}
Document: {filename}
Pages: {pages_str}
Chunk ID: {chunk_id}

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
                "2. State explicitly: 'The uploaded documents do not contain sufficient information to answer this question directly.'\n"
                "3. Follow with: 'Additional Context:' and provide a helpful, factual explanation."
            )
        else:
            # Category A: Fully in PDF
            category_instruction = (
                "Instructions:\n"
                "1. Answer the user's question directly, clearly, and accurately based strictly on the retrieved document context across all referenced pages.\n"
                "2. Structure your response with clean markdown (headings, bullet points, bold key terms, or structured sections).\n"
                "3. Maintain high answer quality comparable to a research assistant. Avoid circular repetition."
            )

        user_content = f"""Retrieved Document Context:
========================================
{context}
========================================

USER QUESTION:
{question}

{category_instruction}"""

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content}
        ]
        return messages
