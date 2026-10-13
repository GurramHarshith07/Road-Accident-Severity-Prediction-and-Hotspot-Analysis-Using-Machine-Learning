import os
import sys
import joblib
import numpy as np

# Add parent directory to path if needed
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from model_def import CustomDecisionTree, CustomRandomForest, Node, AccidentPreprocessor

class SeverityPredictor:
    def __init__(self, models_dir=None):
        if models_dir is None:
            models_dir = os.path.join(current_dir, "models")
        self.models_dir = models_dir
        self.preprocessor = joblib.load(os.path.join(models_dir, "preprocessor.joblib"))
        self.models = {
            "Random Forest": joblib.load(os.path.join(models_dir, "random_forest.joblib")),
            "Logistic Regression": joblib.load(os.path.join(models_dir, "logistic_regression.joblib")),
            "Decision Tree": joblib.load(os.path.join(models_dir, "decision_tree.joblib"))
        }
        self.class_labels = {0: "Minor", 1: "Serious", 2: "Fatal"}

    def predict(self, feature_dict, model_name="Random Forest"):
        if model_name not in self.models:
            model_name = "Random Forest"

        model = self.models[model_name]
        X = self.preprocessor.transform_single(feature_dict)

        probs = model.predict_proba(X)[0]
        pred_class_idx = int(np.argmax(probs))
        predicted_severity = self.class_labels[pred_class_idx]
        confidence = float(probs[pred_class_idx])

        class_probabilities = {
            "Minor": round(float(probs[0]), 4),
            "Serious": round(float(probs[1]), 4),
            "Fatal": round(float(probs[2]), 4)
        }

        explanation = self._generate_explanation(feature_dict, predicted_severity, class_probabilities)

        return {
            "predicted_severity": predicted_severity,
            "confidence_score": round(confidence, 4),
            "class_probabilities": class_probabilities,
            "explanation": explanation,
            "model_name": model_name,
            "model_version": "1.0.0"
        }

    def _generate_explanation(self, feat, severity, probs):
        reasons = []
        speed = feat.get("speed_limit", 50)
        lighting = feat.get("lighting_condition", "")
        weather = feat.get("weather_condition", "")
        surface = feat.get("road_surface_condition", "")
        area = feat.get("area_type", "")
        vehicles = feat.get("vehicle_count", 1)
        hour = feat.get("hour", 12)

        if speed >= 80:
            reasons.append(f"high vehicle velocity ({speed} km/h)")
        if "no lights" in lighting.lower():
            reasons.append("complete absence of street illumination")
        if surface.lower() in ["wet/damp", "snow/ice", "flooded"]:
            reasons.append(f"degraded traction on {surface.lower()} pavement")
        if weather.lower() in ["fog/mist", "high winds", "raining"]:
            reasons.append(f"hazardous weather ({weather.lower()})")
        if area.lower() == "rural":
            reasons.append("rural setting with longer emergency response radius")
        if vehicles >= 3:
            reasons.append(f"multi-vehicle impact dynamic ({vehicles} vehicles)")
        if 0 <= hour <= 4:
            reasons.append("late-night vulnerability window (midnight–4am)")

        if not reasons:
            if severity == "Minor":
                return f"Standard daylight operating conditions at {speed} km/h on dry single carriageway indicate predominantly low risk of severe injury."
            else:
                return f"Cumulative interaction of vehicle velocity ({speed} km/h) and traffic dynamics elevated severity risk."

        joined = ", ".join(reasons)
        if severity == "Fatal":
            return f"Critical severity forecast strongly driven by {joined}. Model estimated a {probs['Fatal']*100:.1f}% fatality probability."
        elif severity == "Serious":
            return f"Hospitalization-level severity elevated by {joined}. Estimated serious injury probability is {probs['Serious']*100:.1f}%."
        else:
            return f"Despite presence of {joined}, low speed profile ({speed} km/h) keeps estimated risk predominantly in the Minor damage threshold ({probs['Minor']*100:.1f}%)."

if __name__ == "__main__":
    predictor = SeverityPredictor()
    sample = {
        "hour": 23, "day_of_week": "Friday", "road_type": "Dual Carriageway",
        "weather_condition": "Raining", "lighting_condition": "Darkness - no lights",
        "road_surface_condition": "Wet/Damp", "vehicle_count": 2, "speed_limit": 80,
        "area_type": "Rural"
    }
    result = predictor.predict(sample, "Random Forest")
    print("Test inference result:")
    print(result)
