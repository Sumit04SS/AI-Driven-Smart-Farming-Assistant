import os
import re

import fitz
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
from dotenv import load_dotenv


load_dotenv()


PDF_PATH = "data/CROP PRODUCTION GUIDE.pdf"

MODEL_NAME = (
    "sentence-transformers/"
    "all-MiniLM-L6-v2"
)

INDEX_NAME = "agriculturebot"
NAMESPACE = "farming"

CHUNK_SIZE = 350
CHUNK_OVERLAP = 50
BATCH_SIZE = 32
EXPECTED_DIMENSION = 384


def clean_text(text):
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def create_chunks(text):
    words = text.split()

    if not words:
        return []

    chunks = []

    start = 0

    while start < len(words):

        end = start + CHUNK_SIZE

        chunk_words = words[start:end]

        if not chunk_words:
            break

        chunks.append(
            " ".join(chunk_words)
        )

        if end >= len(words):
            break

        start = end - CHUNK_OVERLAP

    return chunks


def main():

    if not os.path.exists(PDF_PATH):
        raise FileNotFoundError(
            f"PDF not found: {PDF_PATH}"
        )

    print("Opening Crop Production Guide...")

    document = fitz.open(PDF_PATH)

    records = []

    for page_index in range(len(document)):

        page = document[page_index]

        page_number = page_index + 1

        text = page.get_text("text")

        text = clean_text(text)

        if not text:
            continue

        chunks = create_chunks(text)

        for chunk_index, chunk in enumerate(chunks):

            records.append(
                {
                    "id": (
                        f"CROP PRODUCTION GUIDE.pdf_"
                        f"page_{page_number}_"
                        f"chunk_{chunk_index}"
                    ),
                    "text": chunk,
                    "source": "CROP PRODUCTION GUIDE.pdf",
                    "page": page_number,
                    "chunk_index": chunk_index,
                }
            )

    document.close()

    print(
        f"Chunks created: {len(records)}"
    )

    print("\nLoading embedding model...")

    model = SentenceTransformer(MODEL_NAME)

    dimension = model.get_embedding_dimension()

    print(
        f"Embedding dimension: {dimension}"
    )

    if dimension != EXPECTED_DIMENSION:
        raise ValueError(
            f"Expected {EXPECTED_DIMENSION}, "
            f"but received {dimension}"
        )

    texts = [
        record["text"]
        for record in records
    ]

    print("\nCreating embeddings...")

    embeddings = model.encode(
        texts,
        batch_size=BATCH_SIZE,
        show_progress_bar=True,
        normalize_embeddings=True,
    )

    print("\nConnecting to Pinecone...")

    PINECONE_API_KEY = os.getenv(
        "PINECONE_API_KEY"
    )

    if not PINECONE_API_KEY:
        raise ValueError(
            "PINECONE_API_KEY is missing "
            "from .env"
        )

    pc = Pinecone(
        api_key=PINECONE_API_KEY
    )

    index = pc.Index(INDEX_NAME)

    vectors = []

    for record, embedding in zip(
        records,
        embeddings
    ):

        vector = embedding.tolist()

        vectors.append(
            {
                "id": record["id"],
                "values": vector,
                "metadata": {
                    "text": record["text"],
                    "source": record["source"],
                    "page": record["page"],
                    "chunk_index": record["chunk_index"],
                },
            }
        )

    print(
        f"\nUploading {len(vectors)} vectors..."
    )

    for start in range(
        0,
        len(vectors),
        100
    ):

        batch = vectors[
            start:start + 100
        ]

        index.upsert(
            vectors=batch,
            namespace=NAMESPACE
        )

        uploaded = min(
            start + 100,
            len(vectors)
        )

        print(
            f"Uploaded {uploaded}/"
            f"{len(vectors)}"
        )

    print("\n==============================")
    print("CROP GUIDE UPLOAD COMPLETED")
    print("==============================")

    print(
        f"Source: CROP PRODUCTION GUIDE.pdf"
    )

    print(
        f"Vectors uploaded: {len(vectors)}"
    )

    print(
        f"Index: {INDEX_NAME}"
    )

    print(
        f"Namespace: {NAMESPACE}"
    )


if __name__ == "__main__":
    main()