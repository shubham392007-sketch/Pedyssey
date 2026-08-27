"""Pedyssey Model Setup
Downloads embedding and reranker models.
Usage: python -m scripts.setup_models"""

import os
import requests
from sentence_transformers import SentenceTransformer, CrossEncoder

def main():
    print("=== Pedyssey Model Setup ===")
    
    # 1. Download sentence-transformers/all-MiniLM-L6-v2
    print("1. Downloading embedding model (sentence-transformers/all-MiniLM-L6-v2)...")
    try:
        SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
        print("   -> Success!")
    except Exception as e:
        print(f"   -> Error: {e}")
        
    # 2. Download cross-encoder/ms-marco-MiniLM-L-6-v2
    print("2. Downloading reranker model (cross-encoder/ms-marco-MiniLM-L-6-v2)...")
    try:
        CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
        print("   -> Success!")
    except Exception as e:
        print(f"   -> Error: {e}")
        
    # 3. Check Ollama connectivity
    print("3. Checking Ollama connectivity (http://localhost:11434)...")
    try:
        res = requests.get("http://localhost:11434/api/tags", timeout=5)
        if res.status_code == 200:
            print("   -> Ollama is running!")
            models = res.json().get('models', [])
            print("4. Available Ollama models:")
            for m in models:
                print(f"   - {m.get('name')}")
        else:
            print(f"   -> Ollama returned status {res.status_code}")
    except Exception as e:
        print(f"   -> Error connecting to Ollama: {e}")
        
    print("5. Setup complete.")

if __name__ == "__main__":
    main()
