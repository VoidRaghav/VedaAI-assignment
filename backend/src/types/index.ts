export interface AssignmentInput {
  title: string;
  description?: string;
  fileUrl?: string;
  dueDate: Date;
  questionTypes: QuestionType[];
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
}

export type QuestionType = 'mcq' | 'short' | 'long' | 'true-false';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

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

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface JobProgress {
  status: JobStatus;
  progress: number;
  message?: string;
  error?: string;
}
