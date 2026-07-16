// ─────────────────────────────────────────────────────────────
// src/lib/validations.ts
// Zod schemas — single source of truth for all input validation.
// Used in both API route handlers and React Hook Form resolvers.
// ─────────────────────────────────────────────────────────────

import { z } from "zod";

// ── Helpers ───────────────────────────────────────────────────

/**
 * Optional Egyptian pound amount.
 *
 * Prices are fully optional: null, undefined, an empty string (empty form
 * field) and NaN (an empty `valueAsNumber` input) all normalise to null.
 * A supplied value must be a non-negative number up to 999,999 — zero is
 * accepted when entered intentionally.
 */
const optionalEgpAmount = z.preprocess(
  (v) =>
    v === "" ||
    v === null ||
    v === undefined ||
    (typeof v === "number" && Number.isNaN(v))
      ? null
      : v,
  z
    .number({ invalid_type_error: "يجب أن يكون السعر رقماً" })
    .nonnegative("السعر لا يمكن أن يكون سالباً")
    .max(999_999, "السعر كبير جداً")
    .nullable()
);

/** URL string (relative /uploads/... or absolute https://...) — or empty */
const urlOrEmpty = z
  .string()
  .refine(
    (v) =>
      v === "" ||
      v.startsWith("/") ||
      v.startsWith("http://") ||
      v.startsWith("https://"),
    { message: "يجب أن يكون رابطاً صحيحاً" }
  );

// ── Auth ──────────────────────────────────────────────────────

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "اسم المستخدم مطلوب")
    .max(64, "اسم المستخدم طويل جداً")
    .trim(),
  password: z
    .string()
    .min(1, "كلمة المرور مطلوبة")
    .max(128, "كلمة المرور طويلة جداً"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ── Category ──────────────────────────────────────────────────

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "اسم القسم مطلوب")
    .max(100, "اسم القسم يجب أن يكون أقل من 100 حرف")
    .trim(),
  imageUrl: urlOrEmpty.default(""),
});

export type CategoryInput = z.infer<typeof categorySchema>;

// ── Product ───────────────────────────────────────────────────

export const productSchema = z
  .object({
    name: z
      .string()
      .min(1, "اسم المنتج مطلوب")
      .max(200, "اسم المنتج يجب أن يكون أقل من 200 حرف")
      .trim(),

    description: z
  .string()
  .trim()
  .max(2000, "الوصف يجب أن يكون أقل من 2000 حرف")
  .default(""),

    categoryId: z
      .string()
      .min(1, "يجب اختيار القسم")
      .regex(/^[a-f\d]{24}$/i, "معرّف القسم غير صالح"),

    images: z
      .array(z.string().url("رابط الصورة غير صالح"))
      .default([]),

    originalPrice: optionalEgpAmount,

    discountPrice: optionalEgpAmount,

    available:  z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    isOffer:    z.boolean().default(false),
  })
  // Only meaningful when both prices are set. A lone discount price is the
  // selling price, so it has nothing to be cheaper than.
  .refine(
    (data) =>
      data.discountPrice === null ||
      data.originalPrice === null ||
      data.discountPrice < data.originalPrice,
    {
      message: "سعر الخصم يجب أن يكون أقل من السعر الأصلي",
      path: ["discountPrice"],
    }
  );

export type ProductInput = z.infer<typeof productSchema>;

// ── Settings ──────────────────────────────────────────────────

export const settingsSchema = z.object({
  whatsappNumber: z
    .string()
    .min(1, "رقم الواتساب مطلوب")
    .regex(
      /^\+?[0-9\s\-()]{7,20}$/,
      "رقم الواتساب غير صالح (مثال: +201012506517)"
    )
    .trim(),

  facebookUrl: urlOrEmpty.default(""),
  instagramUrl: urlOrEmpty.default(""),
  tiktokUrl:   urlOrEmpty.default(""),

  // Optional — but when present must be a real Telegram link
  // (t.me / telegram.me / telegram.dog). Empty string clears it.
  telegramUrl: z
    .string()
    .trim()
    .refine(
      (v) =>
        v === "" ||
        /^https?:\/\/(www\.)?(t\.me|telegram\.me|telegram\.dog)\/.+/i.test(v),
      { message: "يجب أن يكون رابط تليجرام صحيحاً (مثال: https://t.me/username)" }
    )
    .default(""),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

// ── Product filters (query params) ───────────────────────────

export const productFiltersSchema = z.object({
  categoryId:   z.string().optional(),
  categorySlug: z.string().optional(),
  available:    z.coerce.boolean().optional(),
  isFeatured:   z.coerce.boolean().optional(),
  isOffer:      z.coerce.boolean().optional(),
  search:       z.string().max(100).optional(),
  page:         z.coerce.number().int().min(1).default(1),
  pageSize:     z.coerce.number().int().min(1).max(100).default(24),
});

export type ProductFiltersInput = z.infer<typeof productFiltersSchema>;
