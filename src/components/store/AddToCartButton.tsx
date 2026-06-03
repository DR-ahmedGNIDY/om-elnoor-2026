"use client";

// ─────────────────────────────────────────────────────────────
// src/components/store/AddToCartButton.tsx
// Add-to-cart button with brief "added" state and toast feedback.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import type { ProductWithCategoryDTO } from "@/types";

interface AddToCartButtonProps {
  product: ProductWithCategoryDTO;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem             = useCartStore((s) => s.addItem);
  const [added, setAdded]   = useState(false);
  const { showToast, ToastContainer } = useToast();

  function handleAdd() {
    addItem(product);
    setAdded(true);
    showToast(`تمت إضافة "${product.name}" للسلة`, "success");
    setTimeout(() => setAdded(false), 1800);
  }

  if (!product.available) {
    return (
      <button disabled className="btn bg-gray-100 text-gray-400 w-full cursor-not-allowed">
        غير متوفر حالياً
      </button>
    );
  }

  return (
    <>
      <ToastContainer />
      <button
        onClick={handleAdd}
        className={cn(
          "btn w-full text-base transition-all duration-300",
          added ? "bg-green-500 text-white" : "btn-primary"
        )}
      >
        {added ? "✓ تمت الإضافة للسلة" : "🛒 أضف للسلة"}
      </button>
    </>
  );
}
