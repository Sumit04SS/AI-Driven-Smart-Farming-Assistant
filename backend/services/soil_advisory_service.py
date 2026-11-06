import os

from dotenv import load_dotenv
from groq import Groq

from retrieve import retrieve_documents


# ==========================================
# CONFIGURATION
# ==========================================

load_dotenv()

GUIDANCE_SOURCES = [
    "plant nutrition and security.pdf",
    "CROP PRODUCTION GUIDE.pdf",
]

GROQ_MODEL = "openai/gpt-oss-120b"


# ==========================================
# ENVIRONMENT VARIABLES
# ==========================================

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
# SOIL GUIDANCE RETRIEVAL
# ==========================================

def get_soil_guidance(
    crop: str,
    nitrogen: float,
    phosphorus: float,
    potassium: float,
    ph: float,
):
    """
    Retrieve crop-specific soil and nutrient
    guidance from the agricultural knowledge base.
    """

    query = (
        f"{crop} soil fertility "
        f"nitrogen phosphorus potassium "
        f"pH nutrient deficiency fertilizer "
        f"management soil test"
    )

    try:
        results = retrieve_documents(query)

    except Exception as e:
        print("\nSoil guidance retrieval error:")
        print(e)
        return []

    guidance = [
        result
        for result in results
        if result.get("source") in GUIDANCE_SOURCES
    ]

    return guidance


# ==========================================
# GENERATE SOIL ADVISORY
# ==========================================

def generate_advisory(
    crop: str,
    nitrogen: float,
    phosphorus: float,
    potassium: float,
    ph: float,
    guidance_results: list,
):
    """
    Generate a concise crop-specific advisory using
    only retrieved agricultural guidance.
    """

    # ======================================
    # NO GUIDANCE FOUND
    # ======================================

    if not guidance_results:
        return (
            f"No crop-specific soil guidance was found for {crop}. "
            "Please use the soil test report together with "
            "crop-specific recommendations from an agricultural expert."
        )

    # ======================================
    # BUILD CONTEXT
    # ======================================

    context_parts = []

    for result in guidance_results[:4]:

        text = result.get(
            "text",
            ""
        ).strip()

        if not text:
            continue

        context_parts.append(
            f"Source: {result.get('source')}\n"
            f"Page: {result.get('page')}\n"
            f"Guidance:\n{text[:1800]}"
        )

    context = "\n\n".join(
        context_parts
    )

    # ======================================
    # EMPTY CONTEXT CHECK
    # ======================================

    if not context.strip():
        return (
            f"No usable soil guidance was found for {crop}. "
            "Please follow soil-test recommendations and "
            "crop-specific advice from an agricultural expert."
        )

    # ======================================
    # GROQ PROMPT
    # ======================================

    prompt = f"""
You are an agricultural soil advisory assistant.

Crop:
{crop}

Farmer's soil test values:
Nitrogen (N): {nitrogen}
Phosphorus (P): {phosphorus}
Potassium (K): {potassium}
pH: {ph}

Use ONLY the agricultural guidance provided below.

IMPORTANT RULES:

1. Use ONLY the agricultural guidance provided below.
2. Give 2 to 3 short farmer-friendly sentences.
3. Mention at least ONE crop-specific nutrient-management
   practice from the retrieved guidance when available.
4. Do not invent nutrient deficiency thresholds.
5. Do not classify N, P, or K as deficient or excessive
   unless the provided guidance explicitly supports it.
6. Do not invent fertilizer quantities.
7. Do not generalize fertilizer rates from another crop.
8. If the guidance specifies application timing or method,
   mention it.
9. If exact fertilizer requirements are not available,
   state that they should follow soil-test recommendations.
10. Do not make claims about suitable pH unless the
    retrieved guidance explicitly provides a pH range.
11. Do not use information outside the supplied guidance.
12. Do not mention that you are an AI.

AGRICULTURAL GUIDANCE:
======================

{context}
"""


    # ======================================
    # GROQ REQUEST
    # ======================================

    try:

        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a concise agricultural soil "
                        "advisor. Use only the provided "
                        "agricultural guidance."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            max_completion_tokens=768,
            temperature=0,
        )

        answer = response.choices[0].message.content

        if answer and answer.strip():
            return answer.strip()

    except Exception as e:

        print(
            "\nSoil advisory Groq error:"
        )

        print(e)

    # ======================================
    # FALLBACK RESPONSE
    # ======================================

    return (
        f"For {crop}, the supplied soil values are "
        f"N={nitrogen}, P={phosphorus}, K={potassium}, "
        f"and pH={ph}. Fertilizer requirements should be "
        "finalized using soil-test recommendations and "
        "crop-specific guidance."
    )


# ==========================================
# ANALYZE SOIL
# ==========================================

def analyze_soil(
    crop: str,
    nitrogen: float,
    phosphorus: float,
    potassium: float,
    ph: float,
):
    """
    Analyze soil values for a specific crop and retrieve
    supporting agricultural guidance.
    """

    # ======================================
    # RETRIEVE GUIDANCE
    # ======================================

    guidance_results = get_soil_guidance(
        crop=crop,
        nitrogen=nitrogen,
        phosphorus=phosphorus,
        potassium=potassium,
        ph=ph,
    )

    # ======================================
    # GENERATE ADVISORY
    # ======================================

    advisory = generate_advisory(
        crop=crop,
        nitrogen=nitrogen,
        phosphorus=phosphorus,
        potassium=potassium,
        ph=ph,
        guidance_results=guidance_results,
    )

    # ======================================
    # PREPARE SOURCES
    # ======================================

    sources = []

    for result in guidance_results:

        source = result.get("source")

        if source:
            sources.append(
                {
                    "source": source,
                    "page": result.get("page"),
                    "score": result.get("score"),
                }
            )

    # ======================================
    # FINAL RESULT
    # ======================================

    return {
        "crop": crop,

        "soil_values": {
            "nitrogen": nitrogen,
            "phosphorus": phosphorus,
            "potassium": potassium,
            "ph": ph,
        },

        "advisory": advisory,

        "sources": sources,
    }