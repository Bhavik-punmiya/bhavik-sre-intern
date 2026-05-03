import { Worker, Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import IORedis from 'ioredis';
import { Signal, connectMongo } from './db/mongo.js';
import { createWorkItem, pgPool } from './db/postgres.js';
import { writeMetric } from './db/timescale.js';
import { checkDebounce, setDebounce } from './services/debounce.js';
import { rebuildDashboardCache } from './utils/dashboardCache.js';
import dotenv from 'dotenv';

dotenv.config();

// Dedicated connection for EVERYTHING in the worker context
export const workerConnection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
});

// Connect to MongoDB
connectMongo();

const worker = new Worker('signal-processing', async (job) => {
  const signalData = job.data;
  console.log(`[WORKER] Processing signal: ${job.id} | Component: ${signalData.component_id}`);

  try {
    // Step 1: Write raw signal to MongoDB
    const signalId = uuidv4();
    const signalDoc = new Signal({
      ...signalData,
      signal_id: signalId,
      ingested_at: new Date()
    });
    await signalDoc.save();

    // Step 2: Debounce check using Redis
    let incidentId = await checkDebounce(signalData.component_id, workerConnection);

    if (incidentId) {
      // Step 2b: Exists -> Update MongoDB signal and increment signal_count in Postgres
      await Signal.updateOne({ signal_id: signalId }, { incident_id: incidentId });
      await pgPool.query('UPDATE work_items SET signal_count = signal_count + 1 WHERE id = $1', [incidentId]);
      console.log(`[WORKER] Signal debounced. Linked to existing incident: ${incidentId}`);
    } else {
      // Step 3: Create Work Item in PostgreSQL (with retry logic built into db function)
      try {
        incidentId = await createWorkItem(signalData);
        
        // Step 3b: Success -> Set Redis debounce key and update MongoDB
        await setDebounce(signalData.component_id, incidentId, workerConnection);
        await Signal.updateOne({ signal_id: signalId }, { incident_id: incidentId });
        
        console.log(`[WORKER] New Incident Created: ${incidentId}`);
        
        // Step 3.5 — Fire alert (non-blocking)
        const alertServiceUrl = process.env.ALERT_SERVICE_URL || 'http://localhost:8004';
        const alertApiKey = process.env.ALERT_SERVICE_KEY || 'alert-svc-key-005';
        
        try {
          fetch(`${alertServiceUrl}/alerts/send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': alertApiKey
            },
            body: JSON.stringify({
              incident_id: incidentId,
              component_id: signalData.component_id,
              component_type: signalData.component_type,
              severity: signalData.severity,
              error_code: signalData.error_code,
              message: signalData.message,
              timestamp: signalData.timestamp
            })
          }).catch(err => console.error('[ALERT] Background fetch failed:', err.message));
        } catch (err) {
          console.error('[ALERT] Failed to notify alert service, continuing:', err.message);
        }

        // Step 5: Rebuild Redis dashboard cache (only on new work item)
        await rebuildDashboardCache();
      } catch (pgErr) {
        console.error(`[WORKER] Critical PG Failure for job ${job.id}:`, pgErr.message);
        throw pgErr; // Rethrow for BullMQ retry/DLQ
      }
    }

    // Step 4: Write metric to TimescaleDB
    await writeMetric(signalData);

  } catch (err) {
    console.error(`[WORKER] Job ${job.id} failed:`, err.message);
    throw err;
  }
}, {
  connection: workerConnection,
  concurrency: 5
});

worker.on('failed', async (job, err) => {
  console.error(`[WORKER] Job ${job.id} failed:`, err.message);
  
  if (job.attemptsMade >= 3) {
    console.error(`[WORKER] Job ${job.id} exhausted. Moving to signal-dlq.`);
    try {
      const dlq = new Queue('signal-dlq', { connection: workerConnection });
      await dlq.add('failed-signal', job.data);
      await dlq.close();
    } catch (dlqErr) {
      console.error(`[WORKER] Failed to move job ${job.id} to DLQ:`, dlqErr.message);
    }
  }
});

console.log('Workflow Engine Worker started...');
