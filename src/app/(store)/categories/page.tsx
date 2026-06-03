// ─────────────────────────────────────────────────────────────
// src/app/(store)/categories/page.tsx
// All categories listing page — Server Component.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "الأقسام",
  description: "تصفح جميع أقسام أم النور للأدوات المنزلية",
};
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { products: { where: { available: true } } } } },
  });

  return (
    <div>
      {/* Hero */}
      <div className="page-hero">
        <h1 className="page-hero-title">جميع الأقسام</h1>
        <p className="page-hero-sub">اختر القسم الذي تريد تصفحه</p>
      </div>

      <div className="container-store py-12">
        {categories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📦</p>
            <p className="font-cairo text-brand-text/50">لا توجد أقسام بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-card-gradient shadow-card hover:shadow-card-lg transition-all duration-300 hover:-translate-y-1 aspect-category flex flex-col justify-end"
              >
                {/* Background image */}
                {cat.imageUrl ? (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                    className="object-cover opacity-30 group-hover:opacity-40 transition-opacity"
                    unoptimized={cat.imageUrl.startsWith("/")}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-10">
                    {["🫕","🍴","🍽️","🛋️","📦"][i % 5]}
                  </div>
                )}

                {/* Content */}
                <div className="relative p-6">
                  <h2 className="font-cairo font-black text-2xl text-white mb-1">
                    {cat.name}
                  </h2>
                  <p className="font-cairo text-white/70 text-sm">
                    {cat._count.products} منتج متاح
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
