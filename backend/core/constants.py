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
Always cite your sources using the document excerpts provided.
If the answer cannot be found in the excerpts, you must abstain and say: 'I could not find a sufficiently supported answer in the selected document(s).'"""

ABSTENTION_RESPONSE = "I could not find a sufficiently supported answer in the selected document(s)."
ALLOWED_EXTENSIONS = {".pdf"}
ALLOWED_MIME_TYPES = {"application/pdf"}
