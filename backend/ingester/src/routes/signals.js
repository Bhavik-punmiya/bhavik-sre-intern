import { signalQueue, getQueueDepth } from '../queue/signalQueue.js';
import { metrics } from '../utils/metrics.js';
import { signalSchema } from '../../shared/signalSchema.js';

export default async function signalRoutes(fastify) {
  fastify.post('/signals', {
    schema: {
      headers: {
        type: 'object',
        properties: {
          'x-api-key': { type: 'string' }
        },
        required: ['x-api-key']
      },
      body: signalSchema
    },
    handler: async (request, reply) => {
      // Backpressure Check
      const depth = await getQueueDepth();
      if (depth > 8000) {
        return reply.code(429).header('Retry-After', '5').send({
          error: 'Rate limit exceeded: Queue backpressure'
        });
      }

      // Add to Queue with requested options
      await signalQueue.add('process-signal', request.body, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: 100,
        removeOnFail: 50
      });
      
      // Update metrics
      metrics.increment();
      
      return reply.code(202).send({ status: 'accepted' });
    }
  });
}
