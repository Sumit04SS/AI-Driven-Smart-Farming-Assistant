import json

from sentence_transformers import SentenceTransformer


CHUNKS_FILE = "output/chunks.json"

EMBEDDINGS_FILE = (
    "output/embeddings.json"
)

MODEL_NAME = (
    "sentence-transformers/"
    "all-MiniLM-L6-v2"
)

EXPECTED_DIMENSION = 384


def main():

    print(
        "Loading embedding model..."
    )

    model = SentenceTransformer(
        MODEL_NAME
    )

    dimension = (
        model.get_embedding_dimension()
    )

    print(
        f"Embedding dimension: {dimension}"
    )

    if dimension != EXPECTED_DIMENSION:

        raise ValueError(
            f"Expected {EXPECTED_DIMENSION}, "
            f"but received {dimension}"
        )

    with open(
        CHUNKS_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        chunks = json.load(file)

    print(
        f"Total chunks: {len(chunks)}"
    )

    texts = [
        chunk["text"]
        for chunk in chunks
    ]

    print(
        "Creating embeddings..."
    )

    embeddings = model.encode(
        texts,
        batch_size=32,
        show_progress_bar=True,
        normalize_embeddings=True
    )

    output = []

    for chunk, embedding in zip(
        chunks,
        embeddings
    ):

        vector = embedding.tolist()

        if len(vector) != EXPECTED_DIMENSION:

            raise ValueError(
                "Embedding dimension is incorrect."
            )

        output.append(
            {
                "id": chunk["id"],
                "text": chunk["text"],
                "source": chunk["source"],
                "page": chunk["page"],
                "chunk_index": chunk["chunk_index"],
                "embedding": vector
            }
        )

    with open(
        EMBEDDINGS_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            output,
            file,
            ensure_ascii=False
        )

    print("\n==============================")
    print("EMBEDDING COMPLETED")
    print("==============================")

    print(
        f"Vectors created: {len(output)}"
    )

    print(
        f"Dimension: {EXPECTED_DIMENSION}"
    )

    print(
        f"Saved to: {EMBEDDINGS_FILE}"
    )


if __name__ == "__main__":
    main()