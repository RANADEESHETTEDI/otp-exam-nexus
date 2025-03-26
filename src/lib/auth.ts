
import { toast } from "sonner";

// Mock authentication functions
// In a real app, these would connect to your backend service

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  profileImage?: string;
}

// Mock function to simulate login API call
export const loginUser = async (
  email: string, 
  password: string
): Promise<{ success: boolean; message: string; }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (!email || !password) {
    return { success: false, message: "Email and password are required" };
  }
  
  // Mock validation
  const isValidEmail = email.includes('@');
  const isValidPassword = password.length >= 6;
  
  if (!isValidEmail) {
    return { success: false, message: "Please enter a valid email" };
  }
  
  if (!isValidPassword) {
    return { success: false, message: "Password must be at least 6 characters" };
  }
  
  // For demo: admin login detection
  const isAdmin = email.includes('admin');
  
  // Store user info in local storage
  localStorage.setItem('userEmail', email);
  localStorage.setItem('userRole', isAdmin ? 'admin' : 'student');
  
  return { 
    success: true, 
    message: "OTP has been sent to your email"
  };
};

// Mock function to verify OTP
export const verifyOtp = async (
  otp: string
): Promise<{ success: boolean; message: string; user?: User }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (!otp || otp.length !== 6) {
    return { success: false, message: "Please enter a valid 6-digit OTP" };
  }
  
  // For demo: any 6-digit number is considered valid
  const isValidOtp = /^\d{6}$/.test(otp);
  
  if (!isValidOtp) {
    return { success: false, message: "OTP must be a 6-digit number" };
  }
  
  // Get stored user info
  const email = localStorage.getItem('userEmail') || '';
  const role = localStorage.getItem('userRole') || 'student';
  
  // Create mock user
  const user: User = {
    id: Math.random().toString(36).substring(2, 15),
    name: email.split('@')[0],
    email,
    role: role as 'student' | 'admin',
    profileImage: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=random`
  };
  
  // Store authenticated user
  localStorage.setItem('authUser', JSON.stringify(user));
  localStorage.setItem('isAuthenticated', 'true');
  
  return { 
    success: true, 
    message: "Authentication successful",
    user
  };
};

// Get current user from storage
export const getCurrentUser = (): User | null => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    return null;
  }
  
  const userJson = localStorage.getItem('authUser');
  
  if (!userJson) {
    return null;
  }
  
  try {
    return JSON.parse(userJson) as User;
  } catch (e) {
    logout();
    return null;
  }
};

// Logout
export const logout = (): void => {
  localStorage.removeItem('authUser');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userRole');
  
  toast.success("Logged out successfully");
};
