// ─────────────────────────────────────────────────────────────
// src/app/api/products/[id]/route.ts
// GET    /api/products/:id  — public (by MongoDB id or slug)
// PUT    /api/products/:id  — protected, full update
// DELETE /api/products/:id  — protected
// ─────────────────────────────────────────────────────────────

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";
import { apiSuccess, apiError, isObjectId } from "@/lib/utils";
import { generateSlug, ensureUniqueProductSlug } from "@/lib/slug";
import { toProductDTO, PRODUCT_INCLUDE } from "@/lib/dto";

type Params = { params: Promise<{ id: string }> };

// ── GET /api/products/:id ─────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    // Accept both MongoDB ObjectId and slug
    const product = isObjectId(id)
      ? await prisma.product.findUnique({ where: { id },   include: PRODUCT_INCLUDE })
      : await prisma.product.findUnique({ where: { slug: id }, include: PRODUCT_INCLUDE });

    if (!product) return apiError("المنتج غير موجود", 404);

    return apiSuccess(toProductDTO(product));
  } catch (err) {
    console.error("[GET /api/products/:id]", err);
    return apiError("حدث خطأ أثناء جلب المنتج", 500);
  }
}

// ── PUT /api/products/:id ─────────────────────────────────────
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) return apiError("غير مصرح", 401);

  const { id } = await params;
  if (!isObjectId(id)) return apiError("معرّف غير صالح", 400);

  try {
    const existing = await prisma.product.findUnique({
      where:  { id },
      select: { id: true, slug: true },
    });
    if (!existing) return apiError("المنتج غير موجود", 404);

    const body   = await req.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
      return apiError("بيانات غير صالحة", 422, fieldErrors);
    }

    const data = parsed.data;

    // Verify category still exists
    const category = await prisma.category.findUnique({
      where:  { id: data.categoryId },
      select: { id: true },
    });
    if (!category) return apiError("القسم المختار غير موجود", 400);

    // Re-slug only when name actually changed
    let slug = existing.slug;
    const newBase = generateSlug(data.name);
    if (!existing.slug.startsWith(newBase)) {
      slug = await ensureUniqueProductSlug(newBase, id);
    }

    const updated = await prisma.product.update({
      where: { id },
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

    return apiSuccess(toProductDTO(updated));
  } catch (err) {
    console.error("[PUT /api/products/:id]", err);
    return apiError("حدث خطأ أثناء تحديث المنتج", 500);
  }
}

// ── DELETE /api/products/:id ──────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) return apiError("غير مصرح", 401);

  const { id } = await params;
  if (!isObjectId(id)) return apiError("معرّف غير صالح", 400);

  try {
    const existing = await prisma.product.findUnique({
      where:  { id },
      select: { id: true },
    });
    if (!existing) return apiError("المنتج غير موجود", 404);

    await prisma.product.delete({ where: { id } });

    return apiSuccess({ id, deleted: true });
  } catch (err) {
    console.error("[DELETE /api/products/:id]", err);
    return apiError("حدث خطأ أثناء حذف المنتج", 500);
  }
}
