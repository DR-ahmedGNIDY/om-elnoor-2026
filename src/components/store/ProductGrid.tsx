// ─────────────────────────────────────────────────────────────
// src/components/store/ProductGrid.tsx
// Reusable product grid section with header and "view all" link.
// Server Component — renders the grid from pre-fetched data.
// The individual ProductCards are client components inside.
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import { ProductCard } from "@/components/store/ProductCard";
import type { ProductWithCategoryDTO } from "@/types";

interface ProductGridProps {
  title:       string;
  products:    ProductWithCategoryDTO[];
  viewAllHref?: string;
  viewAllLabel?: string;
  /** Max items to show before "view all" link */
  limit?:      number;
  emptyMessage?: string;
}

export function ProductGrid({
  title,
  products,
  viewAllHref,
  viewAllLabel = "شاهد جميع المنتجات",
  limit        = 8,
  emptyMessage = "لا توجد منتجات في هذا القسم حالياً",
}: ProductGridProps) {
  const shown = limit ? products.slice(0, limit) : products;

  return (
    <section className="py-10">
      <div className="container-store">
        {/* Section header */}
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          {viewAllHref && products.length > 0 && (
            <Link
              href={viewAllHref}
              className="font-cairo font-bold text-sm text-primary hover:text-secondary transition-colors flex items-center gap-1"
            >
              {viewAllLabel}
              <span aria-hidden>←</span>
            </Link>
          )}
        </div>

        {/* Grid */}
        {shown.length === 0 ? (
          <div className="text-center py-16 text-brand-text/40 font-cairo">
            {emptyMessage}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {shown.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
