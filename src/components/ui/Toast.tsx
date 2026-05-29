'use client';

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  exiting?: boolean;
}

interface ToastContextValue {
  addToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

const BORDER_COLORS: Record<ToastType, string> = {
  success: 'border-status-good',
  error: 'border-status-critical',
  info: 'border-brand-primary',
};

const MAX_TOASTS = 5;
const AUTO_DISMISS_MS = 3000;
const EXIT_ANIMATION_MS = 200;

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      role="alert"
      className={`
        flex items-center gap-3 border-l-4 ${BORDER_COLORS[toast.type]}
        bg-bg-secondary rounded-[var(--radius-md)] shadow-elevated
        px-4 py-3 text-sm text-text-primary
        ${toast.exiting ? 'animate-toast-out' : 'animate-toast-in'}
      `}
    >
      <span className="shrink-0 text-base" aria-hidden="true">
        {ICONS[toast.type]}
      </span>
      <span className="flex-1 min-w-0 break-words">{toast.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-text-muted hover:text-text-primary transition-colors ml-2"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const startExitAnimation = useCallback(
    (id: string) => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
      );
      const exitTimer = setTimeout(() => removeToast(id), EXIT_ANIMATION_MS);
      timersRef.current.set(`${id}-exit`, exitTimer);
    },
    [removeToast],
  );

  const dismiss = useCallback(
    (id: string) => {
      startExitAnimation(id);
    },
    [startExitAnimation],
  );

  const addToast = useCallback(
    (type: ToastType, message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const newToast: Toast = { id, type, message };

      setToasts((prev) => {
        const next = [...prev, newToast];
        // Evict oldest toasts beyond MAX_TOASTS
        if (next.length > MAX_TOASTS) {
          const evicted = next.slice(0, next.length - MAX_TOASTS);
          evicted.forEach((t) => removeToast(t.id));
          return next.slice(next.length - MAX_TOASTS);
        }
        return next;
      });

      // Auto-dismiss after AUTO_DISMISS_MS
      const timer = setTimeout(() => startExitAnimation(id), AUTO_DISMISS_MS);
      timersRef.current.set(id, timer);
    },
    [removeToast, startExitAnimation],
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return ctx;
}
