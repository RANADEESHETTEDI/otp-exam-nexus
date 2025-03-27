
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui-custom/Card";
import { Button } from "@/components/ui-custom/Button";
import { Progress } from "@/components/ui/progress";
import { getCurrentUser } from "@/lib/auth";
import { 
  getExamById, 
  submitExam, 
  Question, 
  saveExamProgress, 
  getExamProgress,
  checkAndAutoSubmitExams
} from "@/lib/exam";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { formatTimeMMSS } from "@/utils/dateUtils";

const ExamPage = () => {
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();
  const user = getCurrentUser();
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [examData, setExamData] = useState<{
    title: string;
    description: string;
    questions: Question[];
    duration: number;
  } | null>(null);
  const [examStartedAt, setExamStartedAt] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const saveProgressInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Check authentication
  useEffect(() => {
    if (!user) {
      toast.error("Please log in to access the exam");
      navigate("/login");
      return;
    }
    
    if (!examId) {
      toast.error("No exam selected");
      navigate("/dashboard");
      return;
    }
    
    // Check for auto-submissions
    checkAndAutoSubmitExams(user.id)
      .catch(error => {
        console.error("Error checking for auto-submissions:", error);
      });
    
    // Fetch exam data
    const fetchExam = async () => {
      try {
        const exam = await getExamById(examId);
        
        if (!exam) {
          toast.error("Exam not found");
          navigate("/dashboard");
          return;
        }
        
        if (exam.status !== "active") {
          toast.error(`This exam is currently ${exam.status}`);
          navigate("/dashboard");
          return;
        }
        
        // Check if there's existing progress
        const progress = getExamProgress(user.id, examId);
        
        if (progress) {
          // Resume from saved progress
          setCurrentQuestion(progress.currentQuestion);
          setAnswers(progress.answers);
          setTimeLeft(progress.timeRemaining !== null ? progress.timeRemaining : exam.duration * 60);
          setExamStartedAt(progress.startedAt);
        } else {
          // Start new exam
          // Initialize empty answers object
          const initialAnswers: Record<string, number> = {};
          exam.questions.forEach(question => {
            initialAnswers[question.id] = -1; // -1 means unanswered
          });
          setAnswers(initialAnswers);
          
          // Set timer to exam duration
          setTimeLeft(exam.duration * 60);
          
          // Record exam start time
          const startTime = new Date().toISOString();
          setExamStartedAt(startTime);
          
          // Save initial progress
          saveExamProgress(user.id, examId, {
            examId,
            currentQuestion: 0,
            answers: initialAnswers,
            timeRemaining: exam.duration * 60,
            startedAt: startTime
          });
        }
        
        setExamData({
          title: exam.title,
          description: exam.description,
          questions: exam.questions,
          duration: exam.duration,
        });
        
      } catch (error) {
        toast.error("Failed to load exam. Please try again.");
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExam();
    
    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (saveProgressInterval.current) {
        clearInterval(saveProgressInterval.current);
      }
    };
  }, [user, examId, navigate]);
  
  // Start timer when exam data is loaded
  useEffect(() => {
    if (timeLeft === null || !examData || !user || !examId) return;
    
    // Update timer every second
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 0) {
          // Time's up - submit automatically
          if (timerRef.current) clearInterval(timerRef.current);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Save progress every 10 seconds
    saveProgressInterval.current = setInterval(() => {
      if (isSubmitting) return; // Don't save if submitting
      
      saveExamProgress(user.id, examId, {
        currentQuestion,
        answers,
        timeRemaining: timeLeft,
        startedAt: examStartedAt
      });
    }, 10000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (saveProgressInterval.current) {
        clearInterval(saveProgressInterval.current);
      }
    };
  }, [timeLeft, examData, user, examId, currentQuestion, answers, examStartedAt, isSubmitting]);
  
  // Calculate progress
  const calculateProgress = (): number => {
    if (!examData) return 0;
    
    const answeredQuestions = Object.values(answers).filter(a => a !== -1).length;
    return Math.floor((answeredQuestions / examData.questions.length) * 100);
  };
  
  // Handle answer selection
  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex,
    }));
    
    // Save progress after answer selection
    if (user && examId) {
      saveExamProgress(user.id, examId, {
        currentQuestion,
        answers: { ...answers, [questionId]: optionIndex },
        timeRemaining: timeLeft,
        startedAt: examStartedAt
      });
    }
  };
  
  // Navigate to next question
  const handleNextQuestion = () => {
    if (!examData) return;
    
    if (currentQuestion < examData.questions.length - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      
      // Save current question in progress
      if (user && examId) {
        saveExamProgress(user.id, examId, {
          currentQuestion: nextQuestion,
          answers,
          timeRemaining: timeLeft,
          startedAt: examStartedAt
        });
      }
    }
  };
  
  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      const prevQuestion = currentQuestion - 1;
      setCurrentQuestion(prevQuestion);
      
      // Save current question in progress
      if (user && examId) {
        saveExamProgress(user.id, examId, {
          currentQuestion: prevQuestion,
          answers,
          timeRemaining: timeLeft,
          startedAt: examStartedAt
        });
      }
    }
  };
  
  // Submit exam
  const handleSubmitExam = async () => {
    if (!examData || !user || !examId) return;
    
    // Check if all questions are answered
    const unansweredCount = Object.values(answers).filter(a => a === -1).length;
    if (unansweredCount > 0 && !isSubmitting) {
      // Ask for confirmation
      if (!window.confirm(`You have ${unansweredCount} unanswered ${unansweredCount === 1 ? 'question' : 'questions'}. Are you sure you want to submit?`)) {
        return;
      }
    }
    
    // Clean up timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (saveProgressInterval.current) {
      clearInterval(saveProgressInterval.current);
    }
    
    setIsSubmitting(true);
    
    try {
      // Filter out unanswered questions
      const finalAnswers: Record<string, number> = {};
      for (const [questionId, answer] of Object.entries(answers)) {
        if (answer !== -1) {
          finalAnswers[questionId] = answer;
        }
      }
      
      await submitExam(examId, user.id, finalAnswers, examStartedAt);
      
      toast.success("Exam submitted successfully!");
      navigate(`/results/${examId}`);
    } catch (error) {
      toast.error("Failed to submit exam. Please try again.");
      setIsSubmitting(false);
      
      // Restart timer if submission fails
      if (timeLeft && timeLeft > 0) {
        timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev === null || prev <= 0) {
              if (timerRef.current) clearInterval(timerRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }
  };
  
  // Navigate to specific question
  const handleQuestionNavigation = (index: number) => {
    setCurrentQuestion(index);
    
    // Save current question in progress
    if (user && examId) {
      saveExamProgress(user.id, examId, {
        currentQuestion: index,
        answers,
        timeRemaining: timeLeft,
        startedAt: examStartedAt
      });
    }
  };
  
  if (isLoading || !examData) {
    return (
      <DashboardLayout title="Loading Exam" subtitle="Please wait while we prepare your exam...">
        <div className="flex justify-center py-16">
          <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-primary animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  const currentQ = examData.questions[currentQuestion];

  return (
    <DashboardLayout title={examData.title} subtitle={examData.description}>
      {/* Exam Info Bar */}
      <div className="sticky top-16 z-10 bg-background/80 backdrop-blur-md border-b border-border mb-8 -mx-4 px-4 py-3">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="bg-secondary text-secondary-foreground text-sm font-medium px-3 py-1 rounded-full">
              Question {currentQuestion + 1} of {examData.questions.length}
            </div>
            <div className="text-sm">
              Progress: <span className="font-medium">{calculateProgress()}%</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`text-sm font-medium ${timeLeft && timeLeft < 300 ? "text-destructive animate-pulse" : ""}`}>
              Time Remaining: {timeLeft !== null ? formatTimeMMSS(timeLeft) : "00:00"}
            </div>
            
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleSubmitExam}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Exam"}
            </Button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3">
          <Progress value={calculateProgress()} className="h-1.5" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Question Navigation Sidebar */}
        <div className="md:col-span-1 order-2 md:order-1">
          <div className="sticky top-40">
            <Card className="p-4 mb-4">
              <h3 className="text-sm font-medium mb-3">Question Navigator</h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-4 gap-2">
                {examData.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionNavigation(index)}
                    className={`
                      w-full aspect-square flex items-center justify-center rounded border text-sm font-medium
                      ${currentQuestion === index 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : answers[examData.questions[index].id] !== -1
                          ? "bg-secondary text-secondary-foreground border-secondary"
                          : "bg-background border-input text-muted-foreground hover:border-primary/50"}
                    `}
                    aria-label={`Go to question ${index + 1}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-primary rounded-sm mr-2"></div>
                  <span>Current Question</span>
                </div>
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-secondary rounded-sm mr-2"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-background rounded-sm border border-input mr-2"></div>
                  <span>Unanswered</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
        
        {/* Question Area */}
        <div className="md:col-span-3 order-1 md:order-2">
          <Card variant="default" className="p-8 mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-medium mb-4">
                    {currentQuestion + 1}. {currentQ.text}
                  </h3>
                  
                  <div className="space-y-3">
                    {currentQ.options.map((option, index) => (
                      <div 
                        key={index}
                        onClick={() => handleSelectAnswer(currentQ.id, index)}
                        className={`
                          flex items-center p-4 rounded-lg border cursor-pointer transition-all
                          ${answers[currentQ.id] === index 
                            ? "border-primary bg-primary/5 shadow" 
                            : "border-input hover:border-primary/50 hover:bg-secondary"}
                        `}
                      >
                        <div 
                          className={`
                            w-5 h-5 rounded-full border flex items-center justify-center mr-3
                            ${answers[currentQ.id] === index 
                              ? "border-primary bg-primary text-white" 
                              : "border-input"}
                          `}
                        >
                          {answers[currentQ.id] === index && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M8.5 2.5L3.5 7.5L1.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <span>{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </Card>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            
            <Button 
              onClick={handleNextQuestion}
              disabled={currentQuestion === examData.questions.length - 1}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ExamPage;
