"use client";

// ─────────────────────────────────────────────────────────────
// src/app/(store)/error.tsx
// Next.js App Router error boundary for the store route group.
// Renders when an unhandled error occurs during page rendering.
// ─────────────────────────────────────────────────────────────

import { useEffect } from "react";
import Link from "next/link";

interface ErrorPageProps {
  error:  Error & { digest?: string };
  reset:  () => void;
}

export default function StoreError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error("[StoreError]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md space-y-5">
        <p className="text-7xl">😕</p>

        <div>
          <h1 className="font-cairo font-black text-2xl text-brand-text mb-2">
            حدث خطأ ما
          </h1>
          <p className="font-cairo text-brand-text/60 text-sm leading-relaxed">
            نأسف على الإزعاج. حدث خطأ غير متوقع أثناء تحميل هذه الصفحة.
          </p>
          {process.env.NODE_ENV === "development" && (
            <p className="font-mono text-xs text-red-500 mt-2 bg-red-50 p-2 rounded">
              {error.message}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={reset} className="btn-primary">
            إعادة المحاولة
          </button>
          <Link href="/" className="btn btn-outline">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
