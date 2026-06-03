// ─────────────────────────────────────────────────────────────
// src/app/not-found.tsx
// Global 404 page.
// ─────────────────────────────────────────────────────────────

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <p className="text-8xl">😕</p>
        <div>
          <h1 className="font-cairo font-black text-3xl text-brand-text mb-2">
            الصفحة غير موجودة
          </h1>
          <p className="font-cairo text-brand-text/60">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/"           className="btn-primary">العودة للرئيسية</Link>
          <Link href="/categories" className="btn btn-outline">تصفح المنتجات</Link>
        </div>
      </div>
    </div>
  );
}
