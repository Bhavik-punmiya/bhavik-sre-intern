import axios from 'axios';
import { PRESETS } from '../utils/signalFactory.js';

let activeSimulation = null;
let signalsSent = 0;

export default async function simulateRoutes(fastify) {
  const INGESTER_URL = process.env.INGESTER_URL || 'http://localhost:8001';
  const API_KEY = 'mock-gen-key-001';

  const sendSignal = async (payload) => {
    try {
      await axios.post(`${INGESTER_URL}/api/v1/signals`, payload, {
        headers: { 'X-API-Key': API_KEY }
      });
      signalsSent++;
    } catch (err) {
      console.error(`[MOCK GEN] Failed to send signal: ${err.message}`);
    }
  };

  const stopCurrent = () => {
    if (activeSimulation) {
      clearInterval(activeSimulation.interval);
      clearTimeout(activeSimulation.timeout);
      activeSimulation = null;
      return true;
    }
    return false;
  };

  // POST /simulate/burst — fires 200 signals in 2 seconds
  fastify.post('/burst', async (request, reply) => {
    stopCurrent();
    signalsSent = 0;
    
    activeSimulation = { type: 'burst' };
    
    const count = 200;
    const duration = 2000;
    const intervalTime = duration / count;

    let sent = 0;
    activeSimulation.interval = setInterval(async () => {
      await sendSignal(PRESETS.CACHE_BURST());
      sent++;
      if (sent >= count) {
        stopCurrent();
      }
    }, intervalTime);

    return { message: 'Burst simulation started', count };
  });

  // POST /simulate/outage — continuous signals every 100ms
  fastify.post('/outage', async (request, reply) => {
    stopCurrent();
    signalsSent = 0;

    activeSimulation = { type: 'outage', phase: 'RDBMS' };

    // Phase 1: RDBMS for 30s
    activeSimulation.interval = setInterval(() => {
      const signal = activeSimulation.phase === 'RDBMS' 
        ? PRESETS.RDBMS_OUTAGE() 
        : PRESETS.API_FAILURE();
      sendSignal(signal);
    }, 100);

    // Switch to API phase after 30s
    activeSimulation.timeout = setTimeout(() => {
      if (activeSimulation) {
        activeSimulation.phase = 'API';
        console.log('[MOCK GEN] Switching to API failure phase');
        
        // Stop everything after another 30s
        activeSimulation.timeout = setTimeout(() => {
          stopCurrent();
          console.log('[MOCK GEN] Outage simulation completed');
        }, 30000);
      }
    }, 30000);

    return { message: 'Outage simulation started', duration: '60s total' };
  });

  // POST /simulate/stop
  fastify.post('/stop', async () => {
    const stopped = stopCurrent();
    return { status: stopped ? 'stopped' : 'no active simulation' };
  });

  // GET /status
  fastify.get('/status', async () => {
    return {
      active: !!activeSimulation,
      type: activeSimulation?.type || null,
      phase: activeSimulation?.phase || null,
      signals_sent_total: signalsSent
    };
  });
}
