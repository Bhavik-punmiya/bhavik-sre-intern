import IORedis from 'ioredis';
import dotenv from 'dotenv';
import { INCIDENT_EXPIRY } from '../../shared/constants.js';

dotenv.config();

export const redis = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
});

export const checkDebounce = async (componentId, redisInstance) => {
  return await redisInstance.get(`debounce:${componentId}`);
};

export const setDebounce = async (componentId, incidentId, redisInstance) => {
  await redisInstance.set(`debounce:${componentId}`, incidentId, 'EX', INCIDENT_EXPIRY);
};

export const updateDashboardCache = async (incidents) => {
  await redis.set('dashboard:live_incidents', JSON.stringify(incidents), 'EX', 30);
};
