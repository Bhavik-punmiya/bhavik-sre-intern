import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const timescalePool = new Pool({
  host: process.env.TIMESCALE_HOST || 'localhost',
  port: parseInt(process.env.TIMESCALE_PORT || '5432'),
  user: process.env.TIMESCALE_USER || 'ims_user',
  password: process.env.TIMESCALE_PASSWORD || 'ims_password',
  database: process.env.TIMESCALE_DB || 'ims_metrics',
});

export const writeMetric = async (signal) => {
  const query = `
    INSERT INTO signal_metrics (time, component_id, severity, component_type)
    VALUES ($1, $2, $3, $4)
  `;
  try {
    await timescalePool.query(query, [new Date(), signal.component_id, signal.severity, signal.component_type]);
  } catch (err) {
    if (err.message.includes('relation "signal_metrics" does not exist')) {
      await timescalePool.query(`
        CREATE TABLE IF NOT EXISTS signal_metrics (
          time TIMESTAMP NOT NULL,
          component_id TEXT,
          severity TEXT,
          component_type TEXT
        )
      `);
      // Retry once
      await timescalePool.query(query, [new Date(), signal.component_id, signal.severity, signal.component_type]);
    } else {
      console.error('[TIMESCALE] Failed to write metric:', err.message);
    }
  }
};
