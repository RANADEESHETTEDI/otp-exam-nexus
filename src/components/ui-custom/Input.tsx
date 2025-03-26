
import { InputHTMLAttributes, forwardRef, useState } from "react";
import { VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const inputVariants = cva(
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/80",
        error: "border-destructive focus-visible:ring-2 focus-visible:ring-destructive/30 focus-visible:border-destructive",
      },
      inputSize: {
        default: "h-10 px-3 py-2",
        sm: "h-9 px-3 py-1.5 text-xs",
        lg: "h-12 px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
);

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  animate?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, label, error, animate = false, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const Wrapper = animate ? motion.div : "div";
    
    const animateProps = animate ? {
      initial: { opacity: 0, y: 5 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3 },
    } : {};
    
    return (
      <Wrapper className="w-full space-y-2" {...animateProps}>
        {label && (
          <label 
            htmlFor={props.id} 
            className={cn(
              "block text-sm font-medium transition-colors",
              isFocused ? "text-primary" : "text-foreground",
              error && "text-destructive"
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          <input
            className={cn(
              inputVariants({ variant: error ? "error" : variant, inputSize, className })
            )}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          
          {isFocused && !error && (
            <motion.span 
              className="absolute inset-0 rounded-lg pointer-events-none border-2 border-primary/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </div>
        
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-destructive mt-1"
          >
            {error}
          </motion.p>
        )}
      </Wrapper>
    );
  }
);

Input.displayName = "Input";

export { Input };
