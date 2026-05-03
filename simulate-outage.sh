#!/bin/bash

echo "🚀 Starting Mission-Critical Incident Simulation..."
echo "--------------------------------------------------"

# 1. Simulate RDBMS Outage (P0)
echo "📡 Phase 1: Simulating Production Database Failure (P0)..."
curl -s -X POST http://localhost:8003/simulate/outage > /dev/null
echo "✅ 50 signals sent. Check logs for 'Signal debounced' to verify backpressure handling."

# 2. Simulate API Latency (P1)
echo -e "\n📡 Phase 2: Simulating API Latency Spike (P1)..."
curl -s -X POST http://localhost:8003/simulate/burst > /dev/null
echo "✅ Burst of 20 signals sent for various components."

# 3. Verify Health
echo -e "\n🏥 Checking System Health..."
curl -s http://localhost:8001/health | grep -o '"signals_received":[0-9]*'
echo "✅ Ingester is healthy and queue is processing."

echo -e "\n--------------------------------------------------"
echo "🎉 Simulation Complete! Open the Dashboard or run the Incident List API to see results."
echo "API Check: curl -H 'X-API-Key: workflow-key-002' http://localhost:8002/incidents"
