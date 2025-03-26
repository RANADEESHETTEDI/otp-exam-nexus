
// Mock exam data and functions

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

// Get all exams
export const getExams = async (): Promise<Exam[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockExams;
};

// Get exam by ID
export const getExamById = async (examId: string): Promise<Exam | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockExams.find(exam => exam.id === examId) || null;
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
  
  const exam = mockExams.find(e => e.id === examId);
  
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
  
  // In a real app, this would be saved to a database
  
  return submission;
};

// Get submission by user and exam
export const getSubmission = async (
  userId: string,
  examId: string
): Promise<ExamSubmission | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockSubmissions.find(
    submission => submission.userId === userId && submission.examId === examId
  ) || null;
};
