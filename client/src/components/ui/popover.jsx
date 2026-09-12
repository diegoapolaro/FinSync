import * as React from 'react';
import { cn } from '@/lib/utils';

const PopoverContext = React.createContext(null);

export function usePopover() {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error('usePopover deve ser utilizado dentro de um <Popover>');
  }
  return context;
}

export function Popover({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  defaultOpen = false,
  children,
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = React.useCallback(
    (value) => {
      if (isControlled) {
        setControlledOpen?.(value);
      } else {
        setUncontrolledOpen(value);
      }
    },
    [isControlled, setControlledOpen],
  );

  const triggerRef = React.useRef(null);
  const contentRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;

    function handleClickOutside(event) {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
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

export function PopoverTrigger({ asChild = false, children, className, onClick, ...props }) {
  const { open, setOpen, triggerRef } = usePopover();

  const handleClick = (e) => {
    onClick?.(e);
    if (!e.defaultPrevented) {
      setOpen(!open);
    }
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref: triggerRef,
      onClick: (e) => {
        children.props.onClick?.(e);
        handleClick(e);
      },
      'aria-haspopup': 'dialog',
      'aria-expanded': open,
      className: cn(children.props.className, className),
      ...props,
    });
  }

  return (
    <button
      ref={triggerRef}
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

export function PopoverContent({
  className,
  align = 'center',
  side = 'bottom',
  sideOffset = 8,
  children,
  ...props
}) {
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
