import { metrics } from '../utils/metrics.js';
import { getQueueDepth } from '../utils/queue.js';

export default async function healthRoutes(fastify) {
  fastify.get('/health', async (request, reply) => {
    const { total, perSec } = metrics.getSnapshot();
    const depth = await getQueueDepth();
    
    return {
      status: 'ok',
      uptime: process.uptime(),
      signals_received: total,
      signals_per_sec: perSec,
      queue_depth: depth
    };
  });
}
