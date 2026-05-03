# Mock Data Generator Service

The Mock Generator is a simulation tool used to test the resilience and logic of the Incident Management System by mimicking realistic infrastructure failures.

## Responsibilities
- **Signal Factory**: Generates realistic signal payloads for various components (RDBMS, Cache, API, etc.) with appropriate error codes and messages.
- **Simulation Modes**:
    - **Burst**: Fires 200 signals in a 2-second window to test the Ingester's throughput and rate-limiting.
    - **Outage**: Simulates a sustained failure. It runs for 60 seconds total, switching from an RDBMS failure (P0) to an API failure (P1) halfway through. This tests the system's debouncing and incident creation logic.
- **State Management**: Tracks the number of signals sent during a session and allows stopping any active simulation via the `/simulate/stop` endpoint.

## Communication
- Configured to use a dedicated API key (`mock-gen-key-001`) to communicate with the Ingester.
- Automatically targets the `INGESTER_URL` provided via environment variables.

## Tech Stack
- Node.js 20, Fastify, Axios.
