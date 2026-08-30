import re
import json
import logging
import time
from typing import List, Dict, Any, Optional, Tuple, AsyncIterator

from services.retrieval_service import RetrievalService
from services.reranking_service import RerankingService
from services.ollama_service import OllamaService
from services.context_manager import ContextManager

logger = logging.getLogger(__name__)


class DeepResearchService:
    """Multi-stage local research engine executing multi-pass facet retrieval,
    section blueprint synthesis, and generate_until_complete iterative completion.
    """

    PLANNED_SECTIONS = [
        "EXECUTIVE SUMMARY",
        "RESEARCH PROBLEM & OBJECTIVES",
        "THEORETICAL BACKGROUND",
        "METHODOLOGY & ARCHITECTURE",
        "EXPERIMENTAL SETUP & DATASETS",
        "KEY FINDINGS & RESULTS",
        "STRENGTHS & INNOVATIONS",
        "LIMITATIONS & THREATS TO VALIDITY",
        "CRITICAL OBSERVATIONS",
        "CONCLUSION",
        "SOURCES & PAGE CITATIONS"
    ]

    @classmethod
    def decompose_question(cls, question: str) -> List[str]:
        """Decomposes a complex user research query into 3-5 distinct facet search queries."""
        q_clean = question.strip()
        sub_queries = [
            q_clean,
            f"core problem, background and objectives of {q_clean}",
            f"methodology, algorithms and architectural design for {q_clean}",
            f"experiments, benchmarks, datasets and quantitative results for {q_clean}",
            f"limitations, trade-offs, comparisons and future work for {q_clean}",
        ]
        return sub_queries

    @classmethod
    def multi_pass_retrieval(
        cls,
        retrieval: RetrievalService,
        reranker: RerankingService,
        question: str,
        document_ids: Optional[List[str]] = None,
        top_k_per_pass: int = 20,
        final_rerank_top_k: int = 16
    ) -> List[Dict[str, Any]]:
        """Executes multi-pass hybrid retrieval across all sub-queries, deduplicating by chunk_id
        and reranking the unified evidence pool against the primary user question.
        """
        sub_queries = cls.decompose_question(question)
        seen_chunk_ids = set()
        combined_candidates = []

        for sub_q in sub_queries:
            chunks = retrieval.retrieve(sub_q, top_k=top_k_per_pass, document_ids=document_ids)
            for ch in chunks:
                cid = ch.get("chunk_id") or ch.get("id") or str(ch.get("page_start", 0)) + str(hash(ch.get("content", ch.get("text", ""))[:40]))
                if cid not in seen_chunk_ids:
                    seen_chunk_ids.add(cid)
                    combined_candidates.append(ch)

        logger.info(f"DeepResearch multi-pass retrieved {len(combined_candidates)} unique candidate chunks across {len(sub_queries)} queries.")
        
        # Rerank against primary user query
        if not combined_candidates:
            return []

        reranked = reranker.rerank(question, combined_candidates, top_k=final_rerank_top_k)
        return reranked

    @classmethod
    def check_response_completeness(cls, text: str) -> Tuple[bool, str, List[str]]:
        """Evaluates whether the generated research response is complete or requires continuation.
        
        Checks:
        1. Does it end mid-sentence (no closing punctuation or abrupt word break)?
        2. Did it reach the concluding/SOURCES section?
        3. Are planned sections missing?
        """
        if not text or len(text.strip()) < 150:
            return False, "Response is too short to be complete.", cls.PLANNED_SECTIONS[3:]

        stripped = text.strip()

        # Check for presence of Sources / References or Conclusion
        has_sources = bool(re.search(r'(?:sources|references|verified page citations|citations|bibliography)', stripped, re.IGNORECASE))
        has_conclusion = bool(re.search(r'(?:conclusion|summary of findings|takeaway)', stripped, re.IGNORECASE))

        # Check 1: Mid-sentence termination
        # Valid terminal endings: punctuation (. ! ? : " '), brackets (] ) >), code block ticks (```), or list item endings in sources
        ends_with_terminal = bool(
            re.search(r'[.!?:"\'\)\]`]\s*$', stripped) 
            or (has_sources and len(stripped.splitlines()) > 5 and not stripped.endswith((",", ";", "-", "and", "the", "with", "for", "in", "of")))
        )
        if not ends_with_terminal:
            return False, "Generation stopped in the middle of a sentence.", []

        # Check 2: Identify completed and remaining sections
        completed_sections = []
        for sec in cls.PLANNED_SECTIONS:
            sec_pattern = re.escape(sec.split("&")[0].strip())
            if re.search(sec_pattern, text, re.IGNORECASE):
                completed_sections.append(sec)

        remaining_sections = [s for s in cls.PLANNED_SECTIONS if s not in completed_sections]

        if not has_sources and len(remaining_sections) > 0 and len(text) < 4000:
            return False, f"Missing sections: {', '.join(remaining_sections[:3])}", remaining_sections

        return True, "Response complete.", []

    @classmethod
    async def generate_until_complete(
        cls,
        llm: OllamaService,
        messages: List[Dict[str, str]],
        num_ctx: int,
        num_predict: int,
        temperature: float = 0.20,
        max_continuations: int = 3,
        on_stage_callback: Optional[Any] = None
    ) -> str:
        """Executes iterative generation loop to guarantee that deep research reports
        are completed in full without arbitrary truncation.
        """
        full_response = ""
        current_messages = list(messages)
        continuation_count = 0

        while continuation_count <= max_continuations:
            # Calculate safe predict budget for this turn
            effective_predict, _ = ContextManager.calculate_effective_num_predict(
                num_ctx=num_ctx,
                messages=current_messages,
                requested_num_predict=num_predict,
                mode="deep_research",
                safety_margin=1024
            )

            chunk_text = await llm.generate(
                current_messages,
                temperature=temperature,
                num_predict=effective_predict,
                num_ctx=num_ctx
            )

            if not full_response:
                full_response = chunk_text
            else:
                # Seamlessly merge continuation
                full_response = cls._merge_continuation(full_response, chunk_text)

            # Completeness evaluation
            is_complete, reason, remaining_secs = cls.check_response_completeness(full_response)
            if is_complete or continuation_count >= max_continuations:
                if is_complete:
                    logger.info(f"DeepResearch completed naturally after {continuation_count} continuations.")
                else:
                    logger.warning(f"DeepResearch reached max continuation budget ({max_continuations}). Stopping safely.")
                break

            continuation_count += 1
            logger.info(f"DeepResearch auto-continuation pass {continuation_count}/{max_continuations} triggered ({reason})...")
            
            if on_stage_callback:
                try:
                    await on_stage_callback(f"Completing research response (Pass {continuation_count})...")
                except Exception:
                    pass

            # Build continuation prompt with previous context
            continuation_prompt = (
                f"Continue the previous response from exactly where it stopped. "
                f"Do NOT repeat any previously written sections or text. "
                f"Complete the remaining sections ({', '.join(remaining_secs[:3]) if remaining_secs else 'remaining content'}) "
                f"and conclude with the Sources & Page Citations section."
            )

            current_messages = [
                messages[0],  # System prompt
                {"role": "user", "content": messages[-1]["content"]},
                {"role": "assistant", "content": full_response},
                {"role": "user", "content": continuation_prompt}
            ]

        return full_response

    @staticmethod
    def _merge_continuation(existing: str, continuation: str) -> str:
        """Merges continuation text into the existing response, removing duplicate header overlaps."""
        cleaned_cont = continuation.strip()
        # If continuation repeats the last heading or first line
        lines = cleaned_cont.split("\n")
        first_line = lines[0].strip()
        if first_line and first_line in existing:
            cleaned_cont = "\n".join(lines[1:]).strip()

        # Connect with clean newline
        if existing.endswith("\n\n"):
            return existing + cleaned_cont
        elif existing.endswith("\n"):
            return existing + "\n" + cleaned_cont
        else:
            return existing + "\n\n" + cleaned_cont
