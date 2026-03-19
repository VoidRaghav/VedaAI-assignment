import { Worker, Job } from 'bullmq';
import { redisClient } from '../config/redis';
import Assignment from '../models/Assignment';
import aiService from '../services/aiService';
import { AssignmentInput } from '../types';
import { io } from '../server';

export const questionWorker = new Worker(
  'question-generation',
  async (job: Job) => {
    const { assignmentId } = job.data;

    try {
      await job.updateProgress(10);
      
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        throw new Error('Assignment not found');
      }

      assignment.jobStatus = 'processing';
      await assignment.save();

      io.to(assignmentId).emit('progress', {
        status: 'processing',
        progress: 20,
        message: 'Generating questions with AI...'
      });

      await job.updateProgress(30);

      const assignmentInput: AssignmentInput = {
        title: assignment.title,
        description: assignment.description,
        fileUrl: assignment.fileUrl,
        dueDate: assignment.dueDate,
        questionTypes: assignment.questionTypes,
        totalQuestions: assignment.totalQuestions,
        totalMarks: assignment.totalMarks,
        additionalInstructions: assignment.additionalInstructions
      };

      const generatedPaper = await aiService.generateQuestions(assignmentInput);

      await job.updateProgress(80);

      assignment.generatedPaper = generatedPaper;
      assignment.jobStatus = 'completed';
      await assignment.save();

      await job.updateProgress(100);

      io.to(assignmentId).emit('progress', {
        status: 'completed',
        progress: 100,
        message: 'Question paper generated successfully!'
      });

      return { success: true, assignmentId };
    } catch (error) {
      const assignment = await Assignment.findById(assignmentId);
      if (assignment) {
        assignment.jobStatus = 'failed';
        await assignment.save();
      }

      io.to(assignmentId).emit('progress', {
        status: 'failed',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  },
  {
    connection: redisClient,
    concurrency: 5
  }
);

questionWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

questionWorker.on('failed', (job, err) => {
  console.log(`Job ${job?.id} failed:`, err.message);
});
