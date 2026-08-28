import json
import logging
from abc import ABC, abstractmethod
from pathlib import Path
from typing import List, Optional

import faiss
import numpy as np

logger = logging.getLogger(__name__)

class VectorStoreBase(ABC):
    @abstractmethod
    def add(self, vectors: np.ndarray, metadata: List[dict]) -> None:
        pass

    @abstractmethod
    def search(self, query_vector: np.ndarray, top_k: int, filter_doc_ids: Optional[List[str]] = None) -> List[dict]:
        pass

    @abstractmethod
    def remove_by_document(self, document_id: str) -> None:
        pass

    @abstractmethod
    def save(self) -> None:
        pass

    @abstractmethod
    def load(self) -> None:
        pass

class FAISSVectorStore(VectorStoreBase):
    """FAISS IndexFlatIP with normalized vectors for cosine similarity.
    Stores metadata mapping (idx -> {chunk_id, document_id, page_start, page_end, section, text}) in JSON."""
    
    def __init__(self, dimension: int, index_dir: Path):
        self._dimension = dimension
        self._index_dir = index_dir
        self._index: Optional[faiss.IndexFlatIP] = None
        self._metadata: List[dict] = []  # ordered, maps to FAISS index positions
        self._index_path = self._index_dir / "index.faiss"
        self._metadata_path = self._index_dir / "metadata.json"
        
        self._index_dir.mkdir(parents=True, exist_ok=True)
        self._initialize()

    def _initialize(self):
        """Create empty index or load from disk."""
        if self._index_path.exists() and self._metadata_path.exists():
            self.load()
        else:
            self._index = faiss.IndexFlatIP(self._dimension)
            self._metadata = []
            logger.info(f"Initialized new FAISS index with dimension {self._dimension}")

    def add(self, vectors: np.ndarray, metadata: List[dict]):
        """Normalize vectors, add to index, append metadata."""
        if len(vectors) != len(metadata):
            raise ValueError("Vectors and metadata must have the same length")
        
        if len(vectors) == 0:
            return

        faiss.normalize_L2(vectors)
        self._index.add(vectors)
        self._metadata.extend(metadata)
        logger.info(f"Added {len(vectors)} vectors. Total: {self.get_count()}")

    def search(self, query_vector: np.ndarray, top_k: int, filter_doc_ids: Optional[List[str]] = None) -> List[dict]:
        """Search index. If filter_doc_ids provided, search all then filter results. 
        Return [{chunk_id, document_id, score, text, page_start, page_end, section}]."""
        if self.get_count() == 0:
            return []

        query_vector = query_vector.reshape(1, -1).copy()
        faiss.normalize_L2(query_vector)

        search_k = self.get_count() if filter_doc_ids else min(top_k, self.get_count())
        scores, indices = self._index.search(query_vector, search_k)
        
        results = []
        for i, idx in enumerate(indices[0]):
            if idx == -1:
                continue
            meta = self._metadata[idx]
            if filter_doc_ids is None or meta.get('document_id') in filter_doc_ids:
                result = dict(meta)
                result['score'] = float(scores[0][i])
                results.append(result)
                if len(results) >= top_k:
                    break
                    
        return results

    def remove_by_document(self, document_id: str):
        """Rebuild index without the document's vectors."""
        indices_to_keep = [i for i, m in enumerate(self._metadata) if m.get('document_id') != document_id]
        if len(indices_to_keep) == len(self._metadata):
            return

        logger.info(f"Removing document {document_id}. Rebuilding index.")
        vectors = []
        new_metadata = []
        for i in indices_to_keep:
            vec = self._index.reconstruct(i)
            vectors.append(vec)
            new_metadata.append(self._metadata[i])
            
        self._index = faiss.IndexFlatIP(self._dimension)
        self._metadata = []
        if vectors:
            self.add(np.array(vectors), new_metadata)

    def save(self):
        """Save index.faiss and metadata.json to disk."""
        faiss.write_index(self._index, str(self._index_path))
        with open(self._metadata_path, 'w', encoding='utf-8') as f:
            json.dump(self._metadata, f)
        logger.info("Saved FAISS index and metadata.")

    def load(self):
        """Load from disk if files exist."""
        self._index = faiss.read_index(str(self._index_path))
        with open(self._metadata_path, 'r', encoding='utf-8') as f:
            self._metadata = json.load(f)
        logger.info(f"Loaded FAISS index with {self.get_count()} vectors.")

    def get_count(self) -> int:
        """Number of vectors."""
        return len(self._metadata) if self._metadata else 0

    def get_document_overview_chunks(self, document_ids: Optional[List[str]] = None, max_chunks_per_doc: int = 4) -> List[dict]:
        """Retrieve the beginning (abstract/intro) and ending (conclusion) chunks for given documents."""
        if not self._metadata:
            return []
        doc_chunks = {}
        for item in self._metadata:
            d_id = item.get("document_id")
            if document_ids and d_id not in document_ids:
                continue
            if d_id not in doc_chunks:
                doc_chunks[d_id] = []
            doc_chunks[d_id].append(item)
        
        overview_chunks = []
        for d_id, chunks in doc_chunks.items():
            if len(chunks) <= max_chunks_per_doc:
                overview_chunks.extend(chunks)
            else:
                # First 2 chunks (title, abstract, intro) and last 2 chunks (conclusions, summary)
                overview_chunks.extend(chunks[:2])
                overview_chunks.extend(chunks[-2:])
        return overview_chunks
