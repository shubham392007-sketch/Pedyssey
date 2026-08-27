import re
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class PageContent:
    page_num: int
    text: str
    section: str | None = None

@dataclass  
class DocumentStructure:
    title: str | None
    sections: list[dict]  # [{heading, start_page, end_page, level}]
    pages: list[PageContent]

class DocumentParser:
    HEADING_PATTERNS = [
        r'^\d+\.\s+\w+',           # "1. Introduction"
        r'^\d+\.\d+\.?\s+\w+',     # "1.1 Background" 
        r'^[A-Z][A-Z\s]{3,}$',       # "METHODOLOGY"
        r'^Chapter\s+\d+',           # "Chapter 1"
        r'^CHAPTER\s+\d+',           # "CHAPTER 1"
        r'^\d+\.\d+\.\d+\.?\s+\w+', # "1.1.1 Details"
    ]
    
    def parse(self, page_texts: list[dict]) -> DocumentStructure:
        pages = []
        all_headings = []
        title = None
        
        for p_info in page_texts:
            page_num = p_info.get("page_num", 0)
            text = p_info.get("text", "")
            
            # Simple title heuristic from first page
            if page_num == 1 and not title:
                lines = [l.strip() for l in text.split('\n') if l.strip()]
                if lines:
                    title = lines[0]
            
            headings = self.detect_headings(text)
            for h in headings:
                h["start_page"] = page_num
                all_headings.append(h)
                
            pages.append(PageContent(page_num=page_num, text=text))
            
        sections = []
        for i, h in enumerate(all_headings):
            end_page = all_headings[i+1]["start_page"] if i + 1 < len(all_headings) else pages[-1].page_num if pages else h["start_page"]
            sections.append({
                "heading": h["text"],
                "start_page": h["start_page"],
                "end_page": end_page,
                "level": h["level"]
            })
            
        pages = self.assign_sections(pages, sections)
        
        return DocumentStructure(title=title, sections=sections, pages=pages)
    
    def detect_headings(self, text: str) -> list[dict]:
        headings = []
        lines = text.split('\n')
        
        for i, line in enumerate(lines):
            stripped = line.strip()
            if not stripped:
                continue
                
            for pattern in self.HEADING_PATTERNS:
                if re.match(pattern, stripped):
                    # Determine a simple level heuristic
                    level = 1
                    if stripped.isupper() and not re.match(r'^CHAPTER', stripped):
                        level = 2
                    elif stripped.count('.') > 1:
                        level = stripped.count('.') + 1
                        
                    headings.append({
                        "text": stripped,
                        "level": level,
                        "line_index": i
                    })
                    break
        return headings
    
    def assign_sections(self, pages: list[PageContent], sections: list[dict]) -> list[PageContent]:
        if not sections:
            return pages
            
        for page in pages:
            current_section = None
            for sec in sections:
                if sec["start_page"] <= page.page_num <= sec["end_page"]:
                    current_section = sec["heading"]
                    # If multiple sections cover this page, we'll keep the last matching one
            page.section = current_section
            
        return pages
