import sys
import json
import httpx

def test_ollama_chat():
    url = "http://localhost:11434/api/chat"
    payload = {
        "model": "qwen3:8b",
        "messages": [
            {"role": "user", "content": "Explain what a PDF document is in one short sentence."}
        ],
        "stream": True
    }
    
    print("Sending chat request to Ollama qwen3:8b...")
    with httpx.Client(timeout=120.0) as client:
        with client.stream("POST", url, json=payload) as response:
            print(f"Response status: {response.status_code}")
            full_response = []
            for line in response.iter_lines():
                if line:
                    data = json.loads(line)
                    content = data.get("message", {}).get("content", "")
                    print(content, end="", flush=True)
                    full_response.append(content)
            print("\n--- Stream Complete ---")

if __name__ == "__main__":
    test_ollama_chat()
