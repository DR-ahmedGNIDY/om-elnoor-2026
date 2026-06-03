// ─────────────────────────────────────────────────────────────
// src/app/admin/products/page.tsx
// Products management page — Server Component shell.
// Pre-fetches products and categories server-side.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { calcDiscountPercent } from "@/lib/utils";
import { ProductsClient } from "./ProductsClient";
import type { ProductWithCategoryDTO, CategoryWithCountDTO } from "@/types";

export const metadata: Metadata = { title: "إدارة المنتجات" };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [rawProducts, rawCategories] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.category.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { products: true } } },
    }),
  ]);

  const products: ProductWithCategoryDTO[] = rawProducts.map((p) => ({
    id:              p.id,
    name:            p.name,
    slug:            p.slug,
    description:     p.description,
    categoryId:      p.categoryId,
    category:        p.category,
    images:          p.images,
    originalPrice:   p.originalPrice,
    discountPrice:   p.discountPrice,
    discountPercent: calcDiscountPercent(p.originalPrice, p.discountPrice),
    available:       p.available,
    isFeatured:      p.isFeatured,
    isOffer:         p.isOffer,
    createdAt:       p.createdAt.toISOString(),
    updatedAt:       p.updatedAt.toISOString(),
  }));

  const categories: CategoryWithCountDTO[] = rawCategories.map((c) => ({
    id:           c.id,
    name:         c.name,
    slug:         c.slug,
    imageUrl:     c.imageUrl,
    productCount: c._count.products,
    createdAt:    c.createdAt.toISOString(),
    updatedAt:    c.updatedAt.toISOString(),
  }));

  return (
    <ProductsClient
      initialProducts={products}
      categories={categories}
    />
  );
}
