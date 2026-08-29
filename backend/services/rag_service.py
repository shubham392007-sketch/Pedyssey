import logging
import json
import time
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
    ResponseMode,
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

    def _get_mode_params(
        self,
        mode: str = "quick",
        action: Optional[str] = None,
        explain_level: Optional[str] = None
    ):
        """Derive adaptive retrieval depth, reranking depth, and token generation parameters via ModeService."""
        from services.mode_service import ModeService
        config = ModeService.get_mode_config(mode=mode, action=action, explain_level=explain_level)
        return {
            "mode": mode,
            "action": action,
            "explain_level": explain_level,
            "retrieval_top_k": config.get("top_k", 20),
            "rerank_top_k": config.get("rerank_top_k", 5),
            "num_predict": config.get("num_predict", 1024),
            "temperature": config.get("temperature", 0.1),
            "stages": config.get("stages", []),
            "stage_label": config.get("stage_label", "Retrieving & answering...")
        }

    async def answer(
        self, 
        question: str, 
        document_ids: List[str],
        session_id: Optional[str] = None,
        mode: str = "quick",
        action: Optional[str] = None,
        explain_level: Optional[str] = None,
        target_language: Optional[str] = None,
        quiz_config: Optional[dict] = None
    ) -> dict:
        """Full grounded RAG pipeline with multi-mode & action awareness."""
        from services.mode_service import ModeService

        start_time = time.time()
        params = self._get_mode_params(mode=mode, action=action, explain_level=explain_level)

        if not question or not question.strip():
            return {
                "answer": "Question cannot be empty.",
                "confidence": 0.0,
                "confidence_level": ConfidenceLevel.LOW.value,
                "category": AnswerCategory.CATEGORY_D.value,
                "citations": [],
                "session_id": session_id,
                "mode": params["mode"],
                "action": params["action"],
                "explain_level": params["explain_level"],
                "duration_seconds": 0.0,
                "evidence_quality": "INSUFFICIENT EVIDENCE",
                "follow_ups": [],
                "structured_data": None
            }

        # Retrieve candidates
        logger.info(f"Retrieving candidates (mode={params['mode']}, action={params['action']}, top_k={params['retrieval_top_k']}) for: {question}")
        candidates = self._retrieval.retrieve(question, top_k=params["retrieval_top_k"], document_ids=document_ids)
        
        if not candidates:
            duration = round(time.time() - start_time, 1)
            return {
                "answer": "I couldn't find sufficient evidence in the uploaded document to answer this reliably.",
                "confidence": 0.0,
                "confidence_level": ConfidenceLevel.LOW.value,
                "category": AnswerCategory.CATEGORY_D.value,
                "citations": [],
                "session_id": session_id,
                "mode": params["mode"],
                "action": params["action"],
                "explain_level": params["explain_level"],
                "duration_seconds": duration,
                "evidence_quality": "INSUFFICIENT EVIDENCE",
                "follow_ups": [],
                "structured_data": None
            }

        # Rerank evidence
        logger.info(f"Reranking top {len(candidates)} candidates down to {params['rerank_top_k']}.")
        reranked = self._reranker.rerank(question, candidates, top_k=params["rerank_top_k"])
        
        # Evaluate confidence and evidence quality
        eval_res = self._confidence.evaluate_detailed(reranked, query=question)
        evidence_quality = ModeService.evaluate_evidence_quality(reranked)
        
        # Category D: Completely unrelated question
        if eval_res.category == AnswerCategory.CATEGORY_D or not eval_res.should_generate:
            duration = round(time.time() - start_time, 1)
            return {
                "answer": CATEGORY_D_RESPONSE, 
                "confidence": eval_res.score,
                "confidence_level": eval_res.level.value,
                "category": eval_res.category.value,
                "citations": [], 
                "session_id": session_id,
                "mode": params["mode"],
                "action": params["action"],
                "explain_level": params["explain_level"],
                "duration_seconds": duration,
                "evidence_quality": "INSUFFICIENT EVIDENCE",
                "follow_ups": [],
                "structured_data": None
            }
            
        citations = self._citation.build_citations(reranked)

        # Build prompt with mode instructions
        context = self._context_builder.build_context(reranked)
        messages = self._context_builder.build_prompt(
            question=question,
            context=context,
            category=eval_res.category,
            confidence_level=eval_res.level,
            mode=params["mode"],
            action=params["action"],
            explain_level=params["explain_level"],
            target_language=target_language,
            quiz_config=quiz_config
        )
        
        try:
            logger.info(f"Generating answer (mode={params['mode']}, predict={params['num_predict']}).")
            answer = await self._llm.generate(
                messages,
                temperature=params["temperature"],
                num_predict=params["num_predict"],
            )
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
        
        duration = round(time.time() - start_time, 1)
        follow_ups = ModeService.generate_follow_ups(question, answer, params["mode"])
        structured_data = ModeService.parse_structured_data(answer, params["mode"], params["action"])

        return {
            "answer": answer,
            "confidence": eval_res.score,
            "confidence_level": eval_res.level.value,
            "category": eval_res.category.value,
            "citations": citations,
            "session_id": session_id,
            "mode": params["mode"],
            "action": params["action"],
            "explain_level": params["explain_level"],
            "duration_seconds": duration,
            "evidence_quality": evidence_quality,
            "follow_ups": follow_ups,
            "structured_data": structured_data
        }
    
    async def answer_stream(
        self, 
        question: str, 
        document_ids: List[str],
        session_id: Optional[str] = None,
        mode: str = "quick",
        action: Optional[str] = None,
        explain_level: Optional[str] = None,
        target_language: Optional[str] = None,
        quiz_config: Optional[dict] = None
    ) -> AsyncIterator[str]:
        """Streaming pipeline yielding SSE events with full multi-mode intelligence."""
        from services.mode_service import ModeService

        start_time = time.time()
        params = self._get_mode_params(mode=mode, action=action, explain_level=explain_level)

        if not question or not question.strip():
            yield json.dumps({"event": "error", "data": "Question cannot be empty."}) + "\n\n"
            return

        yield json.dumps({
            "event": "mode", 
            "data": {
                "mode": params["mode"],
                "action": params["action"],
                "explain_level": params["explain_level"],
                "stages": params["stages"],
                "stage_label": params["stage_label"]
            }
        }) + "\n\n"

        yield json.dumps({"event": "stage", "data": "retrieving"}) + "\n\n"
        candidates = self._retrieval.retrieve(question, top_k=params["retrieval_top_k"], document_ids=document_ids)
        
        if not candidates:
            duration = round(time.time() - start_time, 1)
            yield json.dumps({"event": "token", "data": "I couldn't find sufficient evidence in the uploaded document to answer this reliably."}) + "\n\n"
            yield json.dumps({
                "event": "complete", 
                "data": {
                    "duration_seconds": duration, 
                    "mode": params["mode"],
                    "action": params["action"],
                    "evidence_quality": "INSUFFICIENT EVIDENCE"
                }
            }) + "\n\n"
            return

        yield json.dumps({"event": "stage", "data": "reranking"}) + "\n\n"
        reranked = self._reranker.rerank(question, candidates, top_k=params["rerank_top_k"])
        
        eval_res = self._confidence.evaluate_detailed(reranked, query=question)
        evidence_quality = ModeService.evaluate_evidence_quality(reranked)
        
        yield json.dumps({
            "event": "confidence",
            "data": {
                "score": eval_res.score,
                "level": eval_res.level.value,
                "category": eval_res.category.value,
                "evidence_quality": evidence_quality
            }
        }) + "\n\n"

        if eval_res.category == AnswerCategory.CATEGORY_D or not eval_res.should_generate:
            duration = round(time.time() - start_time, 1)
            yield json.dumps({"event": "stage", "data": "generating"}) + "\n\n"
            yield json.dumps({"event": "token", "data": CATEGORY_D_RESPONSE}) + "\n\n"
            yield json.dumps({
                "event": "complete", 
                "data": {
                    "duration_seconds": duration, 
                    "mode": params["mode"],
                    "action": params["action"],
                    "evidence_quality": "INSUFFICIENT EVIDENCE"
                }
            }) + "\n\n"
            return
            
        context = self._context_builder.build_context(reranked)
        messages = self._context_builder.build_prompt(
            question=question,
            context=context,
            category=eval_res.category,
            confidence_level=eval_res.level,
            mode=params["mode"],
            action=params["action"],
            explain_level=params["explain_level"],
            target_language=target_language,
            quiz_config=quiz_config
        )
        citations = self._citation.build_citations(reranked)
        
        yield json.dumps({"event": "stage", "data": "generating"}) + "\n\n"
        
        full_generated_text = []
        try:
            async for token in self._llm.generate_stream(
                messages,
                temperature=params["temperature"],
                num_predict=params["num_predict"],
            ):
                full_generated_text.append(token)
                yield json.dumps({"event": "token", "data": token}) + "\n\n"
        except OllamaConnectionError:
            err_msg = "Ollama is not running. Start Ollama and try again."
            full_generated_text.append(err_msg)
            yield json.dumps({"event": "token", "data": err_msg}) + "\n\n"
        except OllamaModelNotFoundError:
            err_msg = f"The configured local model '{self._llm.get_model()}' is not installed."
            full_generated_text.append(err_msg)
            yield json.dumps({"event": "token", "data": err_msg}) + "\n\n"
        except OllamaTimeoutError:
            err_msg = "The local model took too long to respond. Try again or select a smaller model."
            full_generated_text.append(err_msg)
            yield json.dumps({"event": "token", "data": err_msg}) + "\n\n"
        except OllamaEmptyResponseError:
            err_msg = "The local model returned an empty response."
            full_generated_text.append(err_msg)
            yield json.dumps({"event": "token", "data": err_msg}) + "\n\n"
        except OllamaError as e:
            full_generated_text.append(e.message)
            yield json.dumps({"event": "token", "data": e.message}) + "\n\n"
        except Exception as e:
            logger.error(f"Stream error: {e}")
            err_msg = "An error occurred while generating the response."
            full_generated_text.append(err_msg)
            yield json.dumps({"event": "token", "data": err_msg}) + "\n\n"
            
        duration = round(time.time() - start_time, 1)
        complete_content = "".join(full_generated_text)
        follow_ups = ModeService.generate_follow_ups(question, complete_content, params["mode"])
        structured_data = ModeService.parse_structured_data(complete_content, params["mode"], params["action"])

        yield json.dumps({"event": "citations", "data": citations}) + "\n\n"
        yield json.dumps({
            "event": "complete",
            "data": {
                "duration_seconds": duration,
                "mode": params["mode"],
                "action": params["action"],
                "explain_level": params["explain_level"],
                "evidence_quality": evidence_quality,
                "follow_ups": follow_ups,
                "structured_data": structured_data
            }
        }) + "\n\n"
