# Road Accident Severity Prediction and Hotspot Analysis Using Machine Learning

**B.Tech Final Year Capstone Project — Computer Science and Engineering**

A production-grade, full-stack decision-support system for road safety analytics, combining a modern **React** dashboard, **Java Spring Boot 3.x** REST API, **MySQL 8** database, and a **Python FastAPI** machine learning microservice for accident severity forecasting and geospatial hotspot clustering.

---

## 📌 System Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │          React Frontend (Vite + Tailwind)     │
                    │         http://localhost:3000 (9 pages)       │
                    └──────────────────────┬───────────────────────┘
                                           │ HTTP REST / JSON
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │     Spring Boot 3.3.5 Backend (Java 17)      │
                    │               http://localhost:8080          │
                    │  - CRUD & Validation    - JPA / Hibernate    │
                    │  - DBSCAN Hotspot Clust - Swagger UI / Docs  │
                    └───────────┬──────────────────────┬───────────┘
                                │                      │
                 JDBC / SQL     ▼                      ▼ HTTP / JSON
             ┌─────────────────────┐       ┌───────────────────────────────┐
             │       MySQL 8       │       │    FastAPI ML Microservice    │
             │  `road_accident_db` │       │     http://localhost:8000     │
             │ - accidents         │       │ - Random Forest Classifier    │
             │ - hotspots          │       │ - Logistic Regression         │
             │ - prediction_record │       │ - Decision Tree Classifier    │
             │ - model_evaluations │       │ - Preprocessing & Inference   │
             └─────────────────────┘       └───────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS 3, React Router v6, Axios, Recharts, Leaflet, React-Leaflet, Lucide Icons |
| **Backend** | Java 17, Spring Boot 3.3.5, Spring Data JPA, Spring Validation, SpringDoc OpenAPI (Swagger), Maven |
| **Database** | MySQL 8, Hibernate ORM, HikariCP Connection Pool |
| **Machine Learning** | Python 3.11, FastAPI, Scikit-learn, Custom NumPy Trees (Random Forest & Decision Tree), Joblib |
| **Spatial Analysis** | DBSCAN (Density-Based Spatial Clustering) using Haversine Geodesic Distance |

---

## 🚀 Quick Start (Running All Services)

### Option A: One-Click Launcher (Windows)
Double-click `start-all.bat` in the project root folder. It will launch all 3 services in separate terminal windows.

### Option B: Manual Startup

