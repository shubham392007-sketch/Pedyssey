import logging
from typing import List, Dict
from core.constants import SYSTEM_PROMPT

logger = logging.getLogger(__name__)


class ContextBuilder:
    def build_context(self, chunks: List[dict]) -> str:
        """Format evidence chunks into structured context for Ollama.
        
        Example format:
        SOURCE 1
        Document: research.pdf
        Pages: 10-11

        [retrieved text]
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
            
        return "\n\n".join(context_parts)
    
    def build_prompt(self, question: str, context: str) -> List[Dict[str, str]]:
        """Build chat messages list for Ollama."""
        user_content = f"""Retrieved Document Context:
========================================
{context}
========================================

User Question: {question}

Instructions: Answer the user's question directly, clearly, and in a well-structured format (using bullet points or concise sections) based strictly on the provided context. Avoid repetition."""

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content}
        ]
        return messages
