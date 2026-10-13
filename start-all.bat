@echo off
title Road Accident Analytics - All Services Runner
echo =====================================================================
echo  Road Accident Severity Prediction and Hotspot Analysis
echo  B.Tech Final Year Project - Service Launcher
echo =====================================================================
echo.

echo [1/3] Starting Python ML Microservice (FastAPI on Port 8000)...
start "ML Service (FastAPI :8000)" cmd /k "cd /d "%~dp0ml-service" && .venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Spring Boot Backend (:8080)...
start "Spring Boot Backend (:8080)" cmd /k "cd /d "%~dp0backend" && java -jar target\road-accident-backend-1.0.0.jar"

timeout /t 5 /nobreak >nul

echo [3/3] Starting React Frontend (:3000)...
start "React Frontend (:3000)" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --host 0.0.0.0 --port 3000"

echo.
echo =====================================================================
echo  All services launched in separate terminal windows!
echo  - Frontend Web UI:    http://localhost:3000
echo  - Spring Boot API:    http://localhost:8080
echo  - Swagger UI Docs:    http://localhost:8080/swagger-ui.html
echo  - ML Service Health:  http://localhost:8000/health
echo =====================================================================
pause
