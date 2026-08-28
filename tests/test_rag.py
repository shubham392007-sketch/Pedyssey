import pytest
from unittest.mock import MagicMock, AsyncMock
from services.rag_service import RAGService
from services.ollama_service import OllamaService, OllamaConnectionError, OllamaModelNotFoundError


@pytest.mark.asyncio
async def test_rag_pipeline_success():
    mock_retrieval = MagicMock()
    mock_rerank = MagicMock()
    mock_conf = MagicMock()
    mock_ctx = MagicMock()
    mock_llm = AsyncMock()
    mock_cit = MagicMock()
    
    mock_retrieval.retrieve.return_value = [{"text": "doc snippet", "chunk_id": "1", "document_id": "d1"}]
    mock_rerank.rerank.return_value = [{"text": "doc snippet", "chunk_id": "1", "document_id": "d1", "reranker_score": 0.95}]
    mock_conf.evaluate.return_value = (0.95, True)
    mock_ctx.build_context.return_value = "context string"
    mock_ctx.build_prompt.return_value = [{"role": "system", "content": "Pedyssey"}, {"role": "user", "content": "q"}]
    mock_llm.generate.return_value = "This is the answer."
    mock_cit.build_citations.return_value = [{"chunk_id": "1", "document_id": "d1", "filename": "test.pdf", "page_start": 1, "page_end": 1}]
    
    service = RAGService(mock_retrieval, mock_rerank, mock_conf, mock_ctx, mock_llm, mock_cit)
    
    res = await service.answer("What is this?", ["d1"])
    assert res["answer"] == "This is the answer."
    assert len(res["citations"]) == 1
    assert res["citations"][0]["document_id"] == "d1"


@pytest.mark.asyncio
async def test_rag_pipeline_ollama_offline_fallback():
    mock_retrieval = MagicMock()
    mock_rerank = MagicMock()
    mock_conf = MagicMock()
    mock_ctx = MagicMock()
    mock_llm = AsyncMock()
    mock_cit = MagicMock()
    
    mock_retrieval.retrieve.return_value = [{"text": "doc snippet", "chunk_id": "1", "document_id": "d1"}]
    mock_rerank.rerank.return_value = [{"text": "doc snippet", "chunk_id": "1", "document_id": "d1", "reranker_score": 0.95}]
    mock_conf.evaluate.return_value = (0.95, True)
    mock_ctx.build_context.return_value = "context string"
    mock_ctx.build_prompt.return_value = [{"role": "system", "content": "Pedyssey"}, {"role": "user", "content": "q"}]
    mock_llm.generate.side_effect = OllamaConnectionError()
    mock_cit.build_citations.return_value = [{"chunk_id": "1", "document_id": "d1", "filename": "test.pdf", "page_start": 1, "page_end": 1}]
    
    service = RAGService(mock_retrieval, mock_rerank, mock_conf, mock_ctx, mock_llm, mock_cit)
    
    res = await service.answer("What is this?", ["d1"])
    assert "Ollama is not running" in res["answer"]
    assert len(res["citations"]) == 1


@pytest.mark.asyncio
async def test_rag_pipeline_low_confidence_abstention():
    mock_retrieval = MagicMock()
    mock_rerank = MagicMock()
    mock_conf = MagicMock()
    mock_ctx = MagicMock()
    mock_llm = AsyncMock()
    mock_cit = MagicMock()
    
    mock_retrieval.retrieve.return_value = [{"text": "irrelevant text", "chunk_id": "1", "document_id": "d1"}]
    mock_rerank.rerank.return_value = [{"text": "irrelevant text", "chunk_id": "1", "document_id": "d1", "reranker_score": 0.1}]
    mock_conf.evaluate.return_value = (0.1, False)
    
    service = RAGService(mock_retrieval, mock_rerank, mock_conf, mock_ctx, mock_llm, mock_cit)
    
    res = await service.answer("Quantum physics explanation?", ["d1"])
    assert "cannot be determined" in res["answer"]
    assert len(res["citations"]) == 0
