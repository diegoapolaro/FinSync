import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variantStyles = {
    default: "bg-card text-card-foreground border border-border shadow-sm",
    sage: "bg-[#e8ebe6] dark:bg-[#161916] text-foreground border border-border/40",
    green: "bg-[#e2f6d5] dark:bg-[#162713] text-[#0e0f0c] dark:text-[#f2f5f1] border border-[#c5edab]/50",
    dark: "bg-[#0e0f0c] text-[#9fe870] border border-border/20",
    outline: "bg-transparent border border-ink/80 dark:border-border text-foreground",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg transition-all",
        variantStyles[variant] || variantStyles.default,
        className
      )}
      {...props}
    />
  );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 pb-3", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-bold tracking-tight text-foreground leading-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
