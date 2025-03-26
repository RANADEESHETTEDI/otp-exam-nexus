
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui-custom/Card";
import { Button } from "@/components/ui-custom/Button";
import { getCurrentUser } from "@/lib/auth";
import { toast } from "sonner";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

// Mock reports data
const mockExamResults = [
  { name: "Web Development", avgScore: 78, students: 24, pass: 21, fail: 3 },
  { name: "Database Management", avgScore: 82, students: 22, pass: 20, fail: 2 },
  { name: "Data Structures", avgScore: 65, students: 26, pass: 18, fail: 8 },
  { name: "Artificial Intelligence", avgScore: 72, students: 20, pass: 16, fail: 4 },
  { name: "Mobile Development", avgScore: 85, students: 18, pass: 17, fail: 1 },
];

const mockPerformanceTrend = [
  { month: "Jan", avgScore: 72 },
  { month: "Feb", avgScore: 74 },
  { month: "Mar", avgScore: 69 },
  { month: "Apr", avgScore: 75 },
  { month: "May", avgScore: 78 },
  { month: "Jun", avgScore: 74 },
  { month: "Jul", avgScore: 80 },
  { month: "Aug", avgScore: 82 },
];

const mockGradeDistribution = [
  { grade: "A", count: 32, percentage: 24 },
  { grade: "B", count: 45, percentage: 34 },
  { grade: "C", count: 30, percentage: 22 },
  { grade: "D", count: 18, percentage: 13 },
  { grade: "F", count: 9, percentage: 7 },
];

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE"];

