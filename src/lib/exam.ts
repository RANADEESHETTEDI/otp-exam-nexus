
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';

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

// Fetch all exams
export const getExams = async (): Promise<Exam[]> => {
  try {
    const { data: exams, error } = await supabase
      .from('exams')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    if (!exams) {
      return [];
    }
    
    // Fetch questions for each exam
    const examsWithQuestions = await Promise.all(
      exams.map(async (exam) => {
        const { data: questions, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('exam_id', exam.id);
        
        if (questionsError) {
          console.error('Error fetching questions:', questionsError);
          return {
            id: exam.id,
            title: exam.title,
            description: exam.title, // Using title as description
            duration: exam.duration,
            totalMarks: 0,
            questions: [],
            startTime: exam.start_time,
            endTime: exam.end_time,
            status: getExamStatus(exam.start_time, exam.end_time)
          };
        }
        
        const formattedQuestions: Question[] = questions?.map(q => ({
          id: q.id,
          text: q.question,
          options: q.options,
          correctOption: q.correct_answer,
          marks: 10 // Default marks per question
        })) || [];
        
        return {
          id: exam.id,
          title: exam.title,
          description: exam.title, // Using title as description
          duration: exam.duration,
          totalMarks: formattedQuestions.length * 10, // Each question is worth 10 marks
          startTime: exam.start_time,
          endTime: exam.end_time,
          status: getExamStatus(exam.start_time, exam.end_time),
          questions: formattedQuestions
        };
      })
    );
    
    return examsWithQuestions;
  } catch (error) {
    console.error("Error fetching exams:", error);
    throw error;
  }
};

// Fetch a specific exam by ID
export const getExamById = async (examId: string): Promise<Exam | null> => {
  try {
    const { data: exam, error } = await supabase
      .from('exams')
      .select('*')
      .eq('id', examId)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!exam) {
      return null;
    }
    
    // Fetch questions for the exam
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('exam_id', examId);
    
    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      return null;
    }
    
    const formattedQuestions: Question[] = questions?.map(q => ({
      id: q.id,
      text: q.question,
      options: q.options,
      correctOption: q.correct_answer,
      marks: 10 // Default marks per question
    })) || [];
    
    return {
      id: exam.id,
      title: exam.title,
      description: exam.title, // Using title as description
      duration: exam.duration,
      totalMarks: formattedQuestions.length * 10, // Each question is worth 10 marks
      startTime: exam.start_time,
      endTime: exam.end_time,
      status: getExamStatus(exam.start_time, exam.end_time),
      questions: formattedQuestions
    };
  } catch (error) {
    console.error("Error fetching exam:", error);
    throw error;
  }
};

// Submit exam answers
export const submitExam = async (
  examId: string,
  userId: string,
  answers: Record<string, number>,
  startedAt: string
): Promise<ExamSubmission> => {
  try {
    // Fetch exam questions to calculate score
    const exam = await getExamById(examId);
    
    if (!exam) {
      throw new Error("Exam not found");
    }
    
    // Calculate score
    let score = 0;
    let totalMarks = 0;
    
    for (const question of exam.questions) {
      totalMarks += question.marks;
      if (answers[question.id] === question.correctOption) {
        score += question.marks;
      }
    }
    
    const percentage = Math.round((score / totalMarks) * 100);
    
    // Save submission to Supabase
    const { data, error } = await supabase
      .from('submissions')
      .insert({
        exam_id: examId,
        user_id: userId,
        answers,
        score,
        submitted_at: new Date().toISOString()
      })
      .select('*')
      .single();
    
    if (error) {
      throw error;
    }
    
    // Clear progress after submission
    clearExamProgress(userId, examId);
    
    return {
      examId,
      userId,
      answers,
      startedAt,
      submittedAt: new Date().toISOString(),
      score,
      totalMarks,
      percentage
    };
  } catch (error) {
    console.error("Error submitting exam:", error);
    throw error;
  }
};

// Fetch submission for a specific exam and user
export const getSubmission = async (
  userId: string,
  examId: string
): Promise<ExamSubmission | null> => {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('user_id', userId)
      .eq('exam_id', examId)
      .maybeSingle();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      return null;
    }
    
    const exam = await getExamById(examId);
    
    if (!exam) {
      throw new Error("Exam not found");
    }
    
    return {
      examId: data.exam_id,
      userId: data.user_id,
      answers: data.answers as Record<string, number>,
      startedAt: data.submitted_at, // We don't have a startedAt field, using submittedAt
      submittedAt: data.submitted_at,
      score: data.score,
      totalMarks: exam.totalMarks,
      percentage: Math.round((data.score / exam.totalMarks) * 100)
    };
  } catch (error) {
    console.error("Error fetching submission:", error);
    throw error;
  }
};

// Check for exams that need to be auto-submitted (time expired)
export const checkAndAutoSubmitExams = async (userId: string): Promise<void> => {
  try {
    // Get all exam progress for user
    const allProgress = useExamStore.getState().examProgress;
    
    for (const key in allProgress) {
      if (key.startsWith(`${userId}|`)) {
        const examId = key.split('|')[1];
        const progress = allProgress[key];
        
        // Check if time has expired
        if (progress.timeRemaining !== null && progress.timeRemaining <= 0) {
          // Auto-submit the exam
          const answers = { ...progress.answers };
          
          try {
            await submitExam(examId, userId, answers, progress.startedAt);
            console.log(`Auto-submitted exam ${examId} for user ${userId}`);
          } catch (submitError) {
            console.error(`Failed to auto-submit exam ${examId}:`, submitError);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error checking for auto-submissions:", error);
  }
};

// Helper function to determine exam status
const getExamStatus = (startTime: string, endTime: string): 'upcoming' | 'active' | 'completed' => {
  const now = new Date().getTime();
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  
  if (now < start) {
    return 'upcoming';
  } else if (now >= start && now <= end) {
    return 'active';
  } else {
    return 'completed';
  }
};
