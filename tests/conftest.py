import sys
from pathlib import Path
import pytest

# Ensure backend directory is in sys.path
backend_path = Path(__file__).parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

@pytest.fixture(scope="session")
def test_data_dir(tmp_path_factory):
    d = tmp_path_factory.mktemp("data")
    return d

@pytest.fixture
def sample_text():
    return "Pedyssey is a privacy-first, local-only PDF intelligence platform."
