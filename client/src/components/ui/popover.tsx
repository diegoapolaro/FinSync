import * as React from 'react';
import { cn } from '@/lib/utils';

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

export function usePopover() {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error('usePopover deve ser utilizado dentro de um <Popover>');
  }
  return context;
}

export interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children?: React.ReactNode;
}

export function Popover({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  defaultOpen = false,
  children,
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  
  const setOpen = React.useCallback(
    (value: boolean) => {
      if (isControlled) {
        setControlledOpen?.(value);
      } else {
        setUncontrolledOpen(value);
      }
    },
    [isControlled, setControlledOpen],
  );

  const triggerRef = React.useRef<HTMLElement | HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, setOpen]);

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef, contentRef }}>
      <div className="relative inline-block text-left">{children}</div>
    </PopoverContext.Provider>
  );
}

export interface PopoverTriggerProps extends React.ComponentPropsWithRef<'button'> {
  asChild?: boolean;
}

export function PopoverTrigger({ asChild = false, children, className, onClick, ...props }: PopoverTriggerProps) {
  const { open, setOpen, triggerRef } = usePopover();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent> | any) => {
    onClick?.(e);
    if (!e.defaultPrevented) {
      setOpen(!open);
    }
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref: triggerRef as React.Ref<any>,
      onClick: (e: any) => {
        (children.props as any).onClick?.(e);
        handleClick(e);
      },
      'aria-haspopup': 'dialog',
      'aria-expanded': open,
      className: cn((children.props as any).className, className),
      ...props,
    });
  }

  return (
    <button
      ref={triggerRef as React.RefObject<HTMLButtonElement>}
      type="button"
      onClick={handleClick}
      aria-haspopup="dialog"
      aria-expanded={open}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

export interface PopoverContentProps extends React.ComponentPropsWithRef<'div'> {
  align?: 'start' | 'center' | 'end';
  side?: 'bottom' | 'top';
  sideOffset?: number;
}

export function PopoverContent({
  className,
  align = 'center',
  side = 'bottom',
  sideOffset = 8,
  children,
  ...props
}: PopoverContentProps) {
  const { open, contentRef } = usePopover();

  if (!open) return null;

  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };

  const sideClasses = {
    bottom: 'top-full mt-2',
    top: 'bottom-full mb-2',
  };

  return (
    <div
      ref={contentRef}
      role="dialog"
      aria-modal="false"
      className={cn(
        'absolute z-50 rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-2xl outline-none',
        'animate-in fade-in-0 zoom-in-95 duration-150',
        alignClasses[align] || alignClasses.center,
        sideClasses[side] || sideClasses.bottom,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
