import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pgPool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'ims_user',
  password: process.env.POSTGRES_PASSWORD || 'ims_password',
  database: process.env.POSTGRES_DB || 'ims',
});

export const getAlertConfig = async (componentType) => {
  const res = await pgPool.query(
    'SELECT * FROM alert_configs WHERE component_type = $1',
    [componentType]
  );
  return res.rows[0];
};

export const getAllAlertConfigs = async () => {
  const res = await pgPool.query('SELECT * FROM alert_configs ORDER BY component_type');
  return res.rows;
};

export const updateAlertConfig = async (componentType, { email, webhook_url, enabled }) => {
  const res = await pgPool.query(
    `UPDATE alert_configs 
     SET email = $2, webhook_url = $3, enabled = $4, updated_at = NOW()
     WHERE component_type = $1
     RETURNING *`,
    [componentType, email, webhook_url, enabled]
  );
  return res.rows[0];
};
