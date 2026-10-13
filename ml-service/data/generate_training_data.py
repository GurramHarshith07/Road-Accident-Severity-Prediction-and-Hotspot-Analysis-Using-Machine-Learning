import os
import random
import numpy as np
import pandas as pd

def generate_dataset(output_path="ml-service/data/training_accidents.csv", n_records=5000):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    random.seed(42)
    np.random.seed(42)

    road_types = ["Single Carriageway", "Dual Carriageway", "Roundabout", "One way street"]
    weather_conditions = ["Fine", "Raining", "Fog/Mist", "High winds"]
    lighting_conditions = ["Daylight", "Darkness - lights lit", "Darkness - no lights"]
    road_surfaces = ["Dry", "Wet/Damp", "Snow/Ice", "Flooded"]
    area_types = ["Urban", "Rural"]
    days_of_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    records = []

    for _ in range(n_records):
        hour = random.randint(0, 23)
        day_of_week = random.choice(days_of_week)
        road_type = random.choices(road_types, weights=[0.50, 0.30, 0.12, 0.08])[0]
        weather = random.choices(weather_conditions, weights=[0.70, 0.18, 0.08, 0.04])[0]
        
        if 6 <= hour < 18:
            lighting = "Daylight"
        else:
            lighting = random.choices(["Darkness - lights lit", "Darkness - no lights"], weights=[0.75, 0.25])[0]

        if weather == "Raining":
            surface = "Wet/Damp"
        elif weather == "Fog/Mist" and random.random() > 0.4:
            surface = "Wet/Damp"
        else:
            surface = random.choices(road_surfaces, weights=[0.80, 0.15, 0.03, 0.02])[0]

        area_type = random.choices(area_types, weights=[0.75, 0.25])[0]
        speed_limit = random.choice([30, 40, 50, 60, 80, 100]) if area_type == "Rural" else random.choice([30, 40, 50, 60])
        vehicles = random.choices([1, 2, 3, 4], weights=[0.45, 0.42, 0.10, 0.03])[0]

        # Calculate risk score based on real-world accident physics
        risk_score = 0.0

        # Speed risk
        risk_score += (speed_limit - 30) * 0.035

        # Vehicle involvement
        risk_score += (vehicles - 1) * 0.35

        # Lighting risk
        if lighting == "Darkness - no lights":
            risk_score += 1.4
        elif lighting == "Darkness - lights lit":
            risk_score += 0.4

        # Weather / surface risk
        if surface in ["Wet/Damp", "Snow/Ice", "Flooded"]:
            risk_score += 0.65
        if weather in ["Fog/Mist", "High winds"]:
            risk_score += 0.55

        # Night time hours (midnight - 4am)
        if 0 <= hour <= 4:
            risk_score += 0.8

        # Rural areas have higher speeds and longer emergency response times
        if area_type == "Rural":
            risk_score += 0.75

        # Road geometry
        if road_type == "Dual Carriageway":
            risk_score += 0.45

        # Stochastic noise
        risk_score += np.random.normal(0, 0.6)

        # Categorize severity based on calibrated threshold boundaries
        if risk_score > 3.8:
            severity = "Fatal"
            casualty = 1 if random.random() > 0.3 else 2
            injury = random.randint(1, 4)
        elif risk_score > 1.8:
            severity = "Serious"
            casualty = 0
            injury = random.randint(1, 3)
        else:
            severity = "Minor"
            casualty = 0
            injury = 1 if random.random() > 0.6 else 0

        records.append({
            "hour": hour,
            "day_of_week": day_of_week,
            "road_type": road_type,
            "weather_condition": weather,
            "lighting_condition": lighting,
            "road_surface_condition": surface,
            "vehicle_count": vehicles,
            "speed_limit": speed_limit,
            "area_type": area_type,
            "casualty_count": casualty,
            "injury_count": injury,
            "severity": severity
        })

    df = pd.DataFrame(records)
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} records in {output_path}")
    print("Severity distribution:\n", df['severity'].value_counts(normalize=True))
    return df

if __name__ == "__main__":
    generate_dataset()
