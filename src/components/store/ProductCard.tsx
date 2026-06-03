"use client";

// ─────────────────────────────────────────────────────────────
// src/components/store/ProductCard.tsx
// Reusable product card for all grid sections.
// Client component because it uses the cart store.
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/components/ui/Toast";
import { formatPrice, effectivePrice, calcDiscountPercent, coverImage, cn } from "@/lib/utils";
import type { ProductWithCategoryDTO } from "@/types";

interface ProductCardProps {
  product: ProductWithCategoryDTO;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem     = useCartStore((s) => s.addItem);
  const { showToast, ToastContainer } = useToast();
  const discPercent = calcDiscountPercent(product.originalPrice, product.discountPrice);
  const price       = effectivePrice(product);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    addItem(product);
    showToast(`تمت الإضافة للسلة ✓`, "success", 2000);
  }

  return (
    <div className="card-hover group flex flex-col">
      {/* Image */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-product overflow-hidden bg-gray-100">
        <Image
          src={coverImage(product.images)}
          alt={product.name}
          fill
          sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          unoptimized={coverImage(product.images).startsWith("/")}
        />

        {/* Badges */}
        <div className="absolute top-2 start-2 flex flex-col gap-1">
          {product.isOffer && (
            <span className="badge badge-gold text-[10px]">عرض خاص</span>
          )}
          {product.isFeatured && (
            <span className="badge badge-primary text-[10px]">الأكثر طلباً</span>
          )}
          {!product.available && (
            <span className="badge badge-gray text-[10px]">غير متوفر</span>
          )}
        </div>

        {/* Discount ribbon */}
        {discPercent > 0 && (
          <div className="absolute top-2 end-2 w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center font-cairo font-black text-[10px] leading-tight text-center">
            -{discPercent}%
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-col flex-1 p-3">
        <Link href={`/product/${product.slug}`} className="flex-1">
          <h3 className="font-cairo font-bold text-sm text-brand-text leading-snug line-clamp-2 mb-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price row */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="font-cairo font-black text-base text-primary">
            {formatPrice(price)}
          </span>
          {discPercent > 0 && (
            <span className="font-cairo text-xs text-brand-text/40 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAdd}
          disabled={!product.available}
          className={cn(
            "w-full py-2 rounded-xl font-cairo font-bold text-sm transition-all",
            product.available
              ? "bg-primary text-white hover:bg-secondary active:scale-95"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          {product.available ? "أضف للسلة" : "غير متوفر"}
        </button>
      </div>

      <ToastContainer />
    </div>
  );
}
