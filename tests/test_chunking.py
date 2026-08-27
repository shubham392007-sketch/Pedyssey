import pytest
from services.chunking_service import ChunkingService

def test_chunking_service():
    service = ChunkingService(target_size=50, overlap=10, min_size=10, max_size=100)
    pages = [
        {"page_num": 1, "text": "This is a paragraph with several sentences describing the architecture. " * 3, "section": "Introduction"},
        {"page_num": 2, "text": "Another paragraph with more details about RAG pipelines and vector search. " * 3, "section": "Methodology"}
    ]
    chunks = service.chunk_document("doc_123", pages)
    assert len(chunks) > 0
    assert chunks[0].chunk_id.startswith("doc_123_chunk_")
    assert chunks[0].document_id == "doc_123"
    assert chunks[0].page_start >= 1
