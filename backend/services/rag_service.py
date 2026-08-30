import logging
import json
import time
from typing import List, Dict, Optional, AsyncIterator, Any

from services.retrieval_service import RetrievalService
from services.reranking_service import RerankingService
from services.confidence_service import ConfidenceService
from services.context_builder import ContextBuilder
from services.context_manager import ContextManager
from services.hardware_service import HardwareService
from services.deep_research_service import DeepResearchService
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
    ) -> Dict[str, Any]:
        """Derive adaptive retrieval depth, reranking depth, and token generation parameters via ModeService."""
        from services.mode_service import ModeService
        config = ModeService.get_mode_config(mode=mode, action=action, explain_level=explain_level)
        return {
            "mode": mode,
            "action": action,
            "explain_level": explain_level,
            "num_ctx": config.get("num_ctx", 32768),
            "num_predict": config.get("num_predict", 4096),
            "retrieval_top_k": config.get("top_k", 20),
            "rerank_top_k": config.get("rerank_top_k", 5),
            "temperature": config.get("temperature", 0.1),
            "stages": config.get("stages", []),
            "stage_label": config.get("stage_label", "Retrieving from your document...")
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
        """Full grounded RAG pipeline with multi-mode & adaptive context management."""
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

        # 1. Multi-pass retrieval for Deep Research, or standard hybrid retrieval
        mode_lower = (params["mode"] or "quick").lower()
        if mode_lower == ResponseMode.DEEP_RESEARCH.value:
            logger.info(f"Executing DeepResearch multi-pass retrieval for query: {question}")
            reranked = DeepResearchService.multi_pass_retrieval(
                retrieval=self._retrieval,
                reranker=self._reranker,
                question=question,
                document_ids=document_ids,
                top_k_per_pass=20,
                final_rerank_top_k=params["rerank_top_k"]
            )
        else:
            logger.info(f"Retrieving candidates (mode={params['mode']}, top_k={params['retrieval_top_k']}) for: {question}")
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
            reranked = self._reranker.rerank(question, candidates, top_k=params["rerank_top_k"])

        if not reranked:
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

        # 2. Confidence Evaluation
        eval_res = self._confidence.evaluate_detailed(reranked, query=question)
        evidence_quality = ModeService.evaluate_evidence_quality(reranked)

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

        # 3. Context compaction & prompt preparation
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

        # 4. ContextManager arithmetic
        effective_predict, input_tokens = ContextManager.calculate_effective_num_predict(
            num_ctx=params["num_ctx"],
            messages=messages,
            requested_num_predict=params["num_predict"],
            mode=params["mode"],
            safety_margin=1024
        )

        try:
            logger.info(f"Generating answer (mode={params['mode']}, num_ctx={params['num_ctx']}, predict={effective_predict}).")
            if mode_lower == ResponseMode.DEEP_RESEARCH.value:
                answer = await DeepResearchService.generate_until_complete(
                    llm=self._llm,
                    messages=messages,
                    num_ctx=params["num_ctx"],
                    num_predict=effective_predict,
                    temperature=params["temperature"],
                    max_continuations=3
                )
            else:
                answer = await self._llm.generate(
                    messages,
                    temperature=params["temperature"],
                    num_predict=effective_predict,
                    num_ctx=params["num_ctx"],
                )
        except OllamaConnectionError:
            answer = "Ollama is unavailable. Start Ollama and try again."
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
        """Streaming pipeline yielding SSE events with multi-mode intelligence and auto-completion."""
        from services.mode_service import ModeService

        start_time = time.time()
        params = self._get_mode_params(mode=mode, action=action, explain_level=explain_level)
        mode_lower = (params["mode"] or "quick").lower()

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

        # 1. Retrieval
        yield json.dumps({"event": "stage", "data": "retrieving"}) + "\n\n"
        
        if mode_lower == ResponseMode.DEEP_RESEARCH.value:
            yield json.dumps({"event": "status", "data": "Searching document (Multi-pass retrieval)..."}) + "\n\n"
            reranked = DeepResearchService.multi_pass_retrieval(
                retrieval=self._retrieval,
                reranker=self._reranker,
                question=question,
                document_ids=document_ids,
                top_k_per_pass=20,
                final_rerank_top_k=params["rerank_top_k"]
            )
        else:
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

        if not reranked:
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

        # Context manager calculation
        effective_predict, _ = ContextManager.calculate_effective_num_predict(
            num_ctx=params["num_ctx"],
            messages=messages,
            requested_num_predict=params["num_predict"],
            mode=params["mode"],
            safety_margin=1024
        )

        yield json.dumps({"event": "stage", "data": "generating"}) + "\n\n"
        
        full_generated_tokens = []
        try:
            async for token in self._llm.generate_stream(
                messages,
                temperature=params["temperature"],
                num_predict=effective_predict,
                num_ctx=params["num_ctx"],
            ):
                full_generated_tokens.append(token)
                yield json.dumps({"event": "token", "data": token}) + "\n\n"
        except OllamaConnectionError:
            err_msg = "Ollama is unavailable. Start Ollama and try again."
            full_generated_tokens.append(err_msg)
            yield json.dumps({"event": "token", "data": err_msg}) + "\n\n"
        except OllamaModelNotFoundError:
            err_msg = f"The configured local model '{self._llm.get_model()}' is not installed."
            full_generated_tokens.append(err_msg)
            yield json.dumps({"event": "token", "data": err_msg}) + "\n\n"
        except OllamaTimeoutError:
            err_msg = "The local model took too long to respond. Try again or select a smaller model."
            full_generated_tokens.append(err_msg)
            yield json.dumps({"event": "token", "data": err_msg}) + "\n\n"
        except OllamaEmptyResponseError:
            err_msg = "The local model returned an empty response."
            full_generated_tokens.append(err_msg)
            yield json.dumps({"event": "token", "data": err_msg}) + "\n\n"
        except OllamaError as e:
            full_generated_tokens.append(e.message)
            yield json.dumps({"event": "token", "data": e.message}) + "\n\n"
        except Exception as e:
            logger.error(f"Stream error: {e}")
            err_msg = "An error occurred while generating the response."
            full_generated_tokens.append(err_msg)
            yield json.dumps({"event": "token", "data": err_msg}) + "\n\n"

        complete_content = "".join(full_generated_tokens)

        # 5. Deep Research Stream Auto-Continuation Check
        if mode_lower == ResponseMode.DEEP_RESEARCH.value and len(complete_content) > 100:
            is_complete, reason, remaining_secs = DeepResearchService.check_response_completeness(complete_content)
            continuation_count = 0
            max_continuations = 2

            while not is_complete and continuation_count < max_continuations:
                continuation_count += 1
                logger.info(f"Stream DeepResearch auto-continuation {continuation_count}/{max_continuations} triggered ({reason})...")
                
                yield json.dumps({"event": "stage", "data": "completing"}) + "\n\n"
                yield json.dumps({
                    "event": "status", 
                    "data": f"Completing research response (Pass {continuation_count})..."
                }) + "\n\n"

                continuation_prompt = (
                    f"Continue the previous response from exactly where it stopped. "
                    f"Do NOT repeat any previously written sections or headers. "
                    f"Complete the remaining sections ({', '.join(remaining_secs[:3]) if remaining_secs else 'remaining content'}) "
                    f"and conclude with the Sources & Verified Page Citations section."
                )

                cont_messages = [
                    messages[0],
                    {"role": "user", "content": messages[-1]["content"]},
                    {"role": "assistant", "content": complete_content},
                    {"role": "user", "content": continuation_prompt}
                ]

                cont_predict, _ = ContextManager.calculate_effective_num_predict(
                    num_ctx=params["num_ctx"],
                    messages=cont_messages,
                    requested_num_predict=4096,
                    mode="deep_research",
                    safety_margin=1024
                )

                cont_tokens = []
                try:
                    # Prepend newline separation
                    yield json.dumps({"event": "token", "data": "\n\n"}) + "\n\n"
                    complete_content += "\n\n"

                    async for token in self._llm.generate_stream(
                        cont_messages,
                        temperature=params["temperature"],
                        num_predict=cont_predict,
                        num_ctx=params["num_ctx"],
                    ):
                        cont_tokens.append(token)
                        yield json.dumps({"event": "token", "data": token}) + "\n\n"
                except Exception as cont_err:
                    logger.warning(f"Continuation stream error: {cont_err}")
                    break

                cont_text = "".join(cont_tokens)
                complete_content += cont_text
                is_complete, reason, remaining_secs = DeepResearchService.check_response_completeness(complete_content)

        duration = round(time.time() - start_time, 1)
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
