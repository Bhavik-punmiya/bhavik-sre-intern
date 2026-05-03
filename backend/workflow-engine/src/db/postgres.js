import pg from 'pg';
import dotenv from 'dotenv';
import { withRetry } from '../../shared/retry.js';

dotenv.config();

const { Pool } = pg;

export const pgPool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'ims_user',
  password: process.env.POSTGRES_PASSWORD || 'ims_password',
  database: process.env.POSTGRES_DB || 'ims',
});

export const createWorkItem = async (signal) => {
  return await withRetry(async () => {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      
      const res = await client.query(
        `INSERT INTO work_items (component_id, component_type, severity, start_time, status)
         VALUES ($1, $2, $3, $4, 'OPEN')
         RETURNING id`,
        [signal.component_id, signal.component_type, signal.severity, signal.timestamp]
      );
      
      await client.query('COMMIT');
      return res.rows[0].id;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  });
};

export const getLiveIncidents = async () => {
  const query = `
    SELECT * FROM work_items 
    WHERE status != 'CLOSED'
    ORDER BY
      CASE severity WHEN 'P0' THEN 1 WHEN 'P1' THEN 2
      WHEN 'P2' THEN 3 ELSE 4 END,
    created_at DESC
  `;
  const res = await pgPool.query(query);
  return res.rows;
};
