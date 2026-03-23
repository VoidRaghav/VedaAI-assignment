import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  tls: process.env.REDIS_URL?.startsWith('rediss://') ? {
    rejectUnauthorized: false
  } : undefined
});

export const questionGenerationQueue = new Queue('question-generation', {
  connection: redisConnection as any
});

export const pdfGenerationQueue = new Queue('pdf-generation', {
  connection: redisConnection as any
});
