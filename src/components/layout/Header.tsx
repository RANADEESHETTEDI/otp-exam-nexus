
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isAuthPage = ['/login', '/verify-otp', '/admin/login'].includes(location.pathname);
  
  // Change header appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't show header on auth pages
  if (isAuthPage) return null;

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out",
      scrolled 
        ? "bg-white/80 dark:bg-card/80 backdrop-blur-md shadow-sm py-3" 
        : "bg-transparent py-5"
    )}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center space-x-2 text-2xl font-medium transition-opacity hover:opacity-80"
        >
          <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
            A
          </span>
          <span>AssignmentHub</span>
        </Link>
        
        <div className="flex items-center space-x-1">
          {location.pathname.startsWith('/admin') ? (
            // Admin navigation
            <nav className="hidden md:flex items-center space-x-1">
              <NavLink to="/admin/dashboard">Dashboard</NavLink>
              <NavLink to="/admin/users">Users</NavLink>
              <NavLink to="/admin/exams">Exams</NavLink>
              <NavLink to="/admin/reports">Reports</NavLink>
              <NavLink to="/login" className="ml-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg">
                Exit Admin
              </NavLink>
            </nav>
          ) : (
            // Student navigation
            <nav className="hidden md:flex items-center space-x-1">
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/admin/login" className="ml-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg">
                Admin
              </NavLink>
            </nav>
          )}
          
          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

function NavLink({ 
  to, 
  children, 
  className 
}: { 
  to: string; 
  children: React.ReactNode;
  className?: string;
}) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={cn(
        "px-3 py-2 rounded-lg transition-colors text-sm font-medium",
        isActive 
          ? "bg-primary/10 text-primary" 
          : "text-foreground/70 hover:text-foreground hover:bg-secondary",
        className
      )}
    >
      {children}
    </Link>
  );
}
