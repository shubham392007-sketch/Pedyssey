import logging
import json
import re
import httpx
from typing import AsyncIterator, List, Dict, Optional, Any
from core.config import settings

logger = logging.getLogger(__name__)


class OllamaError(Exception):
    """Base exception for Ollama errors."""
    def __init__(self, message: str, status_code: int = 500):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class OllamaConnectionError(OllamaError):
    """Raised when the Ollama server cannot be reached."""
    def __init__(self, message: str = "Ollama is not running. Start Ollama and try again."):
        super().__init__(message, status_code=503)


class OllamaModelNotFoundError(OllamaError):
    """Raised when the requested model is not pulled in Ollama."""
    def __init__(self, model_name: str):
        super().__init__(f"The configured local model '{model_name}' is not installed.", status_code=404)


class OllamaTimeoutError(OllamaError):
    """Raised when model inference times out."""
    def __init__(self, message: str = "The local model took too long to respond. Try again or select a smaller model."):
        super().__init__(message, status_code=504)


class OllamaEmptyResponseError(OllamaError):
    """Raised when Ollama returns an empty generation."""
    def __init__(self, message: str = "The local model returned an empty response."):
        super().__init__(message, status_code=502)


class OllamaService:
    """Dedicated backend service for communicating with a local Ollama instance."""

    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL.rstrip('/')
        self.model = settings.OLLAMA_MODEL
        self._resolved_model_cache: Optional[str] = None
        self.timeout_seconds = max(float(getattr(settings, 'OLLAMA_TIMEOUT', 300)), 300.0)
        self.timeout = httpx.Timeout(self.timeout_seconds, connect=10.0)
        self.num_ctx = getattr(settings, 'OLLAMA_NUM_CTX', 8192)
        self.num_predict = getattr(settings, 'OLLAMA_NUM_PREDICT', 4096)

    @staticmethod
    def _strip_think_tags(text: str) -> str:
        """Remove <think>...</think> blocks produced by Qwen3's thinking mode."""
        return re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()

    def get_base_url(self) -> str:
        return self.base_url

    def get_model(self) -> str:
        return self.model

    def set_model(self, model_name: str) -> None:
        self.model = model_name
        self._resolved_model_cache = None

    async def check_health(self) -> tuple[bool, str]:
        """Check if Ollama server is reachable."""
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(5.0, connect=3.0)) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    return True, "reachable"
                return False, f"HTTP {res.status_code}"
        except (httpx.ConnectError, httpx.ConnectTimeout):
            return False, "connection_refused"
        except Exception as e:
            logger.debug(f"Ollama health check error: {e}")
            return False, str(e)

    async def list_models(self) -> List[Dict[str, Any]]:
        """Retrieve all installed models in the local Ollama instance."""
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(5.0, connect=3.0)) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    models_raw = data.get("models", [])
                    return [
                        {
                            "name": m.get("name", ""),
                            "size": m.get("size", 0),
                            "modified_at": m.get("modified_at", ""),
                            "digest": m.get("digest", "")
                        }
                        for m in models_raw if m.get("name")
                    ]
                return []
        except Exception as e:
            logger.debug(f"Failed to list Ollama models: {e}")
            return []

    async def _resolve_target_model(self, model: Optional[str] = None) -> str:
        """Resolve model name against installed models in Ollama."""
        target = model or self.model
        if not model and self._resolved_model_cache:
            return self._resolved_model_cache
            
        models = await self.list_models()
        if not models:
            return target
        names = [m["name"] for m in models]
        for n in names:
            if n == target or n.startswith(f"{target}:") or target.startswith(f"{n}:"):
                if not model:
                    self._resolved_model_cache = n
                return n
            if n.split(":")[0] == target.split(":")[0]:
                if not model:
                    self._resolved_model_cache = n
                return n
        if names:
            if not model:
                self._resolved_model_cache = names[0]
            return names[0]
        return target

    async def is_model_available(self, model: Optional[str] = None) -> bool:
        """Verify whether the specified or configured model exists in local Ollama."""
        target_model = model or self.model
        models = await self.list_models()
        model_names = [m["name"] for m in models]
        
        for name in model_names:
            if name == target_model or name.startswith(f"{target_model}:") or target_model.startswith(f"{name}:"):
                return True
            if name.split(":")[0] == target_model.split(":")[0]:
                return True
        return len(model_names) > 0

    async def generate(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        top_p: Optional[float] = None,
        num_predict: Optional[int] = None,
        num_ctx: Optional[int] = None,
    ) -> str:
        """Generate full response text using the local Ollama model with context adaptability and fallback."""
        target_model = await self._resolve_target_model(model)
        temp = temperature if temperature is not None else 0.1
        tp = top_p if top_p is not None else 0.9
        ctx = num_predict if num_ctx is None else num_ctx
        ctx_val = num_ctx if num_ctx is not None else self.num_ctx
        pred = num_predict if num_predict is not None else self.num_predict

        async def _call_api(effective_ctx: int) -> str:
            payload = {
                "model": target_model,
                "messages": messages,
                "stream": False,
                "options": {
                    "temperature": temp,
                    "top_p": tp,
                    "repeat_penalty": 1.15,
                    "repeat_last_n": 128,
                    "num_ctx": effective_ctx,
                    "num_predict": pred,
                }
            }

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(f"{self.base_url}/api/chat", json=payload)
                if res.status_code == 404:
                    raise OllamaModelNotFoundError(target_model)
                res.raise_for_status()
                data = res.json()
                content = data.get("message", {}).get("content", "").strip()
                content = self._strip_think_tags(content)
                if not content:
                    raise OllamaEmptyResponseError()
                return content

        try:
            return await _call_api(ctx_val)
        except (OllamaConnectionError, OllamaModelNotFoundError, OllamaTimeoutError, OllamaEmptyResponseError):
            raise
        except (httpx.ConnectError, httpx.ConnectTimeout):
            logger.warning(f"Failed to connect to Ollama at {self.base_url}")
            raise OllamaConnectionError()
        except httpx.ReadTimeout:
            logger.warning(f"Ollama inference timed out after {self.timeout_seconds}s")
            raise OllamaTimeoutError()
        except Exception as e:
            # If large context fails, try safe fallback once
            if ctx_val > 32768:
                fallback_ctx = 32768
                logger.warning(f"Ollama generation failed with num_ctx={ctx_val} ({e}). Retrying with safe fallback num_ctx={fallback_ctx}...")
                try:
                    return await _call_api(fallback_ctx)
                except Exception as fallback_err:
                    logger.error(f"Fallback generation also failed: {fallback_err}")
            logger.error(f"Unexpected error during Ollama generation: {e}")
            raise OllamaError("Failed to generate response from local model.")

    async def generate_stream(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        top_p: Optional[float] = None,
        num_predict: Optional[int] = None,
        num_ctx: Optional[int] = None,
    ) -> AsyncIterator[str]:
        """Stream response tokens from the local Ollama model.
        
        Filters out <think>...</think> blocks produced by Qwen3's thinking mode
        so only the actual answer is yielded to the caller.
        """
        target_model = await self._resolve_target_model(model)
        temp = temperature if temperature is not None else 0.1
        tp = top_p if top_p is not None else 0.9
        ctx_val = num_ctx if num_ctx is not None else self.num_ctx
        pred = num_predict if num_predict is not None else self.num_predict

        payload = {
            "model": target_model,
            "messages": messages,
            "stream": True,
            "options": {
                "temperature": temp,
                "top_p": tp,
                "repeat_penalty": 1.15,
                "repeat_last_n": 128,
                "num_ctx": ctx_val,
                "num_predict": pred,
            }
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                async with client.stream("POST", f"{self.base_url}/api/chat", json=payload) as response:
                    if response.status_code == 404:
                        raise OllamaModelNotFoundError(target_model)
                    response.raise_for_status()
                    
                    # State machine to filter <think>...</think> blocks
                    in_think = False
                    buffer = ""
                    
                    async for line in response.aiter_lines():
                        if line:
                            try:
                                data = json.loads(line)
                                token = data.get("message", {}).get("content", "")
                                if not token:
                                    continue
                                
                                buffer += token
                                
                                # Check for <think> opening
                                if not in_think and "<think>" in buffer:
                                    # Yield everything before <think>
                                    before = buffer[:buffer.index("<think>")]
                                    if before:
                                        yield before
                                    buffer = buffer[buffer.index("<think>"):]
                                    in_think = True
                                
                                # Check for </think> closing
                                if in_think and "</think>" in buffer:
                                    after = buffer[buffer.index("</think>") + len("</think>"):]
                                    buffer = after
                                    in_think = False
                                    # Yield any content after </think>
                                    if buffer:
                                        yield buffer
                                        buffer = ""
                                    continue
                                
                                # If inside think block, keep buffering (don't yield)
                                if in_think:
                                    continue
                                
                                # Not in think block — yield the buffer and reset
                                if buffer:
                                    yield buffer
                                    buffer = ""
                                    
                            except json.JSONDecodeError:
                                pass
                    
                    # Yield any remaining buffer after stream ends
                    if buffer and not in_think:
                        yield buffer
                        
        except (httpx.ConnectError, httpx.ConnectTimeout):
            logger.warning(f"Failed to connect to Ollama stream at {self.base_url}")
            raise OllamaConnectionError()
        except httpx.ReadTimeout:
            logger.warning(f"Ollama streaming timed out after {self.timeout_seconds}s")
            raise OllamaTimeoutError()
        except OllamaError:
            raise
        except Exception as e:
            logger.error(f"Unexpected error during Ollama stream: {e}")
            raise OllamaError("Failed to stream response from local model.")
