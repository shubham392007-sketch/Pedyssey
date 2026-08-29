import pytest
from unittest.mock import MagicMock, AsyncMock
from services.rag_service import RAGService
from services.ollama_service import OllamaConnectionError, OllamaModelNotFoundError
from services.confidence_service import ConfidenceEvaluation
from core.constants import ConfidenceLevel, AnswerCategory, CATEGORY_D_RESPONSE


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
    mock_conf.evaluate_detailed.return_value = ConfidenceEvaluation(
        score=0.95,
        level=ConfidenceLevel.HIGH,
        category=AnswerCategory.CATEGORY_A,
        should_generate=True,
        is_unrelated=False
    )
    mock_ctx.build_context.return_value = "SOURCE 1\nDocument: test.pdf\nPages: 1\n\ndoc snippet"
    mock_ctx.build_prompt.return_value = [{"role": "system", "content": "Pedyssey"}, {"role": "user", "content": "q"}]
    mock_llm.generate.return_value = "This is the answer."
    mock_cit.build_citations.return_value = [{"chunk_id": "1", "document_id": "d1", "filename": "test.pdf", "page_start": 1, "page_end": 1}]
    
    service = RAGService(mock_retrieval, mock_rerank, mock_conf, mock_ctx, mock_llm, mock_cit)
    
    res = await service.answer("What is this?", ["d1"])
    assert res["answer"] == "This is the answer."
    assert res["confidence_level"] == ConfidenceLevel.HIGH.value
    assert res["category"] == AnswerCategory.CATEGORY_A.value
    assert len(res["citations"]) == 1
    assert res["citations"][0]["document_id"] == "d1"


@pytest.mark.asyncio
async def test_rag_pipeline_medium_confidence():
    mock_retrieval = MagicMock()
    mock_rerank = MagicMock()
    mock_conf = MagicMock()
    mock_ctx = MagicMock()
    mock_llm = AsyncMock()
    mock_cit = MagicMock()
    
    mock_retrieval.retrieve.return_value = [{"text": "partial snippet", "chunk_id": "1", "document_id": "d1"}]
    mock_rerank.rerank.return_value = [{"text": "partial snippet", "chunk_id": "1", "document_id": "d1", "reranker_score": 0.45}]
    mock_conf.evaluate_detailed.return_value = ConfidenceEvaluation(
        score=0.55,
        level=ConfidenceLevel.MEDIUM,
        category=AnswerCategory.CATEGORY_B,
        should_generate=True,
        is_unrelated=False
    )
    mock_ctx.build_context.return_value = "SOURCE 1\nDocument: test.pdf\nPages: 1\n\npartial snippet"
    mock_ctx.build_prompt.return_value = [{"role": "system", "content": "Pedyssey"}, {"role": "user", "content": "q"}]
    mock_llm.generate.return_value = "From Uploaded Document:\n...\n\nAdditional Context:\n..."
    mock_cit.build_citations.return_value = [{"chunk_id": "1", "document_id": "d1", "filename": "test.pdf", "page_start": 1, "page_end": 1}]
    
    service = RAGService(mock_retrieval, mock_rerank, mock_conf, mock_ctx, mock_llm, mock_cit)
    
    res = await service.answer("Explain the broader concept", ["d1"])
    assert "Additional Context:" in res["answer"]
    assert res["confidence_level"] == ConfidenceLevel.MEDIUM.value
    assert res["category"] == AnswerCategory.CATEGORY_B.value


@pytest.mark.asyncio
async def test_rag_pipeline_unrelated_category_d():
    mock_retrieval = MagicMock()
    mock_rerank = MagicMock()
    mock_conf = MagicMock()
    mock_ctx = MagicMock()
    mock_llm = AsyncMock()
    mock_cit = MagicMock()
    
    mock_retrieval.retrieve.return_value = [{"text": "civil engineering text", "chunk_id": "1", "document_id": "d1"}]
    mock_rerank.rerank.return_value = [{"text": "civil engineering text", "chunk_id": "1", "document_id": "d1", "raw_reranker_score": -12.5}]
    mock_conf.evaluate_detailed.return_value = ConfidenceEvaluation(
        score=0.01,
        level=ConfidenceLevel.LOW,
        category=AnswerCategory.CATEGORY_D,
        should_generate=False,
        is_unrelated=True
    )
    
    service = RAGService(mock_retrieval, mock_rerank, mock_conf, mock_ctx, mock_llm, mock_cit)
    
    res = await service.answer("Who won the FIFA World Cup?", ["d1"])
    assert "This question is unrelated to the uploaded documents." in res["answer"]
    assert res["category"] == AnswerCategory.CATEGORY_D.value
    assert len(res["citations"]) == 0


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
    mock_conf.evaluate_detailed.return_value = ConfidenceEvaluation(
        score=0.95,
        level=ConfidenceLevel.HIGH,
        category=AnswerCategory.CATEGORY_A,
        should_generate=True,
        is_unrelated=False
    )
    mock_ctx.build_context.return_value = "context string"
    mock_ctx.build_prompt.return_value = [{"role": "system", "content": "Pedyssey"}, {"role": "user", "content": "q"}]
    mock_llm.generate.side_effect = OllamaConnectionError()
    mock_cit.build_citations.return_value = [{"chunk_id": "1", "document_id": "d1", "filename": "test.pdf", "page_start": 1, "page_end": 1}]
    
    service = RAGService(mock_retrieval, mock_rerank, mock_conf, mock_ctx, mock_llm, mock_cit)
    
    res = await service.answer("What is this?", ["d1"])
    assert "Ollama is not running" in res["answer"]
    assert len(res["citations"]) == 1
