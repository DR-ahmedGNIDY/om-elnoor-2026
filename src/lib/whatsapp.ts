// ─────────────────────────────────────────────────────────────
// src/lib/whatsapp.ts
// WhatsApp message builder — single source of truth.
// All WA URLs in the app are generated here so the message
// format stays consistent and easy to update.
// ─────────────────────────────────────────────────────────────

import { effectivePrice, formatPrice } from "@/lib/utils";
import type { CartItem, ProductWithCategoryDTO } from "@/types";

// ── Helpers ───────────────────────────────────────────────────

/** Site base URL used to build public product links. */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Strips all non-numeric chars from a phone number. */
function cleanNumber(raw: string): string {
  return raw.replace(/\D/g, "");
}

/** Base wa.me URL for a cleaned number. */
function waBase(number: string): string {
  return `https://wa.me/${cleanNumber(number)}`;
}

/** Public URL for a product detail page. */
function productUrl(slug: string): string {
  return `${SITE_URL.replace(/\/$/, "")}/product/${slug}`;
}

// ── Message builders ──────────────────────────────────────────

/**
 * Builds the full cart order message.
 *
 * Format:
 * ─────────────────────────
 * 🏠 كوكي هوم
 *
 * السلام عليكم 👋
 * أريد طلب المنتجات التالية:
 *
 * المنتجات:
 * ━━━━━━━━━━━━━━━━━━━━
 * 🛍️ [اسم المنتج]
 *    الكمية: 2
 *    السعر:  120 ج.م
 * ───────────────────
 * 🛍️ ...
 * ━━━━━━━━━━━━━━━━━━━━
 *
 * الإجمالي: 240 ج.م
 *
 * شكراً لكم 🙏
 * ─────────────────────────
 */
export function buildCartMessage(items: CartItem[]): string {
  if (items.length === 0) return "";

  const lines: string[] = [
    "🏠 كوكي هوم",
    "",
    "السلام عليكم 👋",
    "أريد طلب المنتجات التالية:",
    "",
    "المنتجات:",
    "━━━━━━━━━━━━━━━━━━━━",
  ];

  let total = 0;

  items.forEach(({ product, quantity }) => {
    const unitPrice = effectivePrice(product);
    const lineTotal = unitPrice * quantity;
    total += lineTotal;

    lines.push(`🛍️ ${product.name}`);
    lines.push(`   🔗 ${productUrl(product.slug)}`);
    lines.push(`   الكمية: ${quantity}`);
    lines.push(`   السعر:  ${formatPrice(lineTotal)}`);
    lines.push("───────────────────");
  });

  lines.push("━━━━━━━━━━━━━━━━━━━━");
  lines.push("");
  lines.push(`الإجمالي: ${formatPrice(total)}`);
  lines.push("");
  lines.push("شكراً لكم 🙏");

  return lines.join("\n");
}

/**
 * Builds a single-product inquiry message.
 *
 * Format:
 * ─────────────────────────
 * 🏠 كوكي هوم
 *
 * السلام عليكم 👋
 * أريد الاستفسار عن:
 *
 * 🛍️ [اسم المنتج]
 * 💰 السعر: 120 ج.م
 *
 * شكراً لكم 🙏
 * ─────────────────────────
 */
export function buildProductInquiryMessage(
  product: Pick<ProductWithCategoryDTO, "name" | "slug" | "originalPrice" | "discountPrice">
): string {
  const price = effectivePrice(product);
  return [
    "🏠 كوكي هوم",
    "",
    "السلام عليكم 👋",
    "أريد الاستفسار عن:",
    "",
    `🛍️ ${product.name}`,
    `🔗 ${productUrl(product.slug)}`,
    `💰 السعر: ${formatPrice(price)}`,
    "",
    "شكراً لكم 🙏",
  ].join("\n");
}

// ── URL generators ────────────────────────────────────────────

/**
 * Returns the wa.me URL for a full cart order.
 * If the cart is empty, returns a plain wa.me link.
 */
export function buildCartWhatsAppUrl(
  whatsappNumber: string,
  items: CartItem[]
): string {
  if (items.length === 0) return waBase(whatsappNumber);
  const message = buildCartMessage(items);
  return `${waBase(whatsappNumber)}?text=${encodeURIComponent(message)}`;
}

/**
 * Returns the wa.me URL for a single-product inquiry.
 */
export function buildProductWhatsAppUrl(
  whatsappNumber: string,
  product: Pick<ProductWithCategoryDTO, "name" | "slug" | "originalPrice" | "discountPrice">
): string {
  const message = buildProductInquiryMessage(product);
  return `${waBase(whatsappNumber)}?text=${encodeURIComponent(message)}`;
}
