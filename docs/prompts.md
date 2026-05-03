# IMS Development Prompts

This document contains the exact prompts used to build the Incident Management System (IMS).

---

## Prompt 1: Core Microservices (Ingester & Mock Generator)

You are a senior Node.js backend engineer. Build two microservices for an Incident Management System.
Service 1: Ingester (port 8001)
Stack: Node.js 20, Fastify, @fastify/helmet, @fastify/cors, @fastify/rate-limit
Endpoints:

POST /api/v1/signals — receives error signals, validates schema, returns 202
GET /health — returns { status: "ok", uptime, signals_received, signals_per_sec }

Signal schema (validate strictly, reject malformed with 400):
json{
  "component_id": "string, required",
  "component_type": "enum: RDBMS | CACHE | API | QUEUE | MCP | NOSQL",
  "severity": "enum: P0 | P1 | P2 | P3",
  "error_code": "string, required",
  "message": "string, required",
  "timestamp": "ISO8601 string, required",
  "metadata": "object, optional"
}
Security requirements:

helmet.js on all routes
CORS restricted to http://localhost:3000 only
Every request must include header X-API-Key. Valid keys loaded from .env as a comma separated list VALID_API_KEYS=key1,key2,key3. Invalid key returns 401.
Rate limit: max 500 requests per 10 seconds per API key. Exceeds returns 429 with Retry-After header.

Observability:

Every 5 seconds print to console: [METRICS] timestamp | signals/sec: X | total: Y
Count resets every 5 seconds for the per-second calculation
/health endpoint reflects live counters

For now, after passing all validation, just log the signal to console and return 202. No database, no queue. We will add those later.
Service 2: Mock Generator (port 8003)
Stack: Node.js 20, Fastify
This service simulates 3 broken infrastructure components sending signals to the Ingester.
Endpoints:

POST /simulate/burst — fires 200 signals in 2 seconds to the Ingester for component CACHE_CLUSTER_01 (P2). Tests debounce later.
POST /simulate/outage — fires continuous signals every 100ms for 30 seconds simulating an RDBMS outage (P0), then switches to an API failure (P1) for another 30 seconds. Stops automatically.
POST /simulate/stop — stops any running simulation immediately
GET /status — returns current simulation status and how many signals sent

The mock generator must use API key mock-gen-key-001 in its X-API-Key header when calling the Ingester.
The Ingester URL is configurable via env var INGESTER_URL=http://localhost:8001

---

## Prompt 2A — Queue + Storage Layer

You are a senior Node.js backend engineer continuing to build an Incident Management System. The Ingester service (port 8001) and Mock Generator (port 8003) are already built and working. Now add BullMQ queuing and the full storage layer.
Context of what exists:

Ingester receives signals at POST /api/v1/signals, validates schema, authenticates via X-API-Key, currently just logs to console and returns 202
Mock Generator fires bursts and outage simulations at the Ingester
Both services are Node.js 20 + Fastify + ES modules


Part 1: Add BullMQ to the Ingester
Install bullmq and ioredis in the ingester. After a signal passes all validation and auth checks, instead of console.logging it, push it onto a BullMQ queue called signal-processing.
js// After all validation passes:
await signalQueue.add('process-signal', signalPayload, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnComplete: 100,
  removeOnFail: 50
})
Backpressure logic — if the queue depth exceeds 8000 jobs, the ingester must return 429 with header Retry-After: 5 instead of adding to the queue. Check queue depth before every add.
The ingester must still return 202 instantly — it must never wait for the worker to finish.
Redis connection config via env: REDIS_HOST, REDIS_PORT, REDIS_PASSWORD (optional).

