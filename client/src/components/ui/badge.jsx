import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-[#ffebee] dark:bg-[#320707] text-[#d03238] dark:text-[#ff8080]",
        positive:
          "border-transparent bg-[#e2f6d5] dark:bg-[#122b10] text-[#054d28] dark:text-[#9fe870]",
        warning:
          "border-transparent bg-[#fff8e1] dark:bg-[#382b00] text-[#b86700] dark:text-[#ffd11a]",
        outline: "text-foreground border border-border",
        sage: "bg-[#e8ebe6] dark:bg-[#1f241f] text-foreground border border-border/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
