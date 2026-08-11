import { useEffect, useId, useRef } from "react";

export default function Modal({ aberto, onClose, titulo, children }) {
  const dialogRef = useRef(null);
  const previousActiveElement = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!aberto) return;

    previousActiveElement.current = document.activeElement;
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const focusableElements = focusable ? Array.from(focusable) : [];
    const firstFocusable = focusableElements[0] ?? dialog;

    firstFocusable?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialog) return;

      const focusableItems = Array.from(
        dialog.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled"));

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

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previousActiveElement.current?.focus) {
        previousActiveElement.current.focus();
      }
    };
  }, [aberto, onClose]);

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop open" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="bg-background w-full max-w-md border-2 border-primary shadow-xl modal-content-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-dashed border-outline-variant px-4 py-3">
          <h2 id={titleId} className="font-headline-md text-headline-md text-primary uppercase text-sm">
            {titulo}
          </h2>
          <button type="button" onClick={onClose} className="btn-base text-outline hover:text-primary transition-colors rounded-full p-1">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}