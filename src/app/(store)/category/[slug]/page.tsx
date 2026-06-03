// ─────────────────────────────────────────────────────────────
// src/app/(store)/category/[slug]/page.tsx
// Single category page — loads products by category slug.
// Server Component with dynamic metadata.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calcDiscountPercent } from "@/lib/utils";
import { ProductGrid } from "@/components/store/ProductGrid";
import type { ProductWithCategoryDTO } from "@/types";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where:  { slug },
    select: { name: true, slug: true, imageUrl: true },
  });
  if (!category) return { title: "القسم غير موجود" };

  const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const url  = `${BASE}/category/${slug}`;
  const desc = `تصفح منتجات قسم ${category.name} في أم النور للأدوات المنزلية — منفلوط، أسيوط`;

  return {
    title:       category.name,
    description: desc,
    alternates:  { canonical: url },
    openGraph: {
      type:        "website",
      locale:      "ar_EG",
      url,
      title:       `${category.name} | أم النور للأدوات المنزلية`,
      description: desc,
      siteName:    "أم النور للأدوات المنزلية",
      images:      category.imageUrl
        ? [{ url: category.imageUrl, width: 1200, height: 630, alt: category.name }]
        : undefined,
    },
    twitter: {
      card:        "summary_large_image",
      title:       `${category.name} | أم النور للأدوات المنزلية`,
      description: desc,
      images:      category.imageUrl ? [category.imageUrl] : undefined,
    },
  };
}

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where:   { slug },
    include: {
      products: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true, name: true, slug: true, description: true,
          images: true, originalPrice: true, discountPrice: true,
          available: true, isFeatured: true, isOffer: true,
          categoryId: true, createdAt: true, updatedAt: true,
        },
      },
    },
  });

  if (!category) notFound();

  const products: ProductWithCategoryDTO[] = category.products.map((p) => ({
    ...p,
    category:        { id: category.id, name: category.name, slug: category.slug },
    discountPercent: calcDiscountPercent(p.originalPrice, p.discountPrice),
    createdAt:       p.createdAt.toISOString(),
    updatedAt:       p.updatedAt.toISOString(),
  }));

  return (
    <div>
      {/* Hero */}
      <div className="page-hero">
        <h1 className="page-hero-title">{category.name}</h1>
        <p className="page-hero-sub">
          {products.length > 0
            ? `${products.length} منتج`
            : "لا توجد منتجات في هذا القسم بعد"}
        </p>
      </div>

      {/* Products */}
      <ProductGrid
        title={category.name}
        products={products}
        limit={products.length} // Show all — no "view all" needed
        emptyMessage="لا توجد منتجات في هذا القسم بعد"
      />
    </div>
  );
}
