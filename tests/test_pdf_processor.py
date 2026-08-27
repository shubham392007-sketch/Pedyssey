import pytest
from unittest.mock import patch, MagicMock
from pathlib import Path
from services.pdf_processor import PDFProcessor

@pytest.fixture
def pdf_processor():
    return PDFProcessor()

def test_assess_text_quality(pdf_processor):
    good_text = "This is a comprehensive research paper discussing transformer architectures and vector retrieval algorithms."
    poor_text = "??? ### !! 123"
    assert pdf_processor.assess_text_quality(good_text) > 0.5
    assert pdf_processor.assess_text_quality(poor_text) < 0.5

def test_validate_pdf_corrupt(pdf_processor, tmp_path):
    fake_pdf = tmp_path / "corrupt.pdf"
    fake_pdf.write_text("not a real pdf content")
    is_valid, msg = pdf_processor.validate_pdf(fake_pdf)
    assert not is_valid
    assert msg is not None
