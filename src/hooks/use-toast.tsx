import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "destructive";

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type Toast = ToastInput & { id: string };

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((input: ToastInput) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const t: Toast = { id, variant: "default", ...input };
    setToasts((prev) => [t, ...prev].slice(0, 3));
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 3500);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "rounded-xl border bg-card px-4 py-3 shadow-lg",
              t.variant === "destructive" && "border-destructive/40"
            )}
          >
            <div className={cn("text-sm font-semibold", t.variant === "destructive" && "text-destructive")}>
              {t.title}
            </div>
            {t.description ? (
              <div className="mt-1 text-sm text-muted-foreground">{t.description}</div>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}



