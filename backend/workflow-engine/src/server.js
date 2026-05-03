import Fastify from 'fastify';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { redis } from './services/debounce.js';
import { pgPool } from './db/postgres.js';
import { Signal, connectMongo } from './db/mongo.js';
import incidentRoutes from './routes/incidents.js';
import metricRoutes from './routes/metrics.js';
import userRoutes from './routes/users.js';
import './worker.js'; // Start the background worker

dotenv.config();

const fastify = Fastify({ logger: false });

// MANUAL CORS: Simple and version-independent
fastify.addHook('onRequest', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  
  // Handle Pre-flight
  if (request.method === 'OPTIONS') {
    return reply.status(204).send();
  }

  // Whitelist health check and ALL read-only GET requests for the dashboard
  if (request.url === '/health' || request.method === 'GET') return;
  
  const apiKey = request.headers['x-api-key'];
  const expectedKey = process.env.WORKFLOW_API_KEY || 'workflow-key-002';
  const validKeys = [expectedKey, 'frontend-key-web'];
  
  if (!apiKey || !validKeys.includes(apiKey)) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
});

// Connect DBs
connectMongo();

// GET /health
fastify.get('/health', async () => {
  return {
    status: 'ok',
    db_connections: {
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      postgres: 'active'
    }
  };
});

// GET /search
fastify.get('/search', async (request, reply) => {
  const { q } = request.query;
  if (!q || q.length < 2) return [];

  const results = [];

  // 1. Check if it's a UUID (Incident ID)
  const isUuid = /^[0-9a-f]{8}/i.test(q); // Support partial UUID search
  if (isUuid) {
    const res = await pgPool.query('SELECT id, severity, component_id FROM work_items WHERE id::text LIKE $1 LIMIT 5', [`${q}%`]);
    res.rows.forEach(row => {
      results.push({ type: 'incident', id: row.id, label: `Incident ${row.id.slice(0,8)}`, sublabel: `${row.severity} | ${row.component_id}` });
    });
  }

  // 2. Check Service Types (Partial match)
  const services = ['CACHE', 'RDBMS', 'API', 'MCP', 'NOSQL'];
  services.filter(s => s.toLowerCase().includes(q.toLowerCase())).forEach(s => {
    results.push({ type: 'service', id: s.toLowerCase(), label: `Log Group: /ims/service/${s.toLowerCase()}`, sublabel: 'System Infrastructure' });
  });

  // 3. Check MongoDB for Signal ID (Partial)
  const signals = await Signal.find({ signal_id: { $regex: q, $options: 'i' } }).limit(5);
  signals.forEach(sig => {
    results.push({ 
      type: 'signal', 
      id: sig.signal_id, 
      component_id: sig.component_id, 
      component_type: sig.component_type, 
      label: `Signal ${sig.signal_id.slice(0,8)}`, 
      sublabel: `${sig.component_type} | ${sig.component_id}` 
    });
  });

  return results.slice(0, 10);
});

// Register Routes
fastify.register(incidentRoutes, { prefix: '/incidents' });
fastify.register(metricRoutes, { prefix: '/metrics' });
fastify.register(userRoutes, { prefix: '/users' });

// Start Server
const start = async () => {
  try {
    const port = process.env.PORT || 8002;
    await fastify.listen({ port: parseInt(port), host: '0.0.0.0' });
    console.log(`Workflow Engine API running on port ${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
