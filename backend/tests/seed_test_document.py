import sys
import json
import time
import urllib.request
import io
import mimetypes
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
sys.path.insert(0, str(Path(__file__).parent.parent))

BASE_URL = "http://127.0.0.1:8001/api/v1"


def upload_and_process_document():
    pdf_path = Path("tests/sample_research_40p.pdf")
    
    # Generate the 40-page PDF if not present
    if not pdf_path.exists():
        from test_multipage_rag import create_synthetic_multipage_pdf
        create_synthetic_multipage_pdf(pdf_path, num_pages=40)
        print(f"Created synthetic 40-page PDF at {pdf_path}")
        
    print(f"Uploading {pdf_path.name} ({pdf_path.stat().st_size} bytes)...")
    
    # Multipart upload
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    data = []
    data.append(f"--{boundary}".encode("utf-8"))
    data.append(f'Content-Disposition: form-data; name="file"; filename="{pdf_path.name}"'.encode("utf-8"))
    data.append(b"Content-Type: application/pdf\r\n")
    with open(pdf_path, "rb") as f:
        data.append(f.read())
    data.append(f"--{boundary}--\r\n".encode("utf-8"))
    
    body = b"\r\n".join(data)
    req = urllib.request.Request(
        f"{BASE_URL}/documents/upload",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
    )
    
    resp = urllib.request.urlopen(req, timeout=10)
    upload_res = json.loads(resp.read().decode("utf-8"))
    doc_id = upload_res.get("id")
    print(f"Document uploaded. ID: {doc_id}, initial status: {upload_res.get('status')}")
    
    # Poll status until READY
    print("Waiting for processing...")
    for _ in range(60):
        time.sleep(2)
        st_req = urllib.request.Request(f"{BASE_URL}/documents/{doc_id}/status")
        st_resp = urllib.request.urlopen(st_req, timeout=5)
        st_data = json.loads(st_resp.read().decode("utf-8"))
        print(f"  Status: {st_data.get('status')}, Stage: {st_data.get('current_stage')}, Progress: {st_data.get('progress')}%")
        if st_data.get("status") == "READY":
            print(f"Document {doc_id} successfully indexed across {st_data.get('total_pages')} pages!")
            return doc_id
        if st_data.get("status") == "FAILED":
            raise RuntimeError(f"Processing failed: {st_data.get('error')}")
            
    raise TimeoutError("Processing timed out")


if __name__ == "__main__":
    upload_and_process_document()
