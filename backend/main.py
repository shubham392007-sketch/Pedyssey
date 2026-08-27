import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from core.config import settings
from database.database import init_db

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    logger.info("Starting Pedyssey API...")
    settings.ensure_directories()
    await init_db()
    logger.info("Database initialized.")
    logger.info(f"Documents directory: {settings.DOCUMENTS_DIR}")
    logger.info(f"Database: {settings.DATABASE_URL}")
    yield
    logger.info("Shutting down Pedyssey API...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Privacy-first local PDF intelligence platform",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
from api.documents import router as documents_router
from api.chat import router as chat_router
from api.system import router as system_router
from api.settings import router as settings_router

app.include_router(documents_router, prefix=settings.API_PREFIX)
app.include_router(chat_router, prefix=settings.API_PREFIX)
app.include_router(system_router, prefix=settings.API_PREFIX)
app.include_router(settings_router, prefix=settings.API_PREFIX)

# Mount static files for serving documents (only if directory exists)
docs_dir = Path(settings.DOCUMENTS_DIR)
if docs_dir.exists():
    app.mount(
        f"{settings.API_PREFIX}/files",
        StaticFiles(directory=str(docs_dir)),
        name="files"
    )


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "tagline": "Your private AI journey through documents.",
        "status": "running"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
