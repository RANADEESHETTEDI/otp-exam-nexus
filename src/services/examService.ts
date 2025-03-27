
import { supabase } from '@/integrations/supabase/client';
import { Exam, Question, ExamSubmission } from '@/lib/exam';

// Fetch all exams
export const fetchExams = async (): Promise<Exam[]> => {
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
            ...exam,
            questions: [],
            status: getExamStatus(exam.start_time, exam.end_time),
            description: exam.title || '', // Add a description field based on title
            totalMarks: 0,
            startTime: exam.start_time,
            endTime: exam.end_time
          } as Exam;
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
          description: exam.title || '', // Using title as description since we don't have a description column
          duration: exam.duration,
          totalMarks: formattedQuestions.length * 10, // Each question is worth 10 marks
          startTime: exam.start_time,
          endTime: exam.end_time,
          status: getExamStatus(exam.start_time, exam.end_time),
          questions: formattedQuestions,
          collegeId: exam.college_id
        } as Exam;
      })
    );
    
    return examsWithQuestions;
  } catch (error) {
    console.error("Error fetching exams:", error);
    throw error;
  }
};

// Fetch a specific exam by ID
export const fetchExamById = async (examId: string): Promise<Exam | null> => {
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
      description: exam.title || '', // Using title as description since we don't have a description column
      duration: exam.duration,
      totalMarks: formattedQuestions.length * 10, // Each question is worth 10 marks
      startTime: exam.start_time,
      endTime: exam.end_time,
      status: getExamStatus(exam.start_time, exam.end_time),
      questions: formattedQuestions,
      collegeId: exam.college_id
    } as Exam;
  } catch (error) {
    console.error("Error fetching exam:", error);
    throw error;
  }
};

// Submit exam answers
export const submitExamAnswers = async (
  examId: string,
  userId: string,
  answers: Record<string, number>,
  startedAt: string
): Promise<ExamSubmission> => {
  try {
    // Fetch exam questions to calculate score
    const exam = await fetchExamById(examId);
    
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
export const fetchSubmission = async (
  userId: string,
  examId: string
): Promise<ExamSubmission | null> => {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('user_id', userId)
      .eq('exam_id', examId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }
    
    if (!data) {
      return null;
    }
    
    const exam = await fetchExamById(examId);
    
    if (!exam) {
      throw new Error("Exam not found");
    }
    
    // Ensure answers is properly typed as a Record<string, number>
    const typedAnswers: Record<string, number> = {};
    if (data.answers && typeof data.answers === 'object') {
      Object.entries(data.answers).forEach(([key, value]) => {
        if (typeof value === 'number') {
          typedAnswers[key] = value;
        }
      });
    }
    
    return {
      examId: data.exam_id,
      userId: data.user_id,
      answers: typedAnswers,
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
