# AI-Driven-Smart-Farming-Assistant-with-Multilingual-Agricultural-Guidance-and-Farmer-Supp-AUG-2026

# AI-Driven Smart Farming Assistant

## Milestone 1 – Agricultural Data Collection, Chunking & Vector Database

This project is an AI-driven smart farming assistant designed to provide
agricultural guidance using document-based retrieval and vector search.

## Milestone 1 Objective

The objective of Milestone 1 is to collect agricultural documents,
extract their text, divide the text into smaller chunks, generate
embeddings, and store the vectors in a Pinecone vector database.

## Data Sources

The project uses the following agricultural documents:

1.FAO – Manual on Integrated Soil Management and Conservation Practices
2.FAO – Plant Nutrition for Food Security: A Guide for Integrated Nutrient Management
3.FAO – Irrigation Manual
4.ICAR – Indian Agriculture after Independence

A starter agricultural dataset is also included.

## Data Processing Pipeline

PDF / Dataset
    ↓
Text Extraction
    ↓
Text Cleaning
    ↓
Chunking
    ↓
Embedding Generation
    ↓
Pinecone Vector Database
    ↓
Semantic Search

## Project Structure

AI-Agricultural-Advisory/
│
├── Data/
│   ├── chunks/
│   ├── datasets/
│   ├── embeddings/
│   ├── processed/
│   ├── raw/
│   ├── chunk_text.py
│   ├── create_embeddings.py
│   ├── create_pinecone_index.py
│   ├── extract_remaining.py
│   ├── test_search.py
│   └── upload_to_pinecone.py
│
└── .gitignore

## Chunking

The agricultural documents were divided into smaller text chunks
to improve semantic retrieval.

Each chunk contains:

- Chunk ID
- Source document
- Chunk number
- Chunk text

The generated chunks are stored as JSON files.

## Embeddings

The text chunks were converted into numerical embedding vectors.

The embedding model produces vectors with 384 dimensions.

## Pinecone Vector Database

A Pinecone index named `agri-advisory` was created.

Configuration:

- Metric: Cosine Similarity
- Vector Type: Dense
- Dimension: 384
- Cloud: AWS
- Region: us-east-1

The generated vectors were successfully uploaded to Pinecone.

## Verification

The vector upload was successfully completed for all four
agricultural documents.

Total vectors uploaded:

**1,576**

## Technologies Used

- Python
- PDF text extraction
- Text chunking
- Embeddings
- Pinecone
- JSON
- CSV
- Git
- GitHub

## Security

API credentials are stored locally in a `.env` file.

The `.env` file is excluded using `.gitignore` and is not included
in the GitHub repository.

## Milestone 1 Status

- [x] Agricultural documents collected
- [x] Dataset collected
- [x] PDF text extraction
- [x] Text processing
- [x] Document chunking
- [x] Embedding generation
- [x] Pinecone index creation
- [x] Vector upload
- [x] Search testing
- [x] GitHub repository updated

---

## Milestone 2 – Modern Full-Stack Agriculture SaaS Application

A premium, responsive, full-stack agricultural decision-support web application built with **React 19, TypeScript, Vite, Tailwind CSS v4, and FastAPI**.

### Core Modules & Capabilities

1. **Multilingual AI Agricultural Guidance (RAG)**: Interactive Q&A chat referencing verified FAO manuals and ICAR research documents stored in Pinecone with exact page citations and similarity match scores.
2. **ML Crop Recommendation Engine**: High-accuracy Random Forest classifier evaluating 7 soil and microclimate variables (N, P, K, temperature, humidity, pH, rainfall) with top-3 probabilistic rankings and Production Guide explanations.
3. **Soil Health & Nutrient Advisory**: Crop-specific soil fertility analysis and nutrient management guidance based on FAO integrated soil standards.
4. **Smart Farm Advisor**: Holistic decision engine fusing live local weather conditions, soil test metrics, and phenological crop growth stages into prioritized actionable recommendations.
5. **Live Agricultural Weather Station**: Real-time microclimate forecasting from Open-Meteo including wind speed, relative humidity, precipitation, and agricultural spraying/irrigation feasibility advisories.
6. **AGMARKNET Mandi Market Prices & Alerts**: Cascading search across Indian states, mandis, and commodities with weekly price tables and automated price alert subscriptions.
7. **Equipment Sharing Hub & Deal Calculator**: Peer-to-peer machinery rental marketplace with an interactive break-even and net savings calculator.
8. **Automated Notification Center**: In-app alert notification tray with background daemon checks.

---

## Quickstart Guide

### 1. Backend Setup & Run

Activate the Python virtual environment and launch the FastAPI server with Uvicorn:

```bash
# Windows PowerShell
.\venv\Scripts\Activate.ps1
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

The API will be live at `http://127.0.0.1:8000` (Docs: `http://127.0.0.1:8000/docs`).

### 2. Frontend Setup & Run

Open a second terminal, navigate to the `frontend` directory, and start the Vite development server:

```bash
cd frontend
npm install
npm run dev
```

The application will be accessible in your browser at `http://localhost:5173`.
Vite dev server proxies all `/api/*` requests directly to `http://127.0.0.1:8000`.

### 3. Frontend Production Build & Type-Check

To test type checking and create an optimized production build:

```bash
cd frontend
npm run build
```

