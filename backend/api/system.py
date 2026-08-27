import logging
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from database.database import get_db
from schemas.system import SystemStatusResponse, ComponentStatus, ModelsResponse, ModelInfo
from services import vector_store, embedding_service, reranking_service, llm_service

router = APIRouter(prefix="/system", tags=["system"])
logger = logging.getLogger(__name__)


@router.get("/health")
async def health_check():
    """Simple liveness probe."""
    return {"status": "healthy"}


@router.get("/status", response_model=SystemStatusResponse)
async def system_status(db: AsyncSession = Depends(get_db)):
    """Comprehensive system status checking all local components."""
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
        db_status = ComponentStatus(
            name="database",
            status="error",
            detail=str(e),
        )

    # 3. Vector Store
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

    # 4. Embedding Model
    emb_loaded = embedding_service.is_loaded()
    emb_status = ComponentStatus(
        name="embedding_model",
        status="ready" if emb_loaded else "ready",
        detail=f"{embedding_service.get_model_name()} ({'in memory' if emb_loaded else 'lazy load ready'})",
    )

    # 5. Reranker
    rerank_loaded = reranking_service.is_loaded()
    reranker_status = ComponentStatus(
        name="reranker",
        status="ready" if rerank_loaded else "ready",
        detail=f"{reranking_service._model_name} ({'in memory' if rerank_loaded else 'lazy load ready'})",
    )

    # 6. Ollama Service
    try:
        ollama_ok = await llm_service.check_health()
        ollama_status = ComponentStatus(
            name="ollama",
            status="ready" if ollama_ok else "offline",
            detail="Ollama daemon connected" if ollama_ok else "Ollama server unreachable at localhost:11434",
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
            model_ok = await llm_service.is_model_available()
            llm_status = ComponentStatus(
                name="llm_model",
                status="ready" if model_ok else "offline",
                detail=f"Model '{llm_service.model}' available" if model_ok else f"Model '{llm_service.model}' not found in Ollama",
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


@router.get("/models", response_model=ModelsResponse)
async def list_models():
    """List information on local neural models."""
    emb_info = ModelInfo(
        name=embedding_service.get_model_name(),
        status="ready" if embedding_service.is_loaded() else "available",
        dimension=embedding_service.get_dimension(),
    )
    rerank_info = ModelInfo(
        name=reranking_service._model_name,
        status="ready" if reranking_service.is_loaded() else "available",
        dimension=None,
    )
    llm_info = ModelInfo(
        name=llm_service.model,
        status="ready",
        dimension=None,
    )

    return ModelsResponse(
        embedding=emb_info,
        reranker=rerank_info,
        llm=llm_info,
    )
