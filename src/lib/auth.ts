
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  profileImage?: string;
  collegeId?: string;
  collegeName?: string;
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
    console.log("Attempting to login:", email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Login error:", error.message);
      return { success: false, message: error.message };
    }
    
    console.log("Login successful");
    return { 
      success: true, 
      message: "Login successful"
    };
  } catch (error: any) {
    console.error("Unexpected login error:", error);
    return { success: false, message: error.message || "An unexpected error occurred" };
  }
};

// Register user with Supabase
export const registerUser = async (
  email: string,
  password: string,
  name: string,
  collegeId: string,
  isAdmin = false
): Promise<{ success: boolean; message: string; }> => {
  if (!email || !password) {
    return { success: false, message: "Email and password are required" };
  }
  
  try {
    console.log("Registering user:", { email, name, collegeId, isAdmin });
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: isAdmin ? 'admin' : 'student',
          college_id: collegeId
        }
      }
    });
    
    if (error) {
      console.error("Registration error:", error.message);
      return { success: false, message: error.message };
    }
    
    console.log("Registration successful");
    return { 
      success: true, 
      message: "Registration successful. Please check your email for verification."
    };
  } catch (error: any) {
    console.error("Unexpected registration error:", error);
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
      console.log("No session found");
      return null;
    }
    
    const user = session.user;
    console.log("Current user ID:", user.id);
    
    // Use our security-definer function to avoid recursion when getting user role
    const { data: roleData, error: roleError } = await supabase.rpc('get_user_role', {
      user_id: user.id
    });
    
    let userRole = 'student';
    if (roleError) {
      console.error("Error fetching role:", roleError);
    } else {
      userRole = roleData || 'student';
    }
    
    // Get the basic profile data
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('name, email, avatar_url, college_id')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error("Error fetching profile:", error.message);
      // Return minimal user data from auth session as fallback
      return {
        id: user.id,
        name: user.email?.split('@')[0] || '',
        email: user.email || '',
        role: userRole as 'student' | 'admin',
        profileImage: `https://ui-avatars.com/api/?name=${user.email?.split('@')[0]}&background=random`
      };
    }
    
    // Separate query to get college name if needed
    let collegeName = null;
    if (profile?.college_id) {
      const { data: college } = await supabase
        .from('colleges')
        .select('name')
        .eq('id', profile.college_id)
        .single();
      
      collegeName = college?.name;
    }
    
    return {
      id: user.id,
      name: profile?.name || user.email?.split('@')[0] || '',
      email: user.email || '',
      role: userRole as 'student' | 'admin',
      profileImage: profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.name || user.email?.split('@')[0]}&background=random`,
      collegeId: profile?.college_id,
      collegeName: collegeName || undefined
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
