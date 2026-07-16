// ─────────────────────────────────────────────────────────────
// src/lib/utils.ts
// Pure utility functions — no side effects, fully tree-shakeable.
// ─────────────────────────────────────────────────────────────

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ProductWithCategoryDTO } from "@/types";

// ── Tailwind class merge ──────────────────────────────────────

/**
 * Merges Tailwind classes safely, resolving conflicts.
 * Usage: cn("px-4 py-2", isActive && "bg-primary", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ── Price formatting ──────────────────────────────────────────

/**
 * Formats a number as Egyptian Pounds.
 * e.g. 1299 → "١٬٢٩٩ ج.م"
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("ar-EG", {
    style:                 "currency",
    currency:              "EGP",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculates discount percentage from original and discount prices.
 * Returns 0 if no discount applies.
 * discountPercent is never stored — always derived.
 */
export function calcDiscountPercent(
  originalPrice: number | null,
  discountPrice: number | null
): number {
  if (!originalPrice || !discountPrice || discountPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
}

/**
 * Returns the effective selling price (discountPrice ?? originalPrice),
 * or null when the product has no price set at all.
 */
export function effectivePrice(product: {
  originalPrice: number | null;
  discountPrice: number | null;
}): number | null {
  return product.discountPrice ?? product.originalPrice;
}

/** True when the product has at least one price worth displaying. */
export function hasPrice(product: {
  originalPrice: number | null;
  discountPrice: number | null;
}): boolean {
  return effectivePrice(product) !== null;
}

// ── Slug generation ───────────────────────────────────────────

/**
 * Converts an Arabic or Latin string to a URL-safe slug.
 * Arabic characters are kept as-is; spaces become hyphens.
 * For fully Latin slugs, slugify (in the API layer) is used.
 *
 * This client-safe version handles both scripts.
 */
export function toSlug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")          // spaces → hyphens
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, "")  // strip unsafe chars
    .replace(/-+/g, "-")           // collapse consecutive hyphens
    .replace(/^-|-$/g, "");        // strip leading/trailing hyphens
}

// ── WhatsApp ──────────────────────────────────────────────────
// Centralised in src/lib/whatsapp.ts — re-exported here for
// backwards-compatibility with existing imports.

export {
  buildCartWhatsAppUrl,
  buildProductWhatsAppUrl,
} from "@/lib/whatsapp";

// ── Image helpers ─────────────────────────────────────────────

/** Placeholder SVG data URL shown when no product image is set */
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23f0ede5'/%3E%3Ctext x='50%25' y='50%25' font-size='80' text-anchor='middle' dominant-baseline='middle'%3E🏠%3C/text%3E%3C/svg%3E";

/**
 * Returns the first image URL for a product, or the placeholder.
 */
export function coverImage(images: string[]): string {
  return images[0] || PLACEHOLDER_IMAGE;
}

// ── Date formatting ───────────────────────────────────────────

/**
 * Formats a date in Arabic locale.
 * e.g. new Date() → "١ يناير ٢٠٢٥"
 */
export function formatDateAr(date: Date | string): string {
  return new Intl.DateTimeFormat("ar-EG", {
    year:  "numeric",
    month: "long",
    day:   "numeric",
  }).format(new Date(date));
}

// ── API response helpers ──────────────────────────────────────

import { NextResponse } from "next/server";
import type { ApiError, ApiSuccess } from "@/types";

export function apiSuccess<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(
  error: string,
  status = 400,
  fieldErrors?: Record<string, string[]>
): NextResponse<ApiError> {
  return NextResponse.json(
    { success: false, error, ...(fieldErrors ? { fieldErrors } : {}) },
    { status }
  );
}

// ── Misc ──────────────────────────────────────────────────────

/**
 * Clamps a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Returns true if a string is a valid MongoDB ObjectId.
 */
export function isObjectId(value: string): boolean {
  return /^[a-f\d]{24}$/i.test(value);
}