Part 2: Create the Workflow Engine service (port 8002)
New service at backend/workflow-engine/. Same stack — Node.js 20, Fastify, ES modules.
This service runs a BullMQ Worker that pulls from the signal-processing queue and does the following for every signal, in order:
Step 1 — Write raw signal to MongoDB
MongoDB collection: signals
Schema:
js{
  signal_id: uuid(),           // generate fresh
  component_id: String,        // from payload
  component_type: String,
  severity: String,
  error_code: String,
  message: String,
  metadata: Object,
  timestamp: Date,             // from payload
  incident_id: String | null,  // filled in step 3
  ingested_at: Date            // Date.now()
}
Add indexes on: component_id, timestamp, incident_id.
Step 2 — Debounce check using Redis
Check if Redis key debounce:{component_id} exists.

If it EXISTS → this signal belongs to an existing incident. Get the incident_id from the Redis value. Update the signal's incident_id in MongoDB. Skip to Step 4 (TimescaleDB). Do NOT create a new Work Item.
If it does NOT exist → proceed to Step 3.

Step 3 — Create Work Item in PostgreSQL (transactional)
Inside a PostgreSQL transaction:
sqlINSERT INTO work_items (
  id, component_id, component_type, severity,
  status, start_time, signal_count, created_at
) VALUES (
  uuid, component_id, component_type, severity,
  'OPEN', NOW(), 1, NOW()
)
After successful insert:

Set Redis key: SET debounce:{component_id} {incident_id} EX 10
Update the MongoDB signal document with the new incident_id

If the PostgreSQL transaction fails → retry up to 3 times with exponential backoff (1000ms, 2000ms, 4000ms). After 3 failures → move job to BullMQ dead letter queue named signal-dlq. Log the failure clearly.
Step 4 — Write metric to TimescaleDB
Every processed signal writes a row:
sqlINSERT INTO signal_metrics (time, component_id, severity, component_type)
VALUES (NOW(), $1, $2, $3)
TimescaleDB is a separate PostgreSQL instance. Use a separate pg Pool for it.
Step 5 — Rebuild Redis dashboard cache
After every new Work Item creation, rebuild the dashboard cache.

---

## Prompt 2B — Alert Service + Strategy Pattern

You are a senior Node.js backend engineer continuing to build an Incident Management System. The Ingester, Mock Generator, and Workflow Engine with storage layer are already built. Now build the Alert Service and wire the Strategy Pattern into the Workflow Engine.

Part 1: Alert Service (port 8004)
New service at backend/alert-service/. Node.js 20, Fastify, ES modules.
This service receives alert instructions from the Workflow Engine and handles notification delivery. It also stores alert history and exposes configurable routing rules.
Endpoints:
POST /alerts/send — internal endpoint called by Workflow Engine
js// Request body:
{
  incident_id: String,
  component_id: String,
  component_type: String,   // RDBMS | CACHE | API | QUEUE | MCP | NOSQL
  severity: String,         // P0 | P1 | P2 | P3
  error_code: String,
  message: String,
  timestamp: String
}
// This endpoint looks up the routing config for the component_type,
// then fires the appropriate notification channels
GET /alerts/history — returns last 50 alerts from MongoDB, sorted newest first
GET /alerts/config — returns current routing configuration from PostgreSQL
PUT /alerts/config/:component_type — update routing for a component type

Default routing config:
js[
  { component_type: 'RDBMS',  severity: 'P0', email: 'oncall@ims.local',  webhook_url: null, enabled: true },
  { component_type: 'API',    severity: 'P1', email: 'backend@ims.local', webhook_url: null, enabled: true },
  { component_type: 'QUEUE',  severity: 'P1', email: 'devops@ims.local',  webhook_url: null, enabled: true },
  { component_type: 'CACHE',  severity: 'P2', email: 'infra@ims.local',   webhook_url: null, enabled: true },
  { component_type: 'MCP',    severity: 'P2', email: 'infra@ims.local',   webhook_url: null, enabled: true },
  { component_type: 'NOSQL',  severity: 'P1', email: 'backend@ims.local', webhook_url: null, enabled: true },
]

