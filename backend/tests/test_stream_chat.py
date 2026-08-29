import sys
import json
import time
import httpx
from pathlib import Path

BASE_URL = "http://127.0.0.1:8001/api/v1"


def test_streaming_rag(question: str):
    print(f"\n=======================================================")
    print(f"QUESTION: {question}")
    print(f"=======================================================")
    
    payload = {
        "question": question,
        "session_id": "live_stream_verification",
    }
    
    url = f"{BASE_URL}/chat/stream"
    print(f"Connecting to SSE stream at {url}...", flush=True)
    
    start_t = time.time()
    citations = []
    confidence = None
    category = None
    first_token_time = None
    
    with httpx.Client(timeout=180.0) as client:
        with client.stream("POST", url, json=payload) as response:
            for line in response.iter_lines():
                if not line or not line.startswith("data:"):
                    continue
                data_str = line[5:].strip()
                if data_str == "[DONE]":
                    break
                try:
                    data = json.loads(data_str)
                except Exception:
                    data = {"content": data_str, "event": "token"}
                    
                event_type = data.get("event")
                content = data.get("content") or data.get("token") or ""
                
                if event_type == "token" or ("event" not in data and "content" in data):
                    if first_token_time is None:
                        first_token_time = time.time() - start_t
                        print(f"\n[First Token in {first_token_time:.2f}s]\n--- ANSWER ---", flush=True)
                    print(content, end="", flush=True)
                elif event_type == "confidence":
                    confidence = data.get("level") or data.get("confidence_level")
                    category = data.get("category")
                elif event_type == "citations" or "citations" in data:
                    citations = data.get("citations") or []
                elif event_type == "status":
                    print(f"  [Status: {data.get('stage', content)}]", flush=True)
                    
    total_time = time.time() - start_t
    print(f"\n\n--- METADATA ---", flush=True)
    print(f"Total Time: {total_time:.2f}s", flush=True)
    print(f"Confidence: {confidence}", flush=True)
    print(f"Category: {category}", flush=True)
    print(f"Citations ({len(citations)}):", flush=True)
    for c in citations:
        if isinstance(c, dict):
            p_start = c.get('page_start')
            p_end = c.get('page_end')
            print(f"  * Document: {c.get('filename')}, Pages: {p_start}-{p_end}, Score: {c.get('relevance_score', 0):.3f}", flush=True)


if __name__ == "__main__":
    test_streaming_rag("What is the 64-layer transformer architecture and rotary positional embeddings (RoPE)?")
    test_streaming_rag("What were the empirical results and 94.8% accuracy metrics achieved?")
