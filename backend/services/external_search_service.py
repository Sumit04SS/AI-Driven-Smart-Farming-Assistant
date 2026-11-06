import os

from dotenv import load_dotenv
from tavily import TavilyClient
from groq import Groq


load_dotenv()


TAVILY_API_KEY = os.getenv(
    "TAVILY_API_KEY"
)

GROQ_API_KEY = os.getenv(
    "GROQ_API_KEY"
)


if not TAVILY_API_KEY:
    raise ValueError(
        "TAVILY_API_KEY is missing from .env"
    )


if not GROQ_API_KEY:
    raise ValueError(
        "GROQ_API_KEY is missing from .env"
    )


tavily_client = TavilyClient(
    api_key=TAVILY_API_KEY
)


groq_client = Groq(
    api_key=GROQ_API_KEY
)


def search_external_knowledge(
    question: str,
    max_results: int = 5
):
    response = tavily_client.search(
        query=question,
        search_depth="basic",
        max_results=max_results
    )

    results = []

    for result in response.get(
        "results",
        []
    ):
        results.append({
            "title": result.get(
                "title",
                ""
            ),
            "url": result.get(
                "url",
                ""
            ),
            "content": result.get(
                "content",
                ""
            )
        })

    return results


def generate_external_answer(
    question: str,
    search_results: list
):
    if not search_results:
        return None

    context_parts = []

    for i, result in enumerate(
        search_results,
        1
    ):
        context_parts.append(
            f"""
Source {i}

Title: {result["title"]}

URL: {result["url"]}

Content:
{result["content"]}
"""
        )

    context = "\n".join(
        context_parts
    )

    prompt = f"""You are an expert agronomic advisor helping farmers.
Answer the user's question using ONLY the information from the external search results provided below.

CORE RULES:
1. Ground every recommendation strictly in the supplied sources. Never invent doses, chemical names, or dates.
2. If sources provide partial information, provide the supported facts and note that they are not exhaustive.
3. Structure your answer using clear, professional markdown headings and natural paragraphs:
   ### Direct Recommendation
   ### Why and How This Practice Works
   ### Practical Implementation Steps & Timing
   ### Important Precautions & Common Mistakes
   ### Key Farmer Takeaway
   (Only include sections supported by the source information).
4. Use practical, farmer-friendly explanations. Avoid walls of raw bullet points.

User question:
{question}

External search information:
{context}
"""

    try:
        response = groq_client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert agronomic advisor. "
                        "Provide detailed, structured, and factual guidance "
                        "based only on the supplied search information."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_completion_tokens=3000
        )

        return response.choices[0].message.content

    except Exception as e:
        print(f"\nGroq External API Error: {e}")
        raise RuntimeError(
            f"AI answer generation failed (external): {e}"
        )
