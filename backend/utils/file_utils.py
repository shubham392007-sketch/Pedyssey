import os
import re
import uuid
from pathlib import Path
from typing import Tuple, Optional

from core.constants import ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES
from core.config import settings

def sanitize_filename(filename: str) -> str:
    """Remove path traversal chars, limit length, keep extension."""
    name = os.path.basename(filename)
    name = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', name)
    if len(name) > 100:
        base, ext = os.path.splitext(name)
        name = base[:100 - len(ext)] + ext
    return name

def validate_pdf_file(filename: str, content_type: Optional[str], file_size: int) -> Tuple[bool, Optional[str]]:
    """Check extension, MIME type, file size against limits."""
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"Invalid extension. Allowed: {ALLOWED_EXTENSIONS}"
    
    if content_type and content_type not in ALLOWED_MIME_TYPES:
        return False, f"Invalid MIME type. Allowed: {ALLOWED_MIME_TYPES}"
        
    if file_size > settings.MAX_FILE_SIZE:
        return False, f"File too large. Max size: {format_file_size(settings.MAX_FILE_SIZE)}"
        
    return True, None

def generate_document_id() -> str:
    """Return a new UUID string."""
    return str(uuid.uuid4())

def format_file_size(size_bytes: int) -> str:
    """Format file size in human readable format."""
    if size_bytes == 0:
        return "0B"
    size_name = ("B", "KB", "MB", "GB", "TB")
    import math
    i = int(math.floor(math.log(size_bytes, 1024)))
    p = math.pow(1024, i)
    s = round(size_bytes / p, 2)
    return f"{s}{size_name[i]}"

def get_safe_path(base_dir: Path, *parts: str) -> Path:
    """Safely join paths preventing directory traversal."""
    joined = base_dir.joinpath(*parts).resolve()
    if not str(joined).startswith(str(base_dir.resolve())):
        raise ValueError("Directory traversal attempt detected")
    return joined