const Reports = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'exams' | 'students'>('overview');
  
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
    
    // Simulate loading data
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, [user, navigate]);
  
  if (isLoading) {
    return (
      <DashboardLayout title="Reports & Analytics" subtitle="Loading report data...">
        <div className="flex justify-center py-16">
          <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-primary animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Reports & Analytics"
      subtitle="Analyze student performance and track progress"
    >
      {/* Tab Navigation */}
      <div className="flex mb-8 border-b">
        <button
          className={`px-4 py-3 font-medium transition-colors relative ${
            selectedTab === 'overview'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setSelectedTab('overview')}
        >
          Overview
          {selectedTab === 'overview' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          className={`px-4 py-3 font-medium transition-colors relative ${
            selectedTab === 'exams'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setSelectedTab('exams')}
        >
          Exam Analytics
          {selectedTab === 'exams' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          className={`px-4 py-3 font-medium transition-colors relative ${
            selectedTab === 'students'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setSelectedTab('students')}
        >
          Student Performance
          {selectedTab === 'students' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>
      
      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div>
          {/* Performance Trend */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Overall Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mockPerformanceTrend}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Average Score']}
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }} 
                    />
                    <Legend />
                    <Bar 
                      dataKey="avgScore" 
                      name="Average Score (%)" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Grade Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockGradeDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="percentage"
                        label={({ grade, percentage }) => `${grade}: ${percentage}%`}
                      >
                        {mockGradeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [`${value}%`, props.payload.grade]}
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-5 gap-2 mt-4">
                  {mockGradeDistribution.map((item, index) => (
                    <div key={index} className="text-center">
                      <div className="w-4 h-4 rounded-full mx-auto mb-1" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <p className="text-xs font-medium">{item.grade}</p>
                      <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Exams Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Exams Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockExamResults.slice(0, 3).map((exam, index) => (
                    <div key={index} className="p-4 bg-secondary/40 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{exam.name}</h4>
                        <span className="text-sm font-medium">
                          {exam.avgScore}% avg
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{exam.students} students</span>
                        <span>{exam.pass} passed, {exam.fail} failed</span>
                      </div>
                      
                      <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${(exam.pass / exam.students) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span>Pass rate: {Math.round((exam.pass / exam.students) * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <Button variant="outline" size="sm" onClick={() => setSelectedTab('exams')}>
                    View All Exams
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-primary">134</h3>
                  <p className="text-sm text-muted-foreground mt-1">Total Students</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-primary">8</h3>
                  <p className="text-sm text-muted-foreground mt-1">Exams Conducted</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-primary">76%</h3>
                  <p className="text-sm text-muted-foreground mt-1">Average Score</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-primary">92%</h3>
                  <p className="text-sm text-muted-foreground mt-1">Pass Rate</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      {/* Exam Analytics Tab */}
      {selectedTab === 'exams' && (
        <div>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Exam Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mockExamResults}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === "avgScore" ? `${value}%` : value,
                        name === "avgScore" ? "Average Score" : name === "pass" ? "Passed" : "Failed"
                      ]}
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }} 
                    />
                    <Legend />
                    <Bar dataKey="avgScore" name="Average Score (%)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Detailed Exam Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-6 py-4 text-left font-medium text-muted-foreground">Exam Name</th>
                      <th className="px-6 py-4 text-left font-medium text-muted-foreground">Students</th>
                      <th className="px-6 py-4 text-left font-medium text-muted-foreground">Avg. Score</th>
                      <th className="px-6 py-4 text-left font-medium text-muted-foreground">Pass Rate</th>
                      <th className="px-6 py-4 text-left font-medium text-muted-foreground">Pass/Fail</th>
                      <th className="px-6 py-4 text-right font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockExamResults.map((exam, index) => (
                      <tr key={index} className="border-b hover:bg-secondary/50 transition-colors">
                        <td className="px-6 py-4 font-medium">{exam.name}</td>
                        <td className="px-6 py-4">{exam.students}</td>
                        <td className="px-6 py-4">{exam.avgScore}%</td>
                        <td className="px-6 py-4">{Math.round((exam.pass / exam.students) * 100)}%</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full" 
                                style={{ width: `${(exam.pass / exam.students) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">
                              {exam.pass}/{exam.fail}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="outline" size="sm">
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Student Performance Tab */}
      {selectedTab === 'students' && (
        <div>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Top Performing Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-6 py-4 text-left font-medium text-muted-foreground">Student</th>
                      <th className="px-6 py-4 text-left font-medium text-muted-foreground">Email</th>
                      <th className="px-6 py-4 text-left font-medium text-muted-foreground">Avg. Score</th>
                      <th className="px-6 py-4 text-left font-medium text-muted-foreground">Exams Taken</th>
                      <th className="px-6 py-4 text-left font-medium text-muted-foreground">Pass Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Mock top students */}
                    {[
                      { name: "Alice Chen", email: "alice.c@example.com", avgScore: 94, examsTaken: 8, passRate: 100 },
                      { name: "Bob Johnson", email: "bob.j@example.com", avgScore: 91, examsTaken: 8, passRate: 100 },
                      { name: "Carol Smith", email: "carol.s@example.com", avgScore: 89, examsTaken: 7, passRate: 100 },
                      { name: "David Kim", email: "david.k@example.com", avgScore: 87, examsTaken: 8, passRate: 88 },
                      { name: "Eva Martinez", email: "eva.m@example.com", avgScore: 85, examsTaken: 8, passRate: 100 },
                    ].map((student, index) => (
                      <tr key={index} className="border-b hover:bg-secondary/50 transition-colors">
                        <td className="px-6 py-4 font-medium">{student.name}</td>
                        <td className="px-6 py-4">{student.email}</td>
                        <td className="px-6 py-4">{student.avgScore}%</td>
                        <td className="px-6 py-4">{student.examsTaken}</td>
                        <td className="px-6 py-4">{student.passRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Students Requiring Attention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-6 py-4 text-left font-medium text-muted-foreground">Student</th>
                      <th className="px-6 py-4 text-left font-medium text-muted-foreground">Email</th>
                      <th className="px-6 py-4 text-left font-medium text-muted-foreground">Avg. Score</th>
                      <th className="px-6 py-4 text-left font-medium text-muted-foreground">Exams Taken</th>
                      <th className="px-6 py-4 text-left font-medium text-muted-foreground">Pass Rate</th>
                      <th className="px-6 py-4 text-right font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Mock students requiring attention */}
                    {[
                      { name: "Frank Wilson", email: "frank.w@example.com", avgScore: 59, examsTaken: 8, passRate: 50 },
                      { name: "Grace Lee", email: "grace.l@example.com", avgScore: 62, examsTaken: 7, passRate: 57 },
                      { name: "Henry Davis", email: "henry.d@example.com", avgScore: 64, examsTaken: 8, passRate: 63 },
                    ].map((student, index) => (
                      <tr key={index} className="border-b hover:bg-secondary/50 transition-colors">
                        <td className="px-6 py-4 font-medium">{student.name}</td>
                        <td className="px-6 py-4">{student.email}</td>
                        <td className="px-6 py-4">{student.avgScore}%</td>
                        <td className="px-6 py-4">{student.examsTaken}</td>
                        <td className="px-6 py-4">{student.passRate}%</td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Reports;
