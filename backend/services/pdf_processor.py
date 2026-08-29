import logging
from pathlib import Path
import pymupdf as fitz
from PIL import Image

from core.config import settings
from services.ocr_service import OCRService

logger = logging.getLogger(__name__)

class PDFProcessor:
    def __init__(self):
        self.ocr_service = OCRService()

    def validate_pdf(self, file_path: Path) -> tuple[bool, str | None]:
        try:
            if not file_path.exists():
                return False, "File does not exist."
            
            # Check file size
            if hasattr(settings, 'MAX_FILE_SIZE') and file_path.stat().st_size > settings.MAX_FILE_SIZE:
                return False, "File exceeds maximum allowed size."

            doc = fitz.open(str(file_path))
            if doc.needs_pass:
                return False, "PDF is password protected."
            
            if hasattr(settings, 'MAX_PAGE_COUNT') and doc.page_count > settings.MAX_PAGE_COUNT:
                return False, "PDF exceeds maximum allowed page count."
                
            doc.close()
            return True, None
        except fitz.FileDataError as e:
            logger.error(f"File data error: {e}")
            return False, "Corrupted PDF or invalid format."
        except Exception as e:
            logger.exception("Unexpected error during PDF validation.")
            return False, str(e)
            
    def extract_metadata(self, file_path: Path) -> dict:
        try:
            doc = fitz.open(str(file_path))
            meta = doc.metadata
            metadata = {
                "filename": file_path.name,
                "page_count": doc.page_count,
                "file_size": file_path.stat().st_size,
                "title": meta.get("title", ""),
                "author": meta.get("author", ""),
                "subject": meta.get("subject", ""),
                "creation_date": meta.get("creationDate", "")
            }
            doc.close()
            return metadata
        except Exception as e:
            logger.exception("Error extracting metadata.")
            return {}

    def extract_page_text(self, file_path: Path, page_num: int) -> str:
        try:
            doc = fitz.open(str(file_path))
            page = doc.load_page(page_num)
            page_dict = page.get_text("dict")
            
            lines = []
            for block in page_dict.get("blocks", []):
                if "lines" in block:
                    for line in block["lines"]:
                        line_text = "".join(span.get("text", "") for span in line.get("spans", [])).strip()
                        if line_text:
                            lines.append({
                                "bbox": line["bbox"],
                                "text": line_text
                            })
            
            if not lines:
                doc.close()
                return ""
                
            page_width = page.rect.width
            page_height = page.rect.height
            mid_x = page_width / 2.0
            
            # Check if this page has multi-column structure
            has_two_columns = False
            left_col = any((l["bbox"][0] + l["bbox"][2]) / 2.0 < (mid_x - 20) for l in lines)
            right_col = any((l["bbox"][0] + l["bbox"][2]) / 2.0 > (mid_x + 20) for l in lines)
            if left_col and right_col:
                has_two_columns = True
                
            if has_two_columns:
                def sort_key(l):
                    bbox = l["bbox"]
                    x0, y0, x1, y1 = bbox[0], bbox[1], bbox[2], bbox[3]
                    center_x = (x0 + x1) / 2.0
                    is_full_width = (x1 - x0) > (page_width * 0.65)
                    if y0 < 110 and is_full_width:
                        return (0, y0)  # Top banner/title across both columns
                    if y1 > (page_height - 50):
                        return (3, y0)  # Footer/page numbers
                    if center_x < mid_x:
                        return (1, y0)  # Left column
                    return (2, y0)      # Right column
                    
                sorted_lines = sorted(lines, key=sort_key)
                text = "\n".join(l["text"] for l in sorted_lines)
            else:
                sorted_lines = sorted(lines, key=lambda l: (l["bbox"][1], l["bbox"][0]))
                text = "\n".join(l["text"] for l in sorted_lines)
                
            doc.close()
            return text
        except Exception as e:
            logger.exception(f"Error extracting text from page {page_num}.")
            return ""

    def assess_text_quality(self, text: str) -> float:
        if not text:
            return 0.0
            
        char_count = len(text)
        if char_count == 0:
            return 0.0
            
        words = text.split()
        word_count = len(words)
        
        alpha_chars = sum(1 for c in text if c.isalpha())
        alpha_ratio = alpha_chars / char_count
        
        valid_words = sum(1 for w in words if any(c.isalpha() for c in w))
        valid_word_ratio = valid_words / word_count if word_count > 0 else 0.0
        
        # Simple heuristic score based on ratios
        score = (alpha_ratio * 0.4) + (valid_word_ratio * 0.6)
        return min(1.0, max(0.0, score))

    def render_page_as_image(self, file_path: Path, page_num: int, dpi: int = 300) -> Image.Image:
        try:
            doc = fitz.open(str(file_path))
            page = doc.load_page(page_num)
            zoom = dpi / 72.0
            mat = fitz.Matrix(zoom, zoom)
            pix = page.get_pixmap(matrix=mat)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            doc.close()
            return img
        except Exception as e:
            logger.exception(f"Error rendering page {page_num} as image.")
            raise

    async def process_document(self, document_id: str, file_path: Path, status_callback=None) -> dict:
        try:
            valid, err = self.validate_pdf(file_path)
            if not valid:
                raise ValueError(f"Validation failed: {err}")
                
            metadata = self.extract_metadata(file_path)
            page_count = metadata.get("page_count", 0)
            
            pages = []
            
            for page_num in range(page_count):
                if status_callback:
                    status_callback("EXTRACTING", page_num + 1, page_count)
                    
                text = self.extract_page_text(file_path, page_num)
                quality = self.assess_text_quality(text)
                ocr_used = False
                
                if quality < getattr(settings, 'TEXT_QUALITY_THRESHOLD', 0.3):
                    if self.ocr_service.is_available():
                        if status_callback:
                            status_callback("OCR_PROCESSING", page_num + 1, page_count)
                        img = self.render_page_as_image(file_path, page_num, getattr(settings, 'OCR_DPI', 300))
                        text = self.ocr_service.extract_text_from_image(img)
                        ocr_used = True
                    else:
                        logger.warning(f"Low text quality on page {page_num} but OCR not available.")
                
                pages.append({
                    "page_num": page_num + 1,
                    "text": text,
                    "ocr_used": ocr_used
                })
                
            return {"pages": pages, "metadata": metadata}
            
        except Exception as e:
            logger.exception(f"Error processing document {document_id}")
            raise
