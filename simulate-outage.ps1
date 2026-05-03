Write-Host "--- Starting Mission-Critical Incident Simulation ---" -ForegroundColor Cyan

# 1. Simulate RDBMS Outage (P0)
Write-Host "Phase 1: Simulating Production Database Failure (P0)..." -ForegroundColor Yellow
Invoke-RestMethod -Method Post -Uri "http://localhost:8003/simulate/outage" -ContentType "application/json" -Body "{}"
Write-Host "Simulation started. Waiting 6 seconds for signals to flow..."
Start-Sleep -s 6

# 2. Simulate API Latency (P1)
Write-Host "`nPhase 2: Simulating API Latency Spike (P1)..." -ForegroundColor Yellow
Invoke-RestMethod -Method Post -Uri "http://localhost:8003/simulate/burst" -ContentType "application/json" -Body "{}"
Write-Host "Burst sent."

# 3. Verify Health
Write-Host "`nChecking System Health..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "http://localhost:8001/health"
Write-Host "Ingester signals received: $($health.signals_received)"
Write-Host "Signals per second: $($health.signals_per_sec)"

Write-Host "--- Simulation Complete! ---" -ForegroundColor Green
Write-Host "Check your logs or the Incident List: http://localhost:8002/incidents"
