"use client";

// ─────────────────────────────────────────────────────────────
// src/app/(store)/cart/CartPageClient.tsx
// Full cart page — item list, quantity controls, subtotal,
// and WhatsApp checkout using the number from DB settings.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { buildCartWhatsAppUrl } from "@/lib/whatsapp";
import { formatPrice, effectivePrice, coverImage } from "@/lib/utils";

export function CartPageClient() {
  const { items, removeItem, updateQuantity, clearCart, subtotal, count } =
    useCartStore();

  // Load WhatsApp number from settings API
  const [waNumber, setWaNumber] = useState<string>("+201012506517");
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data?.whatsappNumber) {
          setWaNumber(j.data.whatsappNumber);
        }
      })
      .catch(() => {});
  }, []);

  const [waSent, setWaSent] = useState(false);

  const handleWhatsApp = useCallback(() => {
    const url = buildCartWhatsAppUrl(waNumber, items);
    window.open(url, "_blank", "noopener,noreferrer");
    // Show confirmation prompt — don't auto-clear
    setWaSent(true);
  }, [waNumber, items]);

  return (
    <div>
      <div className="page-hero">
        <h1 className="page-hero-title">🛒 سلة التسوق</h1>
        <p className="page-hero-sub">
          {count > 0 ? `${count} منتج في سلتك` : "سلتك فارغة"}
        </p>
      </div>

      <div className="container-store py-10">
        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Items list */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={clearCart}
                  className="font-cairo text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  إفراغ السلة
                </button>
              </div>

              {items.map(({ product, quantity }) => {
                const price = effectivePrice(product);
                const img   = coverImage(product.images);

                return (
                  <div key={product.id} className="card flex gap-4 p-4">
                    {/* Image */}
                    <Link
                      href={`/product/${product.slug}`}
                      className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0"
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
                        className="font-cairo font-bold text-brand-text text-sm leading-snug hover:text-primary transition-colors line-clamp-2"
                      >
                        {product.name}
                      </Link>
                      <p className="font-cairo text-xs text-brand-text/40 mt-0.5">
                        {product.category.name}
                      </p>

                      <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center font-cairo font-bold text-brand-text hover:bg-gray-100 transition-colors"
                            aria-label="تقليل"
                          >
                            −
                          </button>
                          <span className="font-cairo font-bold text-sm px-3 select-none">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center font-cairo font-bold text-brand-text hover:bg-gray-100 transition-colors"
                            aria-label="زيادة"
                          >
                            +
                          </button>
                        </div>

                        {/* Line total + remove */}
                        <div className="flex items-center gap-3">
                          <span className="font-cairo font-black text-primary">
                            {formatPrice(price * quantity)}
                          </span>
                          <button
                            onClick={() => removeItem(product.id)}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                            aria-label={`حذف ${product.name}`}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24 space-y-5">
                <h2 className="font-cairo font-black text-lg text-brand-text">
                  ملخص الطلب
                </h2>

                {/* Line items */}
                <div className="space-y-2">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex justify-between gap-2 text-sm">
                      <span className="font-cairo text-brand-text/60 truncate">
                        {product.name}
                        <span className="text-brand-text/40"> × {quantity}</span>
                      </span>
                      <span className="font-cairo font-bold text-brand-text flex-shrink-0">
                        {formatPrice(effectivePrice(product) * quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                  <span className="font-cairo font-bold text-brand-text">الإجمالي</span>
                  <span className="font-cairo font-black text-2xl text-primary">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {/* WhatsApp checkout */}
                <button
                  onClick={handleWhatsApp}
                  className="btn-whatsapp w-full text-base gap-2"
                >
                  <WhatsAppIcon />
                  اطلب عبر واتساب
                </button>

                {/* Post-send confirmation */}
                {waSent && (
                  <div className="rounded-xl bg-green-50 border border-green-200 p-4 space-y-3 animate-fade-in">
                    <p className="font-cairo font-bold text-sm text-green-800 text-center">
                      ✅ تم فتح واتساب بنجاح!
                    </p>
                    <p className="font-cairo text-xs text-green-600 text-center">
                      هل تريد إفراغ السلة بعد إرسال الطلب؟
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { clearCart(); setWaSent(false); }}
                        className="flex-1 py-2 rounded-xl bg-green-600 text-white font-cairo font-bold text-sm hover:bg-green-700 transition-colors"
                      >
                        نعم، إفراغ السلة
                      </button>
                      <button
                        onClick={() => setWaSent(false)}
                        className="flex-1 py-2 rounded-xl border border-gray-200 text-brand-text font-cairo font-bold text-sm hover:bg-gray-50 transition-colors"
                      >
                        الاحتفاظ بها
                      </button>
                    </div>
                  </div>
                )}

                {/* Message preview */}
                <details className="group">
                  <summary className="font-cairo text-xs text-brand-text/40 cursor-pointer hover:text-brand-text/60 transition-colors select-none">
                    معاينة رسالة الطلب
                  </summary>
                  <pre
                    dir="rtl"
                    className="mt-2 p-3 bg-gray-50 rounded-xl text-xs font-cairo text-brand-text/70 whitespace-pre-wrap leading-relaxed overflow-x-auto border border-gray-100"
                  >
                    {buildCartWhatsAppUrl(waNumber, items)
                      ? decodeURIComponent(
                          buildCartWhatsAppUrl(waNumber, items)
                            .split("?text=")[1] ?? ""
                        )
                      : ""}
                  </pre>
                </details>

                <Link href="/categories" className="btn btn-outline w-full text-sm">
                  متابعة التسوق
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────

function EmptyCart() {
  return (
    <div className="text-center py-20 space-y-4">
      <p className="text-7xl">🛒</p>
      <h2 className="font-cairo font-black text-xl text-brand-text">
        سلتك فارغة
      </h2>
      <p className="font-cairo text-brand-text/50">
        أضف منتجات من الكتالوج للبدء
      </p>
      <Link href="/categories" className="btn-primary inline-flex mt-2">
        تصفح المنتجات
      </Link>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
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
