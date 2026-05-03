import { AlertStrategy } from './AlertStrategy.js';

export class RDBMSAlertStrategy extends AlertStrategy {
  async execute(alertPayload) {
    console.error(`[CRITICAL P0] RDBMS failure detected: ${alertPayload.component_id}`);
    
    try {
      await this.sendEmail(
        this.config.email,
        `[P0 CRITICAL] Database failure: ${alertPayload.component_id}`,
        `Incident ID: ${alertPayload.incident_id}\nError: ${alertPayload.error_code}\n${alertPayload.message}`
      );
      await this.logAlert(alertPayload, 'email', 'sent');
    } catch (err) {
      await this.logAlert(alertPayload, 'email', 'failed', err);
    }

    if (this.config.webhook_url) {
      try {
        await this.sendWebhook(this.config.webhook_url, alertPayload);
        await this.logAlert(alertPayload, 'webhook', 'sent');
      } catch (err) {
        await this.logAlert(alertPayload, 'webhook', 'failed', err);
      }
    }
  }
}
