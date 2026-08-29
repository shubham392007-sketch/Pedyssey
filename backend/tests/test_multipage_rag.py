import pytest
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import pymupdf as fitz
import numpy as np

from services.chunking_service import ChunkingService
from services.pdf_processor import PDFProcessor
from services.embedding_service import EmbeddingService
from services.vector_store import FAISSVectorStore
from services.bm25_service import BM25Service
from services.retrieval_service import RetrievalService
from services.reranking_service import RerankingService
from services.confidence_service import ConfidenceService
from core.constants import AnswerCategory, ConfidenceLevel


@pytest.fixture
def temp_dir(tmp_path):
    d = tmp_path / "test_rag_data"
    d.mkdir(parents=True, exist_ok=True)
    yield d
    shutil.rmtree(d, ignore_errors=True)


def create_synthetic_multipage_pdf(file_path: Path, num_pages: int = 40):
    """Generate a multi-page PDF where each page has realistic text length and distinct topics."""
    doc = fitz.open()
    
    page_contents = {
        1: (
            "Introduction to Pedyssey Framework and Core System Overview. "
            "This document presents Pedyssey, an advanced local document intelligence platform designed to "
            "perform offline question answering and semantic retrieval directly on consumer hardware. "
            "The system ensures absolute privacy by executing all embedding, indexing, retrieval, reranking, "
            "and LLM generation locally without sending any data over external networks. "
            "We outline the motivation, background literature, and design principles underpinning the architecture."
        ),
        5: (
            "Deep Neural Network Architecture and Rotary Embeddings. "
            "The neural backbone of our model consists of a 64-layer decoder-only transformer architecture. "
            "Each layer utilizes multi-head self-attention with 64 heads and a hidden dimension of 8192. "
            "We employ Rotary Positional Embeddings (RoPE) to effectively encode token positions across long sequence lengths. "
            "Furthermore, SwiGLU activation functions and RMSNorm pre-normalization are integrated across all feed-forward sublayers."
        ),
        10: (
            "Experimental Methodology and Benchmark Evaluation Protocols. "
            "Our empirical validation methodology assesses the system across standard multi-hop and open-domain datasets. "
            "Specifically, we benchmark performance on HotpotQA, TriviaQA, NaturalQuestions, and MS-MARCO. "
            "We implement 5-fold cross-validation with stratified dataset partitions to prevent data contamination. "
            "All experiments were conducted using standardized random seeds to ensure full experimental reproducibility."
        ),
        20: (
            "Empirical Results and Performance Benchmark Metrics. "
            "The empirical evaluation demonstrated substantial improvements over baseline retrieval-augmented generation systems. "
            "Our hybrid FAISS and BM25 indexing pipeline achieved a top-5 retrieval accuracy of 94.8%. "
            "On the end-to-end question answering benchmarks, the model produced an exact match score of 88.2% "
            "and an F1 score of 93.6%, demonstrating high precision and semantic fidelity in grounded document synthesis."
        ),
        30: (
            "Known System Limitations and Hardware Constraints. "
            "While the system performs robustly on high-end workstations, several notable limitations exist. "
            "First, RAM consumption on embedded edge devices can peak during cross-encoder reranking of large candidate sets. "
            "Second, CPU quantization introduces slight latency overheads on legacy x86 processors without AVX-512 extensions. "
            "Users operating low-memory environments should restrict retrieval candidates to 10 chunks per query."
        ),
        40: (
            "Conclusions and Future Research Horizons. "
            "In conclusion, Pedyssey establishes a new paradigm for secure, local-first document question answering. "
            "By synthesizing PyMuPDF extraction, semantic chunking, reciprocal rank fusion, and cross-encoder reranking, "
            "the system delivers state-of-the-art document grounding. "
            "Future research horizons include integrating multimodal vision-language encoders and real-time audio transcription."
        ),
    }
    
    for p in range(1, num_pages + 1):
        page = doc.new_page(width=595, height=842)
        if p in page_contents:
            text = page_contents[p]
        else:
            text = (
                f"Chapter {p} General Domain Details and Supplementary Information. "
                f"This section discusses ancillary topic {p} regarding standard document processing workflows. "
                f"It provides contextual analysis for subsection {p}.1 and operational guidance for standard data pipelines. "
                f"Various secondary factors and regular parameters are reviewed to ensure consistent operation."
            )
        page.insert_text((50, 72), f"Chapter {p}\n\n{text}", fontsize=11)
        
    doc.save(str(file_path))
    doc.close()


def test_chunking_page_spans():
    """Verify that chunking service does not cascade page 1 across later chunks."""
    cs = ChunkingService(target_size=80, overlap=20, min_size=20, max_size=120)
    
    pages = []
    for p in range(1, 11):
        pages.append({
            "page_num": p,
            "text": f"Page {p} contains important topic {p}. Here are multiple detailed sentences explaining topic {p} thoroughly."
        })
        
    chunks = cs.chunk_document("doc_test", pages)
    
    assert len(chunks) >= 3
    
    # Check that chunks from later pages have realistic page spans, not starting at 1
    last_chunk = chunks[-1]
    assert last_chunk.page_start >= 8, f"Expected page_start >= 8 for last chunk, got {last_chunk.page_start}"
    assert last_chunk.page_end == 10
    
    # Check chunk 0
    assert chunks[0].page_start == 1


