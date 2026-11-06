from backend.services.soil_advisory_service import get_soil_guidance


results = get_soil_guidance(
    crop="rice",
    nitrogen=90,
    phosphorus=42,
    potassium=43,
    ph=6.5,
)


print("\n==============================")
print("RICE SOIL GUIDANCE")
print("==============================")


for result in results:
    print("\n--------------------------------")
    print("Source:", result.get("source"))
    print("Page:", result.get("page"))
    print("Score:", result.get("score"))
    print("--------------------------------")

    print(
        result.get("text", "")[:1500]
    )