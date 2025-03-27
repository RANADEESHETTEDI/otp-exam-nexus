
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui-custom/Card";
import { Button } from "@/components/ui-custom/Button";
import { Progress } from "@/components/ui/progress";
import { getCurrentUser } from "@/lib/auth";
import { getExamById, getSubmission } from "@/lib/exam";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { formatDate, calculateTimeDifference } from "@/utils/dateUtils";

const Results = () => {
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();
  const user = getCurrentUser();
  
  const [isLoading, setIsLoading] = useState(true);
  const [examData, setExamData] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  
  // Check authentication
  useEffect(() => {
    if (!user) {
      toast.error("Please log in to view results");
      navigate("/login");
      return;
    }
    
    if (!examId) {
      toast.error("No exam selected");
      navigate("/dashboard");
      return;
    }
    
    // Fetch exam and submission data
    const fetchData = async () => {
      try {
        const [exam, submissionData] = await Promise.all([
          getExamById(examId),
          getSubmission(user.id, examId)
        ]);
        
        if (!exam) {
          toast.error("Exam not found");
          navigate("/dashboard");
          return;
        }
        
        if (!submissionData) {
          toast.error("No submission found for this exam");
          navigate("/dashboard");
          return;
        }
        
        setExamData(exam);
        setSubmission(submissionData);
      } catch (error) {
        toast.error("Failed to load results. Please try again.");
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, examId, navigate]);
  
  if (isLoading || !examData || !submission) {
    return (
      <DashboardLayout title="Loading Results" subtitle="Please wait while we prepare your results...">
        <div className="flex justify-center py-16">
          <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-primary animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }
  
  // Get score color based on percentage
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-blue-600";
    if (percentage >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <DashboardLayout
      title="Exam Results"
      subtitle={examData.title}
    >
      {/* Results Summary */}
      <div className="max-w-4xl mx-auto mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card variant="glass" className="p-8 text-center">
            <div className="mb-6">
              <div className="relative inline-block">
                <svg viewBox="0 0 36 36" className="w-32 h-32 transform scale-110">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f0f0f0"
                    strokeWidth="3"
                    strokeDasharray="100, 100"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="3"
                    strokeDasharray={`${submission.percentage}, 100`}
                    className="animate-pulse-glow"
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <span className={`text-4xl font-bold ${getScoreColor(submission.percentage)}`}>
                    {submission.percentage}%
                  </span>
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold mb-2">
              {submission.percentage >= 60 ? "Congratulations!" : "Almost there!"}
            </h2>
            
            <p className="text-lg text-muted-foreground mb-6">
              You scored <span className="font-medium">{submission.score} out of {submission.totalMarks}</span> points
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Submitted On</p>
                <p className="font-medium">{formatDate(submission.submittedAt)}</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Time Taken</p>
                <p className="font-medium">{calculateTimeDifference(submission.startedAt, submission.submittedAt)}</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Questions Answered</p>
                <p className="font-medium">
                  {Object.keys(submission.answers).length} of {examData.questions.length}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
      
      {/* Detailed Results */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Detailed Analysis</h2>
        
        <div className="space-y-6">
          {examData.questions.map((question: any, index: number) => {
            const userAnswer = submission.answers[question.id];
            const isCorrect = userAnswer === question.correctOption;
            const isUnanswered = userAnswer === undefined;
            
            return (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card 
                  className={`
                    border-l-4 
                    ${isUnanswered ? "border-l-muted" : isCorrect ? "border-l-green-500" : "border-l-red-500"}
                  `}
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-medium flex items-start">
                      <span className="mr-2">{index + 1}.</span> 
                      <span>{question.text}</span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {question.options.map((option: string, optIndex: number) => (
                        <div 
                          key={optIndex}
                          className={`
                            p-3 rounded-lg border text-sm
                            ${optIndex === question.correctOption ? "bg-green-50 border-green-200" : ""}
                            ${!isUnanswered && userAnswer === optIndex && !isCorrect ? "bg-red-50 border-red-200" : ""}
                          `}
                        >
                          <div className="flex items-center">
                            <div className="w-6 h-6 flex items-center justify-center mr-2">
                              {optIndex === question.correctOption ? (
                                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (!isUnanswered && userAnswer === optIndex) ? (
                                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              ) : (
                                <span className="w-5 h-5 rounded-full border border-muted flex items-center justify-center text-xs">
                                  {String.fromCharCode(65 + optIndex)}
                                </span>
                              )}
                            </div>
                            {option}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-sm">
                      {isUnanswered ? (
                        <p className="text-muted-foreground">
                          You did not answer this question.
                        </p>
                      ) : isCorrect ? (
                        <p className="text-green-600">
                          Correct! You earned {question.marks} points.
                        </p>
                      ) : (
                        <p className="text-red-600">
                          Incorrect. The correct answer is option {String.fromCharCode(65 + question.correctOption)}.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
        
        <div className="mt-8 text-center">
          <Button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Results;
