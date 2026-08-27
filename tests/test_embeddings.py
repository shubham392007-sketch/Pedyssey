import pytest
import numpy as np
from unittest.mock import patch, MagicMock
from services.embedding_service import EmbeddingService

@patch("services.embedding_service.SentenceTransformer")
def test_embedding_service(mock_st):
    mock_model = MagicMock()
    mock_model.encode.return_value = np.array([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]])
    mock_st.return_value = mock_model
    
    service = EmbeddingService()
    embeddings = service.encode(["chunk1", "chunk2"])
    
    assert len(embeddings) == 2
    assert embeddings.shape[1] == 3
