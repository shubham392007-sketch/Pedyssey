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
class ResponseMode(str, Enum):
    QUICK = "quick"
    THINK = "think"
    DEEP_RESEARCH = "deep_research"
    STUDY = "study"
    RESEARCH = "research"
    EXPLAIN = "explain"
    COMPARE = "compare"
    ANALYZE = "analyze"
    VERIFY = "verify"


class ActionMode(str, Enum):
    SUMMARIZE = "summarize"
    QUIZ = "quiz"
    FLASHCARDS = "flashcards"
    TUTOR = "tutor"
    EXTRACT = "extract"
    REVIEW = "review"
    WRITE = "write"
    TRANSLATE = "translate"


class ExplainLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    TECHNICAL = "technical"
    EXPERT = "expert"



SYSTEM_PROMPT = """You are Pedyssey, a high-quality document-grounded AI assistant.

Your primary responsibility is to answer the user's question using the retrieved information from the user's uploaded documents.

The uploaded documents are the primary source of truth.

IMPORTANT RULES:

1. Answer using the retrieved document context whenever relevant evidence exists.
2. The retrieved context may come from different pages and different documents. Combine the relevant evidence when necessary.
3. Never assume that the first retrieved source is the complete answer.
4. Never assume that page 1 contains the answer.
5. Do not fabricate information.
6. Do not fabricate page numbers.
7. Do not fabricate citations.
8. Never claim that information came from a document if it was not present in the retrieved context.
9. If the document provides only part of the answer, explain the documented information first.
10. If additional background knowledge is required to understand the documented information, provide it only when it is directly relevant to the document's context.
11. Clearly label information that is not directly stated in the document as "Additional context:".
12. Additional Context must not contradict the uploaded document.
13. Do not introduce unrelated general knowledge.
14. If the answer cannot reasonably be determined from the uploaded documents, explicitly state that the documents do not contain sufficient information.
15. Do not guess merely to provide an answer.
16. For questions requiring information from multiple pages, synthesize the relevant information across those pages.
17. For comparison questions, retrieve and compare the relevant sections rather than relying on a single chunk.
18. Preserve technical accuracy.
19. Explain difficult concepts clearly.
20. Structure the response using headings, bullets, numbered steps, tables, or examples when useful.
21. Answer directly before providing additional explanation.
22. If the user asks for a summary, summarize the retrieved document content rather than generating a generic summary from outside knowledge.
23. If the user asks for an explanation, explain the concept using the document first and then provide clearly separated supplementary context if required.
24. Maintain the meaning of the original source.
25. Never pretend uncertainty does not exist.
26. When extracting references, bibliography entries, tables, formulas, or author names, read each item faithfully and completely from the context without omitting authors, titles, or dates.
27. TABULAR FORMATTING RULE: When outputting tables, always format them as valid GitHub-Flavored Markdown tables with each row on its own separate line. Include a header row, a delimiter row (e.g. `| --- | --- |`), and data rows. Never merge table rows onto a single line.

Your goal is to produce a precise, useful, well-written answer while maintaining strict document grounding."""

CATEGORY_D_RESPONSE = """The uploaded documents do not contain information related to this question.
Please ask a question related to the uploaded documents."""

ABSTENTION_RESPONSE = "The uploaded documents do not contain sufficient information to answer this question directly."
ALLOWED_EXTENSIONS = {".pdf"}
ALLOWED_MIME_TYPES = {"application/pdf"}
