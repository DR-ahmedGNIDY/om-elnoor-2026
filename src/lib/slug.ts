// ─────────────────────────────────────────────────────────────
// src/lib/slug.ts
// Server-side slug generation using the `slugify` package.
// Used in API routes only — not imported by client components.
// ─────────────────────────────────────────────────────────────

import slugify from "slugify";
import { prisma } from "@/lib/prisma";

/**
 * Converts a name (Arabic or Latin) to a URL-safe slug.
 *
 * Arabic text: slugify transliterates common Arabic words.
 * For full Arabic slugs, we fall back to a manual kebab-case
 * conversion that keeps Arabic Unicode characters intact,
 * which is valid in modern URLs (RFC 3986).
 *
 * Examples:
 *   "أطقم الحلل"     → "atqam-alhellal"  (transliterated)
 *   "Granite Set"    → "granite-set"
 *   "طقم 7 قطع"     → "tqm-7-qt"
 */
export function generateSlug(text: string): string {
  // First attempt: full transliteration (works well for known Arabic words)
  const transliterated = slugify(text, {
    lower:       true,
    strict:      true, // strips non-alphanumeric except hyphens
    locale:      "ar",
    trim:        true,
    replacement: "-",
  });

  if (transliterated && transliterated.length >= 2) {
    return transliterated;
  }

  // Fallback: keep Arabic Unicode, replace spaces with hyphens
  return (
    text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\u0600-\u06FFa-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || `item-${Date.now()}`
  );
}

// ── Unique slug helpers ───────────────────────────────────────

/**
 * Ensures a category slug is unique in MongoDB.
 * Appends -2, -3, … until no conflict is found.
 * Pass excludeId when updating an existing record so it does
 * not conflict with its own current slug.
 */
export async function ensureUniqueCategorySlug(
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const existing = await prisma.category.findUnique({
      where:  { slug },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) return slug;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

/**
 * Ensures a product slug is unique in MongoDB.
 * Appends -2, -3, … until no conflict is found.
 */
export async function ensureUniqueProductSlug(
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const existing = await prisma.product.findUnique({
      where:  { slug },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) return slug;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}
