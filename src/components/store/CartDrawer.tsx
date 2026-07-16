"use client";

// ─────────────────────────────────────────────────────────────
// src/components/store/CartDrawer.tsx
// Slide-in cart drawer accessible from any page via the header.
// WhatsApp checkout uses the number stored in DB settings,
// fetched once on mount via /api/settings.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { buildCartWhatsAppUrl } from "@/lib/whatsapp";
import { formatPrice, effectivePrice, coverImage, cn } from "@/lib/utils";
import type { CartItem } from "@/types";

interface CartDrawerProps {
  open:    boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, clearCart, count, subtotal } =
    useCartStore();

  // Fetch WhatsApp number from settings API (cached in state)
  const [waNumber, setWaNumber] = useState<string>("+201012506517");
  const [waLoaded, setWaLoaded] = useState(false);

  useEffect(() => {
    if (waLoaded) return;
    fetch("/api/settings")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data?.whatsappNumber) {
          setWaNumber(j.data.whatsappNumber);
        }
        setWaLoaded(true);
      })
      .catch(() => setWaLoaded(true));
  }, [waLoaded]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const [waSent, setWaSent] = useState(false);

  const handleWhatsApp = useCallback(() => {
    const url = buildCartWhatsAppUrl(waNumber, items);
    window.open(url, "_blank", "noopener,noreferrer");
    // Don't clear immediately — show a confirmation prompt instead
    setWaSent(true);
    onClose();
  }, [waNumber, items, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal aria-label="سلة التسوق">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div className="relative flex flex-col w-full max-w-md bg-white shadow-2xl animate-slide-in h-full">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-primary flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <h2 className="font-cairo font-black text-white text-lg">
              سلة التسوق
            </h2>
            {count > 0 && (
              <span className="badge bg-gold text-gold-foreground font-cairo font-black">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 transition-colors flex items-center justify-center text-white"
            aria-label="إغلاق"
          >
            <XIcon />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
              <span className="text-6xl">🛒</span>
              <div>
                <p className="font-cairo font-black text-lg text-brand-text">
                  السلة فارغة
                </p>
                <p className="font-cairo text-sm text-brand-text/50 mt-1">
                  أضف منتجات لتبدأ طلبك
                </p>
              </div>
              <button
                onClick={onClose}
                className="btn-primary btn-sm mt-2"
              >
                تصفح المنتجات
              </button>
            </div>
          ) : (
            items.map((item) => (
              <CartDrawerItem
                key={item.product.id}
                item={item}
                onRemove={() => removeItem(item.product.id)}
                onQuantityChange={(q) => updateQuantity(item.product.id, q)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="flex-shrink-0 border-t border-gray-100 bg-gray-50 px-5 py-5 space-y-4">
            {/* Subtotal — the amount is dropped when no item carries a price */}
            <div className="flex items-center justify-between">
              <span className="font-cairo font-bold text-brand-text/70">
                الإجمالي ({count} منتج)
              </span>
              {subtotal > 0 && (
                <span className="font-cairo font-black text-xl text-primary">
                  {formatPrice(subtotal)}
                </span>
              )}
            </div>

            {/* WhatsApp checkout */}
            <button
              onClick={handleWhatsApp}
              className="btn-whatsapp w-full text-base gap-2"
            >
              <WhatsAppIcon />
              اطلب عبر واتساب
            </button>

            {/* View full cart */}
            <Link
              href="/cart"
              onClick={onClose}
              className="btn btn-outline w-full text-sm"
            >
              عرض السلة كاملة
            </Link>

            {/* Clear cart */}
            <button
              onClick={clearCart}
              className="w-full font-cairo text-xs text-red-400 hover:text-red-600 transition-colors py-1"
            >
              إفراغ السلة
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Single item row ───────────────────────────────────────────

function CartDrawerItem({
  item,
  onRemove,
  onQuantityChange,
}: {
  item:             CartItem;
  onRemove:         () => void;
  onQuantityChange: (q: number) => void;
}) {
  const { product, quantity } = item;
  const price = effectivePrice(product);
  const img   = coverImage(product.images);

  return (
    <div className="flex gap-3 bg-white rounded-xl p-3 shadow-card">
      {/* Thumbnail */}
      <Link
        href={`/product/${product.slug}`}
        className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0"
      >
        <Image
          src={img}
          alt={product.name}
          fill
          className="object-cover"
          unoptimized={img.startsWith("/")}
        />
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/product/${product.slug}`}
          className="font-cairo font-bold text-sm text-brand-text leading-snug hover:text-primary transition-colors line-clamp-2"
        >
          {product.name}
        </Link>
        {price !== null && (
          <p className="font-cairo font-black text-primary text-sm mt-1">
            {formatPrice(price * quantity)}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-end justify-between flex-shrink-0 gap-2">
        {/* Remove */}
        <button
          onClick={onRemove}
          className="text-gray-300 hover:text-red-500 transition-colors"
          aria-label={`حذف ${product.name}`}
        >
          <XIcon size={14} />
        </button>

        {/* Quantity stepper */}
        <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => onQuantityChange(quantity - 1)}
            className="w-7 h-7 flex items-center justify-center text-brand-text hover:bg-gray-100 transition-colors font-cairo font-bold text-base"
            aria-label="تقليل"
          >
            −
          </button>
          <span className="font-cairo font-bold text-sm w-5 text-center select-none">
            {quantity}
          </span>
          <button
            onClick={() => onQuantityChange(quantity + 1)}
            className="w-7 h-7 flex items-center justify-center text-brand-text hover:bg-gray-100 transition-colors font-cairo font-bold text-base"
            aria-label="زيادة"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6"  x2="6"  y2="18" />
      <line x1="6"  y1="6"  x2="18" y2="18" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
