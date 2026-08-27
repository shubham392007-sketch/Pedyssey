import logging
from dataclasses import dataclass, field
import re

from core.config import settings
from utils.text_utils import count_tokens, split_into_sentences

logger = logging.getLogger(__name__)

@dataclass
class TextChunk:
    chunk_id: str
    document_id: str
    chunk_index: int
    text: str
    page_start: int
    page_end: int
    section: str | None
    token_count: int

class ChunkingService:
    def __init__(self, target_size: int = None, overlap: int = None, 
                 min_size: int = None, max_size: int = None):
        self.target_size = target_size or getattr(settings, 'CHUNK_TARGET_SIZE', 500)
        self.overlap = overlap or getattr(settings, 'CHUNK_OVERLAP', 100)
        self.min_size = min_size or getattr(settings, 'CHUNK_MIN_SIZE', 100)
        self.max_size = max_size or getattr(settings, 'CHUNK_MAX_SIZE', 700)
    
    def chunk_document(self, document_id: str, pages: list[dict]) -> list[TextChunk]:
        raw_chunks = []
        current_chunk_text = ""
        current_pages = set()
        current_section = None
        
        # Group by sections or paragraphs
        for page in pages:
            page_num = page.get("page_num", 0)
            text = page.get("text", "")
            section = page.get("section")
            
            paragraphs = self._split_into_paragraphs(text)
            
            for para in paragraphs:
                para = para.strip()
                if not para:
                    continue
                    
                para_tokens = count_tokens(para)
                current_tokens = count_tokens(current_chunk_text) if current_chunk_text else 0
                
                # If paragraph itself is too large, split it
                if para_tokens > self.max_size:
                    if current_chunk_text:
                        raw_chunks.append({
                            "text": current_chunk_text,
                            "pages": set(current_pages),
                            "section": current_section
                        })
                        current_chunk_text = ""
                        current_pages = set()
                        
                    split_paras = self._split_large_chunk(para)
                    for sp in split_paras:
                        raw_chunks.append({
                            "text": sp,
                            "pages": {page_num},
                            "section": section
                        })
                    continue

                if current_tokens + para_tokens > self.target_size:
                    raw_chunks.append({
                        "text": current_chunk_text,
                        "pages": set(current_pages),
                        "section": current_section
                    })
                    current_chunk_text = para
                    current_pages = {page_num}
                    current_section = section
                else:
                    if current_chunk_text:
                        current_chunk_text += "\n\n" + para
                    else:
                        current_chunk_text = para
                        current_section = section
                    current_pages.add(page_num)
                    
        if current_chunk_text:
            raw_chunks.append({
                "text": current_chunk_text,
                "pages": set(current_pages),
                "section": current_section
            })
            
        merged_raw = self._merge_small_chunks(raw_chunks)
        overlapped_raw = self._add_overlap(merged_raw)
        
        final_chunks = []
        for i, chunk_info in enumerate(overlapped_raw):
            final_chunks.append(TextChunk(
                chunk_id=f"{document_id}_chunk_{i:04d}",
                document_id=document_id,
                chunk_index=i,
                text=chunk_info["text"],
                page_start=min(chunk_info["pages"]) if chunk_info["pages"] else 0,
                page_end=max(chunk_info["pages"]) if chunk_info["pages"] else 0,
                section=chunk_info["section"],
                token_count=count_tokens(chunk_info["text"])
            ))
            
        return final_chunks
    
    def _split_into_paragraphs(self, text: str) -> list[str]:
        return re.split(r'\n{2,}', text)
    
    def _merge_small_chunks(self, chunks: list[dict]) -> list[dict]:
        merged = []
        i = 0
        while i < len(chunks):
            current = chunks[i]
            tokens = count_tokens(current["text"])
            
            if tokens < self.min_size and i < len(chunks) - 1:
                next_chunk = chunks[i+1]
                # Try to merge with next
                combined_tokens = tokens + count_tokens(next_chunk["text"])
                if combined_tokens <= self.max_size:
                    current["text"] += "\n\n" + next_chunk["text"]
                    current["pages"].update(next_chunk["pages"])
                    i += 1  # Skip next chunk
                    
            merged.append(current)
            i += 1
            
        return merged
    
    def _split_large_chunk(self, text: str) -> list[str]:
        sentences = split_into_sentences(text)
        splits = []
        current_split = ""
        
        for sentence in sentences:
            sentence_tokens = count_tokens(sentence)
            current_tokens = count_tokens(current_split) if current_split else 0
            
            if current_tokens + sentence_tokens > self.target_size:
                if current_split:
                    splits.append(current_split.strip())
                current_split = sentence
            else:
                if current_split:
                    current_split += " " + sentence
                else:
                    current_split = sentence
                    
        if current_split:
            splits.append(current_split.strip())
            
        return splits
    
    def _add_overlap(self, chunks: list[dict]) -> list[dict]:
        if not chunks:
            return chunks
            
        overlapped = [chunks[0]]
        
        for i in range(1, len(chunks)):
            prev_text = chunks[i-1]["text"]
            curr = chunks[i]
            
            # Extract overlap from end of previous chunk
            sentences = split_into_sentences(prev_text)
            overlap_text = ""
            overlap_tokens = 0
            
            for s in reversed(sentences):
                s_tokens = count_tokens(s)
                if overlap_tokens + s_tokens > self.overlap:
                    break
                overlap_text = s + " " + overlap_text
                overlap_tokens += s_tokens
                
            overlap_text = overlap_text.strip()
            if overlap_text:
                curr["text"] = overlap_text + "\n\n" + curr["text"]
                curr["pages"].update(chunks[i-1]["pages"])
                
            overlapped.append(curr)
            
        return overlapped
