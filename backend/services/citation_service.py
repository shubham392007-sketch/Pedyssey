import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

class CitationService:
    def build_citations(self, evidence_chunks: List[dict]) -> List[dict]:
        """Build citation objects from evidence chunks.
        Deduplicate by (document_id, page_start, page_end).
        Return [{document_id, filename, page_start, page_end, chunk_id, text_preview}]
        where text_preview is first 100 chars of chunk text."""
        
        citations = []
        seen = set()
        
        for chunk in evidence_chunks:
            doc_id = chunk.get('document_id')
            page_start = chunk.get('page_start')
            page_end = chunk.get('page_end')
            
            key = (doc_id, page_start, page_end)
            if key not in seen:
                seen.add(key)
                text = chunk.get('text', '')
                preview = text[:100] + "..." if len(text) > 100 else text
                
                citations.append({
                    "document_id": doc_id,
                    "filename": chunk.get('filename', 'Unknown Document'),
                    "page_start": page_start,
                    "page_end": page_end,
                    "chunk_id": chunk.get('chunk_id'),
                    "text_preview": preview
                })
                
        return citations
    
    def format_citations_text(self, citations: List[dict]) -> str:
        """Format citations as numbered text:
        [1] filename.pdf - Page X
        [2] filename.pdf - Pages X-Y"""
        
        lines = []
        for i, cit in enumerate(citations, 1):
            filename = cit.get('filename', 'Unknown')
            p_start = cit.get('page_start')
            p_end = cit.get('page_end')
            
            if p_start == p_end:
                lines.append(f"[{i}] {filename} - Page {p_start}")
            else:
                lines.append(f"[{i}] {filename} - Pages {p_start}-{p_end}")
                
        return "\n".join(lines)
