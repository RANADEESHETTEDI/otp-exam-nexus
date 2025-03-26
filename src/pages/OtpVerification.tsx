
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui-custom/Button";
import { verifyOtp } from "@/lib/auth";
import { toast } from "sonner";
import { motion } from "framer-motion";

const OtpVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Get email from location state
  const email = location.state?.email || "";
  
  // If no email, redirect to login
  useEffect(() => {
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);
  
  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);
  
  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    
    // Take only the last character if multiple characters are pasted
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  // Handle key press
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Allow arrow keys to navigate
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  // Handle paste event
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    
    // Check if pasted data is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      
      // Focus last input
      inputRefs.current[5]?.focus();
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpString = otp.join("");
    
    if (otpString.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await verifyOtp(otpString);
      
      if (result.success) {
        toast.success(result.message);
        
        // Redirect based on user role
        if (result.user?.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle resend OTP
  const handleResendOtp = () => {
    // Reset timer
    setTimeLeft(60);
    toast.success("A new OTP has been sent to your email");
  };

  return (
    <AuthLayout
      title="OTP Verification"
      subtitle={`Enter the 6-digit code sent to ${email}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center space-x-2">
          {otp.map((digit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <input
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-14 text-center text-lg font-medium bg-secondary border border-input rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none"
                autoFocus={index === 0}
              />
            </motion.div>
          ))}
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          {timeLeft > 0 ? (
            <p>Resend code in {timeLeft} seconds</p>
          ) : (
            <button 
              type="button" 
              onClick={handleResendOtp}
              className="text-primary hover:underline focus:outline-none"
            >
              Resend verification code
            </button>
          )}
        </div>
        
        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          disabled={otp.join("").length !== 6}
        >
          Verify & Continue
        </Button>
      </form>
    </AuthLayout>
  );
};

export default OtpVerification;
