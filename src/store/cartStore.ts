// ─────────────────────────────────────────────────────────────
// src/store/cartStore.ts
// Zustand cart store with localStorage persistence.
// Used by StoreHeader (count badge) and CartPage (full list).
// WhatsApp checkout is wired in Phase 8 — this store only
// manages the item list and quantities.
// ─────────────────────────────────────────────────────────────

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { effectivePrice } from "@/lib/utils";
import type { CartItem, ProductWithCategoryDTO } from "@/types";

interface CartState {
  items: CartItem[];

  // Derived
  count:    number;
  subtotal: number;

  // Actions
  addItem:        (product: ProductWithCategoryDTO) => void;
  removeItem:     (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart:      () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items:    [],
      count:    0,
      subtotal: 0,

      addItem(product) {
        set((state) => {
          const existing = state.items.find(
            (i) => i.product.id === product.id
          );

          const items: CartItem[] = existing
            ? state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              )
            : [...state.items, { product, quantity: 1 }];

          return {
            items,
            count:    items.reduce((s, i) => s + i.quantity, 0),
            subtotal: items.reduce(
              (s, i) => s + effectivePrice(i.product) * i.quantity,
              0
            ),
          };
        });
      },

      removeItem(productId) {
        set((state) => {
          const items = state.items.filter(
            (i) => i.product.id !== productId
          );
          return {
            items,
            count:    items.reduce((s, i) => s + i.quantity, 0),
            subtotal: items.reduce(
              (s, i) => s + effectivePrice(i.product) * i.quantity,
              0
            ),
          };
        });
      },

      updateQuantity(productId, quantity) {
        if (quantity < 1) {
          get().removeItem(productId);
          return;
        }
        set((state) => {
          const items = state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          );
          return {
            items,
            count:    items.reduce((s, i) => s + i.quantity, 0),
            subtotal: items.reduce(
              (s, i) => s + effectivePrice(i.product) * i.quantity,
              0
            ),
          };
        });
      },

      clearCart() {
        set({ items: [], count: 0, subtotal: 0 });
      },
    }),
    {
      name:    "om-alnour-cart",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : {
          getItem:    () => null,
          setItem:    () => {},
          removeItem: () => {},
        }
      ),
    }
  )
);
