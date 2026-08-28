import logging
from typing import Dict, Optional
from fastapi import APIRouter, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.database import get_db
from database.models import Setting
from schemas.system import SettingsRequest, SettingsResponse
from core.config import settings as core_settings
from services import ollama_service

router = APIRouter(prefix="/settings", tags=["settings"])
logger = logging.getLogger(__name__)


def _get_default_settings_dict() -> Dict[str, str]:
    return {
        "embedding_model": str(core_settings.EMBEDDING_MODEL),
        "reranker_model": str(core_settings.RERANKER_MODEL),
        "llm_model": str(ollama_service.get_model()),
        "ollama_base_url": str(core_settings.OLLAMA_BASE_URL),
        "ollama_timeout": str(core_settings.OLLAMA_TIMEOUT),
        "chunk_size": str(core_settings.CHUNK_TARGET_SIZE),
        "chunk_overlap": str(core_settings.CHUNK_OVERLAP),
        "theme": "light",
        "confidence_threshold": str(core_settings.CONFIDENCE_THRESHOLD),
    }


@router.get("")
@router.get("/")
async def get_settings(db: AsyncSession = Depends(get_db)):
    """Retrieve all current application settings."""
    result = await db.execute(select(Setting))
    db_settings = {s.key: s.value for s in result.scalars().all()}
    
    current_settings = _get_default_settings_dict()
    current_settings.update(db_settings)
    
    # Sync runtime ollama service model if set in db
    if "llm_model" in db_settings:
        ollama_service.set_model(db_settings["llm_model"])
    
    return {
        "settings": current_settings,
        **current_settings,
    }


@router.post("")
@router.post("/")
@router.put("")
@router.put("/")
async def update_settings(
    payload: dict = Body(...),
    db: AsyncSession = Depends(get_db),
):
    """Update settings in local database."""
    items = payload.get("settings", payload) if isinstance(payload.get("settings"), dict) else payload
    
    for k, v in items.items():
        if v is not None:
            if k in ("llm_model", "ollama_model"):
                ollama_service.set_model(str(v))
            res = await db.execute(select(Setting).where(Setting.key == str(k)))
            setting_obj = res.scalars().first()
            if setting_obj:
                setting_obj.value = str(v)
            else:
                db.add(Setting(key=str(k), value=str(v)))
                
    await db.commit()
    return await get_settings(db)
