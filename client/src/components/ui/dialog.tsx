import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const previousActiveElement = React.useRef<HTMLElement | null>(null);
  const onOpenChangeRef = React.useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;
  const wasOpenRef = React.useRef(false);

  React.useEffect(() => {
    if (!open) {
      if (wasOpenRef.current && previousActiveElement.current?.focus) {
        previousActiveElement.current.focus();
      }
      wasOpenRef.current = false;
      return;
    }

    if (!wasOpenRef.current) {
      wasOpenRef.current = true;
      previousActiveElement.current = document.activeElement as HTMLElement;
      const dialog = dialogRef.current;
      const focusable = dialog?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const focusableElements = focusable ? Array.from(focusable) as HTMLElement[] : [];
      const firstInput = focusableElements.find(
        (el) =>
          (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') &&
          !el.hasAttribute('disabled'),
      );
      const elementToFocus = firstInput || focusableElements[0] || dialog;
      elementToFocus?.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onOpenChangeRef.current?.(false);
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusableItems = Array.from(
        dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute('disabled')) as HTMLElement[];

      if (focusableItems.length === 0) return;

      const first = focusableItems[0];
      const last = focusableItems[focusableItems.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200"
      onClick={() => onOpenChange?.(false)}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="w-full max-w-lg rounded-3xl bg-card p-6 shadow-card border text-card-foreground animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className, ...props }: React.ComponentPropsWithRef<'div'>) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 pb-4 border-b border-border/40', className)}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }: React.ComponentPropsWithRef<'h2'>) {
  return (
    <h2
      className={cn('text-xl font-semibold tracking-tight text-foreground', className)}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }: React.ComponentPropsWithRef<'p'>) {
  return <p className={cn('text-sm text-muted-foreground mt-1', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.ComponentPropsWithRef<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 border-t border-border/40 gap-2',
        className,
      )}
      {...props}
    />
  );
}

export interface DialogCloseProps extends React.ComponentPropsWithRef<'button'> {}

export function DialogClose({ onClick, className, ...props }: DialogCloseProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
        className,
      )}
      {...props}
    >
      <X className="h-5 w-5" />
      <span className="sr-only">Fechar</span>
    </button>
  );
}
