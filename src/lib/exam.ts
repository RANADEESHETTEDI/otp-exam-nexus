
// Enhanced exam module with dynamic data management

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

// Mock exams
const mockExams: Exam[] = [
  {
    id: "exam-001",
    title: "Web Development Fundamentals",
    description: "Test your knowledge of HTML, CSS, and JavaScript basics.",
    duration: 45,
    totalMarks: 100,
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // tomorrow
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 25).toISOString(), // tomorrow + 1hr
    status: "upcoming",
    questions: [
      {
        id: "q1",
        text: "What does HTML stand for?",
        options: [
          "Hyper Text Markup Language",
          "High Tech Machine Learning",
          "Hyperlink and Text Markup Language",
          "Home Tool Markup Language"
        ],
        correctOption: 0,
        marks: 10
      },
      {
        id: "q2",
        text: "Which CSS property is used to change the text color?",
        options: [
          "text-color",
          "font-color",
          "color",
          "text-style"
        ],
        correctOption: 2,
        marks: 10
      },
      // More questions...
    ]
  },
  {
    id: "exam-002",
    title: "Data Structures & Algorithms",
    description: "Test your understanding of fundamental algorithms and data structures.",
    duration: 60,
    totalMarks: 100,
    startTime: new Date().toISOString(), // now
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), // now + 2hrs
    status: "active",
    questions: [
      {
        id: "q1",
        text: "What is the time complexity of binary search?",
        options: [
          "O(1)",
          "O(n)",
          "O(log n)",
          "O(n log n)"
        ],
        correctOption: 2,
        marks: 10
      },
      // More questions...
    ]
  },
  {
    id: "exam-003",
    title: "Database Management",
    description: "Test your knowledge of SQL and database concepts.",
    duration: 30,
    totalMarks: 50,
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // yesterday
    endTime: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(), // yesterday + 1hr
    status: "completed",
    questions: [
      {
        id: "q1",
        text: "What does SQL stand for?",
        options: [
          "Structured Query Language",
          "Simple Query Language",
          "Sequential Query Language",
          "Standard Query Language"
        ],
        correctOption: 0,
        marks: 10
      },
      // More questions...
    ]
  }
];

// Mock submissions
const mockSubmissions: ExamSubmission[] = [
  {
    examId: "exam-003",
    userId: "user-001",
    answers: { "q1": 0 },
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 23.5).toISOString(),
    score: 45,
    totalMarks: 50,
    percentage: 90
  }
];

// Create a store for exams and submissions
interface ExamStore {
  exams: Exam[];
  submissions: ExamSubmission[];
  examProgress: Record<string, ExamProgress>;
  addExam: (exam: Exam) => void;
  updateExam: (examId: string, updates: Partial<Exam>) => void;
  deleteExam: (examId: string) => void;
  addSubmission: (submission: ExamSubmission) => void;
  updateExamProgress: (userId: string, examId: string, progress: Partial<ExamProgress>) => void;
  getExamProgress: (userId: string, examId: string) => ExamProgress | null;
}

// Zustand store for exams
export const useExamStore = create<ExamStore>()(
  persist(
    (set, get) => ({
      exams: mockExams,
      submissions: mockSubmissions,
      examProgress: {},
      
      addExam: (exam: Exam) => set(state => ({
        exams: [exam, ...state.exams]
      })),
      
      updateExam: (examId: string, updates: Partial<Exam>) => set(state => ({
        exams: state.exams.map(exam => 
          exam.id === examId ? { ...exam, ...updates } : exam
        )
      })),
      
      deleteExam: (examId: string) => set(state => ({
        exams: state.exams.filter(exam => exam.id !== examId)
      })),
      
      addSubmission: (submission: ExamSubmission) => set(state => ({
        submissions: [submission, ...state.submissions],
        // Clear progress after submission
        examProgress: Object.entries(state.examProgress).reduce((acc, [key, progress]) => {
          const [userId, examId] = key.split('|');
          if (examId !== submission.examId || userId !== submission.userId) {
            acc[key] = progress;
          }
          return acc;
        }, {} as Record<string, ExamProgress>)
      })),
      
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
      }
    }),
    {
      name: 'exam-storage',
      // Only persist the submissions and examProgress to avoid overriding mockExams
      partialize: (state) => ({ 
        submissions: state.submissions,
        examProgress: state.examProgress
      }),
    }
  )
);

// Get all exams
export const getExams = async (): Promise<Exam[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Update status of exams based on current time
  const exams = useExamStore.getState().exams;
  const now = new Date().getTime();
  
  exams.forEach(exam => {
    const startTime = new Date(exam.startTime).getTime();
    const endTime = new Date(exam.endTime).getTime();
    
    if (now < startTime) {
      if (exam.status !== 'upcoming') {
        useExamStore.getState().updateExam(exam.id, { status: 'upcoming' });
      }
    } else if (now >= startTime && now <= endTime) {
      if (exam.status !== 'active') {
        useExamStore.getState().updateExam(exam.id, { status: 'active' });
      }
    } else if (now > endTime) {
      if (exam.status !== 'completed') {
        useExamStore.getState().updateExam(exam.id, { status: 'completed' });
      }
    }
  });
  
  return useExamStore.getState().exams;
};

// Get exam by ID
export const getExamById = async (examId: string): Promise<Exam | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Update status of the exam based on current time
  const exams = useExamStore.getState().exams;
  const exam = exams.find(e => e.id === examId);
  
  if (exam) {
    const now = new Date().getTime();
    const startTime = new Date(exam.startTime).getTime();
    const endTime = new Date(exam.endTime).getTime();
    
    let newStatus = exam.status;
    
    if (now < startTime) {
      newStatus = 'upcoming';
    } else if (now >= startTime && now <= endTime) {
      newStatus = 'active';
    } else if (now > endTime) {
      newStatus = 'completed';
    }
    
    if (newStatus !== exam.status) {
      useExamStore.getState().updateExam(exam.id, { status: newStatus });
    }
  }
  
  return useExamStore.getState().exams.find(e => e.id === examId) || null;
};

// Submit exam
export const submitExam = async (
  examId: string,
  userId: string,
  answers: Record<string, number>,
  startedAt: string
): Promise<ExamSubmission> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  const exam = useExamStore.getState().exams.find(e => e.id === examId);
  
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
  
  const submission: ExamSubmission = {
    examId,
    userId,
    answers,
    startedAt,
    submittedAt: new Date().toISOString(),
    score,
    totalMarks,
    percentage
  };
  
  // Save submission
  useExamStore.getState().addSubmission(submission);
  
  return submission;
};

// Get submission by user and exam
export const getSubmission = async (
  userId: string,
  examId: string
): Promise<ExamSubmission | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return useExamStore.getState().submissions.find(
    submission => submission.userId === userId && submission.examId === examId
  ) || null;
};

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

// Auto-submit exams that have ended
export const checkAndAutoSubmitExams = async (userId: string): Promise<void> => {
  const state = useExamStore.getState();
  const now = new Date().getTime();
  
  // Check for exams that have ended but haven't been submitted
  for (const [key, progress] of Object.entries(state.examProgress)) {
    const [progressUserId, examId] = key.split('|');
    
    if (progressUserId !== userId) continue;
    
    const exam = state.exams.find(e => e.id === examId);
    if (!exam) continue;
    
    const endTime = new Date(exam.endTime).getTime();
    
    if (now > endTime) {
      // Exam has ended, auto submit
      await submitExam(
        examId,
        userId,
        progress.answers,
        progress.startedAt
      );
    }
  }
};
