
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui-custom/Card";
import { Input } from "@/components/ui-custom/Input";
import { Button } from "@/components/ui-custom/Button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getColleges, College } from "@/lib/exam";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const ExamCreation = () => {
  const navigate = useNavigate();
  const { profile, isLoading } = useAuth();
  
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(60);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<string>("");
  const [collegesLoading, setCollegesLoading] = useState(true);

  useEffect(() => {
    // Admin check
    if (profile && profile.role !== 'admin' && !isLoading) {
      navigate('/dashboard');
      toast.error("You don't have permission to access this page");
    }
    
    // Fetch colleges
    const fetchColleges = async () => {
      try {
        setCollegesLoading(true);
        const collegeList = await getColleges();
        setColleges(collegeList);
        
        // Set default college if any
        if (collegeList.length > 0) {
          setSelectedCollege(collegeList[0].id);
        }
      } catch (err) {
        console.error("Error fetching colleges:", err);
        toast.error("Failed to load colleges");
      } finally {
        setCollegesLoading(false);
      }
    };
    
    fetchColleges();
  }, [profile, navigate, isLoading]);

  const validateForm = () => {
    if (!title.trim()) {
      setError("Title is required");
      return false;
    }
    
    if (!startTime) {
      setError("Start time is required");
      return false;
    }
    
    if (!endTime) {
      setError("End time is required");
      return false;
    }
    
    if (new Date(startTime) >= new Date(endTime)) {
      setError("End time must be after start time");
      return false;
    }
    
    if (!selectedCollege) {
      setError("Please select a college");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) return;
    
    if (!profile) {
      toast.error("You must be logged in to create an exam");
      return;
    }
    
    setLoading(true);
    
    try {
      // Create exam in Supabase
      const { data: exam, error } = await supabase
        .from('exams')
        .insert({
          title,
          duration,
          start_time: startTime,
          end_time: endTime,
          created_by: profile.id,
          college_id: selectedCollege
        })
        .select('*')
        .single();
      
      if (error) {
        throw error;
      }
      
      toast.success("Exam created successfully!");
      
      // Reset form
      setTitle("");
      setDuration(60);
      setStartTime("");
      setEndTime("");
      setSelectedCollege(colleges.length > 0 ? colleges[0].id : "");
      
    } catch (err: any) {
      console.error("Error creating exam:", err);
      setError(err.message || "Failed to create exam");
      toast.error("Failed to create exam");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Create New Exam</h1>
        
        <Card className="max-w-3xl mx-auto">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Exam Details</h2>
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Exam Title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter exam title"
                required
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Duration (minutes)"
                  type="number"
                  min={10}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  required
                />
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium">College</label>
                  {collegesLoading ? (
                    <div className="flex items-center space-x-2 h-10 px-3 py-2 border rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading colleges...</span>
                    </div>
                  ) : (
                    <Select 
                      value={selectedCollege} 
                      onValueChange={setSelectedCollege}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select college" />
                      </SelectTrigger>
                      <SelectContent>
                        {colleges.map((college) => (
                          <SelectItem key={college.id} value={college.id}>
                            {college.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Start Time"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
                
                <Input
                  label="End Time"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
              
              <div className="pt-4">
                <Button
                  type="submit"
                  loading={loading}
                  fullWidth
                >
                  Create Exam
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ExamCreation;
