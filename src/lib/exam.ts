
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
  marks: number;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  totalMarks: number;
  questions: Question[];
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'active' | 'completed';
}

export interface ExamSubmission {
  examId: string;
  userId: string;
  answers: Record<string, number>; // questionId: selectedOption
  startedAt: string;
  submittedAt: string;
  score: number;
  totalMarks: number;
  percentage: number;
}

export interface ExamProgress {
  examId: string;
  currentQuestion: number;
  answers: Record<string, number>;
  timeRemaining: number | null;
  startedAt: string;
}

// Create a store for exam progress
interface ExamStore {
  examProgress: Record<string, ExamProgress>;
  updateExamProgress: (userId: string, examId: string, progress: Partial<ExamProgress>) => void;
  getExamProgress: (userId: string, examId: string) => ExamProgress | null;
  clearExamProgress: (userId: string, examId: string) => void;
}

// Zustand store for exam progress
export const useExamStore = create<ExamStore>()(
  persist(
    (set, get) => ({
      examProgress: {},
      
      updateExamProgress: (userId: string, examId: string, progress: Partial<ExamProgress>) => {
        set(state => {
          const key = `${userId}|${examId}`;
          const existingProgress = state.examProgress[key] || {
            examId,
            currentQuestion: 0,
            answers: {},
            timeRemaining: null,
            startedAt: new Date().toISOString()
          };
          
          return {
            examProgress: {
              ...state.examProgress,
              [key]: {
                ...existingProgress,
                ...progress
              }
            }
          };
        });
      },
      
      getExamProgress: (userId: string, examId: string) => {
        const key = `${userId}|${examId}`;
        return get().examProgress[key] || null;
      },
      
      clearExamProgress: (userId: string, examId: string) => {
        set(state => {
          const key = `${userId}|${examId}`;
          const newExamProgress = { ...state.examProgress };
          delete newExamProgress[key];
          
          return {
            examProgress: newExamProgress
          };
        });
      }
    }),
    {
      name: 'exam-progress-storage',
      partialize: (state) => ({ examProgress: state.examProgress }),
    }
  )
);

// Save exam progress
export const saveExamProgress = (
  userId: string,
  examId: string,
  progress: Partial<ExamProgress>
): void => {
  useExamStore.getState().updateExamProgress(userId, examId, progress);
};

// Get exam progress
export const getExamProgress = (
  userId: string,
  examId: string
): ExamProgress | null => {
  return useExamStore.getState().getExamProgress(userId, examId);
};

// Clear exam progress
export const clearExamProgress = (
  userId: string,
  examId: string
): void => {
  useExamStore.getState().clearExamProgress(userId, examId);
};
