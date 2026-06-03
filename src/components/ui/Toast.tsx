"use client";

// ─────────────────────────────────────────────────────────────
// src/components/ui/Toast.tsx
// Lightweight toast notification system.
// Usage: import { useToast } from "@/components/ui/Toast"
//        const { showToast, ToastContainer } = useToast();
//        showToast("تم إضافة المنتج ✓", "success");
// ─────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

interface ToastItem {
  id:      number;
  message: string;
  type:    ToastType;
}

let toastCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration = 2500) => {
      const id = ++toastCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  const ToastContainer = useCallback(
    () => (
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-4 end-4 z-[9999] flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((toast) => (
          <ToastBubble key={toast.id} toast={toast} />
        ))}
      </div>
    ),
    [toasts]
  );

  return { showToast, ToastContainer };
}

// ── Single toast bubble ───────────────────────────────────────

function ToastBubble({ toast }: { toast: ToastItem }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trigger enter animation
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(12px)";
    requestAnimationFrame(() => {
      el.style.transition = "opacity 0.2s, transform 0.2s";
      el.style.opacity    = "1";
      el.style.transform  = "translateY(0)";
    });
  }, []);

  return (
    <div
      ref={ref}
      role="status"
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl shadow-card-lg",
        "font-cairo font-bold text-sm text-white min-w-[200px] max-w-xs",
        "pointer-events-auto",
        toast.type === "success" && "bg-green-600",
        toast.type === "error"   && "bg-red-600",
        toast.type === "info"    && "bg-primary"
      )}
    >
      <span className="text-base flex-shrink-0">
        {toast.type === "success" ? "✓" : toast.type === "error" ? "✗" : "ℹ"}
      </span>
      <span className="leading-snug">{toast.message}</span>
    </div>
  );
}
