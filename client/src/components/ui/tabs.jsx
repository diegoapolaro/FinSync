import * as React from 'react';
import { cn } from '@/lib/utils';

export function Tabs({ value, onValueChange, className, children }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-xl bg-muted p-1 text-muted-foreground',
        className,
      )}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, {
          active: child.props.value === value,
          onClick: () => onValueChange(child.props.value),
        });
      })}
    </div>
  );
}

export function TabItem({ value: _value, active, onClick, className, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg px-3 py-1.5 text-sm font-medium transition-all select-none',
        active
          ? 'bg-background text-foreground shadow-sm'
          : 'hover:bg-background/70 hover:text-foreground',
        className,
      )}
    >
      {children}
    </button>
  );
}
