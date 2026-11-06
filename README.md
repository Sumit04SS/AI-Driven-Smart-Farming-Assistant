# 🌾 AI-Driven Smart Farming Assistant with Multilingual Agricultural Guidance

An AI-powered agricultural advisory system designed to help farmers access relevant agricultural information through intelligent question answering using Retrieval-Augmented Generation (RAG), vector search, and machine learning.

## 📌 Project Overview

Agriculture plays an important role in the economy, but farmers often face difficulties accessing reliable information about crop diseases, pest management, fertilizer recommendations, irrigation, and agricultural practices.

This project aims to address these challenges by developing an AI-driven Smart Farming Assistant that retrieves relevant agricultural knowledge and generates context-aware responses to farmers' queries.

The system uses a Retrieval-Augmented Generation (RAG) pipeline with agricultural knowledge sources, semantic embeddings, and a vector database to improve the relevance of generated answers.

## 🎯 Objectives

- Provide accessible agricultural guidance through an AI-powered assistant.
- Retrieve relevant information from agricultural question-and-answer datasets.
- Implement a Retrieval-Augmented Generation (RAG) pipeline.
- Improve information retrieval using semantic embeddings and vector search.
- Organize agricultural knowledge into meaningful categories.
- Develop a user-friendly interface for interacting with the assistant.
- Explore multilingual agricultural query assistance.

## ✨ Key Features

- **AI-Powered Agricultural Assistance:** Answers agricultural questions using retrieved knowledge.
- **RAG-Based Question Answering:** Combines information retrieval with language generation.
- **Semantic Search:** Retrieves contextually relevant agricultural information using embeddings.
- **Vector Database Integration:** Uses Pinecone for storing and retrieving vector representations.
- **Agricultural Knowledge Processing:** Processes and organizes agricultural question-and-answer data.
- **Crop Recommendation:** Includes a machine-learning-based crop recommendation component.
- **REST API:** Uses FastAPI to expose backend functionality.
- **Interactive Frontend:** Provides an interface for users to interact with the system.
- **Multilingual Assistance:** Project scope includes supporting agricultural queries in multiple languages.

## 🏗️ System Architecture

The system follows a Retrieval-Augmented Generation architecture.

### 1. Data Collection
Agricultural question-and-answer information is collected from the Kisan Call Centre (KCC) dataset available through the Government of India's open data platform.

### 2. Data Preprocessing
- Load and clean the agricultural dataset.
- Remove unusable records.
- Organize agricultural information into relevant categories.
- Prepare question-and-answer documents for processing.

### 3. Text Chunking
Long documents are divided into smaller chunks using a recursive text-splitting approach to improve retrieval.

### 4. Embedding Generation
Text chunks are converted into numerical vector representations using an embedding model.

### 5. Vector Database
The generated embeddings and associated metadata are stored in Pinecone for efficient similarity-based retrieval.

### 6. Query Processing
When a user submits an agricultural question:
- The query is processed.
- Its semantic embedding is generated.
- Relevant information is retrieved from Pinecone.
- Retrieved context is passed to the language model.

### 7. Response Generation
The language model uses the retrieved agricultural context to generate a relevant response.

### 8. Frontend Integration
The backend exposes API endpoints through FastAPI, allowing the frontend application to communicate with the agricultural advisory system.

## 🔄 RAG Workflow

```text
Agricultural Knowledge Dataset
          |
          v
    Data Cleaning
          |
          v
   Text Chunking
          |
          v
 Embedding Generation
          |
          v
   Pinecone Vector DB
          |
          |
   User Agricultural Query
          |
          v
   Query Embedding
          |
          v
 Semantic Similarity Search
          |
          v
 Relevant Context Retrieval
          |
          v
   LLM Response Generation
          |
          v
   Agricultural Guidance
```

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Programming Language | Python, JavaScript |
| Frontend | React.js, Vite |
| Backend | FastAPI |
| AI Architecture | Retrieval-Augmented Generation (RAG) |
| Vector Database | Pinecone |
| Embeddings | Sentence Transformers / configured embedding model |
| Data Processing | Pandas, NumPy |
| Machine Learning | Scikit-learn |
| Model Integration | Groq / configured LLM provider |
| API Communication | REST API |
| Development Tools | VS Code, Git, GitHub |

