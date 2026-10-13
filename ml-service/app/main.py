import os
import sys
import json
from datetime import datetime
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Add parent directory to sys.path to load train and predict modules
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from predict import SeverityPredictor

app = FastAPI(
    title="Road Accident Severity Prediction & ML Microservice",
    version="1.0.0",
    description="Python FastAPI Microservice providing real-time inference, model evaluation metrics, and geospatial clustering."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load predictor at application startup
predictor: Optional[SeverityPredictor] = None

def get_predictor() -> Optional[SeverityPredictor]:
    global predictor
    if predictor is None:
        models_dir = os.path.join(parent_dir, "models")
        try:
            predictor = SeverityPredictor(models_dir=models_dir)
            print("ML models and preprocessor initialized successfully.")
        except Exception as e:
            print(f"Warning: Failed to load models: {e}")
    return predictor

@app.on_event("startup")
def startup_event():
    get_predictor()

# Request and Response schemas
class PredictionRequest(BaseModel):
    request_id: Optional[str] = None
    hour: int = Field(..., ge=0, le=23)
    day_of_week: str
    road_type: str
    weather_condition: str
    lighting_condition: str
    road_surface_condition: str
    vehicle_count: int = Field(default=1, ge=1)
    speed_limit: Optional[int] = 50
    area_type: str = "Urban"
    model_name: Optional[str] = "Random Forest"

class CoordinatePoint(BaseModel):
    id: Optional[int] = None
    latitude: float
    longitude: float
    severity: Optional[str] = "Minor"

class HotspotClusterRequest(BaseModel):
    coordinates: List[CoordinatePoint]
    radius_km: Optional[float] = 1.5
    min_points: Optional[int] = 3

@app.get("/health")
def health_check():
    p = get_predictor()
    models_loaded = p is not None and len(p.models) > 0
    return {
        "status": "HEALTHY" if models_loaded else "INITIALIZING",
        "service": "Road Accident ML Inference Microservice",
        "models_loaded": list(p.models.keys()) if p else [],
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/predict")
def predict_severity(req: PredictionRequest):
    p = get_predictor()
    if p is None:
        raise HTTPException(status_code=503, detail="Machine learning models are not yet loaded.")

    feature_dict = {
        "hour": req.hour,
        "day_of_week": req.day_of_week,
        "road_type": req.road_type,
        "weather_condition": req.weather_condition,
        "lighting_condition": req.lighting_condition,
        "road_surface_condition": req.road_surface_condition,
        "vehicle_count": req.vehicle_count,
        "speed_limit": req.speed_limit if req.speed_limit is not None else 50,
        "area_type": req.area_type
    }

    try:
        result = p.predict(feature_dict, req.model_name or "Random Forest")
        result["request_id"] = req.request_id or f"REQ-{datetime.utcnow().timestamp()}"
        result["timestamp"] = datetime.utcnow().isoformat()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@app.get("/models/evaluation")
def get_model_evaluations():
    eval_path = os.path.join(parent_dir, "models", "model_evaluations.json")
    if not os.path.exists(eval_path):
        raise HTTPException(status_code=404, detail="Model evaluation report not found. Please run train.py.")

    with open(eval_path, "r") as f:
        data = json.load(f)
    return data

@app.post("/hotspots/cluster")
def cluster_hotspots(req: HotspotClusterRequest):
    """Geospatial DBSCAN clustering with Haversine distance."""
    import numpy as np

    coords = req.coordinates
    if len(coords) < req.min_points:
        return {"clusters": []}

    R_EARTH = 6371.0
    eps = req.radius_km
    min_pts = req.min_points

    n = len(coords)
    visited = [False] * n
    cluster_ids = [-1] * n
    current_cluster = 0

    def haversine(lat1, lon1, lat2, lon2):
        dlat = np.radians(lat2 - lat1)
        dlon = np.radians(lon2 - lon1)
        a = np.sin(dlat / 2)**2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon / 2)**2
        return 2 * R_EARTH * np.arcsin(np.sqrt(a))

    for i in range(n):
        if visited[i]:
            continue
        visited[i] = True

        p1 = coords[i]
        neighbors = [j for j in range(n) if haversine(p1.latitude, p1.longitude, coords[j].latitude, coords[j].longitude) <= eps]

        if len(neighbors) >= min_pts:
            current_cluster += 1
            cluster_ids[i] = current_cluster
            queue = list(neighbors)

            while queue:
                curr = queue.pop(0)
                if not visited[curr]:
                    visited[curr] = True
                    curr_neighbors = [j for j in range(n) if haversine(coords[curr].latitude, coords[curr].longitude, coords[j].latitude, coords[j].longitude) <= eps]
                    if len(curr_neighbors) >= min_pts:
                        queue.extend(curr_neighbors)
                if cluster_ids[curr] == -1:
                    cluster_ids[curr] = current_cluster

    # Group by cluster ID
    clusters_map = {}
    for idx, cid in enumerate(cluster_ids):
        if cid > 0:
            clusters_map.setdefault(cid, []).append(coords[idx])

    output_clusters = []
    for cid, pts in clusters_map.items():
        avg_lat = float(np.mean([p.latitude for p in pts]))
        avg_lon = float(np.mean([p.longitude for p in pts]))
        fatal = sum(1 for p in pts if p.severity == "Fatal")
        serious = sum(1 for p in pts if p.severity == "Serious")
        minor = sum(1 for p in pts if p.severity == "Minor")

        if fatal >= 3 or (len(pts) >= 8 and fatal >= 1):
            risk = "Critical Risk"
        elif fatal >= 1 or serious >= 5 or len(pts) >= 10:
            risk = "High Risk"
        elif serious >= 2 or len(pts) >= 5:
            risk = "Medium Risk"
        else:
            risk = "Moderate Risk"

        output_clusters.append({
            "cluster_id": cid,
            "latitude": round(avg_lat, 6),
            "longitude": round(avg_lon, 6),
            "total_accidents": len(pts),
            "fatal_count": fatal,
            "serious_count": serious,
            "minor_count": minor,
            "risk_category": risk
        })

    output_clusters.sort(key=lambda x: x["total_accidents"], reverse=True)
    return {"clusters": output_clusters, "total_hotspots": len(output_clusters)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
