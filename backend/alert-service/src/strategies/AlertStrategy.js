import { v4 as uuidv4 } from 'uuid';
import { AlertHistory } from '../db/mongo.js';
import { sendEmail as mailerSend } from '../email/mailer.js';

export class AlertStrategy {
  constructor(config) {
    this.config = config; // routing config row from PostgreSQL
  }

  async execute(alertPayload) {
    throw new Error('execute() must be implemented');
  }

  async sendEmail(to, subject, body) {
    try {
      await mailerSend(to, subject, body);
    } catch (err) {
      console.error(`[ALERT STRATEGY] Email failed to ${to}:`, err.message);
      throw err;
    }
  }

  async sendWebhook(url, payload) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`Webhook responded with ${res.status}`);
    } catch (err) {
      console.error(`[ALERT STRATEGY] Webhook failed to ${url}:`, err.message);
      throw err;
    }
  }

  async logAlert(alertPayload, channel, status, error = null) {
    try {
      const history = new AlertHistory({
        alert_id: uuidv4(),
        incident_id: alertPayload.incident_id,
        component_type: alertPayload.component_type,
        severity: alertPayload.severity,
        channel,
        recipient: channel === 'email' ? this.config.email : (channel === 'webhook' ? this.config.webhook_url : 'system'),
        status,
        error: error ? error.message : null
      });
      await history.save();
    } catch (err) {
      console.error(`[ALERT STRATEGY] Failed to log alert to MongoDB:`, err.message);
    }
  }
}
