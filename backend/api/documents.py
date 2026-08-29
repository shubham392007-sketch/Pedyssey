import os
import shutil
import logging
from pathlib import Path
from datetime import datetime, timezone

from fastapi import APIRouter, UploadFile, File, BackgroundTasks, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from database.database import get_db, async_session_factory
from database.models import Document, Chunk
from schemas.document import (
    DocumentUploadResponse, DocumentResponse,
    DocumentListResponse, ProcessingStatusResponse,
)
from core.config import settings
from core.constants import DocumentStatus
from utils.file_utils import validate_pdf_file, generate_document_id, sanitize_filename

router = APIRouter(prefix="/documents", tags=["documents"])
logger = logging.getLogger(__name__)

# In-memory processing progress tracker (document_id -> progress dict)
_processing_progress: dict[str, dict] = {}


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Upload a PDF file for processing."""
    filename = file.filename or "untitled.pdf"
    content_type = file.content_type
    
    # Read file to get size
    content = await file.read()
    file_size = len(content)
    
    # Validate
    is_valid, error_msg = validate_pdf_file(filename, content_type, file_size)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    doc_id = generate_document_id()
    safe_filename = sanitize_filename(filename)

    # Save to local storage
    doc_dir = settings.DOCUMENTS_DIR / doc_id
    doc_dir.mkdir(parents=True, exist_ok=True)
    file_path = doc_dir / "original.pdf"

    with open(file_path, "wb") as f:
        f.write(content)

    # Extract page count immediately
    page_count = 0
    try:
        import pymupdf
        with pymupdf.open(file_path) as pdf_doc:
            page_count = len(pdf_doc)
    except Exception:
        page_count = 0

    # Create DB record
    new_doc = Document(
        id=doc_id,
        filename=safe_filename,
        file_path=str(file_path),
        file_size=file_size,
        page_count=page_count,
        status=DocumentStatus.UPLOADED,
    )
    db.add(new_doc)
    await db.commit()
    await db.refresh(new_doc)

    return DocumentUploadResponse(
        id=doc_id,
        document_id=doc_id,
        filename=safe_filename,
        status=DocumentStatus.UPLOADED,
        page_count=page_count,
        file_size=file_size,
    )


@router.get("", response_model=DocumentListResponse)
@router.get("/", response_model=DocumentListResponse)
async def list_documents(db: AsyncSession = Depends(get_db)):
    """List all uploaded documents."""
    result = await db.execute(select(Document).order_by(Document.created_at.desc()))
    docs = result.scalars().all()
    return DocumentListResponse(
        documents=[DocumentResponse.model_validate(d) for d in docs],
        total=len(docs),
    )


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: str, db: AsyncSession = Depends(get_db)):
    """Get a single document's details."""
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentResponse.model_validate(doc)


