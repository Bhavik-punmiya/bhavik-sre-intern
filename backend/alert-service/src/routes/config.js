import { getAllAlertConfigs, updateAlertConfig } from '../db/postgres.js';

export default async function configRoutes(fastify) {
  // GET /alerts/config
  fastify.get('/config', async () => {
    return await getAllAlertConfigs();
  });

  // PUT /alerts/config/:component_type
  fastify.put('/config/:component_type', async (request, reply) => {
    const { component_type } = request.params;
    const { email, webhook_url, enabled } = request.body;

    try {
      const updated = await updateAlertConfig(component_type, { email, webhook_url, enabled });
      if (!updated) return reply.code(404).send({ error: 'Component type not found' });
      return updated;
    } catch (err) {
      return reply.code(500).send({ error: err.message });
    }
  });
}
