import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-foreground hover:opacity-90',
        outline: 'border border-border bg-transparent hover:bg-secondary/50 text-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        positive: 'bg-entrada text-white hover:bg-entrada/90',
        ghost: 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        copilot: 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20',
      },
      size: {
        default: 'h-11 px-5 py-2',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-14 px-8 text-base font-semibold',
        icon: 'h-11 w-11 p-0',
        iconSm: 'h-8 w-8 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? 'span' : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants };
