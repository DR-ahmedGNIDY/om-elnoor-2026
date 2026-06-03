// ─────────────────────────────────────────────────────────────
// src/app/admin/categories/page.tsx
// Categories management page — Server Component shell.
// Fetches initial data server-side for instant render,
// then hands off to the client table for mutations.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CategoriesClient } from "./CategoriesClient";
import type { CategoryWithCountDTO } from "@/types";

export const metadata: Metadata = { title: "إدارة الأقسام" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  // Server-side initial fetch — no loading spinner on first render
  const raw = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { products: true } } },
  });

  const categories: CategoryWithCountDTO[] = raw.map((c) => ({
    id:           c.id,
    name:         c.name,
    slug:         c.slug,
    imageUrl:     c.imageUrl,
    productCount: c._count.products,
    createdAt:    c.createdAt.toISOString(),
    updatedAt:    c.updatedAt.toISOString(),
  }));

  return <CategoriesClient initialCategories={categories} />;
}
