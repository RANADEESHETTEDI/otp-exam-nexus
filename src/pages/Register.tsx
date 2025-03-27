
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui-custom/Input";
import { Button } from "@/components/ui-custom/Button";
import { registerUser } from "@/lib/auth";
import { getColleges } from "@/lib/exam";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const Register = () => {
  const navigate = useNavigate();
  const { session, profile } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [colleges, setColleges] = useState<{ id: string; name: string; code: string }[]>([]);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    college: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingColleges, setLoadingColleges] = useState(true);

  // Redirect if already logged in
  useEffect(() => {
    if (session && profile) {
      if (profile.role === 'admin') {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [session, profile, navigate]);

  // Fetch colleges
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoadingColleges(true);
        const collegeData = await getColleges();
        setColleges(collegeData);
      } catch (error) {
        console.error("Error fetching colleges:", error);
        toast.error("Failed to load colleges. Please try again later.");
      } finally {
        setLoadingColleges(false);
      }
    };

    fetchColleges();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      college: ""
    });
    
    // Validate form
    let hasError = false;
    
    if (!name) {
      setErrors(prev => ({ ...prev, name: "Full name is required" }));
      hasError = true;
    }
    
    if (!email) {
      setErrors(prev => ({ ...prev, email: "Email is required" }));
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
      hasError = true;
    }
    
    if (!password) {
      setErrors(prev => ({ ...prev, password: "Password is required" }));
      hasError = true;
    } else if (password.length < 6) {
      setErrors(prev => ({ ...prev, password: "Password must be at least 6 characters" }));
      hasError = true;
    }
    
    if (password !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
      hasError = true;
    }
    
    if (!collegeId) {
      setErrors(prev => ({ ...prev, college: "Please select your college" }));
      hasError = true;
    }
    
    if (hasError) return;
    
    // Submit form
    setIsLoading(true);
    
    try {
      const result = await registerUser(email, password, name, collegeId);
      
      if (result.success) {
        toast.success(result.message);
        navigate("/login");
      } else {
        if (result.message.includes("email")) {
          setErrors(prev => ({ ...prev, email: result.message }));
        } else if (result.message.includes("password")) {
          setErrors(prev => ({ ...prev, password: result.message }));
        } else {
          toast.error(result.message);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create an Account"
      subtitle="Join our platform to access exams and resources"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          id="name"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          animate
        />
        
        <Input
          label="Email Address"
          type="email"
          id="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          animate
        />
        
        <div className="space-y-1">
          <label htmlFor="college" className="block text-sm font-medium">
            College
          </label>
          <Select
            value={collegeId}
            onValueChange={setCollegeId}
            disabled={loadingColleges}
          >
            <SelectTrigger id="college" className={errors.college ? "border-destructive" : ""}>
              <SelectValue placeholder={loadingColleges ? "Loading colleges..." : "Select your college"} />
            </SelectTrigger>
            <SelectContent>
              {colleges.map((college) => (
                <SelectItem key={college.id} value={college.id}>
                  {college.name} ({college.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.college && (
            <p className="text-sm font-medium text-destructive mt-1">{errors.college}</p>
          )}
        </div>
        
        <Input
          label="Password"
          type="password"
          id="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          animate
        />
        
        <Input
          label="Confirm Password"
          type="password"
          id="confirmPassword"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          animate
        />
        
        <div className="pt-2">
          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            className="mt-2"
          >
            Create Account
          </Button>
        </div>
        
        <div className="text-center text-sm">
          <span className="text-muted-foreground">
            Already have an account?{" "}
          </span>
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;
