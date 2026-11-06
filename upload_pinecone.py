import os
import json
import time

from dotenv import load_dotenv
from pinecone import (
    Pinecone,
    ServerlessSpec
)


load_dotenv()

PINECONE_API_KEY = os.getenv(
    "PINECONE_API_KEY"
)

if not PINECONE_API_KEY:

    raise ValueError(
        "PINECONE_API_KEY is missing "
        "from .env"
    )


INDEX_NAME = "agriculturebot"

NAMESPACE = "farming"

EMBEDDINGS_FILE = (
    "output/embeddings.json"
)

DIMENSION = 384


def main():

    print(
        "Connecting to Pinecone..."
    )

    pc = Pinecone(
        api_key=PINECONE_API_KEY
    )

    existing_indexes = [
        index["name"]
        for index in pc.list_indexes()
    ]

    if INDEX_NAME not in existing_indexes:

        print(
            f"Creating index: {INDEX_NAME}"
        )

        pc.create_index(
            name=INDEX_NAME,
            dimension=DIMENSION,
            metric="cosine",
            spec=ServerlessSpec(
                cloud="aws",
                region="us-east-1"
            )
        )

        print(
            "Waiting for index..."
        )

        while not pc.describe_index(
            INDEX_NAME
        ).status["ready"]:

            time.sleep(2)

    else:

        print(
            f"Index '{INDEX_NAME}' "
            "already exists."
        )

    index = pc.Index(
        INDEX_NAME
    )

    with open(
        EMBEDDINGS_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        records = json.load(file)

    print(
        f"Total vectors: {len(records)}"
    )

    vectors = []

    for record in records:

        vectors.append(
            {
                "id": record["id"],

                "values": record[
                    "embedding"
                ],

                "metadata": {
                    "text": record["text"],
                    "source": record["source"],
                    "page": record["page"],
                    "chunk_index": (
                        record["chunk_index"]
                    )
                }
            }
        )

    batch_size = 100

    print(
        "Uploading vectors..."
    )

    for start in range(
        0,
        len(vectors),
        batch_size
    ):

        batch = vectors[
            start:start + batch_size
        ]

        index.upsert(
            vectors=batch,
            namespace=NAMESPACE
        )

        uploaded = min(
            start + batch_size,
            len(vectors)
        )

        print(
            f"Uploaded {uploaded}/"
            f"{len(vectors)}"
        )

    print("\n==============================")
    print("PINECONE UPLOAD COMPLETED")
    print("==============================")

    print(
        f"Index: {INDEX_NAME}"
    )

    print(
        f"Namespace: {NAMESPACE}"
    )

    print(
        f"Dimension: {DIMENSION}"
    )

    print(
        f"Vectors: {len(vectors)}"
    )


if __name__ == "__main__":
    main()