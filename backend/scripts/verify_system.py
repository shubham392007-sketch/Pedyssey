"""Verify all Pedyssey components are ready."""
import sys
import os
import subprocess
import requests

def verify():
    print("=== Pedyssey System Verification ===")
    
    # Check Python
    print(f"Python Version: {sys.version.split(' ')[0]}")
    if sys.version_info < (3, 11):
        print("WARNING: Python 3.11+ is recommended.")
        
    # Check Tesseract
    try:
        res = subprocess.run(["tesseract", "--version"], capture_output=True, text=True)
        print(f"Tesseract: Installed ({res.stdout.splitlines()[0]})")
    except FileNotFoundError:
        print("Tesseract: NOT FOUND. OCR will fail.")
        
    # Check Ollama
    try:
        res = requests.get("http://localhost:11434/api/tags", timeout=2)
        print("Ollama: Running")
    except:
        print("Ollama: NOT REACHABLE (Check if Ollama is running)")
        
    # Data Dirs
    print("Data Directories:")
    for d in ['data/documents', 'data/indexes']:
        if os.path.exists(d):
            print(f"  - {d}: EXISTS")
        else:
            print(f"  - {d}: MISSING (will be created automatically)")
            
    print("System verification complete.")

if __name__ == "__main__":
    verify()
