from backend.services.crop_recommendation_service import (
    recommend_crop
)


result = recommend_crop(
    nitrogen=90,
    phosphorus=42,
    potassium=43,
    temperature=25,
    humidity=80,
    ph=6.5,
    rainfall=200
)


print("\n==============================")
print("CROP RECOMMENDATION TEST")
print("==============================")

print(
    "\nRecommended crop:",
    result["recommended_crop"]
)

print(
    "Confidence:",
    result["confidence"]
)

print("\nTop recommendations:")

for item in result["top_recommendations"]:
    print(
        f"- {item['crop']}: "
        f"{item['confidence']}%"
    )

print("\nExplanation:")
print(result["explanation"])

print(
    "\nGuidance source:",
    result["guidance_source"]
)