"""
Pedyssey Service Layer

Lazily-initialized singleton service instances used across the application.
All AI processing happens locally — no cloud API calls.
"""
from core.config import settings

from services.pdf_processor import PDFProcessor
from services.ocr_service import OCRService
from services.text_cleaner import TextCleaner
from services.document_parser import DocumentParser
from services.chunking_service import ChunkingService
from services.embedding_service import EmbeddingService
from services.vector_store import FAISSVectorStore
from services.bm25_service import BM25Service
from services.retrieval_service import RetrievalService
from services.reranking_service import RerankingService
from services.confidence_service import ConfidenceService
from services.context_builder import ContextBuilder
from services.llm_service import LLMService
from services.citation_service import CitationService
from services.rag_service import RAGService
from services.document_comparison import DocumentComparisonService

# Instantiate all service singletons
pdf_processor = PDFProcessor()
ocr_service = OCRService()
text_cleaner = TextCleaner()
document_parser = DocumentParser()
chunking_service = ChunkingService(
    target_size=settings.CHUNK_TARGET_SIZE,
    overlap=settings.CHUNK_OVERLAP,
    min_size=settings.CHUNK_MIN_SIZE,
    max_size=settings.CHUNK_MAX_SIZE,
)
embedding_service = EmbeddingService()
vector_store = FAISSVectorStore(
    dimension=settings.EMBEDDING_DIMENSION,
    index_dir=settings.INDEXES_DIR / "faiss",
)
bm25_service = BM25Service(
    index_dir=settings.INDEXES_DIR / "bm25",
)
retrieval_service = RetrievalService(
    vector_store=vector_store,
    bm25=bm25_service,
    embedding_service=embedding_service,
)
reranking_service = RerankingService()
confidence_service = ConfidenceService(
    threshold=settings.CONFIDENCE_THRESHOLD,
)
context_builder = ContextBuilder()
llm_service = LLMService()
citation_service = CitationService()
rag_service = RAGService(
    retrieval=retrieval_service,
    reranker=reranking_service,
    confidence=confidence_service,
    context_builder=context_builder,
    llm=llm_service,
    citation=citation_service,
)
document_comparison_service = DocumentComparisonService()
