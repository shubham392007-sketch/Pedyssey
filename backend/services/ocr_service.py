import logging
from abc import ABC, abstractmethod
from PIL import Image, ImageEnhance, ImageFilter
import pytesseract

from core.config import settings

logger = logging.getLogger(__name__)

class OCREngine(ABC):
    @abstractmethod
    def extract_text(self, image: Image.Image) -> str:
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        pass

class TesseractOCR(OCREngine):
    def __init__(self, lang: str = "eng"):
        self.lang = lang
    
    def preprocess_image(self, image: Image.Image) -> Image.Image:
        try:
            # Convert to grayscale
            img = image.convert("L")
            # Enhance contrast
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(2.0)
            # Apply slight blur to remove noise
            img = img.filter(ImageFilter.MedianFilter(size=3))
            return img
        except Exception as e:
            logger.exception("Error preprocessing image for OCR.")
            return image
    
    def extract_text(self, image: Image.Image) -> str:
        try:
            preprocessed = self.preprocess_image(image)
            text = pytesseract.image_to_string(preprocessed, lang=self.lang)
            return text
        except Exception as e:
            logger.exception("Error extracting text using Tesseract.")
            return ""
    
    def is_available(self) -> bool:
        try:
            pytesseract.get_tesseract_version()
            return True
        except Exception:
            return False

class OCRService:
    def __init__(self):
        self._engine: OCREngine | None = None
        self._engine = self.get_engine()
    
    def get_engine(self) -> OCREngine:
        engine_type = getattr(settings, 'OCR_ENGINE', 'tesseract').lower()
        if engine_type == 'tesseract':
            return TesseractOCR()
        # Fallback to Tesseract
        return TesseractOCR()
    
    def extract_text_from_image(self, image: Image.Image) -> str:
        if not self._engine:
            return ""
        return self._engine.extract_text(image)
    
    def is_available(self) -> bool:
        if not self._engine:
            return False
        return self._engine.is_available()
