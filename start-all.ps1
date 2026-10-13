# Road Accident Analytics - All Services PowerShell Launcher
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host " Road Accident Severity Prediction and Hotspot Analysis" -ForegroundColor White
Write-Host " B.Tech Final Year Project - Service Launcher" -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. ML Microservice
Write-Host "[1/3] Starting Python ML Microservice (FastAPI on Port 8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectDir\ml-service'; & '.\.venv\Scripts\python.exe' -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

Start-Sleep -Seconds 3

# 2. Spring Boot Backend
Write-Host "[2/3] Starting Spring Boot Backend (:8080)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectDir\backend'; mvn spring-boot:run"

Start-Sleep -Seconds 5

# 3. React Frontend
Write-Host "[3/3] Starting React Frontend (:3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectDir\frontend'; npm run dev -- --host 0.0.0.0 --port 3000"

Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host " All 3 services launched in separate windows!" -ForegroundColor Green
Write-Host " - Frontend Web UI:    http://localhost:3000" -ForegroundColor White
Write-Host " - Spring Boot API:    http://localhost:8080" -ForegroundColor White
Write-Host " - Swagger UI Docs:    http://localhost:8080/swagger-ui.html" -ForegroundColor White
Write-Host " - ML Service Health:  http://localhost:8000/health" -ForegroundColor White
Write-Host "=====================================================================" -ForegroundColor Cyan
