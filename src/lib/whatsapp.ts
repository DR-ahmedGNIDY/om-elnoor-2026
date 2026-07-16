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

/**
 * Removes invisible bidirectional / directional control characters that
 * Intl formatting inserts (LRM, RLM, ALM, isolates, embeddings). WhatsApp
 * renders these as literal "?" marks, so we strip them from WA messages.
 */
function stripBidiMarks(text: string): string {
  // U+200E/200F (LRM/RLM), U+061C (ALM), U+202A–202E (embeddings/overrides),
  // U+2066–2069 (isolates).
  return text.replace(/[‎‏؜‪-‮⁦-⁩]/g, "");
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
    "كوكي هوم",
    "",
    "السلام عليكم",
    "أريد طلب المنتجات التالية:",
    "",
    "المنتجات:",
    "━━━━━━━━━━━━━━━━━━━━",
  ];

  let total = 0;

  items.forEach(({ product, quantity }) => {
    const unitPrice = effectivePrice(product);

    lines.push(`• ${product.name}`);
    lines.push(`   الرابط: ${productUrl(product.slug)}`);
    lines.push(`   الكمية: ${quantity}`);

    // Products without a price contribute no line and no total — the customer
    // asks for the price in the chat instead.
    if (unitPrice !== null) {
      const lineTotal = unitPrice * quantity;
      total += lineTotal;
      lines.push(`   السعر:  ${formatPrice(lineTotal)}`);
    }

    lines.push("───────────────────");
  });

  lines.push("━━━━━━━━━━━━━━━━━━━━");
  lines.push("");
  if (total > 0) {
    lines.push(`الإجمالي: ${formatPrice(total)}`);
    lines.push("");
  }
  lines.push("شكراً لكم");

  return stripBidiMarks(lines.join("\n"));
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
  const message = [
    "كوكي هوم",
    "",
    "السلام عليكم",
    "أريد الاستفسار عن:",
    "",
    `• ${product.name}`,
    `الرابط: ${productUrl(product.slug)}`,
    // Price line is dropped entirely when the product has no price set.
    ...(price !== null ? [`السعر: ${formatPrice(price)}`] : []),
    "",
    "شكراً لكم",
  ].join("\n");
  return stripBidiMarks(message);
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
