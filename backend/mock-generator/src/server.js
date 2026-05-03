import Fastify from 'fastify';
import dotenv from 'dotenv';

dotenv.config();

const fastify = Fastify({ logger: false });

// CORS Hook
fastify.addHook('onRequest', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  
  if (request.method === 'OPTIONS') {
    return reply.status(204).send();
  }
});

const INGESTER_URL = process.env.INGESTER_URL || 'http://localhost:8001';
const API_KEY = 'mock-gen-key-001';

// Simulation State
let simulationState = {
  running: false,
  signals_sent: 0,
  scenario: 'idle',
  intervalId: null
};

const components = ['SRV-01', 'SRV-02', 'DB-01', 'API-GATEWAY', 'REDIS-CACHE'];
const types = ['API', 'NOSQL', 'RDBMS', 'API', 'CACHE'];

const sendSignal = async (override = null) => {
  const componentIdx = Math.floor(Math.random() * components.length);
  const signal = override || {
    component_id: components[componentIdx],
    component_type: types[componentIdx],
    severity: 'P2',
    error_code: 'LATENCY_SPIKE',
    message: 'Background telemetry signal',
    timestamp: new Date().toISOString()
  };

  try {
    await fetch(`${INGESTER_URL}/api/v1/signals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify(signal)
    });
    simulationState.signals_sent++;
  } catch (err) {
    console.error('Failed to send signal:', err.message);
  }
};

// POST /simulate/burst
fastify.post('/simulate/burst', async (request, reply) => {
  if (simulationState.running) return reply.code(409).send({ error: 'Simulation already running' });
  
  const { 
    count = 20, 
    component_id = 'CACHE_CLUSTER_01', 
    component_type = 'CACHE', 
    severity = 'P2', 
    error_code = 'BURST_DETECTION',
    scenario = 'burst'
  } = request.body || {};

  simulationState.running = true;
  simulationState.scenario = scenario;
  simulationState.signals_sent = 0;

  // Fire a burst
  for (let i = 0; i < count; i++) {
    sendSignal({
      component_id,
      component_type,
      severity,
      error_code,
      message: `Automatic ${scenario} simulation signal`,
      timestamp: new Date().toISOString()
    });
  }

  // Bursts are short, so we set running=false after a small delay
  setTimeout(() => {
    simulationState.running = false;
  }, 1000);

  return { status: `Burst of ${count} signals triggered for ${component_id}` };
});

// POST /simulate/outage
fastify.post('/simulate/outage', async (request, reply) => {
  if (simulationState.running) return reply.code(409).send({ error: 'Simulation already running' });

  simulationState.running = true;
  simulationState.scenario = 'rdbms_outage';
  simulationState.signals_sent = 0;

  let elapsed = 0;
  simulationState.intervalId = setInterval(() => {
    elapsed++;
    
    // First 30s: RDBMS P0
    // Next 30s: API P1
    const isFirstHalf = elapsed <= 30;
    
    sendSignal({
      component_id: isFirstHalf ? 'RDBMS_PRIMARY_01' : 'API_GATEWAY_01',
      component_type: isFirstHalf ? 'RDBMS' : 'API',
      severity: isFirstHalf ? 'P0' : 'P1',
      error_code: isFirstHalf ? 'CONNECTION_POOL_EXHAUSTED' : 'LATENCY_THRESHOLD_EXCEEDED',
      message: isFirstHalf ? 'Database connection pool exhausted' : 'API Gateway latency threshold exceeded',
      timestamp: new Date().toISOString()
    });

    if (elapsed > 30) simulationState.scenario = 'api_degradation';
    
    if (elapsed >= 60) {
      clearInterval(simulationState.intervalId);
      simulationState.running = false;
      simulationState.scenario = 'idle';
    }
  }, 1000); // 1 signal per second for 60 seconds

  return { status: 'Outage simulation started (60s duration)' };
});

// POST /simulate/stop
fastify.post('/simulate/stop', async (request, reply) => {
  if (simulationState.intervalId) {
    clearInterval(simulationState.intervalId);
    simulationState.intervalId = null;
  }
  simulationState.running = false;
  simulationState.scenario = 'idle';
  return { status: 'Simulation stopped' };
});

fastify.get('/status', async () => {
  return { 
    running: simulationState.running, 
    signals_sent: simulationState.signals_sent, 
    scenario: simulationState.scenario 
  };
});

fastify.get('/health', async () => {
  return { status: 'ok', uptime: process.uptime() };
});

const start = async () => {
  try {
    await fastify.listen({ port: 8003, host: '0.0.0.0' });
    console.log('Mock Generator service running on port 8003');

    // Start background telemetry (1 signal every 10 seconds to keep charts alive)
    setInterval(() => {
      if (!simulationState.running) {
        sendSignal();
      }
    }, 10000);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
