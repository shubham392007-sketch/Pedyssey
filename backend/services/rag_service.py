import logging
import json
from typing import List, Dict, Optional, AsyncIterator

from services.retrieval_service import RetrievalService
from services.reranking_service import RerankingService
from services.confidence_service import ConfidenceService
from services.context_builder import ContextBuilder
from services.llm_service import LLMService, OllamaOfflineError
from services.citation_service import CitationService
from core.constants import ABSTENTION_RESPONSE
from core.config import settings

logger = logging.getLogger(__name__)


class RAGService:
    def __init__(self, retrieval: RetrievalService, reranker: RerankingService,
                 confidence: ConfidenceService, context_builder: ContextBuilder,
                 llm: LLMService, citation: CitationService):
        self._retrieval = retrieval
        self._reranker = reranker
        self._confidence = confidence
        self._context_builder = context_builder
        self._llm = llm
        self._citation = citation
    
    async def answer(self, question: str, document_ids: List[str],
                     session_id: Optional[str] = None) -> dict:
        """Full RAG pipeline:
        1. Validate question
        2. Retrieve candidates (hybrid FAISS + BM25)
        3. Rerank evidence (Cross-Encoder)
        4. Evaluate confidence
        5. If low confidence -> return abstention
        6. Build context
        7. Generate answer via local LLM
        8. Build citations
        9. Return {answer, confidence, citations, session_id}"""
        
        if not question or not question.strip():
            return {"answer": "Question cannot be empty.", "confidence": 0.0, "citations": [], "session_id": session_id}

        # 2. Retrieve
        logger.info(f"Retrieving candidates for query: {question}")
        candidates = self._retrieval.retrieve(question, top_k=settings.RETRIEVAL_TOP_K, document_ids=document_ids)
        
        if not candidates:
            return {
                "answer": "No relevant document passages were found. Make sure your document has completed processing.",
                "confidence": 0.0,
                "citations": [],
                "session_id": session_id
            }

        # 3. Rerank
        logger.info(f"Reranking top {len(candidates)} candidates.")
        reranked = self._reranker.rerank(question, candidates, top_k=settings.RERANK_TOP_K)
        
        # 4 & 5. Confidence check
        conf_score, should_generate = self._confidence.evaluate(reranked)
        if not should_generate:
            logger.info("Low confidence, abstaining from generation.")
            return {
                "answer": ABSTENTION_RESPONSE, 
                "confidence": conf_score, 
                "citations": [], 
                "session_id": session_id
            }
            
        # Build citations from retrieved evidence
        citations = self._citation.build_citations(reranked)

        # 6. Build context
        context = self._context_builder.build_context(reranked)
        messages = self._context_builder.build_prompt(question, context)
        
        # 7. Generate answer via local LLM
        try:
            logger.info("Generating answer via local LLM.")
            answer = await self._llm.generate(messages)
        except OllamaOfflineError:
            # Provide helpful guidance when Ollama daemon is not yet started
            top_preview = reranked[0].get('text', '')[:300] if reranked else ''
            answer = (
                f"> ⚠️ **Ollama is Offline**\n\n"
                f"Your relevant document evidence was retrieved locally with high confidence ({conf_score:.2f}), "
                f"but Ollama is not yet running for neural answer synthesis.\n\n"
                f"**To enable complete AI answers, start Ollama in your terminal:**\n"
                f"```bash\n"
                f"ollama serve\n"
                f"ollama run {settings.LLM_MODEL}\n"
                f"```\n\n"
                f"---\n"
                f"### Relevant Passage Found:\n"
                f"{top_preview}..."
            )
        except Exception as e:
            logger.error(f"Generation error: {e}")
            answer = f"Error generating answer: {str(e)}"
        
        return {
            "answer": answer,
            "confidence": conf_score,
            "citations": citations,
            "session_id": session_id
        }
    
    async def answer_stream(self, question: str, document_ids: List[str],
                            session_id: Optional[str] = None) -> AsyncIterator[str]:
        """Same pipeline but yields SSE events."""
        if not question or not question.strip():
            yield json.dumps({"event": "error", "data": "Question cannot be empty."}) + "\n\n"
            return

        yield json.dumps({"event": "retrieving"}) + "\n\n"
        candidates = self._retrieval.retrieve(question, top_k=settings.RETRIEVAL_TOP_K, document_ids=document_ids)
        
        if not candidates:
            yield json.dumps({"event": "token", "data": "No relevant document passages were found. Make sure your document has completed processing."}) + "\n\n"
            yield json.dumps({"event": "complete"}) + "\n\n"
            return

        yield json.dumps({"event": "reranking"}) + "\n\n"
        reranked = self._reranker.rerank(question, candidates, top_k=settings.RERANK_TOP_K)
        
        conf_score, should_generate = self._confidence.evaluate(reranked)
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
        except OllamaOfflineError:
            top_preview = reranked[0].get('text', '')[:300] if reranked else ''
            notice = (
                f"> ⚠️ **Ollama is Offline**\n\n"
                f"Your relevant document evidence was retrieved locally with high confidence ({conf_score:.2f}), "
                f"but Ollama is not yet running for neural answer synthesis.\n\n"
                f"**To enable complete AI answers, start Ollama in your terminal:**\n"
                f"```bash\n"
                f"ollama serve\n"
                f"ollama run {settings.LLM_MODEL}\n"
                f"```\n\n"
                f"---\n"
                f"### Relevant Passage Found:\n"
                f"{top_preview}..."
            )
            yield json.dumps({"event": "token", "data": notice}) + "\n\n"
        except Exception as e:
            yield json.dumps({"event": "token", "data": f"Error: {str(e)}"}) + "\n\n"
            
        yield json.dumps({"event": "citations", "data": citations}) + "\n\n"
        yield json.dumps({"event": "complete"}) + "\n\n"
