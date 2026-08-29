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
            
            part = f"""=== CONTEXT EXCERPT {i} (from {filename}, Pages: {pages_str}) ===
{text}"""
            context_parts.append(part)
            
        return "\n\n--------------------------------\n\n".join(context_parts)
    
    def build_prompt(
        self, 
        question: str, 
        context: str, 
        category: AnswerCategory = AnswerCategory.CATEGORY_A,
        confidence_level: ConfidenceLevel = ConfidenceLevel.HIGH,
        mode: str = "quick",
        action: Optional[str] = None,
        explain_level: Optional[str] = None,
        target_language: Optional[str] = None,
        quiz_config: Optional[dict] = None
    ) -> List[Dict[str, str]]:
        """Build chat messages list for Ollama with structured document-grounded instructions tailored by response mode."""
        from services.mode_service import ModeService

        mode_specific_guidance = ModeService.get_mode_prompt_instruction(
            mode=mode,
            action=action,
            explain_level=explain_level,
            target_language=target_language,
            quiz_config=quiz_config
        )

        category_instruction = f"""INSTRUCTIONS FOR YOUR ANSWER:
1. Answer the user's question directly, clearly, and authoritatively using the retrieved document context as your primary source.
2. Synthesize information across all relevant pages (e.g., Pages 1–14). Cite page numbers in parentheses (e.g., Page 1, Page 3, Pages 4–7) whenever referencing findings, architectures, methods, or results.
3. If the user asks for the main idea, summary, overview, limitations, methodology, or key points, synthesize the core thesis, contributions, and findings of the document thoroughly.
4. ACADEMIC REFERENCES & CITATIONS: When the user asks about references, bibliography, or cited authors ([1], [2], [3]... [8]), find the 'REFERENCES' or bibliography list printed inside the document text. Extract every cited reference entry verbatim including all author names, full paper titles, journal/conference names, volume/issue numbers, and publication years. Do NOT confuse CONTEXT EXCERPT numbers with the document's internal academic references.
5. TABULAR OUTPUT FORMATTING: When presenting comparisons, summaries, or structured data in a table, ALWAYS use valid GitHub Flavored Markdown table syntax. Put each table row on its own separate line with matching column delimiters (e.g. `| Col 1 | Col 2 |\\n|---|---|\\n| Val 1 | Val 2 |`). Never merge multiple rows onto a single line.
6. Structure your response with clean Markdown: start with a direct executive summary/main finding, followed by structured sections with descriptive headings (###), bold terms, and bulleted breakdowns.
7. Maintain absolute factual fidelity to the uploaded document.

{mode_specific_guidance}"""

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