@router.delete("/{document_id}")
async def delete_document(document_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a document and all associated data."""
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Remove from vector store and BM25
    try:
        from services import vector_store, bm25_service
        vector_store.remove_by_document(document_id)
        vector_store.save()
        bm25_service.remove_by_document(document_id)
        bm25_service.save()
    except Exception as e:
        logger.warning(f"Error removing vectors for {document_id}: {e}")

    # Delete chunks from DB
    await db.execute(delete(Chunk).where(Chunk.document_id == document_id))
    await db.delete(doc)
    await db.commit()

    # Delete files from disk
    doc_dir = settings.DOCUMENTS_DIR / document_id
    if doc_dir.exists():
        shutil.rmtree(doc_dir, ignore_errors=True)
    processed_dir = settings.PROCESSED_DIR / document_id
    if processed_dir.exists():
        shutil.rmtree(processed_dir, ignore_errors=True)

    return {"message": f"Document {document_id} deleted successfully."}


async def _process_document_background(document_id: str):
    """Background task: full document processing pipeline.
    Uses its own DB session since BackgroundTasks run outside the request lifecycle."""
    from services import (
        pdf_processor, text_cleaner, document_parser,
        chunking_service, embedding_service, vector_store, bm25_service,
    )
    
    async with async_session_factory() as db:
        try:
            result = await db.execute(select(Document).where(Document.id == document_id))
            doc = result.scalars().first()
            if not doc:
                return

            file_path = Path(doc.file_path)

            # Stage: VALIDATING
            _processing_progress[document_id] = {
                "stage": "VALIDATING", "current_page": 0, "total_pages": 0, "progress": 5
            }
            doc.status = DocumentStatus.VALIDATING
            await db.commit()

            is_valid, error_msg = pdf_processor.validate_pdf(file_path)
            if not is_valid:
                raise ValueError(error_msg or "PDF validation failed")

            # Stage: EXTRACTING
            _processing_progress[document_id]["stage"] = "EXTRACTING"
            _processing_progress[document_id]["progress"] = 10
            doc.status = DocumentStatus.EXTRACTING
            await db.commit()

            metadata = pdf_processor.extract_metadata(file_path)
            doc.page_count = metadata.get("page_count", 0) or doc.page_count
            total_pages = max(doc.page_count, 1)
            _processing_progress[document_id]["total_pages"] = total_pages
            await db.commit()

            # Extract text page by page
            page_texts = []
            for page_num in range(doc.page_count):
                _processing_progress[document_id]["current_page"] = page_num + 1
                _processing_progress[document_id]["progress"] = 10 + int(30 * (page_num + 1) / total_pages)

                text = pdf_processor.extract_page_text(file_path, page_num)
                quality = pdf_processor.assess_text_quality(text)
                ocr_used = False

                if quality < settings.TEXT_QUALITY_THRESHOLD:
                    # OCR needed
                    doc.status = DocumentStatus.OCR_PROCESSING
                    _processing_progress[document_id]["stage"] = "OCR_PROCESSING"
                    await db.commit()
                    try:
                        from services import ocr_service
                        image = pdf_processor.render_page_as_image(file_path, page_num, dpi=settings.OCR_DPI)
                        text = ocr_service.extract_text_from_image(image)
                        ocr_used = True
                    except Exception as ocr_err:
                        logger.warning(f"OCR failed for page {page_num}: {ocr_err}")

                page_texts.append({
                    "page_num": page_num + 1,
                    "text": text,
                    "ocr_used": ocr_used,
                })

            # Stage: CLEANING
            _processing_progress[document_id]["stage"] = "CLEANING"
            _processing_progress[document_id]["progress"] = 45
            doc.status = DocumentStatus.CLEANING
            await db.commit()

            all_texts = [p["text"] for p in page_texts]
            cleaned_pages = []
            for pt in page_texts:
                cleaned_text = text_cleaner.clean(pt["text"], page_texts=all_texts)
                cleaned_pages.append({
                    "page_num": pt["page_num"],
                    "text": cleaned_text,
                    "section": None,
                })

            # Parse structure
            structure = document_parser.parse(cleaned_pages)
            for page in cleaned_pages:
                for sp in structure.pages:
                    if sp.page_num == page["page_num"]:
                        page["section"] = sp.section
                        break

            # Clean previous vectors and DB chunks if reprocessing
            try:
                vector_store.remove_by_document(document_id)
                vector_store.save()
                bm25_service.remove_by_document(document_id)
                bm25_service.save()
                await db.execute(delete(Chunk).where(Chunk.document_id == document_id))
                await db.commit()
            except Exception as clean_err:
                logger.warning(f"Cleanup before re-indexing {document_id}: {clean_err}")

            # Stage: CHUNKING
            _processing_progress[document_id]["stage"] = "CHUNKING"
            _processing_progress[document_id]["progress"] = 55
            doc.status = DocumentStatus.CHUNKING
            await db.commit()

            chunks = chunking_service.chunk_document(document_id, cleaned_pages)

            # Save chunks to DB
            for chunk in chunks:
                db_chunk = Chunk(
                    id=chunk.chunk_id,
                    document_id=document_id,
                    chunk_index=chunk.chunk_index,
                    text=chunk.text,
                    page_start=chunk.page_start,
                    page_end=chunk.page_end,
                    section=chunk.section,
                    token_count=chunk.token_count,
                )
                db.add(db_chunk)
            await db.commit()

            # Stage: EMBEDDING
            _processing_progress[document_id]["stage"] = "EMBEDDING"
            _processing_progress[document_id]["progress"] = 65
            doc.status = DocumentStatus.EMBEDDING
            await db.commit()

            chunk_texts = [c.text for c in chunks]
            embeddings = embedding_service.encode(chunk_texts, show_progress=False)

            # Stage: INDEXING
            _processing_progress[document_id]["stage"] = "INDEXING"
            _processing_progress[document_id]["progress"] = 85
            doc.status = DocumentStatus.INDEXING
            await db.commit()

            # Build metadata for vector store
            chunk_metadata = [
                {
                    "chunk_id": c.chunk_id,
                    "document_id": c.document_id,
                    "filename": doc.filename,
                    "page_start": c.page_start,
                    "page_end": c.page_end,
                    "section": c.section,
                    "text": c.text,
                }
                for c in chunks
            ]

            bm25_chunks = [
                {
                    "chunk_id": c.chunk_id,
                    "document_id": c.document_id,
                    "filename": doc.filename,
                    "text": c.text,
                    "page_start": c.page_start,
                    "page_end": c.page_end,
                    "section": c.section,
                }
                for c in chunks
            ]

            # Strict Index Validation (Section 25)
            if not (len(chunks) == len(embeddings) == len(chunk_metadata) == len(bm25_chunks)):
                raise ValueError(
                    f"Index validation failed: {len(chunks)} chunks != {len(embeddings)} embeddings != "
                    f"{len(chunk_metadata)} FAISS metadata != {len(bm25_chunks)} BM25 entries."
                )

            vector_store.add(embeddings, chunk_metadata)
            vector_store.save()

            bm25_service.add_documents(bm25_chunks)
            bm25_service.save()

            # READY
            doc.status = DocumentStatus.READY
            doc.processed_at = datetime.now(timezone.utc)
            _processing_progress[document_id] = {
                "stage": "READY", "current_page": total_pages,
                "total_pages": total_pages, "progress": 100,
            }
            await db.commit()
            logger.info(
                f"Document {document_id} ({doc.filename}) processed successfully: "
                f"{len(chunks)} chunks, {len(embeddings)} embeddings, {len(chunk_metadata)} FAISS vectors, "
                f"{len(bm25_chunks)} BM25 docs across {total_pages} pages."
            )

        except Exception as e:
            logger.error(f"Error processing document {document_id}: {e}", exc_info=True)
            try:
                result = await db.execute(select(Document).where(Document.id == document_id))
                doc = result.scalars().first()
                if doc:
                    doc.status = DocumentStatus.FAILED
                    doc.error_message = str(e)
                    await db.commit()
            except Exception:
                pass
            _processing_progress[document_id] = {
                "stage": "FAILED", "progress": 0, "error": str(e),
            }


@router.post("/{document_id}/process")
async def process_document(
    document_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Trigger document processing in the background."""
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.status == DocumentStatus.READY:
        # Allow reprocessing
        doc.status = DocumentStatus.UPLOADED
        await db.commit()

    background_tasks.add_task(_process_document_background, document_id)
    return {"message": "Processing started.", "document_id": document_id}


@router.get("/{document_id}/status", response_model=ProcessingStatusResponse)
async def document_status(document_id: str, db: AsyncSession = Depends(get_db)):
    """Get the current processing status of a document."""
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    progress = _processing_progress.get(document_id, {})
    return ProcessingStatusResponse(
        document_id=document_id,
        status=doc.status,
        current_stage=progress.get("stage", doc.status),
        current_page=progress.get("current_page"),
        total_pages=progress.get("total_pages") or doc.page_count,
        progress=progress.get("progress", 0 if doc.status != DocumentStatus.READY else 100),
    )


@router.get("/{document_id}/file")
async def serve_file(document_id: str, db: AsyncSession = Depends(get_db)):
    """Serve the original PDF file."""
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")

    return FileResponse(
        doc.file_path,
        filename=doc.filename,
        media_type="application/pdf",
    )


@router.post("/{document_id}/reindex")
async def reindex_document(
    document_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Rebuild index for an existing document from scratch."""
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    doc.status = DocumentStatus.UPLOADED
    await db.commit()

    background_tasks.add_task(_process_document_background, document_id)
    return {"message": f"Reindexing started for document {document_id}.", "document_id": document_id}


@router.post("/reindex-all")
async def reindex_all_documents(
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Rebuild indexes for all uploaded documents."""
    result = await db.execute(select(Document))
    docs = result.scalars().all()
    
    doc_ids = []
    for doc in docs:
        doc.status = DocumentStatus.UPLOADED
        doc_ids.append(doc.id)
        background_tasks.add_task(_process_document_background, doc.id)
    await db.commit()

    return {"message": f"Reindexing started for {len(doc_ids)} document(s).", "document_ids": doc_ids}

