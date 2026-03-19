import { Worker, Job } from 'bullmq';
import { redisClient } from '../config/redis';
import Assignment from '../models/Assignment';
import pdfService from '../services/pdfService';

export const pdfWorker = new Worker(
  'pdf-generation',
  async (job: Job) => {
    const { assignmentId } = job.data;

    try {
      await job.updateProgress(20);

      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        throw new Error('Assignment not found');
      }

      if (!assignment.generatedPaper) {
        throw new Error('No generated paper found');
      }

      await job.updateProgress(50);

      const pdfBuffer = await pdfService.generatePDF(assignment);

      await job.updateProgress(100);

      return { 
        success: true, 
        assignmentId,
        pdfSize: pdfBuffer.length 
      };
    } catch (error) {
      throw error;
    }
  },
  {
    connection: redisClient,
    concurrency: 3
  }
);

pdfWorker.on('completed', (job) => {
  console.log(`PDF Job ${job.id} completed`);
});

pdfWorker.on('failed', (job, err) => {
  console.log(`PDF Job ${job?.id} failed:`, err.message);
});
