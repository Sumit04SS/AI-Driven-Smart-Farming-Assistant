import os

from dotenv import load_dotenv
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer


load_dotenv()

PINECONE_API_KEY = os.getenv(
    "PINECONE_API_KEY"
)

if not PINECONE_API_KEY:
    raise ValueError(
        "PINECONE_API_KEY is missing from .env"
    )


INDEX_NAME = "agriculturebot"
NAMESPACE = "farming"

MODEL_NAME = (
    "sentence-transformers/"
    "all-MiniLM-L6-v2"
)

EXPECTED_DIMENSION = 384

# Retrieve more candidates from Pinecone
CANDIDATE_RESULTS = 20

# Send only 4 chunks to Groq
# One preferred chunk per PDF source
FINAL_RESULTS = 4

# Similarity threshold
MIN_SCORE = 0.35


print("Loading embedding model...")

model = SentenceTransformer(
    MODEL_NAME
)

if model.get_embedding_dimension() != EXPECTED_DIMENSION:
    raise ValueError(
        "Embedding model does not produce 384 dimensions."
    )


print("Connecting to Pinecone...")

pc = Pinecone(
    api_key=PINECONE_API_KEY
)

index = pc.Index(
    INDEX_NAME
)


def retrieve_documents(question):

    # ----------------------------------------
    # Convert question to 384D embedding
    # ----------------------------------------

    query_embedding = model.encode(
        question,
        normalize_embeddings=True
    ).tolist()

    if len(query_embedding) != EXPECTED_DIMENSION:
        raise ValueError(
            "Query embedding is not 384-dimensional."
        )

    # ----------------------------------------
    # Search Pinecone
    # ----------------------------------------

    response = index.query(
        namespace=NAMESPACE,
        vector=query_embedding,
        top_k=CANDIDATE_RESULTS,
        include_metadata=True
    )

    matches = response.get(
        "matches",
        []
    )

    # ----------------------------------------
    # Remove weak matches
    # ----------------------------------------

    matches = [
        match
        for match in matches
        if match.get("score", 0) >= MIN_SCORE
    ]

    selected = []

    selected_ids = set()

    selected_sources = set()

    # ----------------------------------------
    # PASS 1
    #
    # Prefer different PDF sources
    # ----------------------------------------

    for match in matches:

        metadata = match.get(
            "metadata",
            {}
        )

        source = metadata.get(
            "source"
        )

        if not source:
            continue

        if source in selected_sources:
            continue

        selected.append(
            {
                "id": match["id"],
                "score": match["score"],
                "text": metadata.get(
                    "text",
                    ""
                ),
                "source": source,
                "page": metadata.get(
                    "page"
                ),
                "chunk_index": metadata.get(
                    "chunk_index"
                )
            }
        )

        selected_ids.add(
            match["id"]
        )

        selected_sources.add(
            source
        )

        if len(selected) >= FINAL_RESULTS:
            break

    # ----------------------------------------
    # PASS 2
    #
    # If fewer than 4 sources were relevant,
    # fill remaining slots with best matches.
    # ----------------------------------------

    if len(selected) < FINAL_RESULTS:

        for match in matches:

            if match["id"] in selected_ids:
                continue

            metadata = match.get(
                "metadata",
                {}
            )

            selected.append(
                {
                    "id": match["id"],
                    "score": match["score"],
                    "text": metadata.get(
                        "text",
                        ""
                    ),
                    "source": metadata.get(
                        "source"
                    ),
                    "page": metadata.get(
                        "page"
                    ),
                    "chunk_index": metadata.get(
                        "chunk_index"
                    )
                }
            )

            selected_ids.add(
                match["id"]
            )

            if len(selected) >= FINAL_RESULTS:
                break

    return selected


if __name__ == "__main__":

    question = input(
        "Enter agriculture question: "
    ).strip()

    results = retrieve_documents(
        question
    )

    print(
        "\n=============================="
    )

    print(
        "RETRIEVED PDF CHUNKS"
    )

    print(
        "=============================="
    )

    if not results:

        print(
            "No relevant PDF information found."
        )

    for i, result in enumerate(
        results,
        1
    ):

        print(
            f"\n[{i}] "
            f"Score: {result['score']:.4f}"
        )

        print(
            f"Source: {result['source']}"
        )

        print(
            f"Page: {result['page']}"
        )

        print(
            f"Text: {result['text'][:500]}..."
        )