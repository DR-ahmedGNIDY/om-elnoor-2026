// ─────────────────────────────────────────────────────────────
// src/app/api/products/route.ts
// GET  /api/products  — public, filterable + paginated
// POST /api/products  — protected, creates a new product
// ─────────────────────────────────────────────────────────────

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema, productFiltersSchema } from "@/lib/validations";
import { apiSuccess, apiError, calcDiscountPercent } from "@/lib/utils";
import { generateSlug, ensureUniqueProductSlug } from "@/lib/slug";
import { toProductDTO, PRODUCT_INCLUDE } from "@/lib/dto";
import type { ProductWithCategoryDTO, PaginatedResult } from "@/types";
import type { Prisma } from "@prisma/client";

const CATEGORY_SELECT = PRODUCT_INCLUDE.category.select;

// ── GET /api/products ─────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const parsed = productFiltersSchema.safeParse({
      categoryId:   searchParams.get("categoryId")   ?? undefined,
      categorySlug: searchParams.get("categorySlug") ?? undefined,
      available:    searchParams.get("available")    ?? undefined,
      isFeatured:   searchParams.get("isFeatured")   ?? undefined,
      isOffer:      searchParams.get("isOffer")       ?? undefined,
      search:       searchParams.get("search")        ?? undefined,
      page:         searchParams.get("page")          ?? 1,
      pageSize:     searchParams.get("pageSize")      ?? 24,
    });

    if (!parsed.success) {
      return apiError("معاملات الفلترة غير صالحة", 400);
    }

    const {
      categoryId,
      categorySlug,
      available,
      isFeatured,
      isOffer,
      search,
      page,
      pageSize,
    } = parsed.data;

    // Build Prisma where clause
    const where: Prisma.ProductWhereInput = {};

    if (categoryId)   where.categoryId = categoryId;
    if (categorySlug) where.category   = { slug: categorySlug };
    if (available   !== undefined) where.available   = available;
    if (isFeatured  !== undefined) where.isFeatured  = isFeatured;
    if (isOffer     !== undefined) where.isOffer      = isOffer;
    if (search) {
      where.OR = [
        { name:        { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: PRODUCT_INCLUDE,
        orderBy: { createdAt: "desc" },
        skip:    (page - 1) * pageSize,
        take:    pageSize,
      }),
    ]);

    const result: PaginatedResult<ProductWithCategoryDTO> = {
      items:      products.map(toProductDTO),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    return apiSuccess(result);
  } catch (err) {
    console.error("[GET /api/products]", err);
    return apiError("حدث خطأ أثناء جلب المنتجات", 500);
  }
}

// ── POST /api/products ────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return apiError("غير مصرح", 401);

  try {
    const body   = await req.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
      return apiError("بيانات غير صالحة", 422, fieldErrors);
    }

    const data = parsed.data;

    // Verify category exists
    const category = await prisma.category.findUnique({
      where:  { id: data.categoryId },
      select: { id: true },
    });
    if (!category) return apiError("القسم المختار غير موجود", 400);

    // Generate unique slug
    const slug = await ensureUniqueProductSlug(generateSlug(data.name));

    const product = await prisma.product.create({
      data: {
        name:          data.name,
        slug,
        description:   data.description,
        categoryId:    data.categoryId,
        images:        data.images,
        originalPrice: data.originalPrice,
        discountPrice: data.discountPrice,
        available:     data.available,
        isFeatured:    data.isFeatured,
        isOffer:       data.isOffer,
      },
      include: PRODUCT_INCLUDE,
    });

    return apiSuccess(toProductDTO(product), 201);
  } catch (err) {
    console.error("[POST /api/products]", err);
    return apiError("حدث خطأ أثناء إنشاء المنتج", 500);
  }
}
