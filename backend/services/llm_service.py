import logging
import json
import httpx
from typing import AsyncIterator, List, Dict, Optional
from core.config import settings

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL.rstrip('/')
        self.model = settings.LLM_MODEL
        self.timeout = httpx.Timeout(120.0)
    
    async def check_health(self) -> bool:
        """GET {base_url}/api/tags. Returns True if Ollama is reachable."""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                return response.status_code == 200
        except Exception as e:
            logger.error(f"Ollama health check failed: {e}")
            return False
            
    async def list_models(self) -> List[str]:
        """List installed Ollama models."""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                if response.status_code == 200:
                    data = response.json()
                    return [model.get('name') for model in data.get('models', [])]
                return []
        except Exception as e:
            logger.error(f"Failed to list Ollama models: {e}")
            return []
    
    async def is_model_available(self, model: Optional[str] = None) -> bool:
        """Check if configured model is installed."""
        target_model = model or self.model
        models = await self.list_models()
        return any(m.startswith(target_model) for m in models)
    
    async def generate(self, messages: List[Dict[str, str]], 
                       temperature: float = None, top_p: float = None) -> str:
        """POST {base_url}/api/chat with stream=false. Return full response text."""
        temp = temperature if temperature is not None else settings.LLM_TEMPERATURE
        tp = top_p if top_p is not None else settings.LLM_TOP_P
        
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": temp,
                "top_p": tp
            }
        }
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(f"{self.base_url}/api/chat", json=payload)
            response.raise_for_status()
            data = response.json()
            return data.get("message", {}).get("content", "")
    
    async def generate_stream(self, messages: List[Dict[str, str]],
                               temperature: float = None, 
                               top_p: float = None) -> AsyncIterator[str]:
        """POST {base_url}/api/chat with stream=true. Yield tokens as they arrive."""
        temp = temperature if temperature is not None else settings.LLM_TEMPERATURE
        tp = top_p if top_p is not None else settings.LLM_TOP_P
        
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": True,
            "options": {
                "temperature": temp,
                "top_p": tp
            }
        }
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            async with client.stream("POST", f"{self.base_url}/api/chat", json=payload) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line:
                        try:
                            data = json.loads(line)
                            token = data.get("message", {}).get("content", "")
                            if token:
                                yield token
                        except json.JSONDecodeError:
                            logger.warning(f"Failed to parse stream line: {line}")
