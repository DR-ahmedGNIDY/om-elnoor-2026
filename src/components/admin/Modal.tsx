"use client";

// ─────────────────────────────────────────────────────────────
// src/components/admin/Modal.tsx
// Generic modal shell used to wrap forms (create / edit).
// ─────────────────────────────────────────────────────────────

import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open:      boolean;
  title:     string;
  onClose:   () => void;
  children:  React.ReactNode;
  maxWidth?: string;
}

export function Modal({
  open,
  title,
  onClose,
  children,
  maxWidth = "max-w-lg",
}: ModalProps) {
  // Prevent body scroll while open; close on Escape
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handler);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        className={cn(
          "relative bg-white w-full rounded-t-3xl sm:rounded-2xl shadow-2xl",
          "flex flex-col max-h-[90vh] animate-slide-up",
          maxWidth
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-cairo font-black text-lg text-brand-text">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="btn-icon text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            aria-label="إغلاق"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6"  x2="6"  y2="18" />
      <line x1="6"  y1="6"  x2="18" y2="18" />
    </svg>
  );
}
