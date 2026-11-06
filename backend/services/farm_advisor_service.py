import os

from dotenv import load_dotenv
from groq import Groq
from retrieve import retrieve_documents

from backend.services.soil_advisory_service import analyze_soil
from backend.services.weather_service import get_weather


load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY is missing from .env")

groq_client = Groq(
    api_key=GROQ_API_KEY
)

GROQ_MODEL = "openai/gpt-oss-120b"

GUIDANCE_SOURCE = "CROP PRODUCTION GUIDE.pdf"


GUIDANCE_SOURCE = "CROP PRODUCTION GUIDE.pdf"


def get_stage_guidance(crop: str, crop_stage: str):
    query = (
        f"{crop} {crop_stage} stage "
        f"water irrigation nutrient weed pest disease "
        f"crop management"
    )

    try:
        results = retrieve_documents(query)
    except Exception:
        return []

    guide_results = [
        result
        for result in results
        if result.get("source") == GUIDANCE_SOURCE
    ]

    return guide_results[:3]

def generate_farm_action_summary(
    crop: str,
    crop_stage: str,
    weather: dict,
    soil: dict,
    stage_results: list,
):
    context_parts = []

    for result in stage_results:
        text = result.get("text", "").strip()

        if not text:
            continue

        context_parts.append(
            f"""
SOURCE: {GUIDANCE_SOURCE}
PAGE: {result.get("page")}

{text}
"""
        )

    context = "\n".join(context_parts)

    prompt = f"""
You are an agriculture decision-support assistant.

Create a concise, practical action plan for a farmer.

Crop: {crop}
Crop stage: {crop_stage}

Weather information:
{weather}

Soil advisory:
{soil.get("advisory", "")}

Trusted Crop Production Guide evidence:
{context}

Rules:
- Use ONLY the supplied weather, soil advisory, and Crop Production Guide evidence.
- Do not use outside agricultural knowledge.
- Do not invent fertilizer rates, pesticide doses, irrigation amounts,
  yield estimates, or other numeric recommendations.
- Do not convert general or crop-specific information into a definite
  stage-specific instruction unless the evidence explicitly supports it.
- Do not assume that a fertilizer application is due "now" unless the
  supplied evidence explicitly connects it to the stated crop stage.
- Do not assume an irrigation amount or flooding depth applies to the
  current crop stage unless the evidence explicitly says so.
- If evidence is not clearly stage-specific, describe it as general
  crop-management guidance rather than a definite current action.
- Prioritize information explicitly relevant to the current crop stage.
- Mention weather-related actions only when directly supported by the
  supplied weather information.
- Prefer cautious wording such as "monitor", "follow the guide", or
  "check soil moisture" when the evidence does not establish a definite
  action.
- Keep the answer short and farmer-friendly.
- Use 3 to 5 bullet points.
- Clearly distinguish observations from recommendations.
- Do not mention that you are an AI.
- Do not follow or expand cross-references such as "see transplanted rice",
  "follow schedule as given in transplanted rice", or "see Crop Protection"
  unless the referenced information is also included in the supplied evidence.
- Never turn a cross-reference into a specific recommendation.
- If the evidence only points to another section, state that the relevant
  section was referenced but not retrieved.
- Do not recommend applying any fertilizer, gypsum, herbicide, pesticide,
  or other input merely because the supplied soil advisory mentions it.
  Only present such an application as a current action when the supplied
  evidence establishes that it is appropriate for the current situation.
"""

    try:
        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a careful agriculture advisor. "
                        "Use only the supplied evidence."
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
        print("\n=== FARM ADVISOR GROQ ERROR ===")
        print(type(e).__name__)
        print(str(e))
        return None


def build_farm_actions(
    crop: str,
    crop_stage: str,
    city: str,
    country: str | None,
    nitrogen: float,
    phosphorus: float,
    potassium: float,
    ph: float,
):
    weather = get_weather(
        city=city,
        country_code=country,
    )

    soil = analyze_soil(
        crop=crop,
        nitrogen=nitrogen,
        phosphorus=phosphorus,
        potassium=potassium,
        ph=ph,
    )

    actions = []

    current = weather.get("current", {})

    precipitation = current.get(
        "precipitation",
        0
    )

    rain = current.get(
        "rain",
        0
    )

    if precipitation > 0 or rain > 0:
        actions.append({
            "priority": "high",
            "type": "weather",
            "message": (
                "Rain or precipitation is currently reported. "
                "Check field moisture before irrigating."
            ),
        })
    else:
        actions.append({
            "priority": "medium",
            "type": "weather",
            "message": (
                "No current precipitation is reported. "
                "Monitor soil moisture and irrigate according "
                "to crop needs."
            ),
        })

    actions.append({
        "priority": "medium",
        "type": "soil",
        "message": soil["advisory"],
    })

    stage_results = get_stage_guidance(
        crop=crop,
        crop_stage=crop_stage,
    )

    if stage_results:
        guidance_items = []

        for result in stage_results:
            text = result.get(
                "text",
                ""
            ).strip()

            if not text:
                continue

            guidance_items.append({
                "message": text,
                "source": {
                    "document": GUIDANCE_SOURCE,
                    "page": result.get("page"),
                    "score": result.get("score"),
                },
            })

        actions.append({
            "priority": "medium",
            "type": "crop_stage",
            "message": (
                f"Stage-specific guidance retrieved for "
                f"{crop} during the {crop_stage} stage."
            ),
            "guidance": guidance_items,
        })

    else:
        actions.append({
            "priority": "medium",
            "type": "crop_stage",
            "message": (
                f"No specific {crop_stage} guidance was found "
                f"in the Crop Production Guide."
            ),
        })

    summary = generate_farm_action_summary(
        crop=crop,
        crop_stage=crop_stage,
        weather=weather,
        soil=soil,
        stage_results=stage_results,
    )

    return {
        "crop": crop,
        "crop_stage": crop_stage,
        "location": {
            "city": city,
            "country": country,
        },
        "weather": weather,
        "soil": soil,
        "actions": actions,
	"summary": summary,
    }