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
from core.constants import ABSTENTION_RESPONSE
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
        2. Retrieve candidates (hybrid FAISS + BM25)
        3. Rerank evidence (Cross-Encoder)
        4. Evaluate confidence (abstention check)
        5. Build context
        6. Generate grounded answer via local Ollama LLM
        7. Build citations
        8. Return {answer, confidence, citations, session_id}
        """
        if not question or not question.strip():
            return {
                "answer": "Question cannot be empty.",
                "confidence": 0.0,
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
                "citations": [],
                "session_id": session_id
            }

        # 3. Rerank
        logger.info(f"Reranking top {len(candidates)} candidates.")
        reranked = self._reranker.rerank(question, candidates, top_k=settings.RERANK_TOP_K)
        
        # 4. Confidence evaluation
        conf_score, should_generate = self._confidence.evaluate(reranked, query=question)
        if not should_generate:
            logger.info("Low retrieval confidence, abstaining from generation.")
            return {
                "answer": ABSTENTION_RESPONSE, 
                "confidence": conf_score, 
                "citations": [], 
                "session_id": session_id
            }
            
        # Build citations from reranked chunks
        citations = self._citation.build_citations(reranked)

        # 5. Build context and grounded prompt
        context = self._context_builder.build_context(reranked)
        messages = self._context_builder.build_prompt(question, context)
        
        # 6. Generate answer via local Ollama LLM
        try:
            logger.info("Generating answer via local Ollama model.")
            answer = await self._llm.generate(messages)
        except OllamaConnectionError:
            answer = "Ollama is not running. Start Ollama and try again."
        except OllamaModelNotFoundError as e:
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
            "confidence": conf_score,
            "citations": citations,
            "session_id": session_id
        }
    
    async def answer_stream(self, question: str, document_ids: List[str],
                            session_id: Optional[str] = None) -> AsyncIterator[str]:
        """Same pipeline yielding SSE events."""
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
        
        conf_score, should_generate = self._confidence.evaluate(reranked, query=question)
        if not should_generate:
            yield json.dumps({"event": "generating"}) + "\n\n"
            yield json.dumps({"event": "token", "data": ABSTENTION_RESPONSE}) + "\n\n"
            yield json.dumps({"event": "complete"}) + "\n\n"
            return
            
        context = self._context_builder.build_context(reranked)
        messages = self._context_builder.build_prompt(question, context)
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
