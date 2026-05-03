import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import signalRoutes from './routes/signals.js';
import healthRoutes from './routes/health.js';
import { metrics } from './utils/metrics.js';

dotenv.config();

const fastify = Fastify({
  logger: false // Custom metrics logging used instead
});

// Security
fastify.register(helmet);
fastify.register(cors, {
  origin: 'http://localhost:3000'
});

// Rate Limiting
fastify.register(rateLimit, {
  max: 500,
  timeWindow: '10 seconds',
  keyGenerator: (request) => request.headers['x-api-key'] || request.ip,
  errorResponseBuilder: (request, context) => ({
    statusCode: 429,
    error: 'Too Many Requests',
    message: `Rate limit exceeded. Try again in ${context.after}.`
  })
});

// Global Error Handler
fastify.setErrorHandler((error, request, reply) => {
  if (error.validation) {
    reply.status(400).send({ error: error.message });
    return;
  }
  
  if (error.statusCode === 429) {
    reply.status(429).send({ error: error.message });
    return;
  }

  console.error('[FATAL ERROR]', error);
  reply.status(500).send({ error: 'Internal Server Error' });
});

// Authentication Hook (Fire before body parsing/validation)
fastify.addHook('onRequest', async (request, reply) => {
  // Handle Pre-flight
  if (request.method === 'OPTIONS') {
    return reply.status(204).send();
  }

  // Skip auth for health check
  if (request.url === '/health') return;

  const apiKey = request.headers['x-api-key'];
  const validKeys = (process.env.VALID_API_KEYS || 'ingester-key-001,frontend-key-web').split(',').map(k => k.trim());

  if (!apiKey || !validKeys.includes(apiKey)) {
    return reply.status(401).send({ error: 'Unauthorized — invalid or missing API key' });
  }
});

// Routes
fastify.register(healthRoutes);
fastify.register(signalRoutes, { prefix: '/api/v1' });

// Metrics Interval
setInterval(() => {
  metrics.resetWindow();
}, 5000);

// Start Server
const start = async () => {
  try {
    await fastify.listen({ port: 8001, host: '0.0.0.0' });
    console.log('Ingester service running on port 8001');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
