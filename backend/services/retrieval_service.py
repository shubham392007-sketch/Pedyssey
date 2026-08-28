import logging
from typing import List, Optional, Dict

from services.vector_store import FAISSVectorStore
from services.bm25_service import BM25Service
from services.embedding_service import EmbeddingService

logger = logging.getLogger(__name__)

OVERVIEW_KEYWORDS = [
    "topic", "conclusion", "summar", "overview", "main point", "key point",
    "about", "what is this", "explain this", "takeaway", "findings", "objective",
    "purpose", "abstract", "describe this", "what does this", "what are the"
]


class RetrievalService:
    def __init__(self, vector_store: FAISSVectorStore, bm25: BM25Service, 
                 embedding_service: EmbeddingService):
        self._vector_store = vector_store
        self._bm25 = bm25
        self._embedding_service = embedding_service
    
    def is_overview_query(self, query: str) -> bool:
        """Detect whether query is asking for broad document summary/topics/conclusions."""
        q_lower = query.lower()
        return any(k in q_lower for k in OVERVIEW_KEYWORDS)
    
    def retrieve(self, query: str, top_k: int = 20, 
                 document_ids: Optional[List[str]] = None) -> List[dict]:
        """Hybrid retrieval: FAISS + BM25 + Overview Injection + Reciprocal Rank Fusion.
        1. Embed query
        2. FAISS search (top_k * 2)
        3. BM25 search (top_k * 2)
        4. Overview chunks (abstract, intro, conclusions) if query is broad or candidates are sparse
        5. RRF fusion: score(d) = sum(1/(k+rank(d)))
        6. Return top_k combined results sorted by RRF score."""
        
        search_k = top_k * 2
        
        # 1. FAISS Search
        query_vector = self._embedding_service.encode_query(query)
        faiss_results = self._vector_store.search(query_vector, search_k, filter_doc_ids=document_ids)
        
        # 2. BM25 Search
        bm25_results = self._bm25.search(query, search_k, filter_doc_ids=document_ids)
        
        # 3. Check for overview query intent
        overview_chunks = []
        if self.is_overview_query(query) or len(faiss_results) == 0:
            overview_chunks = self._vector_store.get_document_overview_chunks(document_ids)
            logger.info(f"Injected {len(overview_chunks)} document overview chunks for broad/summary query.")
            
        # 4. RRF Fusion
        fused_results = self._reciprocal_rank_fusion(faiss_results, bm25_results, extra_chunks=overview_chunks)
        
        return fused_results[:top_k]
    
    def _reciprocal_rank_fusion(
        self, 
        faiss_results: List[dict], 
        bm25_results: List[dict], 
        extra_chunks: Optional[List[dict]] = None,
        k: int = 60
    ) -> List[dict]:
        """Merge results using RRF."""
        rrf_scores: Dict[str, float] = {}
        chunks_map: Dict[str, dict] = {}
        
        def add_to_rrf(results, weight=1.0):
            for rank, doc in enumerate(results, start=1):
                chunk_id = doc['chunk_id']
                if chunk_id not in chunks_map:
                    chunks_map[chunk_id] = dict(doc)
                if chunk_id not in rrf_scores:
                    rrf_scores[chunk_id] = 0.0
                
                rrf_scores[chunk_id] += weight * (1.0 / (k + rank))

        add_to_rrf(faiss_results, weight=1.0)
        add_to_rrf(bm25_results, weight=1.0)
        
        if extra_chunks:
            add_to_rrf(extra_chunks, weight=1.2)  # Boost overview structural chunks
        
        final_results = []
        for chunk_id, score in rrf_scores.items():
            doc = chunks_map[chunk_id]
            doc['score'] = score  # overwrite with RRF score
            final_results.append(doc)
            
        final_results.sort(key=lambda x: x['score'], reverse=True)
        return final_results
