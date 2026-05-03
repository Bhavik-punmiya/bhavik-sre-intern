# Ingester Service

The Ingester is the entry point for all system signals. It is a high-performance Fastify service designed to receive, validate, and buffer signals before they are processed.

## Responsibilities
- **Signal Reception**: Exposed via `POST /api/v1/signals`.
- **Strict Security**: 
    - Uses an `onRequest` hook to validate `X-API-Key` before any body parsing or validation occurs. This prevents internal schema leakage to unauthorized users.
    - Implements `helmet.js` for security headers and restricted `CORS`.
- **Validation**: Validates incoming signals against a shared JSON schema (ensuring correct component types, severities, and ISO8601 timestamps).
- **Backpressure Management**: Monitors the BullMQ queue depth. If there are more than 8,000 pending jobs, it returns a `429 Too Many Requests` status with a `Retry-After` header to prevent system overload.
- **Buffering**: Instead of processing signals immediately, it pushes them into a Redis-backed **BullMQ** queue (`signal-processing`) and returns a `202 Accepted` status instantly.

## Observability
- **Metrics**: Tracks signals/sec and total signals received. Prints a snapshot to the console every 5 seconds.
- **Health**: The `/health` endpoint provides live status, uptime, and current queue depth.

## Tech Stack
- Node.js 20, Fastify, BullMQ, IORedis.
