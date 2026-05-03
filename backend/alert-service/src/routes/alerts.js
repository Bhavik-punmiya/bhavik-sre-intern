import { AlertHistory } from '../db/mongo.js';
import { getAlertConfig } from '../db/postgres.js';
import { AlertStrategyFactory } from '../strategies/AlertStrategyFactory.js';

export default async function alertRoutes(fastify) {
  // POST /alerts/send
  fastify.post('/send', async (request, reply) => {
    const alertPayload = request.body;
    const { component_type } = alertPayload;

    try {
      // 1. Look up routing config
      const config = await getAlertConfig(component_type);
      
      if (!config) {
        console.error(`[ALERT SERVICE] No config found for ${component_type}`);
        return reply.code(404).send({ error: `No config for ${component_type}` });
      }

      // 2. If disabled -> log and skip
      if (!config.enabled) {
        console.log(`[ALERT SERVICE] Alerts disabled for ${component_type}. Skipping.`);
        return { status: 'skipped', reason: 'disabled' };
      }

      // 3. Use Factory to create strategy
      const strategy = AlertStrategyFactory.create(component_type, config);

      // 4. Execute (log/email/webhook)
      await strategy.execute(alertPayload);

      return { status: 'sent' };
    } catch (err) {
      console.error('[ALERT SERVICE] Failure in /send:', err.message);
      return reply.code(500).send({ error: err.message });
    }
  });

  // GET /alerts/history
  fastify.get('/history', async () => {
    return await AlertHistory.find().sort({ sent_at: -1 }).limit(50);
  });
}
