'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setItems((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            role="status"
            className={cn(
              'pointer-events-auto flex items-start gap-2 rounded-md border p-3 text-sm shadow-lg',
              item.variant === 'success' && 'border-green-200 bg-white text-green-800 dark:border-green-900 dark:bg-neutral-900 dark:text-green-300',
              item.variant === 'error' && 'border-red-200 bg-white text-red-800 dark:border-red-900 dark:bg-neutral-900 dark:text-red-300',
              item.variant === 'info' && 'border-neutral-200 bg-white text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200',
            )}
          >
            {item.variant === 'success' && <CheckCircle2 className="h-5 w-5 shrink-0" />}
            {item.variant === 'error' && <AlertCircle className="h-5 w-5 shrink-0" />}
            {item.variant === 'info' && <Info className="h-5 w-5 shrink-0" />}
            <span className="flex-1">{item.message}</span>
            <button onClick={() => setItems((p) => p.filter((i) => i.id !== item.id))} aria-label="Tutup" className="shrink-0 opacity-60 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
