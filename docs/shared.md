# Shared Module

The Shared Module acts as a "single source of truth" for core business logic and constants that are used across multiple services. This ensures that the Ingester, Workflow Engine, and Alert Service always speak the same language.

## Components

### 1. Constants (`shared/constants.js`)
Centralizes all enums and configuration values:
- **Component Types**: `RDBMS`, `CACHE`, `API`, `QUEUE`, `MCP`, `NOSQL`.
- **Severities**: `P0`, `P1`, `P2`, `P3`.
- **Work Item Status**: `OPEN`, `ACKNOWLEDGED`, `RESOLVED`, `CLOSED`.
- **Incident Expiry**: 10-second window used by the Redis debounce logic.

### 2. Signal Schema (`shared/signalSchema.js`)
A JSON schema used by Fastify to validate incoming requests. By sharing this, we ensure that if a signal is valid for the Ingester, it is also valid for the Workflow Engine.

### 3. Retry Utility (`shared/retry.js`)
An exponential backoff utility (`withRetry`) used primarily by the Workflow Engine when interacting with PostgreSQL. It ensures that transient database connection issues or deadlocks don't cause the entire workflow to fail immediately.
- **Default Strategy**: 3 attempts, starting at 1000ms delay, doubling each time.

## Why it's important
- **Consistency**: Prevents bugs where one service might support a component type that another does not.
- **DRY (Don't Repeat Yourself)**: Shared logic reduces code duplication and makes global changes (like adding a new severity level) much easier.