Part 2: Strategy Pattern implementation inside Alert Service
Create src/strategies/ folder with one file per strategy:
strategies/
├── AlertStrategy.js        ← base class / interface
├── RDBMSAlertStrategy.js   ← P0, emails oncall, logs CRITICAL
├── CacheAlertStrategy.js   ← P2, emails infra
├── APIAlertStrategy.js     ← P1, emails backend
├── QueueAlertStrategy.js   ← P1, emails devops
├── MCPAlertStrategy.js     ← P2, emails infra
├── NoSQLAlertStrategy.js   ← P1, emails backend
└── AlertStrategyFactory.js ← picks correct strategy from component_type

Part 3: Wire Alert Service into Workflow Engine
In workflow-engine/src/worker.js, after Step 3 (Work Item created in PostgreSQL), add Step 3.5:
js// Step 3.5 — Fire alert (non-blocking, don't let alert failure break the worker)
try {
  await fetch(`${process.env.ALERT_SERVICE_URL}/alerts/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.ALERT_SERVICE_KEY
    },
    body: JSON.stringify({
      incident_id: newWorkItemId,
      component_id: signal.component_id,
      component_type: signal.component_type,
      severity: signal.severity,
      error_code: signal.error_code,
      message: signal.message,
      timestamp: signal.timestamp
    })
  })
} catch (err) {
  console.error('[ALERT] Failed to notify alert service, continuing:', err.message)
}

---

## Prompt 3 — Workflow Engine State Pattern, RCA, and MTTR

You are a senior Node.js backend engineer continuing to build an Incident Management System. The Ingester (port 8001), Mock Generator (port 8003), Workflow Engine with storage layer (port 8002), and Alert Service (port 8004) are already built. Now add the complete incident lifecycle — State Pattern, RCA validation, MTTR calculation, and all transition endpoints.

Part 1: State Pattern implementation
Create workflow-engine/src/states/ folder:
states/
├── IncidentState.js          ← base class
├── OpenState.js
├── InvestigatingState.js
├── ResolvedState.js
├── ClosedState.js
└── IncidentContext.js        ← holds current state, exposes transition methods

Part 2: New endpoints in workflow-engine/src/routes/
Add routes/incidents.js with all transition and RCA endpoints:
PATCH /incidents/:id/investigate
PATCH /incidents/:id/resolve
POST /incidents/:id/rca
PATCH /incidents/:id/close
GET /incidents/:id
GET /incidents/:id/signals
GET /metrics/throughput

Part 3: RCA validation unit tests
Create workflow-engine/src/tests/rca.test.js using Node.js built-in test runner (node:test).

---

## Frontend Prompt

You are a senior React frontend engineer building a CloudWatch-inspired Incident Management System dashboard. The backend APIs are fully built and running.
Tech stack: React 18 + Vite + React Router v6 + Recharts + Axios. No UI component library — custom CSS only. Dark mode support via CSS variables. Light/dark toggle already exists.

Build these pages in this exact order:
Page 1 — Dashboard (/)
Page 2 — Alarms/Incidents (/alarms)
Page 3 — Incident Detail (/incidents/:id)
Page 4 — Log Groups (/logs)
Page 5 — Metrics (/metrics)
Page 6 — Alert Config (/settings/alerts)
Page 7 — RCA Vault (/rca-vault)
Page 8 — Notification bell in header

Global requirements:

Sidebar matches existing design (Monitoring, Incident Management, Administration sections)
All pages show a "LIVE" indicator with current time in header (updates every second)
Loading skeletons while data fetches — no blank screens
Severity badges: P0 = red background, P1 = orange, P2 = yellow, P3 = gray
Status chips: OPEN = blue, INVESTIGATING = purple, RESOLVED = teal, CLOSED = gray
Toast notifications for all user actions (success green, error red, 3 second auto-dismiss)
Mobile responsive — sidebar collapses on small screens
