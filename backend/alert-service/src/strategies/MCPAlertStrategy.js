import { AlertStrategy } from './AlertStrategy.js';

export class MCPAlertStrategy extends AlertStrategy {
  async execute(alertPayload) {
    console.log(`[ALERT P2] MCP failure: ${alertPayload.component_id}`);
    
    try {
      await this.sendEmail(
        this.config.email,
        `[P2 ALERT] MCP failure: ${alertPayload.component_id}`,
        `Incident ID: ${alertPayload.incident_id}\nSeverity: P2\n${alertPayload.message}`
      );
      await this.logAlert(alertPayload, 'email', 'sent');
    } catch (err) {
      await this.logAlert(alertPayload, 'email', 'failed', err);
    }
  }
}
