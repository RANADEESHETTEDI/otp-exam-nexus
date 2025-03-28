
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui-custom/Button";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { profile, isLoading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);
  
  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (profile && !isLoading) {
      setRedirecting(true);
      const timer = setTimeout(() => {
        if (profile.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 1000); // Slight delay for better user experience
      
      return () => clearTimeout(timer);
    }
  }, [profile, navigate, isLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl">
              A
            </span>
            <span className="text-xl font-semibold">AssignmentHub</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              to="/admin/login" 
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition"
            >
              Admin
            </Link>
            <Link to="/login">
              <Button size="sm">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center container mx-auto px-4 py-12 relative">
        {redirecting && (
          <div className="absolute top-0 left-0 w-full z-10 bg-background/80 backdrop-blur-sm p-3 text-center animate-pulse">
            <p className="text-primary font-medium">
              Welcome back, {profile?.name || 'user'}! Redirecting to your dashboard...
            </p>
          </div>
        )}
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative mb-8 inline-block"
          >
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-primary flex items-center justify-center text-white font-bold text-4xl md:text-5xl mx-auto">
              A
            </div>
            <motion.div 
              className="absolute -bottom-2 -right-2 w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-accent/40 backdrop-blur-sm border border-accent"
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute -top-2 -left-2 w-8 h-8 md:w-10 md:h-10 rounded-xl bg-muted/40 backdrop-blur-sm border border-muted"
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.5 }}
            />
          </motion.div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Assessment Made Simple
          </h1>
          
          <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-2xl mx-auto">
            A modern platform for secure online examinations with intuitive interfaces for students and powerful management tools for administrators.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to="/login">
                <Button 
                  size="lg"
                  className="px-8 py-3 rounded-xl"
                >
                  Get Started
                </Button>
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to="/admin/login">
                <Button 
                  size="lg"
                  variant="outline"
                  className="px-8 py-3 rounded-xl"
                >
                  Admin Portal
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>
      
      {/* Features Overview (Simplified) */}
      <section className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            title: "Secure Examinations",
            description: "Advanced security features ensure integrity during assessments"
          },
          {
            title: "Real-time Monitoring",
            description: "Monitor progress and engagement throughout exams"
          },
          {
            title: "Comprehensive Analytics",
            description: "Detailed reports and insights to improve learning outcomes"
          }
        ].map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            className="glass-panel p-6 text-center"
          >
            <h3 className="text-xl font-medium mb-3">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </section>
      
      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AssignmentHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
