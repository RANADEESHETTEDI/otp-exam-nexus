
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/auth";
import { Button } from "@/components/ui-custom/Button";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { session, profile } = useAuth();
  const isAuthPage = ['/login', '/verify-otp', '/admin/login', '/register'].includes(location.pathname);
  
  // Change header appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

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
          {!session ? (
            // Not logged in
            <div className="flex space-x-2">
              <Link to="/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Register</Button>
              </Link>
            </div>
          ) : profile?.role === 'admin' ? (
            // Admin navigation
            <>
              <nav className="hidden md:flex items-center space-x-1">
                <NavLink to="/admin/dashboard">Dashboard</NavLink>
                <NavLink to="/admin/users">Users</NavLink>
                <NavLink to="/admin/exams">Exams</NavLink>
                <NavLink to="/admin/reports">Reports</NavLink>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="ml-2"
                >
                  Logout
                </Button>
              </nav>
              <MobileMenu isAdmin={true} onLogout={handleLogout} />
            </>
          ) : (
            // Student navigation
            <>
              <nav className="hidden md:flex items-center space-x-1">
                <NavLink to="/dashboard">Dashboard</NavLink>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="ml-2"
                >
                  Logout
                </Button>
              </nav>
              <MobileMenu isAdmin={false} onLogout={handleLogout} />
            </>
          )}
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

function MobileMenu({ isAdmin, onLogout }: { isAdmin: boolean, onLogout: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="md:hidden relative">
      <button 
        className="p-2 rounded-lg hover:bg-secondary"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg py-2 z-50 border">
          {isAdmin ? (
            <>
              <MobileNavLink to="/admin/dashboard" onClick={() => setIsOpen(false)}>Dashboard</MobileNavLink>
              <MobileNavLink to="/admin/users" onClick={() => setIsOpen(false)}>Users</MobileNavLink>
              <MobileNavLink to="/admin/exams" onClick={() => setIsOpen(false)}>Exams</MobileNavLink>
              <MobileNavLink to="/admin/reports" onClick={() => setIsOpen(false)}>Reports</MobileNavLink>
            </>
          ) : (
            <MobileNavLink to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</MobileNavLink>
          )}
          <div className="border-t mt-2 pt-2">
            <button 
              className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileNavLink({ 
  to, 
  children,
  onClick
}: { 
  to: string; 
  children: React.ReactNode;
  onClick: () => void;
}) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={cn(
        "block px-4 py-2 text-sm",
        isActive 
          ? "bg-primary/10 text-primary" 
          : "text-foreground hover:bg-secondary transition-colors"
      )}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
