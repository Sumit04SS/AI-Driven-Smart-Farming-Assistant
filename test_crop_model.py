import joblib
import pandas as pd


MODEL_PATH = "models/crop_recommendation_model.pkl"

model_data = joblib.load(MODEL_PATH)

model = model_data["model"]
features = model_data["features"]


test_data = pd.DataFrame(
    [[90, 42, 43, 25, 80, 6.5, 200]],
    columns=features,
)

prediction = model.predict(test_data)[0]
probabilities = model.predict_proba(test_data)[0]

class_probabilities = dict(
    zip(model.classes_, probabilities)
)

top_crops = sorted(
    class_probabilities.items(),
    key=lambda x: x[1],
    reverse=True
)[:3]


print("Recommended crop:", prediction)
print("\nTop 3 recommendations:")

for crop, probability in top_crops:
    print(f"{crop}: {probability * 100:.2f}%")