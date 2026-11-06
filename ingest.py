import os
import re
import json
import fitz


DATA_DIR = "data"
OUTPUT_DIR = "output"

CHUNKS_FILE = os.path.join(
    OUTPUT_DIR,
    "chunks.json"
)

CHUNK_SIZE = 350
CHUNK_OVERLAP = 50


def clean_text(text):
    """
    Clean extracted PDF text.
    """

    text = re.sub(r"\s+", " ", text)

    return text.strip()


def create_chunks(
    text,
    chunk_size=CHUNK_SIZE,
    overlap=CHUNK_OVERLAP
):
    """
    Split text into overlapping word chunks.
    """

    words = text.split()

    if not words:
        return []

    chunks = []

    start = 0

    while start < len(words):

        end = start + chunk_size

        chunk_words = words[start:end]

        if not chunk_words:
            break

        chunk = " ".join(chunk_words)

        chunks.append(chunk)

        if end >= len(words):
            break

        start = end - overlap

    return chunks


def process_pdf(pdf_path):

    filename = os.path.basename(pdf_path)

    print(f"\nProcessing: {filename}")

    document = fitz.open(pdf_path)

    pdf_chunks = []

    for page_index in range(len(document)):

        page = document[page_index]

        page_number = page_index + 1

        text = page.get_text("text")

        text = clean_text(text)

        if not text:
            continue

        chunks = create_chunks(text)

        for chunk_index, chunk in enumerate(chunks):

            pdf_chunks.append(
                {
                    "id": (
                        f"{filename}_"
                        f"page_{page_number}_"
                        f"chunk_{chunk_index}"
                    ),
                    "text": chunk,
                    "source": filename,
                    "page": page_number,
                    "chunk_index": chunk_index
                }
            )

    document.close()

    print(
        f"Chunks created: {len(pdf_chunks)}"
    )

    return pdf_chunks


def main():

    os.makedirs(
        OUTPUT_DIR,
        exist_ok=True
    )

    pdf_files = [
        filename
        for filename in os.listdir(DATA_DIR)
        if filename.lower().endswith(".pdf")
    ]

    if not pdf_files:

        print(
            "No PDF files found in data folder."
        )

        return

    print(
        f"Found {len(pdf_files)} PDF files."
    )

    all_chunks = []

    for filename in pdf_files:

        pdf_path = os.path.join(
            DATA_DIR,
            filename
        )

        chunks = process_pdf(pdf_path)

        all_chunks.extend(chunks)

    with open(
        CHUNKS_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            all_chunks,
            file,
            ensure_ascii=False,
            indent=2
        )

    print("\n==============================")
    print("INGESTION COMPLETED")
    print("==============================")

    print(
        f"Total chunks: {len(all_chunks)}"
    )

    print(
        f"Saved to: {CHUNKS_FILE}"
    )


if __name__ == "__main__":
    main()