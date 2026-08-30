import json
import time
import logging
from typing import AsyncIterator, Optional, List
from core.constants import SYSTEM_PROMPT, AnswerCategory
from services.mode_service import ModeService
from services.ollama_service import OllamaConnectionError, OllamaModelNotFoundError, OllamaTimeoutError, OllamaEmptyResponseError, OllamaError
from services.hardware_service import HardwareService

logger = logging.getLogger(__name__)


class LensService:
    def __init__(
        self,
        retrieval,
        reranker,
        confidence,
        context_builder,
        llm,
        citation,
    ):
        self._retrieval = retrieval
        self._reranker = reranker
        self._confidence = confidence
        self._context_builder = context_builder
        self._llm = llm
        self._citation = citation

    @staticmethod
    def get_action_instruction(lens_action: str, target_language: str = 'hindi') -> tuple[str, str]:
        actions = {
            "ask": (
                "Ask",
                "Answer the user's question about this specific selection using the selected passage as primary context "
                "and the supporting document context as secondary evidence. Cite page numbers for all claims. "
                "If the user did not provide a question, explain what the selected passage means and its significance."
            ),
            "explain": (
                "Explain",
                "Explain the selected passage clearly and thoroughly. Use supporting context from other sections of the document "
                "to provide definitions for technical terms, background context, and clarify complex concepts. "
                "Structure your explanation with: 1) A plain-language summary, 2) Key terms defined, 3) How it connects to other parts of the document. "
                "Cite page numbers in parentheses."
            ),
            "analyze": (
                "Analyze",
                "Critically analyze the selected passage. Examine the claims, methodology, assumptions, reasoning, and implications. "
                "Use evidence from the rest of the document to assess validity. Structure your analysis with: "
                "1) Core claim/argument, 2) Evidence assessment, 3) Methodology critique, 4) Strengths and weaknesses, 5) Implications. "
                "Cite page numbers for all cross-references."
            ),
            "verify": (
                "Verify",
                "Verify every factual claim in the selected passage by cross-referencing with other sections of the document. "
                "For each claim, provide your verdict: SUPPORTED (found confirming evidence), PARTIALLY SUPPORTED (some evidence, some gaps), "
                "CONTRADICTED (conflicting evidence found), or INSUFFICIENT EVIDENCE (not enough data to verify). "
                "Structure as a claim-by-claim verification table. Cite page numbers for all evidence used."
            ),
            "compare": (
                "Compare",
                "Compare the selected passage with related content found elsewhere in the document. "
                "Identify: 1) Similarities and agreements, 2) Differences and contradictions, 3) Complementary information, "
                "4) Evolution of ideas across sections. Present as a structured comparison with page citations. "
                "Use a Markdown table if appropriate."
            ),
            "find_evidence": (
                "Find Evidence",
                "Find ALL evidence in the document that supports, contradicts, or relates to the claims in the selected passage. "
                "Organize findings into: 1) Supporting evidence (with page numbers), 2) Contradicting evidence (with page numbers), "
                "3) Related context (with page numbers). Be exhaustive — search across all sections and pages."
            ),
            "summarize": (
                "Summarize",
                "Provide a concise, accurate summary of the selected passage. Place it in the broader context of the document. "
                "Include: 1) Core message in 1-2 sentences, 2) Key details and data points, 3) How it fits within the document's overall argument. "
                "Cite the relevant page number(s)."
            ),
            "translate": (
                "Translate",
                f"Translate the selected passage accurately into {target_language}. "
                "Preserve all technical terms, mathematical formulas, citation markers, and proper nouns. "
                "Add brief translator notes in brackets [TN: ...] for terms that have no direct equivalent."
            ),
            "create_notes": (
                "Create Notes",
                "Create structured study notes from the selected passage. Include: "
                "1) Key Concepts (bulleted list with definitions), 2) Important Facts & Data Points, "
                "3) Connections to Other Topics in the document (with page references), "
                "4) Potential Exam/Review Questions, 5) Summary in your own words. "
                "Use clear Markdown formatting with headings."
            ),
        }
        return actions.get(lens_action, actions["ask"])

    async def action_stream(
        self,
        selected_text: str,
        selected_page: Optional[int] = None,
        lens_action: str = "ask",
        question: Optional[str] = None,
        document_ids: Optional[List[str]] = None,
        session_id: Optional[str] = None,
        mode: str = "quick",
        target_language: str = "hindi"
    ) -> AsyncIterator[str]:
        start_time = time.time()
        
        # Get mode params
        params = ModeService.get_mode_config(mode=mode)
        
        from services.context_manager import ContextManager
        
        yield json.dumps({
            "event": "mode", 
            "data": {
                "mode": mode,
                "action": lens_action,
                "explain_level": None,
                "stages": params["stages"],
                "stage_label": params["stage_label"]
            }
        }) + "\n\n"

        yield json.dumps({"event": "stage", "data": "retrieving"}) + "\n\n"
        
        candidates = self._retrieval.retrieve(selected_text, top_k=params["top_k"], document_ids=document_ids)
        
        if not candidates:
            duration = round(time.time() - start_time, 1)
            yield json.dumps({"event": "token", "data": "I couldn't find sufficient evidence in the uploaded document to analyze this selection."}) + "\n\n"
            yield json.dumps({
                "event": "complete", 
                "data": {
                    "duration_seconds": duration, 
                    "mode": mode,
                    "action": lens_action,
                    "evidence_quality": "INSUFFICIENT EVIDENCE"
                }
            }) + "\n\n"
            return

        yield json.dumps({"event": "stage", "data": "reranking"}) + "\n\n"
        reranked = self._reranker.rerank(selected_text, candidates, top_k=params["rerank_top_k"])

        if not reranked:
            duration = round(time.time() - start_time, 1)
            yield json.dumps({"event": "token", "data": "I couldn't find sufficient evidence in the uploaded document to analyze this selection."}) + "\n\n"
            yield json.dumps({
                "event": "complete", 
                "data": {
                    "duration_seconds": duration, 
                    "mode": mode,
                    "action": lens_action,
                    "evidence_quality": "INSUFFICIENT EVIDENCE"
                }
            }) + "\n\n"
            return

        eval_res = self._confidence.evaluate_detailed(reranked, query=selected_text)
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
            yield json.dumps({"event": "token", "data": "The uploaded documents do not contain information related to this selection."}) + "\n\n"
            yield json.dumps({
                "event": "complete", 
                "data": {
                    "duration_seconds": duration, 
                    "mode": mode,
                    "action": lens_action,
                    "evidence_quality": "INSUFFICIENT EVIDENCE"
                }
            }) + "\n\n"
            return

        rag_context = self._context_builder.build_context(reranked)
        citations = self._citation.build_citations(reranked)
        
        action_label, action_instruction = self.get_action_instruction(lens_action, target_language)
        
        page_str = str(selected_page) if selected_page else "Unknown"
        optional_user_question = f"USER QUESTION: {question}" if question else ""
        
        user_content = (
            f"=== PRIMARY SELECTION (from Page {page_str}) ===\n"
            f"{selected_text}\n\n"
            f"=== SUPPORTING DOCUMENT CONTEXT ===\n"
            f"{rag_context}\n\n"
            f"LENS ACTION: {action_label}\n"
            f"{action_instruction}\n"
            f"{optional_user_question}"
        )
        
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content}
        ]

        effective_predict, _ = ContextManager.calculate_effective_num_predict(
            num_ctx=params["num_ctx"],
            messages=messages,
            requested_num_predict=params["num_predict"],
            mode=mode,
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

        # Finalize
        duration = round(time.time() - start_time, 1)
        yield json.dumps({"event": "citations", "data": citations}) + "\n\n"
        yield json.dumps({
            "event": "complete",
            "data": {
                "duration_seconds": duration,
                "mode": mode,
                "action": lens_action,
                "evidence_quality": evidence_quality,
                "citations": citations
            }
        }) + "\n\n"
