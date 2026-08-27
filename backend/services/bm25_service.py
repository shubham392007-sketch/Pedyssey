import logging
import pickle
from pathlib import Path
from typing import List, Optional, Dict, Any

from rank_bm25 import BM25Okapi

logger = logging.getLogger(__name__)

class BM25Service:
    def __init__(self, index_dir: Path):
        self._index_dir = index_dir
        self._bm25: Optional[BM25Okapi] = None
        self._documents: List[dict] = []  # metadata for each doc in corpus
        self._corpus: List[List[str]] = []  # tokenized corpus
        self._index_path = self._index_dir / "bm25_index.pkl"
        
        self._index_dir.mkdir(parents=True, exist_ok=True)
        self._load()
    
    def add_documents(self, chunks: List[dict]): 
        """Add chunks [{chunk_id, document_id, text, page_start, page_end, section}]. Rebuild index."""
        if not chunks:
            return
            
        for chunk in chunks:
            self._documents.append(chunk)
            self._corpus.append(self._tokenize(chunk.get("text", "")))
            
        self._bm25 = BM25Okapi(self._corpus)
        logger.info(f"Rebuilt BM25 index with {len(self._documents)} documents.")
        
    def search(self, query: str, top_k: int, filter_doc_ids: Optional[List[str]] = None) -> List[dict]:
        """Tokenize query, search BM25, filter by doc IDs. Return ranked results with scores."""
        if not self._bm25 or not self._documents:
            return []
            
        tokenized_query = self._tokenize(query)
        scores = self._bm25.get_scores(tokenized_query)
        
        results = []
        for i, score in enumerate(scores):
            meta = self._documents[i]
            if filter_doc_ids is None or meta.get('document_id') in filter_doc_ids:
                result = dict(meta)
                result['score'] = float(score)
                results.append(result)
                
        # Sort descending by score
        results.sort(key=lambda x: x['score'], reverse=True)
        return results[:top_k]
        
    def remove_by_document(self, document_id: str): 
        """Remove doc chunks and rebuild."""
        indices_to_keep = [i for i, m in enumerate(self._documents) if m.get('document_id') != document_id]
        if len(indices_to_keep) == len(self._documents):
            return
            
        logger.info(f"Removing document {document_id} from BM25. Rebuilding index.")
        self._documents = [self._documents[i] for i in indices_to_keep]
        self._corpus = [self._corpus[i] for i in indices_to_keep]
        
        if self._corpus:
            self._bm25 = BM25Okapi(self._corpus)
        else:
            self._bm25 = None
            
    def _tokenize(self, text: str) -> List[str]: 
        """Simple word tokenization + lowering."""
        return text.lower().split()
        
    def save(self): 
        """Pickle to disk."""
        data = {
            "documents": self._documents,
            "corpus": self._corpus
        }
        with open(self._index_path, "wb") as f:
            pickle.dump(data, f)
        logger.info("Saved BM25 index.")
        
    def _load(self): 
        """Load from disk if exists."""
        if self._index_path.exists():
            with open(self._index_path, "rb") as f:
                data = pickle.load(f)
                self._documents = data.get("documents", [])
                self._corpus = data.get("corpus", [])
                if self._corpus:
                    self._bm25 = BM25Okapi(self._corpus)
            logger.info(f"Loaded BM25 index with {len(self._documents)} documents.")
