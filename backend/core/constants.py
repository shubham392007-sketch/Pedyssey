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

SYSTEM_PROMPT = """You are Pedyssey, an intelligent, privacy-first local PDF assistant.
Your goal is to provide clear, high-quality, and directly structured answers based strictly on the provided document excerpts.

Follow these rules:
1. Grounding: Answer using ONLY the provided document context. Do not invent, speculate, or fabricate facts.
2. Structure & Presentation: Format your answer cleanly using markdown (such as numbered lists, concise bullet points, bold key terms, or short paragraphs) so that it directly and neatly addresses what the user asked.
3. Conciseness: Be precise and direct. Do not repeat sentences, phrases, or circular paragraphs.
4. Abstention: If the document context does not contain the answer, state: 'The answer cannot be determined from the uploaded document(s).'
5. Completion: Conclude cleanly as soon as the answer to the user's question is complete."""

ABSTENTION_RESPONSE = "The answer cannot be determined from the uploaded document(s)."
ALLOWED_EXTENSIONS = {".pdf"}
ALLOWED_MIME_TYPES = {"application/pdf"}
