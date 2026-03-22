import mongoose, { Schema, Document } from 'mongoose';
import { AssignmentInput, QuestionType, JobStatus, GeneratedPaper } from '../types';

export interface IAssignment extends Document {
  title: string;
  description?: string;
  subject?: string;
  class?: string;
  duration?: string;
  fileUrl?: string;
  dueDate: Date;
  questionTypes: QuestionType[];
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  generatedPaper?: GeneratedPaper;
  jobId?: string;
  jobStatus: JobStatus;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    description: { type: String },
    subject: { type: String },
    class: { type: String },
    duration: { type: String },
    fileUrl: { type: String },
    dueDate: { type: Date, required: true },
    questionTypes: [{ type: String, enum: ['mcq', 'short', 'long', 'true-false'], required: true }],
    totalQuestions: { type: Number, required: true, min: 1 },
    totalMarks: { type: Number, required: true, min: 1 },
    additionalInstructions: { type: String },
    generatedPaper: {
      sections: [{
        title: String,
        instruction: String,
        questions: [{
          text: String,
          difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
          marks: Number,
          type: { type: String, enum: ['mcq', 'short', 'long', 'true-false'] }
        }]
      }],
      totalMarks: Number,
      totalQuestions: Number
    },
    jobId: { type: String },
    jobStatus: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' }
  },
  { timestamps: true }
);

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
