import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import pymupdf as fitz
from services.chunking_service import ChunkingService
from services.pdf_processor import PDFProcessor
from services.embedding_service import EmbeddingService
from services.vector_store import FAISSVectorStore
from services.bm25_service import BM25Service
from services.retrieval_service import RetrievalService
from services.reranking_service import RerankingService

temp_dir = Path("temp_debug_dir")
temp_dir.mkdir(parents=True, exist_ok=True)
pdf_path = temp_dir / "research_test.pdf"

doc = fitz.open()
page_contents = {
    1: "Introduction to Pedyssey: This first page introduces the general concept of local document intelligence and offline RAG systems.",
    5: "Neural Network Architecture: Page five details the 64-layer transformer architecture with multi-head attention and rotary positional embeddings (RoPE).",
    10: "Experimental Methodology: Page ten covers the benchmark datasets including HotpotQA and TriviaQA used for evaluation with 5-fold cross validation.",
    20: "Empirical Results: Page twenty presents the primary evaluation metrics showing 94.8% accuracy on retrieval and 88.2% exact match on question answering.",
    30: "Known System Limitations: Page thirty discusses specific limitations such as memory consumption on embedded edge devices and latency constraints.",
    40: "Conclusion and Future Horizons: Page forty summarizes future directions for multimodal audio and video extensions.",
}

for p in range(1, 41):
    page = doc.new_page(width=595, height=842)
    text = page_contents.get(p, f"Page {p} background information: This is generic filler text for page {p} describing ancillary procedures and secondary considerations.")
    page.insert_text((50, 72), f"Chapter {p}\n\n{text}", fontsize=11)
doc.save(str(pdf_path))
doc.close()

pdf_proc = PDFProcessor()
extracted_pages = []
for p in range(40):
    text = pdf_proc.extract_page_text(pdf_path, p)
    extracted_pages.append({"page_num": p + 1, "text": text, "section": f"Chapter {p+1}"})

cs = ChunkingService(target_size=200, overlap=50, min_size=50, max_size=300)
chunks = cs.chunk_document("doc_40p", extracted_pages)

for i, c in enumerate(chunks):
    print(f"Chunk {i}: span={c.page_start}-{c.page_end} | tokens={c.token_count} | text: {c.text[:80]!r}")

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

q_arch = "What is the transformer architecture and rotary positional embeddings?"
retrieved = retrieval.retrieve(q_arch, top_k=10)
print(f"\n--- RETRIEVED for: {q_arch} ---")
for r in retrieved:
    print(f"  Chunk {r['chunk_id']}: page={r['page_start']}-{r['page_end']}, score={r.get('score'):.4f}, text={r['text'][:60]!r}")

top_reranked = reranker.rerank(q_arch, retrieved, top_k=3)
print(f"\n--- RERANKED for: {q_arch} ---")
for r in top_reranked:
    print(f"  Chunk {r['chunk_id']}: page={r['page_start']}-{r['page_end']}, reranker_score={r.get('reranker_score'):.4f}, raw={r.get('raw_reranker_score'):.4f}, text={r['text'][:60]!r}")
