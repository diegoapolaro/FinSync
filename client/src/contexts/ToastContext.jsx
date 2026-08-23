import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'error', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          return (
            <div
              key={toast.id}
              role="alert"
              className={cn(
                'pointer-events-auto px-4 py-3 rounded-full shadow-elevation border flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200',
                isSuccess
                  ? 'bg-[#0e0f0c] text-[#9fe870] border-[#9fe870]/30'
                  : 'bg-[#d03238] text-white border-destructive/30'
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                {isSuccess ? (
                  <CheckCircle2 className="w-4 h-4 text-[#9fe870] shrink-0 stroke-[2.5]" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-white shrink-0 stroke-[2.5]" />
                )}
                <span className="truncate">{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 shrink-0 p-1"
              >
                <X className="w-3.5 h-3.5" />
                <span className="sr-only">Fechar</span>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider');
  return ctx;
}
