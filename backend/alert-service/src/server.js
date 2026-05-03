import Fastify from 'fastify';
import dotenv from 'dotenv';
import { connectMongo } from './db/mongo.js';
import alertRoutes from './routes/alerts.js';
import configRoutes from './routes/config.js';

dotenv.config();

const fastify = Fastify({ logger: false });

// CORS & Auth Hook
fastify.addHook('onRequest', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (request.method === 'OPTIONS') {
    return reply.status(204).send();
  }

  if (request.url === '/health') return;
  
  const apiKey = request.headers['x-api-key'];
  const expectedKey = process.env.ALERT_SERVICE_KEY || 'alert-svc-key-005';
  
  // Dashboard often uses 'frontend-key-web'
  const validKeys = [expectedKey, 'frontend-key-web'];
  
  if (!apiKey || !validKeys.includes(apiKey)) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
});

// Routes
fastify.register(alertRoutes, { prefix: '/alerts' });
fastify.register(configRoutes, { prefix: '/alerts' });

// Health
fastify.get('/health', async () => ({ status: 'ok' }));

// Start
const start = async () => {
  try {
    await connectMongo();
    const port = process.env.PORT || 8004;
    await fastify.listen({ port: parseInt(port), host: '0.0.0.0' });
    console.log(`Alert Service running on port ${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