def test_multipage_retrieval_accuracy(temp_dir):
    """Verify that hybrid retrieval + reranking returns chunks from the specific target page, not page 1."""
    pdf_path = temp_dir / "research_test.pdf"
    create_synthetic_multipage_pdf(pdf_path, num_pages=40)
    
    pdf_proc = PDFProcessor()
    doc_data = fitz.open(str(pdf_path))
    page_count = doc_data.page_count
    doc_data.close()
    
    extracted_pages = []
    for p in range(page_count):
        text = pdf_proc.extract_page_text(pdf_path, p)
        extracted_pages.append({
            "page_num": p + 1,
            "text": text,
            "section": f"Chapter {p+1}"
        })
        
    cs = ChunkingService(target_size=150, overlap=30, min_size=30, max_size=200)
    chunks = cs.chunk_document("doc_40p", extracted_pages)
    
    # Initialize index stores
    emb_service = EmbeddingService()
    vector_store = FAISSVectorStore(dimension=384, index_dir=temp_dir / "faiss")
    bm25_service = BM25Service(temp_dir / "bm25")
    
    chunk_texts = [c.text for c in chunks]
    embeddings = emb_service.encode(chunk_texts, show_progress=False)
    
    chunk_metadata = [
        {
            "chunk_id": c.chunk_id,
            "document_id": c.document_id,
            "filename": "research_test.pdf",
            "page_start": c.page_start,
            "page_end": c.page_end,
            "section": c.section,
            "text": c.text,
        }
        for c in chunks
    ]
    
    # Verify index consistency
    assert len(chunks) == len(embeddings) == len(chunk_metadata)
    
    vector_store.add(embeddings, chunk_metadata)
    vector_store.save()
    
    bm25_chunks = [
        {
            "chunk_id": c.chunk_id,
            "document_id": c.document_id,
            "filename": "research_test.pdf",
            "text": c.text,
            "page_start": c.page_start,
            "page_end": c.page_end,
            "section": c.section,
        }
        for c in chunks
    ]
    bm25_service.add_documents(bm25_chunks)
    bm25_service.save()
    
    retrieval = RetrievalService(vector_store, bm25_service, emb_service)
    reranker = RerankingService()
    
    # Test 1: Query about architecture (Page 5)
    q_arch = "What is the 64-layer transformer architecture and rotary positional embeddings (RoPE)?"
    retrieved = retrieval.retrieve(q_arch, top_k=10)
    top_reranked = reranker.rerank(q_arch, retrieved, top_k=3)
    
    assert len(top_reranked) > 0
    top_chunk = top_reranked[0]
    assert top_chunk["page_start"] <= 5 <= top_chunk["page_end"], (
        f"Expected page 5 for architecture query, got {top_chunk['page_start']}-{top_chunk['page_end']}"
    )
    assert "rotary" in top_chunk["text"].lower() or "64-layer" in top_chunk["text"].lower()

    # Test 2: Query about methodology (Page 10)
    q_method = "Which benchmark datasets like HotpotQA, TriviaQA, and NaturalQuestions were used in the methodology?"
    retrieved = retrieval.retrieve(q_method, top_k=10)
    top_reranked = reranker.rerank(q_method, retrieved, top_k=3)
    
    assert len(top_reranked) > 0
    top_chunk = top_reranked[0]
    assert top_chunk["page_start"] <= 10 <= top_chunk["page_end"], (
        f"Expected page 10 for methodology query, got {top_chunk['page_start']}-{top_chunk['page_end']}"
    )
    assert "methodology" in top_chunk["text"].lower() or "hotpotqa" in top_chunk["text"].lower() or "benchmark" in top_chunk["text"].lower()

    # Test 3: Query about empirical results (Page 20)
    q_results = "What were the empirical results and 94.8% accuracy metrics?"
    retrieved = retrieval.retrieve(q_results, top_k=10)
    top_reranked = reranker.rerank(q_results, retrieved, top_k=3)
    
    assert len(top_reranked) > 0
    top_chunk = top_reranked[0]
    assert top_chunk["page_start"] <= 20 <= top_chunk["page_end"], (
        f"Expected page 20 for results query, got {top_chunk['page_start']}-{top_chunk['page_end']}"
    )
    assert "94.8%" in top_chunk["text"] or "results" in top_chunk["text"].lower()

    # Test 4: Query about system limitations (Page 30)
    q_limits = "What are the known system limitations regarding memory consumption on edge devices?"
    retrieved = retrieval.retrieve(q_limits, top_k=10)
    top_reranked = reranker.rerank(q_limits, retrieved, top_k=3)
    
    assert len(top_reranked) > 0
    top_chunk = top_reranked[0]
    assert top_chunk["page_start"] <= 30 <= top_chunk["page_end"], (
        f"Expected page 30 for limitations query, got {top_chunk['page_start']}-{top_chunk['page_end']}"
    )
    assert "limitations" in top_chunk["text"].lower()

    # Test 5: Query about conclusions (Page 40)
    q_conclusion = "What are the conclusions and future research horizons regarding multimodal audio and video?"
    retrieved = retrieval.retrieve(q_conclusion, top_k=10)
    top_reranked = reranker.rerank(q_conclusion, retrieved, top_k=3)
    
    assert len(top_reranked) > 0
    top_chunk = top_reranked[0]
    assert top_chunk["page_start"] <= 40 <= top_chunk["page_end"], (
        f"Expected page 40 for conclusion query, got {top_chunk['page_start']}-{top_chunk['page_end']}"
    )
    assert "conclusions" in top_chunk["text"].lower() or "horizons" in top_chunk["text"].lower()
