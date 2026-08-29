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

class ConfidenceLevel(str, Enum):
    HIGH = "High Confidence"
    MEDIUM = "Medium Confidence"
    LOW = "Low Confidence"

class AnswerCategory(str, Enum):
    CATEGORY_A = "CATEGORY_A"  # Answer fully present in PDF
    CATEGORY_B = "CATEGORY_B"  # Partial information in PDF (PDF info + supplementary context)
    CATEGORY_C = "CATEGORY_C"  # Not explicitly in PDF, but on-topic general explanation
    CATEGORY_D = "CATEGORY_D"  # Completely unrelated question (off-topic rejection)

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

SYSTEM_PROMPT = """You are Pedyssey, an advanced document intelligence system.

Your primary goal is to answer questions using the retrieved PDF context.

Rules:
1. Prioritize uploaded document information.
2. Never invent citations.
3. Never fabricate page numbers.
4. Never claim unsupported information exists in the PDF.
5. If information is partially available, provide supplementary explanations separately under 'Additional Context:'.
6. If information is missing, explicitly say so.
7. Maintain high answer quality comparable to top AI assistants.
8. Write clear, accurate, well-structured responses.
9. Use examples when helpful.
10. Explain technical concepts simply when required.
11. Combine information from multiple retrieved chunks.
12. Maintain factual correctness.
13. Keep answers concise unless the user requests detailed explanations.
14. Preserve the original meaning of source material.
15. If the user asks for summary, explanation, comparison, notes, examples, or simplification, generate those based on the document.
16. If external knowledge is used, clearly label it as "Additional Context".
17. Never confuse additional context with PDF content.
18. Never hallucinate."""

CATEGORY_D_RESPONSE = """This question is unrelated to the uploaded documents.

Pedyssey focuses on document-based answers.

Please upload a relevant document or ask a question related to the current PDFs."""

ABSTENTION_RESPONSE = "The answer cannot be determined from the uploaded document(s)."
ALLOWED_EXTENSIONS = {".pdf"}
ALLOWED_MIME_TYPES = {"application/pdf"}
