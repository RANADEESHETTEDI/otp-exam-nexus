
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui-custom/Input";
import { Button } from "@/components/ui-custom/Button";
import { loginUser } from "@/lib/auth";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { session, profile, isLoading } = useAuth();
  const [email, setEmail] = useState("admin@examportal.com");
  const [password, setPassword] = useState("admin123");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [redirectProgress, setRedirectProgress] = useState(0);

  // Redirect if already logged in
  useEffect(() => {
    if (session && profile && !isLoading) {
      // Start progress animation
      const interval = setInterval(() => {
        setRedirectProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            // Redirect based on role
            if (profile.role === 'admin') {
              navigate("/admin/dashboard", { replace: true });
            } else {
              navigate("/dashboard", { replace: true });
            }
            return 100;
          }
          return prev + 5;
        });
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [session, profile, navigate, isLoading]);

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
    setFormLoading(true);
    
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
      setFormLoading(false);
    }
  };

  // If we're redirecting, show a nice transition
  if (redirectProgress > 0) {
    return (
      <AuthLayout
        title="Admin Portal"
        subtitle="Welcome to the administration dashboard"
      >
        <div className="flex flex-col items-center justify-center py-8">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4"
          >
            <motion.div 
              className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <motion.div 
                className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold"
              >
                A
              </motion.div>
            </motion.div>
          </motion.div>
          
          <h3 className="text-lg font-medium mb-2">
            Welcome, {profile?.name || 'Admin'}!
          </h3>
          <p className="text-muted-foreground mb-6">
            Redirecting to administration dashboard...
          </p>
          
          <div className="w-full bg-secondary rounded-full h-2 mb-4">
            <motion.div 
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${redirectProgress}%` }}
              transition={{ ease: "easeInOut" }}
            />
          </div>
        </div>
      </AuthLayout>
    );
  }

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
          autoComplete="email"
          leftIcon={
            email === "admin@examportal.com" ? 
              <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
              undefined
          }
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
          autoComplete="current-password"
          leftIcon={
            password === "admin123" ? 
              <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
              undefined
          }
        />
        
        <div className="pt-2">
          <Button
            type="submit"
            fullWidth
            loading={formLoading}
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