#### 1. Machine Learning Microservice
```powershell
cd "c:\Users\PUJARI ABHIRAM\harshith\ml-service"
.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

#### 2. Spring Boot Backend
```powershell
cd "c:\Users\PUJARI ABHIRAM\harshith\backend"
mvn spring-boot:run
```
- API Base: [http://localhost:8080/api](http://localhost:8080/api)
- Swagger UI Documentation: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

#### 3. React Frontend
```powershell
cd "c:\Users\PUJARI ABHIRAM\harshith\frontend"
npm run dev -- --host 0.0.0.0 --port 3000
```
- Application Web UI: [http://localhost:3000](http://localhost:3000)

---

## 💻 Frontend Application Pages (9 Core Modules)

1. **Dashboard (`/`)**:
   - Executive KPI cards: Total Accidents, Fatal, Serious, Minor, and Detected Hotspots.
   - Interactive charts: Severity breakdown (Donut), Hourly patterns (Bar), Monthly timeline (Multi-line), Weather conditions (Stacked Bar), and Road types.

2. **Accident Records (`/accidents`)**:
   - Complete CRUD interface for records.
   - City search, severity filtering, and server-side pagination.
   - Add/Edit modal with comprehensive field validations (date, coordinates, vehicle counts, categorical factors).
   - Detailed record inspection modal and deletion confirmation dialog.

3. **Severity Prediction (`/prediction`)**:
   - Interactive inference form: hour, weekday, road type, weather, lighting, road surface, vehicles, speed limit, and area type.
   - Model selector (Random Forest, Logistic Regression, Decision Tree).
   - Visual output: Severity class badge, confidence score, class probability breakdown bars, and automated natural language risk factor explanation.

4. **Accident Hotspots (`/hotspots`)**:
   - Interactive Leaflet & OpenStreetMap visualization.
   - Toggle between individual accident incident markers and DBSCAN spatial hotspot clusters.
   - Configurable DBSCAN clustering controls (Search radius $\epsilon$ in km, min points).
   - Hotspot table with risk classifications (Critical, High, Medium, Moderate) and incident breakdown.

5. **Data Analytics (`/analytics`)**:
   - 6 high-resolution charts: Severity percentages, 24-hour crash curves, Weather vs Severity, Road type distribution, Urban vs Rural risk contrast, and Lighting conditions.
   - Top 10 High-Incident Cities table with fatality rates.

6. **Dataset Upload (`/upload`)**:
   - Drag-and-drop CSV importer with header auto-mapping.
   - 2-phase process: Dry-run preview with error reporting followed by transactional batch database insertion.
   - Downloadable standard CSV template.

7. **Model Evaluation (`/models`)**:
   - Side-by-side performance comparison: Accuracy, Precision, Recall, and Macro F1 score across Random Forest (76.0%), Logistic Regression (74.8%), and Decision Tree (72.6%).
   - Radar charts, confusion matrices, and per-class classification metrics.
   - Live synchronization with the Python ML microservice.

8. **Reports & Summaries (`/reports`)**:
   - Instant compilation of database metrics into an executive analytical report.
   - 1-click CSV report export.

9. **About Project (`/about`)**:
   - Comprehensive documentation covering project goals, full technology breakdown, ML model architectures, and methodology.

---

## 🧠 Machine Learning & Analytical Methodology

### 1. Severity Classification
- **Classes**: `Minor` (≈55%), `Serious` (≈30%), `Fatal` (≈15%).
- **Models Evaluated**:
  - **Random Forest Classifier**: Ensemble of 15 trees, Gini impurity splitting, bootstrap sampling with feature subsampling ($m = \sqrt{p}$). Best overall performer (76.0% accuracy, 0.723 Macro F1).
  - **Logistic Regression**: Pure-Python $L_2$-regularized multinomial solver (74.8% accuracy, 0.732 Macro F1).
  - **Decision Tree**: Pure-Python recursive CART tree with max depth 12 (72.6% accuracy, 0.706 Macro F1).

### 2. Hotspot Detection (DBSCAN Clustering)
- **Algorithm**: Density-Based Spatial Clustering of Applications with Noise.
- **Metric**: Geodesic distance computed via the Haversine formula:
  $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$
- **Parameters**: $\epsilon = 1.5\text{ km}$, $\text{minPoints} = 3$.
- **Risk Categorization**:
  - `Critical Risk`: $\ge 3$ Fatal accidents OR $\ge 15$ total accidents.
  - `High Risk`: $1\text{–}2$ Fatal accidents OR $\ge 10$ total accidents.
  - `Medium Risk`: $\ge 5$ total accidents.
  - `Moderate Risk`: All other clusters.

---

## 🎓 B.Tech Viva & Final-Year Presentation Key Points

1. **Why separate Spring Boot and FastAPI?**
   - Microservice separation of concerns: Spring Boot excels at enterprise CRUD, JPA transactions, connection pooling, and security; Python FastAPI excels at vectorized ML inference, scientific computation, and model lifecycle management.

2. **Why DBSCAN instead of K-Means for Hotspot Analysis?**
   - K-Means requires specifying $K$ in advance and assumes spherical clusters. DBSCAN discovers arbitrary geographic cluster shapes (e.g., corridors along highways) and treats isolated accidents as noise rather than forcing them into clusters.

3. **Why Haversine metric for spatial clustering?**
   - Euclidean distance on latitude/longitude degrees introduces significant distortion because longitudinal degree distances shrink as latitude increases ($1^\circ \text{ lon} = 111.32 \times \cos(\text{lat})\text{ km}$). Haversine calculates great-circle distance accurately on Earth's curved surface.

4. **Handling of Imbalanced Data:**
   - Fatal accidents are naturally rare in traffic datasets ($<15\%$). Macro-averaged F1 and per-class precision/recall are reported rather than relying solely on raw accuracy.
