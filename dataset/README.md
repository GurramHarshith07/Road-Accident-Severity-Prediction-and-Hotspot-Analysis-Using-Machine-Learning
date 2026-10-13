# Road Accident Dataset Documentation

This directory contains reference and ingestion datasets for the **Road Accident Severity Prediction and Hotspot Analysis** platform.

## Dataset Structure

Each accident record contains the following standardized attributes:

| Column Name | Type | Description | Values / Examples |
|-------------|------|-------------|-------------------|
| `accident_date` | Date (YYYY-MM-DD) | Date of accident occurrence | `2024-03-15` |
| `accident_time` | Time (HH:MM:SS) | Time of incident | `18:30:00` |
| `latitude` | Decimal (-90 to +90) | Geodetic latitude | `28.6139391` |
| `longitude` | Decimal (-180 to +180) | Geodetic longitude | `77.2090212` |
| `state` | String | State / Province | `Delhi`, `Maharashtra` |
| `city` | String | Metropolitan area or city | `New Delhi`, `Mumbai`, `Bengaluru` |
| `location_description`| String | Specific intersection or landmark | `Connaught Place Outer Circle` |
| `road_type` | Categorical | Road geometry | `Single Carriageway`, `Dual Carriageway`, `Roundabout`, `One way street` |
| `weather_condition` | Categorical | Weather during incident | `Fine`, `Raining`, `Fog/Mist`, `High winds` |
| `lighting_condition`| Categorical | Illumination level | `Daylight`, `Darkness - lights lit`, `Darkness - no lights` |
| `road_surface_condition`| Categorical | Pavement condition | `Dry`, `Wet/Damp`, `Snow/Ice`, `Flooded` |
| `vehicle_count` | Integer | Total vehicles involved | `1`, `2`, `3+` |
| `casualty_count` | Integer | Fatalities reported | `0`, `1`, `2` |
| `injury_count` | Integer | Non-fatal injuries | `0`, `1`, `2+` |
| `speed_limit` | Integer (km/h) | Posted speed limit | `40`, `50`, `60`, `80`, `100` |
| `area_type` | Categorical | Urban or Rural sector | `Urban`, `Rural` |
| `severity` | Target Class | Incident outcome classification | `Minor` (Low risk), `Serious` (Hospitalization), `Fatal` (Death) |

## Usage
- Ingest new files via the **Dataset Upload** interface (`/upload`) in the React frontend.
- Files support automatic header alignment, validation preview, row-by-row error diagnostics, and batch database persistence.
