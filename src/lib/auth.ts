
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  profileImage?: string;
}

// Login user with Supabase
export const loginUser = async (
  email: string, 
  password: string
): Promise<{ success: boolean; message: string; }> => {
  if (!email || !password) {
    return { success: false, message: "Email and password are required" };
  }
  
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      return { success: false, message: error.message };
    }
    
    return { 
      success: true, 
      message: "Login successful"
    };
  } catch (error: any) {
    return { success: false, message: error.message || "An unexpected error occurred" };
  }
};

// Register user with Supabase
export const registerUser = async (
  email: string,
  password: string,
  name: string,
  isAdmin = false
): Promise<{ success: boolean; message: string; }> => {
  if (!email || !password) {
    return { success: false, message: "Email and password are required" };
  }
  
  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: isAdmin ? 'admin' : 'student',
        }
      }
    });
    
    if (error) {
      return { success: false, message: error.message };
    }
    
    return { 
      success: true, 
      message: "Registration successful. Please check your email for verification."
    };
  } catch (error: any) {
    return { success: false, message: error.message || "An unexpected error occurred" };
  }
};

// OTP verification is not needed with Supabase authentication
export const verifyOtp = async (
  otp: string
): Promise<{ success: boolean; message: string; user?: UserProfile }> => {
  // This is a placeholder as Supabase handles email verification differently
  return { success: false, message: "OTP verification is not supported with Supabase authentication" };
};

// Get current user from Supabase session
export const getCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return null;
    }
    
    const user = session.user;
    
    // Fetch the user's profile from the profiles table to get role info
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (!profile) {
      return null;
    }
    
    return {
      id: user.id,
      name: profile.name || user.email?.split('@')[0] || '',
      email: user.email || '',
      role: profile.role || 'student',
      profileImage: profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.name || user.email?.split('@')[0]}&background=random`
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast.error(error.message);
      return;
    }
    
    toast.success("Logged out successfully");
  } catch (error: any) {
    toast.error(error.message || "An error occurred during logout");
  }
};
