"use client";

// ─────────────────────────────────────────────────────────────
// src/components/admin/ConfirmDialog.tsx
// Generic confirmation dialog (used for delete actions).
// Traps focus inside the modal and closes on Escape.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open:        boolean;
  title:       string;
  description: string;
  confirmLabel?: string;
  cancelLabel?:  string;
  danger?:       boolean;
  loading?:      boolean;
  onConfirm:   () => void;
  onCancel:    () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "تأكيد",
  cancelLabel  = "إلغاء",
  danger       = false,
  loading      = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Focus confirm button when dialog opens
  useEffect(() => {
    if (open) confirmRef.current?.focus();
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden
      />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">

        {/* Icon */}
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl",
          danger ? "bg-red-100" : "bg-yellow-100"
        )}>
          {danger ? "🗑️" : "⚠️"}
        </div>

        {/* Text */}
        <h2
          id="confirm-title"
          className="font-cairo font-black text-lg text-center text-brand-text mb-2"
        >
          {title}
        </h2>
        <p className="font-cairo text-sm text-brand-text/60 text-center leading-relaxed">
          {description}
        </p>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            ref={confirmRef}
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "flex-1 btn",
              danger
                ? "btn-danger"
                : "btn-primary",
              loading && "opacity-70 cursor-not-allowed"
            )}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <SpinnerIcon />
                جاري التنفيذ…
              </span>
            ) : (
              confirmLabel
            )}
          </button>

          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 btn btn-ghost border border-gray-200"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 00-9-9" />
    </svg>
  );
}
