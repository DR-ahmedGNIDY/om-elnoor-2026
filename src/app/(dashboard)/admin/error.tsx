"use client";

// ─────────────────────────────────────────────────────────────
// src/app/admin/error.tsx
// Error boundary for the admin section.
// ─────────────────────────────────────────────────────────────

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error:  Error & { digest?: string };
  reset:  () => void;
}) {
  useEffect(() => { console.error("[AdminError]", error); }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-5">
      <p className="text-6xl">⚠️</p>

      <div>
        <h1 className="font-cairo font-black text-xl text-brand-text mb-2">
          حدث خطأ في لوحة التحكم
        </h1>
        <p className="font-cairo text-sm text-brand-text/60">
          يرجى المحاولة مجدداً أو التواصل مع الدعم التقني.
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre className="mt-3 text-xs text-red-500 bg-red-50 p-3 rounded-xl text-start max-w-md overflow-auto">
            {error.message}
          </pre>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={reset} className="btn-primary btn-sm">إعادة المحاولة</button>
        <Link href="/admin" className="btn btn-outline btn-sm">الرئيسية</Link>
      </div>
    </div>
  );
}
