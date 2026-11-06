from backend.services.soil_advisory_service import (
    analyze_soil
)


result = analyze_soil(
    crop="rice",
    nitrogen=90,
    phosphorus=42,
    potassium=43,
    ph=6.5
)


print("\n==============================")
print("SOIL ADVISORY TEST")
print("==============================")

print("\nCrop:")
print(result["crop"])

print("\nSoil values:")
print(result["soil_values"])

print("\nAdvisory:")
print(result["advisory"])

print("\nSources:")

for source in result["sources"]:
    print(
        f"- {source['source']} "
        f"| Page {source['page']} "
        f"| Score {source['score']}"
    )