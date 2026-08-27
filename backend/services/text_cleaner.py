import re
import logging
from collections import Counter

logger = logging.getLogger(__name__)

class TextCleaner:
    def clean(self, text: str, page_texts: list[str] | None = None) -> str:
        cleaned = self.normalize_unicode(text)
        cleaned = self.clean_extraction_artifacts(cleaned)
        
        if page_texts:
            headers, footers = self.detect_headers_footers(page_texts)
            cleaned = self.remove_headers_footers(cleaned, headers, footers)
            
        cleaned = self.repair_line_breaks(cleaned)
        cleaned = self.normalize_whitespace(cleaned)
        return cleaned.strip()
    
    def normalize_whitespace(self, text: str) -> str:
        # Normalize line endings
        text = text.replace('\r\n', '\n').replace('\r', '\n')
        # Replace multiple spaces/tabs with a single space, but preserve double newlines
        text = re.sub(r'[ \t]+', ' ', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text
    
    def repair_line_breaks(self, text: str) -> str:
        # Fix hyphenated words split across lines
        text = re.sub(r'(\w+)-\n(\w+)', r'\1\2', text)
        
        # Join lines that don't end with sentence-ending punctuation
        lines = text.split('\n')
        repaired = []
        for i, line in enumerate(lines):
            stripped = line.strip()
            if not stripped:
                repaired.append('')
                continue
                
            if i < len(lines) - 1 and lines[i+1].strip():
                # If it doesn't end with punctuation that normally ends a sentence or heading
                if not re.search(r'[.!?:]$', stripped) and not stripped.isupper():
                    repaired.append(stripped + ' ')
                else:
                    repaired.append(stripped + '\n')
            else:
                repaired.append(stripped + '\n')
                
        return ''.join(repaired).replace(' \n', '\n')
    
    def detect_headers_footers(self, page_texts: list[str]) -> tuple[set[str], set[str]]:
        if not page_texts or len(page_texts) < 3:
            return set(), set()
            
        first_lines = []
        last_lines = []
        
        for p_text in page_texts:
            lines = [l.strip() for l in p_text.split('\n') if l.strip()]
            if lines:
                first_lines.append(lines[0])
                last_lines.append(lines[-1])
                
        header_counts = Counter(first_lines)
        footer_counts = Counter(last_lines)
        
        threshold = len(page_texts) * 0.5
        
        headers = {line for line, count in header_counts.items() if count > threshold}
        footers = {line for line, count in footer_counts.items() if count > threshold}
        
        return headers, footers
    
    def remove_headers_footers(self, text: str, headers: set[str], footers: set[str]) -> str:
        lines = text.split('\n')
        if not lines:
            return text
            
        # Check first non-empty line
        start_idx = 0
        for i, line in enumerate(lines):
            if line.strip():
                if line.strip() in headers:
                    start_idx = i + 1
                break
                
        # Check last non-empty line
        end_idx = len(lines)
        for i in range(len(lines) - 1, -1, -1):
            if lines[i].strip():
                if lines[i].strip() in footers:
                    end_idx = i
                break
                
        return '\n'.join(lines[start_idx:end_idx])
    
    def normalize_unicode(self, text: str) -> str:
        # Replace common ligatures
        ligatures = {
            'ﬁ': 'fi', 'ﬂ': 'fl', 'ﬀ': 'ff', 'ﬃ': 'ffi', 'ﬄ': 'ffl'
        }
        for lig, rep in ligatures.items():
            text = text.replace(lig, rep)
            
        # Smart quotes
        text = re.sub(r'[“”]', '"', text)
        text = re.sub(r'[‘’]', "'", text)
        
        # Dashes
        text = re.sub(r'[–—]', '-', text)
        
        return text
    
    def clean_extraction_artifacts(self, text: str) -> str:
        # Remove null bytes, form feeds, vertical tabs
        text = re.sub(r'[\x00\x0B\x0C]', '', text)
        # Remove other unprintable characters but keep newlines, tabs
        text = re.sub(r'[^\x09\x0A\x0D\x20-\x7E\x85\xA0-\uD7FF\uE000-\uFDCF\uFDE0-\uFFFD]', '', text)
        return text
