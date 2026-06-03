// ─────────────────────────────────────────────────────────────
// src/app/api/categories/route.ts
// GET  /api/categories  — public, returns all categories with product count
// POST /api/categories  — protected, creates a new category
// ─────────────────────────────────────────────────────────────

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations";
import { apiSuccess, apiError } from "@/lib/utils";
import { generateSlug, ensureUniqueCategorySlug } from "@/lib/slug";
import { toCategoryDTO, CATEGORY_COUNT_INCLUDE } from "@/lib/dto";
import type { CategoryWithCountDTO } from "@/types";

// ── GET /api/categories ───────────────────────────────────────
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "asc" },
      include: CATEGORY_COUNT_INCLUDE,
    });

    return apiSuccess(categories.map(toCategoryDTO));
  } catch (err) {
    console.error("[GET /api/categories]", err);
    return apiError("حدث خطأ أثناء جلب الأقسام", 500);
  }
}

// ── POST /api/categories ──────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return apiError("غير مصرح", 401);

  try {
    const body   = await req.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
      return apiError("بيانات غير صالحة", 422, fieldErrors);
    }

    const { name, imageUrl } = parsed.data;
    const slug = await ensureUniqueCategorySlug(generateSlug(name));

    const category = await prisma.category.create({
      data: { name, slug, imageUrl },
      include: CATEGORY_COUNT_INCLUDE,
    });

    return apiSuccess(toCategoryDTO(category), 201);
  } catch (err) {
    console.error("[POST /api/categories]", err);
    return apiError("حدث خطأ أثناء إنشاء القسم", 500);
  }
}
