import { Worker, Job } from 'bullmq';
import Assignment from '../models/Assignment';
import aiService from '../services/aiService';
import { AssignmentInput } from '../types';
import { getIO } from '../config/socket';
import { redisClient } from '../config/redis';

const redisConnection = process.env.REDIS_URL?.startsWith('rediss://') 
  ? {
      host: new URL(process.env.REDIS_URL).hostname,
      port: parseInt(new URL(process.env.REDIS_URL).port || '6379'),
      tls: {
        rejectUnauthorized: false
      }
    }
  : {
      host: process.env.REDIS_URL?.includes('://') 
        ? new URL(process.env.REDIS_URL).hostname 
        : 'localhost',
      port: process.env.REDIS_URL?.includes('://') 
        ? parseInt(new URL(process.env.REDIS_URL).port || '6379') 
        : 6379,
    };

export const questionWorker = new Worker(
  'question-generation',
  async (job: Job) => {
    const { assignmentId } = job.data;

    try {
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        throw new Error('Assignment not found');
      }

      await Assignment.findByIdAndUpdate(
        assignmentId,
        { $set: { jobStatus: 'processing' } },
        { new: true }
      );

      getIO().to(assignmentId).emit('progress', {
        status: 'processing',
        progress: 30,
        message: 'AI is generating your questions...'
      });

      const assignmentInput: AssignmentInput = {
        title: assignment.title,
        description: assignment.description,
        fileUrl: assignment.fileUrl,
        dueDate: assignment.dueDate,
        questionTypes: assignment.questionTypes,
        totalQuestions: assignment.totalQuestions,
        totalMarks: assignment.totalMarks,
        additionalInstructions: assignment.additionalInstructions,
        subject: (assignment as any).subject,
        class: (assignment as any).class,
        duration: (assignment as any).duration
      };

      const generatedPaper = await aiService.generateQuestions(assignmentInput);
      console.log('Generated paper:', JSON.stringify(generatedPaper).substring(0, 200));

      await Assignment.findByIdAndUpdate(
        assignmentId,
        { $set: { generatedPaper: generatedPaper } },
        { new: true }
      );
      
      const savedAssignment = await Assignment.findByIdAndUpdate(
        assignmentId,
        { $set: { jobStatus: 'completed' } },
        { new: true }
      );
      
      if (!savedAssignment) {
        throw new Error('Failed to update assignment');
      }
      
      console.log(`Assignment ${assignmentId} saved successfully. Status: ${savedAssignment.jobStatus}`);
      console.log(`Has generated paper: ${!!savedAssignment.generatedPaper}`);
      console.log(`Verification - fetching from DB...`);
      
      const verification = await Assignment.findById(assignmentId).select('jobStatus generatedPaper');
      console.log(`DB Status: ${verification?.jobStatus}, Has Paper: ${!!verification?.generatedPaper}`);

      const cacheKey = `assignment:${assignmentId}`;
      await redisClient.del(cacheKey);
      console.log(`Cache invalidated for ${assignmentId}`);

      getIO().to(assignmentId).emit('progress', {
        status: 'completed',
        progress: 100,
        message: 'Question paper generated successfully!'
      });

      return { success: true, assignmentId };
    } catch (error) {
      console.error(`Job ${assignmentId} failed:`, error);
      
      await Assignment.findByIdAndUpdate(
        assignmentId,
        { $set: { jobStatus: 'failed' } },
        { new: true }
      );

      getIO().to(assignmentId).emit('progress', {
        status: 'failed',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5
  }
);

questionWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

questionWorker.on('failed', (job, err) => {
  console.log(`Job ${job?.id} failed:`, err.message);
});
