import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui-custom/Card";
import { Button } from "@/components/ui-custom/Button";
import { getCurrentUser } from "@/lib/auth";
import { getExams, Exam } from "@/lib/exam";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { formatDate } from "@/utils/dateUtils";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (user.role === "admin") {
      navigate("/admin/dashboard");
      return;
    }
    
    const fetchExams = async () => {
      try {
        const data = await getExams();
        setExams(data);
      } catch (error) {
        toast.error("Failed to load exams. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExams();
  }, [user, navigate]);
  
  const upcomingExams = exams.filter(exam => exam.status === "upcoming");
  const activeExams = exams.filter(exam => exam.status === "active");
  const completedExams = exams.filter(exam => exam.status === "completed");
  
  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Loading your exams...">
        <div className="flex justify-center py-16">
          <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-primary animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Student Dashboard"
      subtitle={`Welcome back, ${user?.name || 'Student'}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <StatsCard 
          title="Active Exams" 
          value={activeExams.length.toString()} 
          description="Exams ready to take" 
          variant={activeExams.length > 0 ? "primary" : "default"}
        />
        <StatsCard 
          title="Upcoming Exams" 
          value={upcomingExams.length.toString()} 
          description="Scheduled for later" 
          variant="default"
        />
        <StatsCard 
          title="Completed Exams" 
          value={completedExams.length.toString()} 
          description="Finished assessments" 
          variant="default"
        />
      </div>
      
      <section className="mb-12">
        <h2 className="text-2xl font-medium mb-6">Active Exams</h2>
        
        {activeExams.length === 0 ? (
          <Card variant="outline" className="text-center p-8">
            <p className="text-muted-foreground">No active exams at the moment.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {activeExams.map((exam, index) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                index={index}
                actionLabel="Start Exam"
                actionLink={`/exam/${exam.id}`}
                highlightAction
              />
            ))}
          </div>
        )}
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-medium mb-6">Upcoming Exams</h2>
        
        {upcomingExams.length === 0 ? (
          <Card variant="outline" className="text-center p-8">
            <p className="text-muted-foreground">No upcoming exams scheduled.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {upcomingExams.map((exam, index) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                index={index}
                actionLabel="View Details"
                actionLink={`/dashboard`}
              />
            ))}
          </div>
        )}
      </section>
      
      <section>
        <h2 className="text-2xl font-medium mb-6">Completed Exams</h2>
        
        {completedExams.length === 0 ? (
          <Card variant="outline" className="text-center p-8">
            <p className="text-muted-foreground">You haven't completed any exams yet.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {completedExams.map((exam, index) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                index={index}
                actionLabel="View Results"
                actionLink={`/results/${exam.id}`}
              />
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
};

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  variant?: "default" | "primary";
}

const StatsCard = ({ title, value, description, variant = "default" }: StatsCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <Card 
      className={`h-full ${variant === "primary" ? "border-primary/30 bg-primary/5" : ""}`} 
      hover="scale"
    >
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className={`text-4xl font-bold ${variant === "primary" ? "text-primary" : ""}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  </motion.div>
);

interface ExamCardProps {
  exam: Exam;
  index: number;
  actionLabel: string;
  actionLink: string;
  highlightAction?: boolean;
}

const ExamCard = ({ exam, index, actionLabel, actionLink, highlightAction = false }: ExamCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
  >
    <Card hover={true} className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="flex-1 p-6">
          <div className="mb-2">
            <span className="inline-block text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full">
              {exam.status === "active" 
                ? "In Progress" 
                : exam.status === "upcoming" 
                  ? "Upcoming" 
                  : "Completed"}
            </span>
          </div>
          
          <h3 className="text-xl font-medium mb-1">{exam.title}</h3>
          <p className="text-muted-foreground mb-4">{exam.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Start Time</p>
              <p className="font-medium">{formatDate(exam.startTime)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Duration</p>
              <p className="font-medium">{exam.duration} minutes</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Marks</p>
              <p className="font-medium">{exam.totalMarks}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Questions</p>
              <p className="font-medium">{exam.questions.length}</p>
            </div>
          </div>
          
          <Link to={actionLink}>
            <Button
              variant={highlightAction ? "default" : "outline"}
              size="sm"
            >
              {actionLabel}
            </Button>
          </Link>
        </div>
        
        {exam.status === "active" && (
          <div className="bg-primary/10 w-full md:w-24 flex flex-row md:flex-col items-center justify-center p-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <div className="flex items-center space-x-1">
                <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="font-medium text-primary">Live</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  </motion.div>
);

export default Dashboard;