*The exact embedding and LLM providers should reflect the models actually used in the published implementation.*

## 📂 Project Structure

```text
AI-Driven-Smart-Farming-Assistant/
│
├── backend/
│   ├── main.py
│   ├── routes/
│   ├── services/
│   ├── rag/
│   ├── models/
│   ├── config.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   └── package.json
│
├── data/
├── notebooks/
├── models/
├── docs/
├── screenshots/
│
├── README.md
├── .gitignore
└── LICENSE
```

## ⚙️ Installation and Setup

### Prerequisites

- Python 3.10+
- Node.js and npm
- Git
- Pinecone account and API key
- API key for the configured LLM provider

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/AI-Driven-Smart-Farming-Assistant.git

cd AI-Driven-Smart-Farming-Assistant
```

### 2. Backend Setup

```bash
python -m venv venv
```

Activate the virtual environment.

Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r backend/requirements.txt
```

### 3. Environment Configuration

Create a `.env` file in the appropriate backend configuration directory.

Example:

```env
PINECONE_API_KEY=your_pinecone_api_key
GROQ_API_KEY=your_groq_api_key
```

Add other configuration variables required by your actual implementation.

Never commit API keys or credentials.

### 4. Run the Backend

From the project root:

```bash
uvicorn backend.main:app --reload
```

Backend API:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### 5. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open the local development URL displayed in the terminal.

## 📊 Agricultural Knowledge Base

The project uses agricultural question-and-answer information from the Kisan Call Centre dataset.

The knowledge base covers categories such as:

- Crop Disease and Pest Management
- Fertilizer and Nutrient Management
- Crop Cultivation
- Seeds and Varieties
- Livestock and Animal Husbandry
- Government Schemes and Finance
- Other Agricultural Topics

The dataset is cleaned, categorized, chunked, and prepared for semantic retrieval.

## 🧠 Machine Learning Component

The system also incorporates a crop recommendation component based on machine learning.

The component is intended to analyze agricultural input parameters and provide crop recommendations based on the trained model.

The model implementation and supported input parameters should be documented alongside the corresponding source files.

## 🔐 Security and Data Handling

- API credentials are stored in environment variables.
- Sensitive configuration files are excluded from version control.
- Private datasets and company-owned resources are not included in this public portfolio repository.
- Only authorized source code and documentation are published.

## 🚀 Future Enhancements

- Improve multilingual query understanding and response generation.
- Expand the agricultural knowledge base.
- Integrate additional trusted agricultural information sources.
- Improve retrieval accuracy and response relevance.
- Add voice-based agricultural assistance.
- Develop a mobile-friendly experience.
- Add source references to retrieved agricultural answers.

## 👨‍💻 My Contributions

This project was developed as part of an internship project.

My work involved:

- Working with agricultural question-and-answer datasets.
- Exploring and implementing data preprocessing techniques.
- Categorizing agricultural knowledge.
- Implementing document chunking for RAG.
- Working with embedding generation and semantic search.
- Integrating Pinecone as a vector database.
- Developing and integrating backend services using FastAPI.
- Exploring frontend and API integration.
- Working with machine learning components for agricultural recommendations.

*Adjust this section to accurately reflect your individual contributions and the work you are authorized to disclose.*

## 📚 Data Source

Kisan Call Centre (KCC) dataset:

Government of India – Open Government Data Platform

https://www.data.gov.in/

## 📬 Contact

For project-related discussions, collaboration, or technical queries, feel free to connect.

GitHub: https://github.com/YOUR-USERNAME

LinkedIn: Add your LinkedIn profile URL

---

⭐ If you find this project interesting, consider giving this repository a star.

**Built to explore the intersection of Artificial Intelligence and Agriculture.** 🌱
