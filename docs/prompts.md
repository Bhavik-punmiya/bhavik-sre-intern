# IMS Development Prompts

This document contains the sequence of comprehensive prompts used to build the Incident Management System (IMS). Each prompt represents a major architectural phase of the project.

---

## 🏗️ Phase 1: Core Microservices & Ingestion logic
**Objective**: Build the initial Ingester and Mock Generator services with validation and API security.

> [!NOTE]
> **Prompt 1 Content**
> 
> You are a senior Node.js backend engineer. Build two microservices for an Incident Management System.
> 
> **Service 1: Ingester (port 8001)**
> - Stack: Node.js 20, Fastify, @fastify/helmet, @fastify/cors, @fastify/rate-limit
> - Endpoints: `POST /api/v1/signals` (receives error signals), `GET /health`
> - Security: Helmet, CORS, API Key Auth (`X-API-Key`), Rate limiting (500/10s).
> - Observability: 5s metrics console logs.
> 
> **Service 2: Mock Generator (port 8003)**
> - Simulates broken infrastructure components.
> - Scenarios: Burst (200 signals), Outage (P0 RDBMS → P1 API).
> - Configurable Ingester URL and API Key.

---

## 📦 Phase 2A: Backpressure & Storage Layer
**Objective**: Implement BullMQ for queuing and polyglot persistence (PostgreSQL, MongoDB, TimescaleDB).

> [!NOTE]
> **Prompt 2A Content**
> 
> Add BullMQ to the Ingester with backpressure logic (429 if queue depth > 8000).
> 
> **Workflow Engine Service (port 8002):**
> 1. **MongoDB**: Write raw audit logs for every signal.
> 2. **Redis Debounce**: Check for existing incidents to prevent alert fatigue.
> 3. **PostgreSQL**: Transactional Work Item creation for new incidents.
> 4. **TimescaleDB**: Time-series metric writes for throughput tracking.
> 5. **Dashboard Cache**: Rebuild Redis live incident cache.

---

## 📢 Phase 2B: Alert Orchestration & Strategy Pattern
**Objective**: Build the Alert Service using the Strategy Design Pattern for extensible routing.

> [!NOTE]
> **Prompt 2B Content**
> 
> **Alert Service (port 8004):**
> - Strategy Pattern: Implement `AlertStrategy` base class and specific strategies (`RDBMSAlertStrategy`, `CacheAlertStrategy`, etc.).
> - Factory Pattern: `AlertStrategyFactory` picks the routing logic at runtime.
> - Channels: Email (Nodemailer/Ethereal) and Webhooks.
> - DB: PostgreSQL for routing config, MongoDB for alert history.

---

## 🔄 Phase 3: Incident Lifecycle & State Pattern
**Objective**: Hardening the incident workflow with a formal State Pattern and RCA enforcement.

> [!NOTE]
> **Prompt 3 Content**
> 
> **Workflow Engine Lifecycle:**
> - State Pattern: `OPEN` → `INVESTIGATING` → `RESOLVED` → `CLOSED`.
> - RCA Enforcement: Mandatory Root Cause Analysis record before an incident can be `CLOSED`.
> - MTTR Calculation: Automated calculation of Mean Time to Resolution based on RCA timestamps.
> - Unit Testing: 8 tests using `node:test` to verify state transitions and RCA validation.

---

## 🎨 Phase 4: High-Fidelity Frontend Console
**Objective**: Build the CloudWatch-inspired React dashboard.

> [!NOTE]
> **Frontend Prompt Content**
> 
> **Tech Stack**: React 18, Vite, Recharts, Axios.
> **Key Pages**:
> - Dashboard: Real-time stat cards and throughput line charts.
> - Alarms: High-density incident management table.
> - Incident Detail: Master-detail view with State Transition buttons, Raw Signal feed, and RCA Wizard.
> - Services (Ingestion): AWS-style data sources table and simulation terminal.
> - RCA Vault: Historical record of all closed incidents and their resolutions.
> - Alert Config: Administrative panel for routing strategies.

---

## 🛠️ Phase 5: Demo & DevOps
**Objective**: Create the CLI simulator and documentation.

> [!NOTE]
> **Final Scripts Prompt**
> 
> Create `scripts/simulate-outage.js` as an interactive Node.js CLI script. 
> Scenarios:
> 1. RDBMS Outage → MCP Cascade (Demo hero scenario).
> 2. Cache Burst Test.
> 3. Full Stack Disaster.
> 
> Update `backend/package.json` with `npm run simulate` and `npm run test`.
