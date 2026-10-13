import os
import sys

# Ensure parent directory is in path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_ml_api():
    print("Testing /health endpoint...")
    resp = client.get("/health")
    assert resp.status_code == 200, f"Health check failed: {resp.text}"
    print("Health response:", resp.json())

    print("\nTesting /models/evaluation endpoint...")
    resp = client.get("/models/evaluation")
    assert resp.status_code == 200, f"Evaluation check failed: {resp.text}"
    eval_data = resp.json()
    print("Models evaluated count:", len(eval_data.get("models", [])))

    print("\nTesting /predict endpoint...")
    payload = {
        "request_id": "TEST-001",
        "hour": 22,
        "day_of_week": "Saturday",
        "road_type": "Dual Carriageway",
        "weather_condition": "Raining",
        "lighting_condition": "Darkness - no lights",
        "road_surface_condition": "Wet/Damp",
        "vehicle_count": 2,
        "speed_limit": 80,
        "area_type": "Rural",
        "model_name": "Random Forest"
    }
    resp = client.post("/predict", json=payload)
    assert resp.status_code == 200, f"Predict failed: {resp.text}"
    pred_data = resp.json()
    print("Prediction response:")
    print("  Severity:", pred_data["predicted_severity"])
    print("  Confidence:", pred_data["confidence_score"])
    print("  Probabilities:", pred_data["class_probabilities"])
    print("  Explanation:", pred_data["explanation"])

    print("\nAll ML microservice API tests passed successfully!")

if __name__ == "__main__":
    test_ml_api()
