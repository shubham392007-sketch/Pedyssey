import logging
import json
from typing import List, Dict, Optional, AsyncIterator

from services.retrieval_service import RetrievalService
from services.reranking_service import RerankingService
from services.confidence_service import ConfidenceService
from services.context_builder import ContextBuilder
from services.llm_service import LLMService
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
        1. Validate question (not empty, reasonable length)
        2. Retrieve candidates (hybrid)
        3. Rerank evidence
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
            
        # 6. Build context
        context = self._context_builder.build_context(reranked)
        messages = self._context_builder.build_prompt(question, context)
        
        # 7. Generate answer
        logger.info("Generating answer via local LLM.")
        answer = await self._llm.generate(messages)
        
        # 8. Build citations
        citations = self._citation.build_citations(reranked)
        
        return {
            "answer": answer,
            "confidence": conf_score,
            "citations": citations,
            "session_id": session_id
        }
    
    async def answer_stream(self, question: str, document_ids: List[str],
                            session_id: Optional[str] = None) -> AsyncIterator[str]:
        """Same pipeline but yields SSE events:
        {event: 'retrieving'}, {event: 'reranking'}, {event: 'generating'},
        {event: 'token', data: '...'}, {event: 'citations', data: [...]},
        {event: 'complete'}"""
        
        if not question or not question.strip():
            yield json.dumps({"event": "error", "data": "Question cannot be empty."}) + "\n\n"
            return

        yield json.dumps({"event": "retrieving"}) + "\n\n"
        candidates = self._retrieval.retrieve(question, top_k=settings.RETRIEVAL_TOP_K, document_ids=document_ids)
        
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
        
        async for token in self._llm.generate_stream(messages):
            yield json.dumps({"event": "token", "data": token}) + "\n\n"
            
        yield json.dumps({"event": "citations", "data": citations}) + "\n\n"
        yield json.dumps({"event": "complete"}) + "\n\n"
