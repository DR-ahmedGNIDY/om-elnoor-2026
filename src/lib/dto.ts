// ─────────────────────────────────────────────────────────────
// src/lib/dto.ts
// Shared DTO mapper functions for server-side use.
// Imported by API routes — never by client components.
// Centralises all Prisma → DTO conversions so route files
// never need to import from each other.
// ─────────────────────────────────────────────────────────────

import type { Prisma } from "@prisma/client";
import { calcDiscountPercent } from "@/lib/utils";
import type { ProductWithCategoryDTO, CategoryWithCountDTO } from "@/types";

// ── Shared Prisma include shapes ──────────────────────────────

export const PRODUCT_INCLUDE = {
  category: { select: { id: true, name: true, slug: true } },
} as const;

export const CATEGORY_COUNT_INCLUDE = {
  _count: { select: { products: true } },
} as const;

// ── Product ───────────────────────────────────────────────────

type PrismaProductWithCategory = Prisma.ProductGetPayload<{
  include: typeof PRODUCT_INCLUDE;
}>;

export function toProductDTO(p: PrismaProductWithCategory): ProductWithCategoryDTO {
  return {
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
  };
}

// ── Category ──────────────────────────────────────────────────

type PrismaCategoryWithCount = Prisma.CategoryGetPayload<{
  include: typeof CATEGORY_COUNT_INCLUDE;
}>;

export function toCategoryDTO(c: PrismaCategoryWithCount): CategoryWithCountDTO {
  return {
    id:           c.id,
    name:         c.name,
    slug:         c.slug,
    imageUrl:     c.imageUrl,
    productCount: c._count.products,
    createdAt:    c.createdAt.toISOString(),
    updatedAt:    c.updatedAt.toISOString(),
  };
}
