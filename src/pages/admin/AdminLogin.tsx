
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui-custom/Input";
import { Button } from "@/components/ui-custom/Button";
import { loginUser } from "@/lib/auth";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { session, profile } = useAuth();
  const [email, setEmail] = useState("admin@examportal.com");
  const [password, setPassword] = useState("admin123");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({ email: "", password: "" });
    
    // Validate form
    let hasError = false;
    
    if (!email) {
      setErrors(prev => ({ ...prev, email: "Email is required" }));
      hasError = true;
    } else if (!email.includes('admin')) {
      setErrors(prev => ({ ...prev, email: "Please use an admin email address" }));
      hasError = true;
    }
    
    if (!password) {
      setErrors(prev => ({ ...prev, password: "Password is required" }));
      hasError = true;
    }
    
    if (hasError) return;
    
    // Submit form
    setIsLoading(true);
    
    try {
      const result = await loginUser(email, password);
      
      if (result.success) {
        toast.success("Login successful");
        // Navigation will be handled by the auth state change in useEffect
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
      title="Admin Login"
      subtitle="Access the administration portal"
    >
      <Alert className="mb-4 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800">
        <div className="flex items-start">
          <InfoIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
          <AlertDescription className="text-sm text-blue-700 dark:text-blue-300">
            Use the default admin credentials:<br />
            <strong>Email:</strong> admin@examportal.com<br />
            <strong>Password:</strong> admin123
          </AlertDescription>
        </div>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Admin Email"
          type="email"
          id="email"
          placeholder="admin@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          animate
        />
        
        <Input
          label="Password"
          type="password"
          id="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          animate
        />
        
        <div className="pt-2">
          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            className="mt-2"
          >
            Sign In
          </Button>
        </div>
        
        <div className="text-center text-sm">
          <Link to="/login" className="text-primary hover:underline font-medium">
            Return to student login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default AdminLogin;
