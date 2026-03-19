import { z } from 'zod';

export const assignmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  fileUrl: z.string().optional(),
  dueDate: z.string().refine((date) => new Date(date) > new Date(), {
    message: 'Due date must be in the future'
  }),
  questionTypes: z.array(z.enum(['mcq', 'short', 'long', 'true-false'])).min(1, 'At least one question type is required'),
  totalQuestions: z.number().min(1, 'Total questions must be at least 1'),
  totalMarks: z.number().min(1, 'Total marks must be at least 1'),
  additionalInstructions: z.string().optional()
});

export type AssignmentValidation = z.infer<typeof assignmentSchema>;
