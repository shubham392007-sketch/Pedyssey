import pytest
import numpy as np
from unittest.mock import MagicMock
from services.retrieval_service import RetrievalService

def test_retrieval_service():
    mock_vs = MagicMock()
    mock_bm25 = MagicMock()
    mock_embed = MagicMock()
    
    # Setup mocks
    mock_embed.encode_query.return_value = np.array([0.1, 0.2, 0.3])
    mock_vs.search.return_value = [{"chunk_id": "c1", "document_id": "d1", "text": "sample", "score": 0.9}]
    mock_bm25.search.return_value = [{"chunk_id": "c1", "document_id": "d1", "text": "sample", "score": 0.8}, {"chunk_id": "c2", "document_id": "d1", "text": "other", "score": 0.7}]
    
    service = RetrievalService(mock_vs, mock_bm25, mock_embed)
    results = service.retrieve("test query", top_k=2)
    
    assert len(results) > 0
    mock_embed.encode_query.assert_called_once()
