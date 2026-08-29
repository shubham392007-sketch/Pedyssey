import logging
import json
from typing import List, Dict, Optional, AsyncIterator

from services.retrieval_service import RetrievalService
from services.reranking_service import RerankingService
from services.confidence_service import ConfidenceService
from services.context_builder import ContextBuilder
from services.ollama_service import (
    OllamaService,
    OllamaError,
    OllamaConnectionError,
    OllamaModelNotFoundError,
    OllamaTimeoutError,
    OllamaEmptyResponseError,
)
from services.citation_service import CitationService
from core.constants import (
    ABSTENTION_RESPONSE,
    CATEGORY_D_RESPONSE,
    ConfidenceLevel,
    AnswerCategory,
)
from core.config import settings

logger = logging.getLogger(__name__)


class RAGService:
    def __init__(
        self,
        retrieval: RetrievalService,
        reranker: RerankingService,
        confidence: ConfidenceService,
        context_builder: ContextBuilder,
        llm: OllamaService,
        citation: CitationService,
    ):
        self._retrieval = retrieval
        self._reranker = reranker
        self._confidence = confidence
        self._context_builder = context_builder
        self._llm = llm
        self._citation = citation
    
    async def answer(self, question: str, document_ids: List[str],
                     session_id: Optional[str] = None) -> dict:
        """Full grounded RAG pipeline:
        1. Validate question
        2. Retrieve candidates (hybrid FAISS + BM25 + Overview Injection)
        3. Rerank evidence (Cross-Encoder)
        4. Multi-signal confidence & category evaluation
        5. Build structured prompt (18-Rule System Prompt + Category guidance)
        6. Generate research-grade answer via local Ollama LLM
        7. Build citations
        8. Return {answer, confidence, confidence_level, category, citations, session_id}
        """
        if not question or not question.strip():
            return {
                "answer": "Question cannot be empty.",
                "confidence": 0.0,
                "confidence_level": ConfidenceLevel.LOW.value,
                "category": AnswerCategory.CATEGORY_D.value,
                "citations": [],
                "session_id": session_id
            }

        # 2. Retrieve
        logger.info(f"Retrieving candidates for query: {question}")
        candidates = self._retrieval.retrieve(question, top_k=settings.RETRIEVAL_TOP_K, document_ids=document_ids)
        
        if not candidates:
            return {
                "answer": "No relevant document passages were found in the selected documents.",
                "confidence": 0.0,
                "confidence_level": ConfidenceLevel.LOW.value,
                "category": AnswerCategory.CATEGORY_D.value,
                "citations": [],
                "session_id": session_id
            }

        # 3. Rerank
        logger.info(f"Reranking top {len(candidates)} candidates.")
        reranked = self._reranker.rerank(question, candidates, top_k=settings.RERANK_TOP_K)
        
        # 4. Multi-signal Confidence and Category Evaluation
        eval_res = self._confidence.evaluate_detailed(reranked, query=question)
        
        # Category D: Completely unrelated question
        if eval_res.category == AnswerCategory.CATEGORY_D or not eval_res.should_generate:
            logger.info("Query evaluated as Category D (Unrelated), returning off-topic notice.")
            return {
                "answer": CATEGORY_D_RESPONSE, 
                "confidence": eval_res.score,
                "confidence_level": eval_res.level.value,
                "category": eval_res.category.value,
                "citations": [], 
                "session_id": session_id
            }
            
        # Build citations from reranked chunks
        citations = self._citation.build_citations(reranked)

        # 5. Build structured context and category-tailored prompt
        context = self._context_builder.build_context(reranked)
        messages = self._context_builder.build_prompt(
            question=question,
            context=context,
            category=eval_res.category,
            confidence_level=eval_res.level
        )
        
        # 6. Generate answer via local Ollama LLM
        try:
            logger.info(f"Generating answer via local Ollama model (Category: {eval_res.category.value}, Confidence: {eval_res.level.value}).")
            answer = await self._llm.generate(messages)
        except OllamaConnectionError:
            answer = "Ollama is not running. Start Ollama and try again."
        except OllamaModelNotFoundError:
            answer = f"The configured local model '{self._llm.get_model()}' is not installed."
        except OllamaTimeoutError:
            answer = "The local model took too long to respond. Try again or select a smaller model."
        except OllamaEmptyResponseError:
            answer = "The local model returned an empty response."
        except OllamaError as e:
            answer = e.message
        except Exception as e:
            logger.error(f"Generation error: {e}")
            answer = "An error occurred while generating the response from the local model."
        
        return {
            "answer": answer,
            "confidence": eval_res.score,
            "confidence_level": eval_res.level.value,
            "category": eval_res.category.value,
            "citations": citations,
            "session_id": session_id
        }
    
    async def answer_stream(self, question: str, document_ids: List[str],
                            session_id: Optional[str] = None) -> AsyncIterator[str]:
        """Same pipeline yielding SSE events with confidence and category."""
        if not question or not question.strip():
            yield json.dumps({"event": "error", "data": "Question cannot be empty."}) + "\n\n"
            return

        yield json.dumps({"event": "retrieving"}) + "\n\n"
        candidates = self._retrieval.retrieve(question, top_k=settings.RETRIEVAL_TOP_K, document_ids=document_ids)
        
        if not candidates:
            yield json.dumps({"event": "token", "data": "No relevant document passages were found in the selected documents."}) + "\n\n"
            yield json.dumps({"event": "complete"}) + "\n\n"
            return

        yield json.dumps({"event": "reranking"}) + "\n\n"
        reranked = self._reranker.rerank(question, candidates, top_k=settings.RERANK_TOP_K)
        
        eval_res = self._confidence.evaluate_detailed(reranked, query=question)
        
        yield json.dumps({
            "event": "confidence",
            "data": {
                "score": eval_res.score,
                "level": eval_res.level.value,
                "category": eval_res.category.value
            }
        }) + "\n\n"

        # Category D: Completely unrelated question
        if eval_res.category == AnswerCategory.CATEGORY_D or not eval_res.should_generate:
            yield json.dumps({"event": "generating"}) + "\n\n"
            yield json.dumps({"event": "token", "data": CATEGORY_D_RESPONSE}) + "\n\n"
            yield json.dumps({"event": "complete"}) + "\n\n"
            return
            
        context = self._context_builder.build_context(reranked)
        messages = self._context_builder.build_prompt(
            question=question,
            context=context,
            category=eval_res.category,
            confidence_level=eval_res.level
        )
        citations = self._citation.build_citations(reranked)
        
        yield json.dumps({"event": "generating"}) + "\n\n"
        
        try:
            async for token in self._llm.generate_stream(messages):
                yield json.dumps({"event": "token", "data": token}) + "\n\n"
        except OllamaConnectionError:
            yield json.dumps({"event": "token", "data": "Ollama is not running. Start Ollama and try again."}) + "\n\n"
        except OllamaModelNotFoundError:
            yield json.dumps({"event": "token", "data": f"The configured local model '{self._llm.get_model()}' is not installed."}) + "\n\n"
        except OllamaTimeoutError:
            yield json.dumps({"event": "token", "data": "The local model took too long to respond. Try again or select a smaller model."}) + "\n\n"
        except OllamaEmptyResponseError:
            yield json.dumps({"event": "token", "data": "The local model returned an empty response."}) + "\n\n"
        except OllamaError as e:
            yield json.dumps({"event": "token", "data": e.message}) + "\n\n"
        except Exception as e:
            logger.error(f"Stream error: {e}")
            yield json.dumps({"event": "token", "data": "An error occurred while generating the response."}) + "\n\n"
            
        yield json.dumps({"event": "citations", "data": citations}) + "\n\n"
        yield json.dumps({"event": "complete"}) + "\n\n"
