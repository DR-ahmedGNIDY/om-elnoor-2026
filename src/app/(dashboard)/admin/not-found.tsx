// ─────────────────────────────────────────────────────────────
// src/app/admin/not-found.tsx
// 404 page scoped to the admin section.
// ─────────────────────────────────────────────────────────────

import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
      <div className="text-7xl">🔍</div>
      <div>
        <h1 className="font-cairo font-black text-2xl text-brand-text mb-2">
          الصفحة غير موجودة
        </h1>
        <p className="font-cairo text-brand-text/50 text-sm">
          الصفحة التي تبحث عنها غير موجودة في لوحة التحكم.
        </p>
      </div>
      <Link href="/admin" className="btn-primary btn-sm">
        العودة للرئيسية
      </Link>
    </div>
  );
}
