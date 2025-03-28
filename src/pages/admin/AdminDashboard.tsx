
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui-custom/Card";
import { Button } from "@/components/ui-custom/Button";
import { getCurrentUser } from "@/lib/auth";
import { getExams, Exam } from "@/lib/exam";
import { toast } from "sonner";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock data for dashboard
  const [stats] = useState({
    totalStudents: 142,
    totalExams: 8,
    examsThisMonth: 3,
    avgScore: 76.4,
  });
  
  // Check authentication
  useEffect(() => {
    if (!user) {
      navigate("/admin/login");
      return;
    }
    
    if (user.role !== "admin") {
      toast.error("You do not have permission to access this page");
      navigate("/login");
      return;
    }
    
    // Fetch exams
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
  
  if (isLoading) {
    return (
      <DashboardLayout title="Admin Dashboard" subtitle="Loading dashboard data...">
        <div className="flex justify-center py-16">
          <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-primary animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle={`Welcome back, ${user?.name || 'Administrator'}`}
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatsCard 
          title="Total Students" 
          value={stats.totalStudents.toString()}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatsCard 
          title="Total Exams" 
          value={stats.totalExams.toString()}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <line x1="10" y1="9" x2="8" y2="9" />
            </svg>
          }
        />
        <StatsCard 
          title="Exams This Month" 
          value={stats.examsThisMonth.toString()}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
        />
        <StatsCard 
          title="Average Score" 
          value={`${stats.avgScore}%`}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          }
        />
      </div>
      
      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="text-2xl font-medium mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <QuickActionCard 
            title="Create Exam"
            description="Create a new assessment for students"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M12 18v-6" />
                <path d="M9 15h6" />
              </svg>
            }
            href="/admin/exams"
          />
          <QuickActionCard 
            title="Manage Users"
            description="Add or modify student accounts"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 12h-4" />
                <path d="M20 10v4" />
              </svg>
            }
            href="/admin/users"
          />
          <QuickActionCard 
            title="Generate Reports"
            description="View detailed performance analytics"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                <line x1="6" y1="6" x2="6" y2="6" />
                <line x1="6" y1="18" x2="6" y2="18" />
              </svg>
            }
            href="/admin/reports"
          />
        </div>
      </div>
      
      {/* Recent Exams */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-medium">Recent Exams</h2>
          <Button variant="outline" size="sm" as={Link} to="/admin/exams">
            View All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {exams.slice(0, 3).map((exam, index) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card hover="true">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 p-6">
                    <div className="mb-2">
                      <span className={`
                        inline-block text-xs font-medium px-2.5 py-1 rounded-full
                        ${exam.status === "active" 
                          ? "bg-green-100 text-green-800" 
                          : exam.status === "upcoming" 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-gray-100 text-gray-800"}
                      `}>
                        {exam.status === "active" 
                          ? "Active" 
                          : exam.status === "upcoming" 
                            ? "Upcoming" 
                            : "Completed"}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-medium mb-1">{exam.title}</h3>
                    <p className="text-muted-foreground mb-4">{exam.description}</p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Duration</p>
                        <p className="font-medium">{exam.duration} minutes</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Questions</p>
                        <p className="font-medium">{exam.questions.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Total Marks</p>
                        <p className="font-medium">{exam.totalMarks}</p>
                      </div>
                    </div>
                    
                    <Button
                      as={Link}
                      to={`/admin/exams?id=${exam.id}`}
                      variant="outline"
                      size="sm"
                    >
                      Manage Exam
                    </Button>
                  </div>
                  
                  {exam.status === "active" && (
                    <div className="bg-primary/10 w-full md:w-24 flex flex-row md:flex-col items-center justify-center p-4">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                        <div className="flex items-center space-x-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          <span className="font-medium text-green-600">Live</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const StatsCard = ({ title, value, icon }: StatsCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <Card className="h-full" hover="scale">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className="p-2 bg-primary/10 rounded-full text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Quick Action Card Component
interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

const QuickActionCard = ({ title, description, icon, href }: QuickActionCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    whileHover={{ scale: 1.02 }}
  >
    <Link to={href}>
      <Card className="h-full hover:shadow-md transition-all duration-300 border-primary/10">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-primary/10 rounded-full text-primary shrink-0">
              {icon}
            </div>
            <div>
              <h3 className="font-medium mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  </motion.div>
);

export default AdminDashboard;
