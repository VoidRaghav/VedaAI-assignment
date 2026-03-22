import { Queue } from 'bullmq';

const redisConnection = {
  host: process.env.REDIS_URL?.includes('://') 
    ? new URL(process.env.REDIS_URL).hostname 
    : 'localhost',
  port: process.env.REDIS_URL?.includes('://') 
    ? parseInt(new URL(process.env.REDIS_URL).port || '6379') 
    : 6379,
};

export const questionGenerationQueue = new Queue('question-generation', {
  connection: redisConnection
});

export const pdfGenerationQueue = new Queue('pdf-generation', {
  connection: redisConnection
});
