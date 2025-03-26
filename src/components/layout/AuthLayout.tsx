
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-panel p-8 sm:p-10">
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl">
              A
            </div>
          </div>
          
          <h1 className="text-2xl font-medium text-center mb-2">{title}</h1>
          
          {subtitle && (
            <p className="text-muted-foreground text-center mb-6">{subtitle}</p>
          )}
          
          <div className="space-y-6">{children}</div>
        </div>
      </motion.div>
    </div>
  );
}
