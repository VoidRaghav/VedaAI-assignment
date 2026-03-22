export interface Assignment {
  _id: string;
  title: string;
  description?: string;
  subject?: string;
  class?: string;
  duration?: string;
  fileUrl?: string;
  dueDate: string;
  questionTypes: QuestionType[];
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  generatedPaper?: GeneratedPaper;
  jobId?: string;
  jobStatus: JobStatus;
  createdAt: string;
  updatedAt: string;
}

export type QuestionType = 'mcq' | 'short' | 'long' | 'true-false';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Question {
  text: string;
  difficulty: DifficultyLevel;
  marks: number;
  type: QuestionType;
}

export interface QuestionSection {
  title: string;
  instruction: string;
  questions: Question[];
}

export interface GeneratedPaper {
  sections: QuestionSection[];
  totalMarks: number;
  totalQuestions: number;
}

export interface JobProgress {
  status: JobStatus;
  progress: number;
  message?: string;
  error?: string;
}

export interface AssignmentFormData {
  title: string;
  description?: string;
  subject?: string;
  class?: string;
  duration?: string;
  dueDate: string;
  questionTypes: QuestionType[];
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
}
