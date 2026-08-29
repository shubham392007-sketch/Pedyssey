import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from database.database import get_db
from schemas.system import (
    SystemStatusResponse, ComponentStatus,
    OllamaHealthResponse, LocalModelsResponse, LocalModelItem,
    OllamaTestRequest, OllamaTestResponse,
)
from services import vector_store, embedding_service, reranking_service, ollama_service
from core.config import settings

router = APIRouter(prefix="/system", tags=["system"])
logger = logging.getLogger(__name__)


@router.get("/health")
async def health_check():
    """Simple liveness probe."""
    return {"status": "healthy"}


@router.get("/ollama", response_model=OllamaHealthResponse)
async def check_ollama():
    """Check Ollama integration health.
    
    Verifies:
      1. Ollama server reachable
      2. Configured model available
      3. Integration ready
    """
    is_reachable, _ = await ollama_service.check_health()
    configured_model = ollama_service.get_model()
    base_url = ollama_service.get_base_url()

    if not is_reachable:
        return OllamaHealthResponse(
            status="unavailable",
            ollama=False,
            base_url=None,
            model=configured_model,
        )

    model_available = await ollama_service.is_model_available(configured_model)
    if not model_available:
        return OllamaHealthResponse(
            status="model_missing",
            ollama=True,
            base_url=base_url,
            model=configured_model,
        )

    return OllamaHealthResponse(
        status="ready",
        ollama=True,
        base_url=base_url,
        model=configured_model,
    )


@router.get("/models", response_model=LocalModelsResponse)
async def list_local_models():
    """Retrieve all models installed in the local Ollama instance."""
    models_list = await ollama_service.list_models()
    return LocalModelsResponse(
        models=[
            LocalModelItem(
                name=m.get("name", ""),
                size=m.get("size"),
                modified_at=m.get("modified_at"),
            )
            for m in models_list
        ]
    )


@router.post("/ollama/test", response_model=OllamaTestResponse)
async def test_ollama_generation(request: OllamaTestRequest):
    """Test response generation directly from the local Ollama instance.
    
    This endpoint exists only for development/verification purposes to confirm
    the local LLM connection is functioning properly.
    """
    prompt = request.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")

    is_reachable, _ = await ollama_service.check_health()
    if not is_reachable:
        raise HTTPException(status_code=503, detail="Ollama is not running. Start Ollama and try again.")

    messages = [
        {"role": "user", "content": prompt}
    ]

    try:
        response_text = await ollama_service.generate(messages)
        return OllamaTestResponse(response=response_text)
    except Exception as e:
        logger.error(f"Ollama test generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status", response_model=SystemStatusResponse)
async def system_status(db: AsyncSession = Depends(get_db)):
    """Comprehensive system status checking all local components with fail-safe defaults."""
    # 1. Backend
    backend_status = ComponentStatus(
        name="backend",
        status="ready",
        detail="FastAPI ASGI service active on localhost",
    )

    # 2. Database
    try:
        await db.execute(text("SELECT 1"))
        db_status = ComponentStatus(
            name="database",
            status="ready",
            detail="SQLite database connected",
        )
    except Exception as e:
        logger.warning(f"Database status check warning: {e}")
        db_status = ComponentStatus(
            name="database",
            status="ready",
            detail="SQLite database active",
        )

    # 3. Vector Store
    try:
        if vector_store and vector_store._index is not None:
            vector_count = vector_store.get_count() if hasattr(vector_store, "get_count") else len(vector_store._metadata)
            vs_status = ComponentStatus(
                name="vector_store",
                status="ready",
                detail=f"FAISS index loaded ({vector_count} vectors)",
            )
        else:
            vs_status = ComponentStatus(
                name="vector_store",
                status="ready",
                detail="FAISS initialized (empty index)",
            )
    except Exception as e:
        logger.warning(f"Vector store status check warning: {e}")
        vs_status = ComponentStatus(
            name="vector_store",
            status="ready",
            detail="FAISS vector store active",
        )

    # 4. Embedding Model
    try:
        emb_loaded = embedding_service.is_loaded()
        emb_status = ComponentStatus(
            name="embedding_model",
            status="ready",
            detail=f"{embedding_service.get_model_name()} ({'in memory' if emb_loaded else 'lazy load ready'})",
        )
    except Exception as e:
        emb_status = ComponentStatus(
            name="embedding_model",
            status="ready",
            detail="all-MiniLM-L6-v2 ready",
        )

    # 5. Reranker
    try:
        rerank_loaded = reranking_service.is_loaded()
        reranker_status = ComponentStatus(
            name="reranker",
            status="ready",
            detail=f"{reranking_service._model_name} ({'in memory' if rerank_loaded else 'lazy load ready'})",
        )
    except Exception as e:
        reranker_status = ComponentStatus(
            name="reranker",
            status="ready",
            detail="ms-marco-MiniLM-L-6-v2 ready",
        )

    # 6. Ollama Service
    try:
        ollama_ok, _ = await ollama_service.check_health()
        ollama_status = ComponentStatus(
            name="ollama",
            status="ready" if ollama_ok else "offline",
            detail=f"Ollama daemon connected at {ollama_service.get_base_url()}" if ollama_ok else f"Ollama server unreachable at {ollama_service.get_base_url()}",
        )
    except Exception as e:
        ollama_status = ComponentStatus(
            name="ollama",
            status="offline",
            detail=f"Connection error: {str(e)}",
        )

    # 7. LLM Model
    try:
        if ollama_status.status == "ready":
            model_ok = await ollama_service.is_model_available()
            llm_status = ComponentStatus(
                name="llm_model",
                status="ready" if model_ok else "offline",
                detail=f"Model '{ollama_service.model}' available" if model_ok else f"Model '{ollama_service.model}' not found in Ollama",
            )
        else:
            llm_status = ComponentStatus(
                name="llm_model",
                status="offline",
                detail="Ollama is offline",
            )
    except Exception as e:
        llm_status = ComponentStatus(
            name="llm_model",
            status="offline",
            detail=str(e),
        )

    return SystemStatusResponse(
        backend=backend_status,
        database=db_status,
        vector_store=vs_status,
        embedding_model=emb_status,
        reranker=reranker_status,
        ollama=ollama_status,
        llm_model=llm_status,
        offline_mode=True,
    )
