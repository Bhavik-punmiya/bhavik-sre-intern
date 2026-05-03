# Alert Service

The Alert Service manages the delivery of notifications to engineers. It uses the **Strategy Pattern** to ensure that different types of failures are handled with the appropriate urgency and via the correct channels.

## Strategy Pattern Logic
Instead of a giant `if/else` block, the service uses a `AlertStrategyFactory`. Based on the `component_type` (e.g., RDBMS, CACHE), it instantiates a specific strategy:
- **RDBMS Strategy**: Handles P0 critical failures. It sends urgent emails to the on-call rotation and executes a webhook if configured.
- **Cache/MCP Strategy**: Handles P2 degradations. Sends notifications to the infrastructure team.
- **API/NoSQL/Queue Strategy**: Handles P1 errors. Notifies the backend or devops teams.

## Configuration & Management
- **Dynamic Routing**: Routing rules (which email for which component) are stored in PostgreSQL. They can be updated at runtime via the `PUT /alerts/config/:type` endpoint without restarting the service.
- **Alert History**: Every attempt to send an alert is logged in MongoDB (`alert_history`), including the status (sent/failed) and any error messages from the mail provider.
- **Email Delivery**: Uses **Nodemailer**. In development, it defaults to **Ethereal Email**, generating a web preview URL for every sent message.

## Tech Stack
- Node.js 20, Fastify, Nodemailer, MongoDB, PostgreSQL.
