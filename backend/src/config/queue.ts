import { Queue } from 'bullmq';
import { redisClient } from './redis';

export const questionGenerationQueue = new Queue('question-generation', {
  connection: redisClient
});

export const pdfGenerationQueue = new Queue('pdf-generation', {
  connection: redisClient
});
