
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui-custom/Input";
import { Button } from "@/components/ui-custom/Button";
import { loginUser } from "@/lib/auth";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    
    try {
      const result = await loginUser(email, password);
      
      if (result.success) {
        toast.success(result.message);
        navigate("/verify-otp", { state: { email } });
      } else {
        if (result.message.includes("email")) {
          setErrors(prev => ({ ...prev, email: result.message }));
        } else if (result.message.includes("password")) {
          setErrors(prev => ({ ...prev, password: result.message }));
        } else {
          toast.error(result.message);
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
            loading={isLoading}
            className="mt-2"
          >
            Continue
          </Button>
        </div>
        
        <div className="text-center text-sm">
          <span className="text-muted-foreground">
            Don't have an account?{" "}
          </span>
          <Link to="/login" className="text-primary hover:underline font-medium">
            Contact administrator
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
