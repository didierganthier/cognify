// Database types
export interface User {
  id: string;
  email: string;
  plan: 'free' | 'pro';
  created_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  title: string;
  file_url: string;
  file_size: number;
  page_count: number;
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
}

export interface Summary {
  id: string;
  document_id: string;
  tldr: string;
  key_concepts: string[];
  definitions: { term: string; definition: string }[];
  bullet_summary: string[];
  audio_url: string | null;
  created_at: string;
}

export interface Quiz {
  id: string;
  document_id: string;
  questions: QuizQuestion[];
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  answers: number[];
  taken_at: string;
}

// API Response types
export interface StudyPack {
  document: Document;
  summary: Summary;
  quiz: Quiz;
  attempts: QuizAttempt[];
}

// Component props
export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export interface ProcessingState {
  status: 'idle' | 'extracting' | 'summarizing' | 'generating-quiz' | 'generating-audio' | 'complete' | 'error';
  progress: number;
  message: string;
}
