import os

import joblib
import pandas as pd
from dotenv import load_dotenv
from groq import Groq

from retrieve import retrieve_documents


# ==========================================
# CONFIGURATION
# ==========================================

load_dotenv()

MODEL_PATH = os.path.join(
    "models",
    "crop_recommendation_model.pkl"
)

GUIDANCE_SOURCE = "CROP PRODUCTION GUIDE.pdf"

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

groq_client = Groq(
    api_key=GROQ_API_KEY
)


# ==========================================
# LOAD CROP MODEL
# ==========================================

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"Crop recommendation model not found: "
        f"{MODEL_PATH}"
    )

model_data = joblib.load(
    MODEL_PATH
)

model = model_data["model"]
features = model_data["features"]


# ==========================================
# CROP GUIDE RETRIEVAL
# ==========================================

def get_crop_guidance(crop: str):
    """
    Retrieve crop-specific information from
    the Crop Production Guide.
    """

    query = (
        f"{crop} crop production "
        f"climate requirements season varieties"
    )

    try:
        results = retrieve_documents(query)

    except Exception as e:
        print("\nCrop guidance retrieval error:")
        print(e)
        return []

    guide_results = [
        result
        for result in results
        if result.get("source") == GUIDANCE_SOURCE
    ]

    return guide_results


# ==========================================
# CROP EXPLANATION
# ==========================================

def generate_crop_explanation(
    crop: str,
    input_data: dict,
    guidance_results: list
):
    """
    Generate a short farmer-friendly explanation
    using the Crop Production Guide.
    """

    if not guidance_results:
        return (
            "The model recommends this crop "
            "based on the supplied soil and "
            "climate inputs."
        )

    context_parts = []

    for result in guidance_results[:3]:

        text = result.get(
            "text",
            ""
        ).strip()

        page = result.get(
            "page",
            "Unknown"
        )

        if not text:
            continue

        context_parts.append(
            f"""
SOURCE: {GUIDANCE_SOURCE}
PAGE: {page}

{text}
"""
        )

    context = "\n".join(
        context_parts
    )

    if not context.strip():
        return (
            "The model recommends this crop "
            "based on the supplied soil and "
            "climate inputs."
        )

    # ======================================
    # GROQ PROMPT
    # ======================================

    prompt = f"""
The ML model recommended {crop}.

Using ONLY the Crop Production Guide context below,
write exactly 2 short sentences explaining the
relevant requirements for {crop}.

Mention specific requirements from the guide when
available.

Do not discuss the ML model's accuracy.
Do not claim the guide made the prediction.
Do not claim success is guaranteed.
Do not use a table.
Do not use outside knowledge.

Crop Production Guide context:
==============================

{context}
"""

    print(
        f"Crop guidance context: "
        f"{len(context)} characters"
    )

    # ======================================
    # GROQ REQUEST
    # ======================================

    try:

        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a concise agriculture "
                        "advisor. Answer only from the "
                        "provided Crop Production Guide."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_completion_tokens=512
        )

        answer = (
            response
            .choices[0]
            .message
            .content
        )

        if answer and answer.strip():
            return answer.strip()

    except Exception as e:

        print(
            "\nCrop explanation Groq error:"
        )

        print(e)

    return (
        "The model recommends this crop "
        "based on the supplied soil and "
        "climate inputs. See the Crop "
        "Production Guide for crop-specific "
        "production guidance."
    )


# ==========================================
# CROP RECOMMENDATION
# ==========================================

def recommend_crop(
    nitrogen: float,
    phosphorus: float,
    potassium: float,
    temperature: float,
    humidity: float,
    ph: float,
    rainfall: float,
):

    # ======================================
    # INPUT DATA
    # ======================================

    input_data = {
        "nitrogen": nitrogen,
        "phosphorus": phosphorus,
        "potassium": potassium,
        "temperature": temperature,
        "humidity": humidity,
        "ph": ph,
        "rainfall": rainfall,
    }

    # ======================================
    # CREATE MODEL INPUT
    # ======================================

    input_dataframe = pd.DataFrame(
        [[
            nitrogen,
            phosphorus,
            potassium,
            temperature,
            humidity,
            ph,
            rainfall,
        ]],
        columns=features,
    )

    # ======================================
    # MODEL PREDICTION
    # ======================================

    prediction = model.predict(
        input_dataframe
    )[0]

    # ======================================
    # PREDICTION PROBABILITIES
    # ======================================

    probabilities = model.predict_proba(
        input_dataframe
    )[0]

    class_probabilities = dict(
        zip(
            model.classes_,
            probabilities
        )
    )

    # ======================================
    # TOP 3 CROPS
    # ======================================

    top_recommendations = sorted(
        class_probabilities.items(),
        key=lambda x: x[1],
        reverse=True,
    )[:3]

    # ======================================
    # RETRIEVE CROP GUIDE
    # ======================================

    guidance_results = get_crop_guidance(
        prediction
    )

    # ======================================
    # GENERATE EXPLANATION
    # ======================================

    explanation = generate_crop_explanation(
        crop=prediction,
        input_data=input_data,
        guidance_results=guidance_results,
    )

    # ======================================
    # FINAL RESULT
    # ======================================

    return {
        "recommended_crop": prediction,

        "confidence": round(
            float(
                class_probabilities[prediction]
            ) * 100,
            2,
        ),

        "top_recommendations": [
            {
                "crop": crop,
                "confidence": round(
                    float(probability) * 100,
                    2,
                ),
            }
            for crop, probability
            in top_recommendations
        ],

        "explanation": explanation,

        "guidance_source": GUIDANCE_SOURCE,
    }