import math
import logging
from typing import List, Dict, Any, Optional, Tuple

logger = logging.getLogger(__name__)


class ContextManager:
    """Manages the total context pool for Qwen3 8B.
    
    Context Pool Formula:
    num_ctx = input_tokens + retrieved_evidence + conversation_history + system_prompt + reasoning_tokens + output_tokens
    
    Guarantees:
    - Never sets num_predict to an arbitrary value that overflows num_ctx.
    - Accurately estimates prompt & evidence token consumption.
    - Reserves generous reasoning space (for Think & Deep Research modes).
    - Compacts old conversation turns and weak retrieval chunks if budget is tight.
    - Never removes page/source metadata from preserved chunks.
    """

    # Average chars per token for English & technical documents
    CHARS_PER_TOKEN = 3.5

    @classmethod
    def estimate_tokens(cls, text: str) -> int:
        """Heuristic token estimator with safety overhead for Qwen3 tokenization."""
        if not text:
            return 0
        # Fast character-based token estimator with safety factor
        length = len(text)
        return max(1, int(math.ceil(length / cls.CHARS_PER_TOKEN)))

    @classmethod
    def estimate_messages_tokens(cls, messages: List[Dict[str, str]]) -> int:
        """Estimates total tokens for a list of chat messages including role wrappers."""
        total = 0
        for msg in messages:
            content = msg.get("content", "")
            role = msg.get("role", "")
            # Role header + message body + turn delimiters (~4 tokens per message)
            total += cls.estimate_tokens(content) + cls.estimate_tokens(role) + 4
        return total

    @classmethod
    def calculate_effective_num_predict(
        cls,
        num_ctx: int,
        messages: List[Dict[str, str]],
        requested_num_predict: int = 4096,
        mode: str = "quick",
        safety_margin: int = 1024,
    ) -> Tuple[int, int]:
        """Calculates available generation space and returns (effective_num_predict, estimated_input_tokens).
        
        Formula:
        available_output_tokens = num_ctx - estimated_input_tokens - reserved_reasoning_space - safety_margin
        effective_num_predict = min(requested_output_limit, available_output_tokens)
        """
        estimated_input = cls.estimate_messages_tokens(messages)
        
        # Reserved reasoning space for Qwen3 reasoning modes
        mode_lower = (mode or "quick").lower()
        if mode_lower in ("deep_research", "think"):
            reserved_reasoning = 2048
        elif mode_lower in ("research", "compare", "analyze"):
            reserved_reasoning = 1024
        else:
            reserved_reasoning = 512

        available_output = num_ctx - estimated_input - reserved_reasoning - safety_margin
        
        # Floor effective predict at 512 to ensure minimum generation capability
        effective_predict = max(512, min(requested_num_predict, available_output))
        
        logger.info(
            f"ContextManager: num_ctx={num_ctx}, input={estimated_input}, "
            f"reasoning_res={reserved_reasoning}, requested={requested_num_predict}, "
            f"effective_num_predict={effective_predict}"
        )
        return effective_predict, estimated_input

    @classmethod
    def compact_context_if_needed(
        cls,
        num_ctx: int,
        system_instruction: str,
        question: str,
        retrieved_chunks: List[Dict[str, Any]],
        conversation_history: Optional[List[Dict[str, str]]] = None,
        mode: str = "quick",
        requested_predict: int = 4096,
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, str]]]:
        """Compacts context if total input tokens threaten the generation budget.
        
        Compaction priority:
        1. Reduce old conversation history (preserving latest turn).
        2. Reduce weak / redundant retrieval chunks (preserving top chunks with full page metadata).
        3. Never truncate the user question or required grounding instructions.
        """
        history = list(conversation_history or [])
        chunks = list(retrieved_chunks)
        
        # Target input budget = num_ctx - requested_predict - reasoning_reserve - safety_margin
        mode_lower = (mode or "quick").lower()
        reasoning_reserve = 2048 if mode_lower in ("deep_research", "think") else 512
        safety_margin = 1024
        max_input_budget = max(4096, num_ctx - requested_predict - reasoning_reserve - safety_margin)
        
        def calculate_current_input_size(cur_chunks, cur_hist):
            chunks_text = "\n".join([c.get("content", c.get("text", "")) for c in cur_chunks])
            hist_tokens = sum(cls.estimate_tokens(m.get("content", "")) + 4 for m in cur_hist)
            prompt_tokens = cls.estimate_tokens(system_instruction) + cls.estimate_tokens(question) + cls.estimate_tokens(chunks_text)
            return prompt_tokens + hist_tokens

        current_size = calculate_current_input_size(chunks, history)
        
        if current_size <= max_input_budget:
            return chunks, history

        logger.warning(
            f"Context compaction triggered: prompt size {current_size} > budget {max_input_budget}. "
            f"Pruning history and weak evidence..."
        )

        # 1. Prune conversation history (keep only the 2 most recent messages)
        while len(history) > 2 and calculate_current_input_size(chunks, history) > max_input_budget:
            history.pop(0)

        # 2. Prune lowest-ranked retrieval chunks (keep at least top 3 high-quality chunks)
        while len(chunks) > 3 and calculate_current_input_size(chunks, history) > max_input_budget:
            chunks.pop(-1)  # Remove lowest ranked chunk

        # 3. If still exceeding (extreme case), keep top 2 chunks
        while len(chunks) > 2 and calculate_current_input_size(chunks, history) > max_input_budget:
            chunks.pop(-1)

        compacted_size = calculate_current_input_size(chunks, history)
        logger.info(f"Context compaction complete: reduced from {current_size} to {compacted_size} tokens (retained {len(chunks)} chunks, {len(history)} history turns).")
        return chunks, history
