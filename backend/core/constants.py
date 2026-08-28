from enum import Enum

class DocumentStatus(str, Enum):
    UPLOADED = "UPLOADED"
    VALIDATING = "VALIDATING"
    EXTRACTING = "EXTRACTING"
    OCR_PROCESSING = "OCR_PROCESSING"
    CLEANING = "CLEANING"
    CHUNKING = "CHUNKING"
    EMBEDDING = "EMBEDDING"
    INDEXING = "INDEXING"
    READY = "READY"
    FAILED = "FAILED"

class MessageRole(str, Enum):
    USER = "USER"
    ASSISTANT = "ASSISTANT"
    SYSTEM = "SYSTEM"

class QueryType(str, Enum):
    FACTUAL = "FACTUAL"
    SUMMARY = "SUMMARY"
    COMPARISON = "COMPARISON"
    EXPLANATION = "EXPLANATION"
    QUIZ_GENERATION = "QUIZ_GENERATION"
    FLASHCARD_GENERATION = "FLASHCARD_GENERATION"

class ErrorCode(str, Enum):
    INVALID_FILE = "INVALID_FILE"
    CORRUPTED_PDF = "CORRUPTED_PDF"
    PASSWORD_PROTECTED = "PASSWORD_PROTECTED"
    FILE_TOO_LARGE = "FILE_TOO_LARGE"
    PAGE_LIMIT_EXCEEDED = "PAGE_LIMIT_EXCEEDED"
    EXTRACTION_FAILED = "EXTRACTION_FAILED"
    OCR_FAILED = "OCR_FAILED"
    EMBEDDING_MODEL_NOT_FOUND = "EMBEDDING_MODEL_NOT_FOUND"
    EMBEDDING_FAILED = "EMBEDDING_FAILED"
    VECTOR_INDEX_ERROR = "VECTOR_INDEX_ERROR"
    RERANKING_FAILED = "RERANKING_FAILED"
    OLLAMA_OFFLINE = "OLLAMA_OFFLINE"
    LLM_MODEL_NOT_INSTALLED = "LLM_MODEL_NOT_INSTALLED"
    LLM_TIMEOUT = "LLM_TIMEOUT"
    GENERATION_FAILED = "GENERATION_FAILED"
    DOCUMENT_NOT_FOUND = "DOCUMENT_NOT_FOUND"
    SESSION_NOT_FOUND = "SESSION_NOT_FOUND"
    DATABASE_ERROR = "DATABASE_ERROR"
    STORAGE_ERROR = "STORAGE_ERROR"
    INVALID_REQUEST = "INVALID_REQUEST"
    LOW_CONFIDENCE = "LOW_CONFIDENCE"

SYSTEM_PROMPT = """You are Pedyssey, a privacy-first, local-only PDF intelligence platform.
Your primary role is to accurately answer user questions based strictly on the provided document excerpts.

You must follow these rules strictly:
1. Answer using ONLY the provided document context.
2. Do not invent or assume information.
3. Do not fabricate citations or page numbers.
4. If the retrieved context does not contain enough information, explicitly state: 'The answer cannot be determined from the provided document excerpts.'
5. Do not pretend that unsupported information came from the PDF.
6. Preserve the exact meaning of the source material.
7. Keep answers concise, factual, and clear unless the user explicitly asks for detail."""

ABSTENTION_RESPONSE = "The answer cannot be determined from the uploaded document(s)."
ALLOWED_EXTENSIONS = {".pdf"}
ALLOWED_MIME_TYPES = {"application/pdf"}
