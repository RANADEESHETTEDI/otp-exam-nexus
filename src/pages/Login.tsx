
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui-custom/Input";
import { Button } from "@/components/ui-custom/Button";
import { loginUser } from "@/lib/auth";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const { session, profile, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [redirectProgress, setRedirectProgress] = useState(0);
  const [loginAttempted, setLoginAttempted] = useState(false);

  console.log("Login render:", { session: !!session, profile, isLoading, loginAttempted });

  // Redirect if already logged in
  useEffect(() => {
    if (session && profile && !isLoading) {
      console.log("Logged in, redirecting...", { profile, session });
      // Start progress animation
      const interval = setInterval(() => {
        setRedirectProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            // Redirect based on role with replace to prevent going back to login
            const redirectPath = profile.role === 'admin' ? "/admin/dashboard" : "/dashboard";
            console.log("Redirecting to:", redirectPath);
            navigate(redirectPath, { replace: true });
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
    }
    
    if (!password) {
      setErrors(prev => ({ ...prev, password: "Password is required" }));
      hasError = true;
    }
    
    if (hasError) return;
    
    // Submit form
    setFormLoading(true);
    
    try {
      setLoginAttempted(true);
      console.log("Submitting login form:", { email });
      const result = await loginUser(email, password);
      
      if (result.success) {
        toast.success("Login successful");
        console.log("Login successful, waiting for auth state to update...");
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
      console.error("Login error:", error);
      toast.error(error.message || "An unexpected error occurred. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  // If we're redirecting, show a nice transition
  if (redirectProgress > 0) {
    return (
      <AuthLayout
        title="Welcome Back"
        subtitle="Signing you in..."
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
                {profile?.role === 'admin' ? 'A' : 'S'}
              </motion.div>
            </motion.div>
          </motion.div>
          
          <h3 className="text-lg font-medium mb-2">
            Welcome, {profile?.name || 'User'}!
          </h3>
          <p className="text-muted-foreground mb-6">
            Redirecting to your {profile?.role === 'admin' ? 'admin' : 'student'} dashboard...
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
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
            loading={formLoading}
            className="mt-2"
          >
            Sign In
          </Button>
        </div>
        
        <div className="text-center text-sm">
          <span className="text-muted-foreground">
            Don't have an account?{" "}
          </span>
          <Link to="/register" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </div>
      </form>
      
      <div className="mt-6 pt-4 border-t text-center">
        <Link 
          to="/admin/login" 
          className="text-sm text-muted-foreground hover:text-foreground transition"
        >
          Sign in as administrator
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Login;
