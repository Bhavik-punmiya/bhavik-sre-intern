import { timescalePool } from '../db/timescale.js';

export default async function metricRoutes(fastify) {
  // Ensure table exists
  await timescalePool.query(`
    CREATE TABLE IF NOT EXISTS signal_metrics (
      time TIMESTAMP NOT NULL,
      component_id TEXT,
      severity TEXT,
      component_type TEXT
    )
  `);

  // GET /metrics/throughput
  fastify.get('/throughput', async (request, reply) => {
    // Try timescale time_bucket, fallback to standard date_trunc
    const query = `
      SELECT
        date_trunc('minute', time) AS bucket,
        COUNT(*) AS signal_count
      FROM signal_metrics
      WHERE time > NOW() - INTERVAL '1 hour'
      GROUP BY bucket
      ORDER BY bucket DESC
      LIMIT 60
    `;
    
    try {
      const res = await timescalePool.query(query);
      return res.rows;
    } catch (err) {
      console.error('[METRICS API] Failed to query TimescaleDB:', err.message);
      return reply.code(500).send({ error: 'Failed to fetch throughput metrics' });
    }
  });

  // GET /metrics/summary
  fastify.get('/summary', async (request, reply) => {
    try {
      const throughputRes = await timescalePool.query(`
        SELECT COUNT(*) / 60.0 as signals_per_sec 
        FROM signal_metrics 
        WHERE time > NOW() - INTERVAL '1 minute'
      `);
      
      return {
        signals_per_sec: parseFloat(throughputRes.rows[0].signals_per_sec || 0).toFixed(2)
      };
    } catch (err) {
      return { signals_per_sec: 0 };
    }
  });
}
