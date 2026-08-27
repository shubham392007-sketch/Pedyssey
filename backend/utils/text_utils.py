import re
import tiktoken

def count_tokens(text: str, encoding_name: str = "cl100k_base") -> int:
    """Use tiktoken to count tokens."""
    try:
        encoding = tiktoken.get_encoding(encoding_name)
        return len(encoding.encode(text, disallowed_special=()))
    except Exception:
        # Fallback approximation
        return len(text.split()) * 4 // 3

def truncate_to_tokens(text: str, max_tokens: int, encoding_name: str = "cl100k_base") -> str:
    """Truncate text to token limit."""
    try:
        encoding = tiktoken.get_encoding(encoding_name)
        tokens = encoding.encode(text, disallowed_special=())
        if len(tokens) <= max_tokens:
            return text
        return encoding.decode(tokens[:max_tokens])
    except Exception:
        # Fallback approximation
        words = text.split()
        max_words = max_tokens * 3 // 4
        return " ".join(words[:max_words])

def split_into_sentences(text: str) -> list[str]:
    """Split text into sentences using regex for common patterns while handling abbreviations."""
    # Simple rule-based sentence splitter
    text = text.replace('\n', ' ')
    # Look behind for period/exclamation/question mark, look ahead for space and capital letter
    sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z])', text)
    return [s.strip() for s in sentences if s.strip()]

def count_words(text: str) -> int:
    """Simple word count."""
    return len(text.split())

def is_meaningful_text(text: str, min_words: int = 10, min_alpha_ratio: float = 0.3) -> bool:
    """Check if text contains enough meaningful content."""
    words = count_words(text)
    if words < min_words:
        return False
        
    alpha_chars = sum(1 for c in text if c.isalpha())
    if len(text) == 0:
        return False
        
    alpha_ratio = alpha_chars / len(text)
    return alpha_ratio >= min_alpha_ratio
