import os

from dotenv import load_dotenv
from groq import Groq

from retrieve import retrieve_documents


# ==========================================
# CONFIGURATION
# ==========================================

# Verified available via GET https://api.groq.com/openai/v1/models
# "groq/compound" was removed — openai/gpt-oss-120b is currently active.
MODEL_NAME = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

MAX_CONTEXT_CHARS = 8000
MAX_COMPLETION_TOKENS = 2500


# ==========================================
# LOAD ENVIRONMENT VARIABLES
# ==========================================

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError(
        "GROQ_API_KEY is missing from .env"
    )


# ==========================================
# GROQ CLIENT
# ==========================================

client = Groq(
    api_key=GROQ_API_KEY
)


# ==========================================
# SENTINEL EXCEPTION — callers can detect
# generation failure vs. "not found"
# ==========================================

class GroqGenerationError(RuntimeError):
    """Raised when the Groq API call fails so callers can return HTTP 502."""
    pass


# ==========================================
# BUILD PDF CONTEXT
# ==========================================

def build_context(results):

    context_parts = []

    total_chars = 0

    for result in results:

        text = result.get(
            "text",
            ""
        ).strip()

        source = result.get(
            "source",
            "Unknown PDF"
        )

        page = result.get(
            "page",
            "Unknown"
        )

        if not text:
            continue

        remaining = (
            MAX_CONTEXT_CHARS
            - total_chars
        )

        if remaining <= 0:
            break

        text = text[:remaining]

        context_parts.append(
            f"""
SOURCE: {source}
PAGE: {page}

{text}
"""
        )

        total_chars += len(text)

    return "\n".join(
        context_parts
    )


# ==========================================
# GENERATE ANSWER
# ==========================================

def generate_answer(
    question,
    results
):

    if not results:

        return (
            "I am an agriculture advisor. Please ask me an agriculture-related question.."
        )

    context = build_context(
        results
    )

    if not context.strip():

        return (
            "I am an agriculture advisor. Please ask me an agriculture-related question.."
        )

    # --------------------------------------
    # Detailed Agricultural Guidance Prompt
    # --------------------------------------

    system_prompt = """You are an expert agronomic advisor helping farmers make informed, scientifically sound agricultural decisions.

Your task is to provide detailed, professional, and practical farmer-friendly guidance based on the provided document context.

CORE RULES:
1. Synthesize all relevant agronomic principles, water management guidelines, stored soil moisture data, irrigation splitting techniques, and soil texture rules present in the provided document context.
2. Ground every statement, dose, timing, and practice in the provided document context.
3. If the documents contain general or partial water management principles (e.g. soil moisture levels, irrigation duration limits, drip guidelines, split applications), explain these practical guidelines clearly for the farmer.
4. Only state "I could not find this information in the provided documents." if the documents are completely unrelated to agriculture or crops.
5. Complete the entire response thoroughly (around 450 to 700 words). Every section and sentence must finish naturally and completely. Never stop mid-sentence.

TONE & STYLE:
- Professional, supportive, and accessible to farmers.
- Use natural, well-developed paragraphs with clear descriptive markdown headings.
- Explain the underlying agricultural reasons ("why" and "how") simply.

RESPONSE STRUCTURE:
### Direct Recommendation
A concise, direct summary of the recommended farming practice or irrigation guidance.

### Why and How This Practice Works
Detailed explanation of soil moisture dynamics, water retention, root asphyxiation avoidance, or nutrient uptake based on the documents.

### Practical Implementation Steps & Timing
Step-by-step field execution steps (e.g. splitting irrigation sessions over 3 hours, managing stored soil moisture levels, soil texture considerations).

### Important Precautions & Common Mistakes
Pitfalls to avoid such as excessive percolation, waterlogging, or root asphyxiation mentioned in the sources.

### Key Farmer Takeaway
A clear, 1-2 sentence conclusion stating the primary action the farmer should take right now."""

    # --------------------------------------
    # User prompt
    # --------------------------------------

    user_prompt = f"""DOCUMENT CONTEXT:
====================
{context}
====================

FARMER'S QUESTION:
{question}

Provide a comprehensive, practical, and farmer-friendly guide answering this question using all relevant agricultural insights from the document context above."""

    print(
        f"Context sent to Groq: "
        f"{len(context)} characters"
    )

    # --------------------------------------
    # Groq request with Model Fallback
    # --------------------------------------
    candidate_models = [MODEL_NAME, "openai/gpt-oss-20b", "qwen/qwen3.8-27b"]

    last_error = None
    for model_item in candidate_models:
        try:
            response = client.chat.completions.create(
                model=model_item,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_completion_tokens=MAX_COMPLETION_TOKENS
            )

            choice = response.choices[0]
            answer = choice.message.content
            print(f"Groq ({model_item}) generated {len(answer) if answer else 0} chars, finish_reason: {choice.finish_reason}")
            if not answer:
                return "I could not find this information in the provided documents."

            return answer.strip()

        except Exception as e:
            print(f"Groq API Error (model={model_item}): {e}")
            last_error = e

    raise GroqGenerationError(
        f"AI answer generation failed across all models: {last_error}"
    )




# ==========================================
# MAIN PROGRAM
# ==========================================

def main():

    print(
        "================================"
    )

    print(
        "CROP PRODUCTION & MANAGEMENT RAG"
    )

    print(
        "================================"
    )

    question = input(
        "\nAsk an agriculture question: "
    ).strip()

    if not question:

        print(
            "Please enter a question."
        )

        return

    print(
        "\nSearching agricultural PDFs..."
    )

    # --------------------------------------
    # Retrieve from Pinecone
    # --------------------------------------

    results = retrieve_documents(
        question
    )

    print(
        f"Retrieved {len(results)} PDF chunks."
    )

    # --------------------------------------
    # Generate answer with Groq
    # --------------------------------------

    answer = generate_answer(
        question,
        results
    )

    # --------------------------------------
    # Final answer
    # --------------------------------------

    print(
        "\n================================"
    )

    print(
        "FINAL ANSWER"
    )

    print(
        "================================\n"
    )

    print(answer)

    # --------------------------------------
    # Sources
    # --------------------------------------

    print(
        "\n================================"
    )

    print(
        "SOURCES"
    )

    print(
        "================================"
    )

    for result in results:

        source = result.get(
            "source",
            "Unknown"
        )

        page = result.get(
            "page",
            "Unknown"
        )

        score = result.get(
            "score",
            0
        )

        print(
            f"- {source} "
            f"(Page {page}) "
            f"[Score: {score:.4f}]"
        )


# ==========================================
# START PROGRAM
# ==========================================

if __name__ == "__main__":

    main()