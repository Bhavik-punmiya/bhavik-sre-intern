import { AlertStrategy } from './AlertStrategy.js';

export class NoSQLAlertStrategy extends AlertStrategy {
  async execute(alertPayload) {
    console.warn(`[WARNING P1] NoSQL failure: ${alertPayload.component_id}`);
    
    try {
      await this.sendEmail(
        this.config.email,
        `[P1 WARNING] NoSQL failure: ${alertPayload.component_id}`,
        `Incident ID: ${alertPayload.incident_id}\nSeverity: P1\n${alertPayload.message}`
      );
      await this.logAlert(alertPayload, 'email', 'sent');
    } catch (err) {
      await this.logAlert(alertPayload, 'email', 'failed', err);
    }
  }
}
