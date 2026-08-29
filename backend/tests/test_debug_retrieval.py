import urllib.request
import json

doc_id = "9364af30-d87e-416f-a668-9066d267eeb9"
questions = [
    "What is the 64-layer transformer architecture and rotary positional embeddings (RoPE)?",
    "Which benchmark datasets like HotpotQA and TriviaQA were used in the methodology?",
    "What were the empirical results and 94.8% accuracy metrics?",
    "What are the known system limitations regarding memory on edge devices?",
    "What are the conclusions and future research horizons regarding multimodal audio and video?",
]

for q in questions:
    payload = json.dumps({"question": q, "document_ids": [doc_id]}).encode("utf-8")
    req = urllib.request.Request(
        "http://127.0.0.1:8001/api/v1/chat/debug-retrieval",
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    resp = urllib.request.urlopen(req, timeout=60)
    data = json.loads(resp.read().decode("utf-8"))
    print(f"=== QUESTION: {q} ===")
    top3 = data["results"][:3]
    for r in top3:
        p_str = f"Page {r['page_start']}-{r['page_end']}"
        print(f"  Rank {r['rank']}: {p_str} | Reranker Score: {r['reranker_score']:.4f} (raw: {r['raw_reranker_score']:.2f}) | Chunk ID: {r['chunk_id']}")
        print(f"  Snippet: {r['snippet']}")
    print()
