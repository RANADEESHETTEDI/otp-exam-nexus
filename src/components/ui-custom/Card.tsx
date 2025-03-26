
import { HTMLAttributes, forwardRef } from "react";
import { VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

const cardVariants = cva(
  "rounded-xl overflow-hidden transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground shadow-sm hover:shadow-md border border-border/50",
        glass: "bg-white/90 dark:bg-card/90 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg",
        outline: "border border-border bg-transparent",
        ghost: "bg-transparent border-none shadow-none",
      },
      hover: {
        true: "hover:-translate-y-1 hover:shadow-lg",
        scale: "hover:scale-[1.02] hover:shadow-lg",
        glow: "hover:shadow-[0_0_20px_rgba(191,219,254,0.5)]",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      hover: "none",
    },
  }
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  animate?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hover, animate = false, children, ...props }, ref) => {
    if (animate) {
      // Cast props to unknown first to avoid type mismatch
      return (
        <motion.div
          ref={ref}
          className={cn(cardVariants({ variant, hover, className }))}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          {...props as any} // Use type assertion to avoid type checking
        >
          {children}
        </motion.div>
      );
    }
    
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, hover, className }))}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
