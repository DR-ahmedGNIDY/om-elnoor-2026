// ─────────────────────────────────────────────────────────────
// src/app/api/categories/[id]/route.ts
// GET    /api/categories/:id  — public
// PUT    /api/categories/:id  — protected, update name/image
// DELETE /api/categories/:id  — protected, only if no products
// ─────────────────────────────────────────────────────────────

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations";
import { apiSuccess, apiError, isObjectId } from "@/lib/utils";
import { generateSlug, ensureUniqueCategorySlug } from "@/lib/slug";
import { toCategoryDTO, CATEGORY_COUNT_INCLUDE } from "@/lib/dto";
import type { CategoryWithCountDTO } from "@/types";

type Params = { params: Promise<{ id: string }> };

// ── GET /api/categories/:id ───────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  if (!isObjectId(id)) return apiError("معرّف غير صالح", 400);

  try {
    const category = await prisma.category.findUnique({
      where:   { id },
      include: CATEGORY_COUNT_INCLUDE,
    });

    if (!category) return apiError("القسم غير موجود", 404);

    return apiSuccess(toCategoryDTO(category));
  } catch (err) {
    console.error("[GET /api/categories/:id]", err);
    return apiError("حدث خطأ أثناء جلب القسم", 500);
  }
}

// ── PUT /api/categories/:id ───────────────────────────────────
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) return apiError("غير مصرح", 401);

  const { id } = await params;
  if (!isObjectId(id)) return apiError("معرّف غير صالح", 400);

  try {
    // Confirm the category exists
    const existing = await prisma.category.findUnique({
      where: { id },
      select: { id: true, slug: true },
    });
    if (!existing) return apiError("القسم غير موجود", 404);

    // Validate body
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
      return apiError("بيانات غير صالحة", 422, fieldErrors);
    }

    const { name, imageUrl } = parsed.data;

    // Re-generate slug only if the name changed
    let slug = existing.slug;
    const newBaseSlug = generateSlug(name);
    if (newBaseSlug !== existing.slug && !existing.slug.startsWith(newBaseSlug)) {
      slug = await ensureUniqueCategorySlug(newBaseSlug, id);
    }

    const updated = await prisma.category.update({
      where: { id },
      data:  { name, slug, imageUrl },
      include: CATEGORY_COUNT_INCLUDE,
    });

    return apiSuccess(toCategoryDTO(updated));
  } catch (err) {
    console.error("[PUT /api/categories/:id]", err);
    return apiError("حدث خطأ أثناء تحديث القسم", 500);
  }
}

// ── DELETE /api/categories/:id ────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) return apiError("غير مصرح", 401);

  const { id } = await params;
  if (!isObjectId(id)) return apiError("معرّف غير صالح", 400);

  try {
    // Check for linked products before deleting
    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      return apiError(
        `لا يمكن حذف هذا القسم لأنه يحتوي على ${productCount} منتج. يرجى نقل المنتجات أو حذفها أولاً.`,
        409
      );
    }

    await prisma.category.delete({ where: { id } });

    return apiSuccess({ id, deleted: true });
  } catch (err) {
    console.error("[DELETE /api/categories/:id]", err);
    return apiError("حدث خطأ أثناء حذف القسم", 500);
  }
}
