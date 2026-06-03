// ─────────────────────────────────────────────────────────────
// src/app/admin/page.tsx
// Admin dashboard home — Server Component.
// Fetches real stats from MongoDB via Prisma.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateAr } from "@/lib/utils";

export const metadata: Metadata = { title: "الرئيسية" };

// Opt out of caching so stats are always fresh
export const dynamic = "force-dynamic";

async function fetchStats() {
  const [totalProducts, totalCategories, featuredProducts, activeOffers] =
    await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.product.count({ where: { isFeatured: true } }),
      prisma.product.count({ where: { isOffer: true } }),
    ]);

  return { totalProducts, totalCategories, featuredProducts, activeOffers };
}

async function fetchRecentProducts() {
  return prisma.product.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    include: { category: { select: { name: true } } },
  });
}

export default async function AdminDashboardPage() {
  const session = await auth();
  const [stats, recentProducts] = await Promise.all([
    fetchStats(),
    fetchRecentProducts(),
  ]);

  return (
    <div className="space-y-8">

      {/* Page header */}
      <div>
        <h1 className="font-cairo font-black text-2xl text-brand-text">
          لوحة التحكم
        </h1>
        <p className="font-cairo text-sm text-brand-text/50 mt-1">
          مرحباً، {session?.user.name} 👋
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="إجمالي المنتجات"
          value={stats.totalProducts}
          icon="📦"
          color="bg-blue-50 text-blue-700"
        />
        <StatCard
          label="الأقسام"
          value={stats.totalCategories}
          icon="📂"
          color="bg-purple-50 text-purple-700"
        />
        <StatCard
          label="منتجات مميزة"
          value={stats.featuredProducts}
          icon="⭐"
          color="bg-yellow-50 text-yellow-700"
        />
        <StatCard
          label="عروض نشطة"
          value={stats.activeOffers}
          icon="🏷️"
          color="bg-green-50 text-green-700"
        />
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickAction
          href="/admin/products"
          icon="📦"
          title="إدارة المنتجات"
          description="إضافة وتعديل وحذف المنتجات"
        />
        <QuickAction
          href="/admin/categories"
          icon="📂"
          title="إدارة الأقسام"
          description="إنشاء وتنظيم أقسام المنتجات"
        />
        <QuickAction
          href="/admin/settings"
          icon="⚙️"
          title="إعدادات المتجر"
          description="واتساب، سوشيال ميديا وأكثر"
        />
      </div>

      {/* Recent products */}
      {recentProducts.length > 0 && (
        <div className="admin-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-cairo font-black text-lg text-brand-text">
              آخر المنتجات المضافة
            </h2>
            <a
              href="/admin/products"
              className="font-cairo text-sm text-primary font-bold hover:underline"
            >
              عرض الكل ←
            </a>
          </div>

          <div className="divide-y divide-gray-100">
            {recentProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
              >
                {/* Cover image placeholder */}
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center text-2xl">
                  {product.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    "🏠"
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-cairo font-bold text-sm text-brand-text truncate">
                    {product.name}
                  </p>
                  <p className="font-cairo text-xs text-brand-text/40 mt-0.5">
                    {product.category.name} · {formatDateAr(product.createdAt)}
                  </p>
                </div>

                <div className="text-end flex-shrink-0">
                  <p className="font-cairo font-black text-sm text-primary">
                    {product.originalPrice.toLocaleString("ar-EG")} ج.م
                  </p>
                  {product.discountPrice && (
                    <p className="font-cairo text-xs text-green-600 font-bold mt-0.5">
                      خصم {product.discountPrice.toLocaleString("ar-EG")} ج.م
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon:  string;
  color: string;
}) {
  return (
    <div className="admin-card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="font-cairo font-black text-2xl text-brand-text leading-none">
          {value.toLocaleString("ar-EG")}
        </p>
        <p className="font-cairo text-xs text-brand-text/50 mt-1">
          {label}
        </p>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href:        string;
  icon:        string;
  title:       string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="admin-card flex items-start gap-4 hover:shadow-card-lg hover:-translate-y-0.5 transition-all duration-200 group"
    >
      <div className="w-12 h-12 rounded-2xl bg-primary/8 flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-primary/15 transition-colors">
        {icon}
      </div>
      <div>
        <p className="font-cairo font-black text-sm text-brand-text group-hover:text-primary transition-colors">
          {title}
        </p>
        <p className="font-cairo text-xs text-brand-text/45 mt-1 leading-relaxed">
          {description}
        </p>
      </div>
    </a>
  );
}
