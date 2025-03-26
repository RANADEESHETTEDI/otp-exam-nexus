import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui-custom/Card";
import { Button } from "@/components/ui-custom/Button";
import { Input } from "@/components/ui-custom/Input";
import { getCurrentUser } from "@/lib/auth";
import { getExams, Exam } from "@/lib/exam";
import { toast } from "sonner";
import { motion } from "framer-motion";

const ExamCreation = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'exams' | 'create'>('exams');
  const [searchTerm, setSearchTerm] = useState("");
  
  const [newExam, setNewExam] = useState({
    title: "",
    description: "",
    duration: 60,
    startDate: "",
    startTime: "",
    questions: [] as { text: string; options: string[]; correctOption: number; marks: number }[]
  });
  
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    options: ["", "", "", ""],
    correctOption: 0,
    marks: 10
  });
  
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
  
  const filteredExams = exams.filter(exam => {
    const searchLower = searchTerm.toLowerCase();
    return (
      exam.title.toLowerCase().includes(searchLower) ||
      exam.description.toLowerCase().includes(searchLower) ||
      exam.status.toLowerCase().includes(searchLower)
    );
  });
  
  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };
  
  const handleAddQuestion = () => {
    if (!newQuestion.text.trim()) {
      toast.error("Question text is required");
      return;
    }
    
    if (newQuestion.options.some(opt => !opt.trim())) {
      toast.error("All options must be filled");
      return;
    }
    
    setNewExam({
      ...newExam,
      questions: [...newExam.questions, { ...newQuestion }]
    });
    
    setNewQuestion({
      text: "",
      options: ["", "", "", ""],
      correctOption: 0,
      marks: 10
    });
    
    toast.success("Question added to exam");
  };
  
  const handleRemoveQuestion = (index: number) => {
    const updatedQuestions = [...newExam.questions];
    updatedQuestions.splice(index, 1);
    setNewExam({ ...newExam, questions: updatedQuestions });
    toast.success("Question removed");
  };
  
  const handleCreateExam = () => {
    if (!newExam.title.trim()) {
      toast.error("Exam title is required");
      return;
    }
    
    if (!newExam.description.trim()) {
      toast.error("Exam description is required");
      return;
    }
    
    if (!newExam.startDate || !newExam.startTime) {
      toast.error("Start date and time are required");
      return;
    }
    
    if (newExam.questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }
    
    const startDateTime = new Date(`${newExam.startDate}T${newExam.startTime}`);
    const endDateTime = new Date(startDateTime.getTime() + newExam.duration * 60000);
    
    const totalMarks = newExam.questions.reduce((sum, q) => sum + q.marks, 0);
    
    const newExamData: Exam = {
      id: `exam-${Math.floor(Math.random() * 1000)}`,
      title: newExam.title,
      description: newExam.description,
      duration: newExam.duration,
      totalMarks,
      questions: newExam.questions.map((q, index) => ({
        id: `q${index + 1}`,
        text: q.text,
        options: q.options,
        correctOption: q.correctOption,
        marks: q.marks
      })),
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      status: 'upcoming'
    };
    
    setExams([newExamData, ...exams]);
    
    setNewExam({
      title: "",
      description: "",
      duration: 60,
      startDate: "",
      startTime: "",
      questions: []
    });
    
    setActiveTab('exams');
    toast.success("New exam created successfully");
  };
  
  const handleDeleteExam = (examId: string) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      setExams(prev => prev.filter(exam => exam.id !== examId));
      toast.success("Exam deleted successfully");
    }
  };
  
  const handleChangeStatus = (examId: string, newStatus: 'upcoming' | 'active' | 'completed') => {
    setExams(prev => 
      prev.map(exam => 
        exam.id === examId 
          ? { ...exam, status: newStatus } 
          : exam
      )
    );
    
    const statusText = newStatus === 'active' ? 'activated' : 
                       newStatus === 'completed' ? 'marked as completed' : 
                       'scheduled';
    
    toast.success(`Exam ${statusText} successfully`);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Exam Management" subtitle="Loading exams...">
        <div className="flex justify-center py-16">
          <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-primary animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Exam Management"
      subtitle="Create and manage assessments"
    >
      <div className="flex mb-8 border-b">
        <button
          className={`px-4 py-3 font-medium transition-colors relative ${
            activeTab === 'exams'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('exams')}
        >
          All Exams
          {activeTab === 'exams' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
            />
          )}
        </button>
        <button
          className={`px-4 py-3 font-medium transition-colors relative ${
            activeTab === 'create'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('create')}
        >
          Create New Exam
          {activeTab === 'create' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
            />
          )}
        </button>
      </div>
      
      {activeTab === 'exams' && (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="w-full sm:w-auto sm:min-w-[300px]">
              <Input
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button onClick={() => setActiveTab('create')}>
              Create New Exam
            </Button>
          </div>
          
          {filteredExams.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No exams found</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredExams.map((exam, index) => (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card hover={true}>
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
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
                          <h3 className="text-xl font-medium mt-2">{exam.title}</h3>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {exam.status !== 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleChangeStatus(exam.id, 'active')}
                            >
                              Activate
                            </Button>
                          )}
                          
                          {exam.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleChangeStatus(exam.id, 'completed')}
                            >
                              Mark Completed
                            </Button>
                          )}
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteExam(exam.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">{exam.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Start Time</p>
                          <p className="font-medium">{formatDate(exam.startTime)}</p>
                        </div>
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
                      
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-medium text-primary hover:underline">
                          View Questions ({exam.questions.length})
                        </summary>
                        <div className="mt-4 pl-4 border-l space-y-4">
                          {exam.questions.map((q, qIndex) => (
                            <div key={q.id} className="p-4 bg-secondary/50 rounded-lg">
                              <p className="font-medium mb-2">
                                {qIndex + 1}. {q.text} <span className="text-muted-foreground text-sm">({q.marks} marks)</span>
                              </p>
                              <ol className="list-alpha pl-5 space-y-1">
                                {q.options.map((opt, oIndex) => (
                                  <li key={oIndex} className={oIndex === q.correctOption ? "text-green-600 font-medium" : ""}>
                                    {opt} {oIndex === q.correctOption && "(Correct)"}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'create' && (
        <div>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Exam Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Exam Title"
                value={newExam.title}
                onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                placeholder="Enter exam title"
              />
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Exam Description</label>
                <textarea
                  value={newExam.description}
                  onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
                  placeholder="Describe the exam purpose and content"
                  className="w-full rounded-lg border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/80 min-h-[100px]"
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Duration (minutes)"
                  type="number"
                  value={newExam.duration.toString()}
                  onChange={(e) => setNewExam({ ...newExam, duration: Number(e.target.value) })}
                  min="5"
                  max="240"
                />
                
                <Input
                  label="Start Date"
                  type="date"
                  value={newExam.startDate}
                  onChange={(e) => setNewExam({ ...newExam, startDate: e.target.value })}
                />
                
                <Input
                  label="Start Time"
                  type="time"
                  value={newExam.startTime}
                  onChange={(e) => setNewExam({ ...newExam, startTime: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Questions</CardTitle>
            </CardHeader>
            <CardContent>
              {newExam.questions.length > 0 ? (
                <div className="mb-6 space-y-4">
                  {newExam.questions.map((question, index) => (
                    <div key={index} className="bg-secondary/50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">
                          {index + 1}. {question.text} 
                          <span className="ml-2 text-sm text-muted-foreground">
                            ({question.marks} marks)
                          </span>
                        </h4>
                        <button
                          onClick={() => handleRemoveQuestion(index)}
                          className="text-destructive hover:text-destructive/80 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <ol className="list-alpha pl-5 mt-2">
                        {question.options.map((opt, optIndex) => (
                          <li key={optIndex} className={optIndex === question.correctOption ? "text-green-600 font-medium" : ""}>
                            {opt} {optIndex === question.correctOption && "(Correct)"}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4 mb-4">
                  No questions added yet. Add your first question below.
                </p>
              )}
              
              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Add New Question</h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Question Text</label>
                    <textarea
                      value={newQuestion.text}
                      onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                      placeholder="Enter the question"
                      className="w-full rounded-lg border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/80"
                    ></textarea>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-medium">Options</label>
                    {newQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="radio"
                          id={`option-${index}`}
                          name="correctOption"
                          checked={newQuestion.correctOption === index}
                          onChange={() => setNewQuestion({ ...newQuestion, correctOption: index })}
                          className="accent-primary"
                        />
                        <label htmlFor={`option-${index}`} className="text-sm min-w-[70px]">
                          Option {String.fromCharCode(65 + index)}:
                        </label>
                        <Input
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          className="flex-1"
                        />
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground">
                      Select the radio button next to the correct option
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Marks"
                      type="number"
                      value={newQuestion.marks.toString()}
                      onChange={(e) => setNewQuestion({ ...newQuestion, marks: Number(e.target.value) })}
                      min="1"
                      max="100"
                    />
                  </div>
                  
                  <div className="pt-2">
                    <Button onClick={handleAddQuestion}>
                      Add Question
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveTab('exams')}>
              Cancel
            </Button>
            
            <Button 
              onClick={handleCreateExam}
              disabled={!newExam.title || !newExam.description || newExam.questions.length === 0}
            >
              Create Exam
            </Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ExamCreation;
