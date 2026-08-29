import sys
import json
import time
import urllib.request
from pathlib import Path

BASE_URL = "http://127.0.0.1:8001/api/v1"


def test_system_status():
    print("\n--- 1. Testing System Status ---")
    req = urllib.request.Request(f"{BASE_URL}/system/ollama")
    resp = urllib.request.urlopen(req, timeout=10)
    data = json.loads(resp.read().decode("utf-8"))
    print("Ollama Status:", json.dumps(data, indent=2))
    assert data["status"] == "ready"
    assert data["model"] == "qwen3:8b"


def test_reindex_and_stats():
    print("\n--- 2. Testing Document Reindexing ---")
    req = urllib.request.Request(f"{BASE_URL}/documents/reindex-all", data=b"", method="POST")
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        data = json.loads(resp.read().decode("utf-8"))
        print("Reindex Response:", data)
    except Exception as e:
        print(f"Reindex notice: {e}")


def test_multi_page_chat():
    print("\n--- 3. Testing Multi-Page RAG Chat with Qwen3 8B ---")
    
    questions = [
        ("What is the neural network architecture and rotary positional embeddings described in the document?", [4, 5, 6]),
        ("What experimental methodology and benchmark datasets were evaluated?", [9, 10, 11]),
        ("What were the empirical results and exact accuracy percentages achieved?", [19, 20, 21]),
        ("What are the known system limitations regarding edge devices and RAM consumption?", [29, 30, 31]),
    ]
    
    for q_text, expected_pages in questions:
        print(f"\n[Question]: {q_text}")
        payload = json.dumps({
            "question": q_text,
            "session_id": "test_verification_session",
        }).encode("utf-8")
        
        req = urllib.request.Request(
            f"{BASE_URL}/chat/ask-sync",
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        
        start_t = time.time()
        try:
            resp = urllib.request.urlopen(req, timeout=120)
            data = json.loads(resp.read().decode("utf-8"))
            elapsed = time.time() - start_t
            
            print(f"Time taken: {elapsed:.2f}s")
            print(f"Category: {data.get('category')}")
            print(f"Confidence Level: {data.get('confidence_level')}")
            print(f"Answer snippet: {data.get('answer', '')[:300]}...")
            
            citations = data.get("citations", [])
            print(f"Citations count: {len(citations)}")
            for c in citations:
                p_start = c.get("page_start")
                p_end = c.get("page_end")
                print(f"  -> Source: {c.get('filename')}, Pages: {p_start}-{p_end}, Score: {c.get('relevance_score'):.3f}")
                
        except Exception as e:
            print(f"Chat request failed: {e}")


if __name__ == "__main__":
    test_system_status()
    test_reindex_and_stats()
    test_multi_page_chat()
