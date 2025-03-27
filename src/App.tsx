
import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import OtpVerification from "./pages/OtpVerification";
import Dashboard from "./pages/Dashboard";
import ExamPage from "./pages/ExamPage";
import Results from "./pages/Results";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import ExamCreation from "./pages/admin/ExamCreation";
import Reports from "./pages/admin/Reports";

// Not Found
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-primary animate-spin"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-otp" element={<OtpVerification />} />
            
            {/* Student protected routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/exam/:examId" element={<ExamPage />} />
            <Route path="/results/:examId" element={<Results />} />
            
            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/exams" element={<ExamCreation />} />
            <Route path="/admin/reports" element={<Reports />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
