import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Required by BullMQ
});

export const signalQueue = new Queue('signal-processing', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export const getQueueDepth = async () => {
  const [waiting, active, delayed] = await Promise.all([
    signalQueue.getWaitingCount(),
    signalQueue.getActiveCount(),
    signalQueue.getDelayedCount(),
  ]);
  return waiting + active + delayed;
};
