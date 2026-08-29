import logging
from typing import List, Optional, Dict, Any

from services.vector_store import FAISSVectorStore
from services.bm25_service import BM25Service
from services.embedding_service import EmbeddingService

logger = logging.getLogger(__name__)


class RetrievalService:
    def __init__(self, vector_store: FAISSVectorStore, bm25: BM25Service, 
                 embedding_service: EmbeddingService):
        self._vector_store = vector_store
        self._bm25 = bm25
        self._embedding_service = embedding_service
    
    def retrieve(self, query: str, top_k: int = 20, 
                 document_ids: Optional[List[str]] = None) -> List[dict]:
        """Pure dynamic question-specific hybrid retrieval: FAISS (dense) + BM25 (sparse) + RRF.
        Retrieves relevant evidence from ANY page across the entire document without first-page bias.
        
        1. Embed user query
        2. FAISS vector search across all chunks (search_k = top_k * 2)
        3. BM25 keyword search across all chunks (search_k = top_k * 2)
        4. Reciprocal Rank Fusion (RRF): score(d) = sum(1 / (k + rank(d)))
        5. Return top candidate chunks sorted by RRF score.
        """
        search_k = max(top_k * 2, 20)
        
        # 1. FAISS Search
        query_vector = self._embedding_service.encode_query(query)
        faiss_results = self._vector_store.search(query_vector, search_k, filter_doc_ids=document_ids)
        
        # 2. BM25 Search
        bm25_results = self._bm25.search(query, search_k, filter_doc_ids=document_ids)
        
        # 3. Dynamic RRF Fusion
        fused_results = self._reciprocal_rank_fusion(faiss_results, bm25_results)
        
        logger.info(
            f"Retrieval for '{query[:40]}...': FAISS returned {len(faiss_results)}, "
            f"BM25 returned {len(bm25_results)}, Fused top {len(fused_results[:top_k])}"
        )
        return fused_results[:top_k]
    
    def _reciprocal_rank_fusion(
        self, 
        faiss_results: List[dict], 
        bm25_results: List[dict], 
        k: int = 60
    ) -> List[dict]:
        """Merge FAISS and BM25 search results using Reciprocal Rank Fusion."""
        rrf_scores: Dict[str, float] = {}
        chunks_map: Dict[str, dict] = {}
        
        def add_to_rrf(results, source_name=""):
            for rank, doc in enumerate(results, start=1):
                chunk_id = doc['chunk_id']
                if chunk_id not in chunks_map:
                    chunks_map[chunk_id] = dict(doc)
                if chunk_id not in rrf_scores:
                    rrf_scores[chunk_id] = 0.0
                
                rrf_scores[chunk_id] += 1.0 / (k + rank)
                if f"{source_name}_rank" not in chunks_map[chunk_id]:
                    chunks_map[chunk_id][f"{source_name}_rank"] = rank
                    chunks_map[chunk_id][f"{source_name}_score"] = doc.get("score", 0.0)

        add_to_rrf(faiss_results, source_name="faiss")
        add_to_rrf(bm25_results, source_name="bm25")
        
        final_results = []
        for chunk_id, score in rrf_scores.items():
            doc = chunks_map[chunk_id]
            doc['score'] = score  # overwrite with RRF score
            final_results.append(doc)
            
        final_results.sort(key=lambda x: x['score'], reverse=True)
        return final_results
