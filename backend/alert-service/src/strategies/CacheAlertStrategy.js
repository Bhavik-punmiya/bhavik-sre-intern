import { AlertStrategy } from './AlertStrategy.js';

export class CacheAlertStrategy extends AlertStrategy {
  async execute(alertPayload) {
    console.log(`[ALERT P2] Cache degradation: ${alertPayload.component_id}`);
    
    try {
      await this.sendEmail(
        this.config.email,
        `[P2 ALERT] Cache degradation: ${alertPayload.component_id}`,
        `Incident ID: ${alertPayload.incident_id}\nSeverity: P2\n${alertPayload.message}`
      );
      await this.logAlert(alertPayload, 'email', 'sent');
    } catch (err) {
      await this.logAlert(alertPayload, 'email', 'failed', err);
    }
  }
}
