# Pedyssey

> A privacy-first, local-only PDF intelligence platform using RAG.

**Privacy Statement**: Pedyssey processes documents locally. PDFs and their contents are not sent to a cloud AI API by the application. Everything runs directly on your machine.

## Architecture

```text
+----------------+      +-------------------+      +-----------------+
|   Frontend     | <--> |   FastAPI Backend | <--> |   Ollama (LLM)  |
| (React/NextJS) |      |    (RAG Engine)   |      +-----------------+
+----------------+      +-------------------+
                               |   |
                    +----------+   +----------+
                    |                         |
            +---------------+         +---------------+
            | PostgreSQL DB |         | Vector & BM25 |
            |  (Metadata)   |         |    Indexes    |
            +---------------+         +---------------+
```

## Technology Stack

| Component | Technology |
|---|---|
| Backend | Python, FastAPI, SQLAlchemy |
| AI / ML | sentence-transformers, FAISS, BM25, Ollama |
| Database | PostgreSQL |
| Frontend | React, Next.js (TailwindCSS) |
| OCR | Tesseract |

## Prerequisites
- Python 3.11+
- Node.js 18+
- [Ollama](https://ollama.com) installed and running locally
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) installed on your system
- Git

## Hardware Requirements
- **Minimum**: 8GB RAM (will struggle with large LLMs, recommend smaller models like `phi3`)
- **Recommended**: 16GB+ RAM, dedicated GPU (Nvidia/Apple Silicon) for faster processing

## Installation

1. **Clone Repo**
   ```bash
   git clone https://github.com/yourusername/pedyssey.git
   cd pedyssey
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Install Ollama & Pull Model**
   Ensure Ollama is running, then pull your preferred model:
   ```bash
   ollama pull llama3
   ```

5. **Install Tesseract**
   - **Windows**: Download installer from [UB-Mannheim](https://github.com/UB-Mannheim/tesseract/wiki)
   - **Mac**: `brew install tesseract`
   - **Linux**: `sudo apt install tesseract-ocr`

6. **Download ML Models**
   ```bash
   cd ../backend
   python -m scripts.setup_models
   ```

7. **Verify System**
   ```bash
   python -m scripts.verify_system
   ```

## Running the Application

**Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/documents/upload` | POST | Upload and save a PDF |
| `/documents/{id}/process` | POST | Trigger RAG pipeline extraction |
| `/chat/` | POST | Send a query to the AI |
| `/chat/stream` | POST | Send a query (streaming response) |
| `/system/status` | GET | Check component health |

## Offline Usage
Pedyssey is entirely offline. Once models (Ollama, embedding, reranking) are downloaded via setup scripts and Ollama pulls, you can safely disconnect from the internet.

## Folder Structure
```
pedyssey/
├── backend/
│   ├── api/          # FastAPI routers
│   ├── core/         # Config and constants
│   ├── database/     # Models and DB connection
│   ├── schemas/      # Pydantic schemas
│   ├── scripts/      # Setup and verify scripts
│   ├── services/     # RAG, PDF, OCR services
│   └── utils/        # Helper functions
├── frontend/         # Next.js UI
├── tests/            # Pytest test suite
└── data/             # Local data (documents, indexes)
```

## Troubleshooting
- **Tesseract Not Found**: Ensure Tesseract is in your system PATH.
- **Ollama Connection Refused**: Verify Ollama app is open in your system tray or `ollama serve` is running.
- **Out of Memory (OOM)**: Change LLM model to a smaller one (e.g., `phi3` or `qwen2:0.5b`) in Settings.
