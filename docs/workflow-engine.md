# Workflow Engine Service

The Workflow Engine is the "brain" of the system. It consumes signals from the BullMQ queue and orchestrates the complex logic of incident creation, debouncing, and multi-database storage.

## The 5-Step Processing Pipeline

1.  **Raw Storage (MongoDB)**: Every signal is assigned a fresh UUID and saved as a raw document in MongoDB for auditability and deep history searching.
2.  **Debounce Check (Redis)**: 
    - The engine checks Redis for a key: `debounce:{component_id}`.
    - If found, the signal is linked to an existing incident ID, and the workflow skips to metrics. This prevents "alert fatigue" during a failure storm.
3.  **Incident Creation (PostgreSQL)**:
    - If no debounce key exists, a new **Work Item** is created in PostgreSQL within a transaction.
    - Upon success, the engine sets the Redis debounce key (expires in 10s) and updates the MongoDB record with the new `incident_id`.
4.  **Notification (Alert Service)**:
    - **Step 3.5**: Immediately after an incident is created, the engine makes a non-blocking HTTP call to the Alert Service. Failures in notification do not halt the signal processing.
5.  **Metrics (TimescaleDB)**:
    - Every signal (even debounced ones) writes a data point to TimescaleDB for high-resolution performance graphing and historical analysis.
6.  **Cache Rebuild**:
    - The Redis dashboard cache (`dashboard:live_incidents`) is rebuilt after every new incident to ensure the UI stays updated with sub-second latency.

## Tech Stack
- Node.js 20, BullMQ, Mongoose (MongoDB), PG (Postgres/Timescale), IORedis.
