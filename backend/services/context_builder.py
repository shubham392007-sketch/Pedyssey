import logging
from typing import List, Dict
from core.constants import SYSTEM_PROMPT

logger = logging.getLogger(__name__)

class ContextBuilder:
    def build_context(self, chunks: List[dict]) -> str:
        """Format evidence chunks into structured context for LLM.
        Format:
        [Source ID: S1]
        Document: {filename}
        Pages: {page_start}-{page_end}
        Section: {section}
        
        Content:
        {text}
        
        Separate system instructions from document content clearly."""
        
        if not chunks:
            return "No relevant context found."
            
        context_parts = []
        for i, chunk in enumerate(chunks, 1):
            filename = chunk.get('filename', 'Unknown Document')
            page_start = chunk.get('page_start', '?')
            page_end = chunk.get('page_end', '?')
            section = chunk.get('section', 'Main')
            text = chunk.get('text', '').strip()
            
            part = f"""[Source ID: S{i}]
Document: {filename}
Pages: {page_start}-{page_end}
Section: {section}

Content:
{text}
"""
            context_parts.append(part)
            
        return "\n".join(context_parts)
    
    def build_prompt(self, question: str, context: str) -> List[Dict[str, str]]:
        """Build messages list: [{role: system, content: SYSTEM_PROMPT}, 
        {role: user, content: context + question}]."""
        
        user_content = f"""Context Information:
---------------------
{context}
---------------------

Question: {question}

Please answer the question based strictly on the provided context."""

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content}
        ]
        return messages
