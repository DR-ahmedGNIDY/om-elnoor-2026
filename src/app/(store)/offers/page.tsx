// ─────────────────────────────────────────────────────────────
// src/app/(store)/offers/page.tsx
// Special offers page — products where isOffer = true.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { calcDiscountPercent } from "@/lib/utils";
import { ProductGrid } from "@/components/store/ProductGrid";
import type { ProductWithCategoryDTO } from "@/types";

export const metadata: Metadata = {
  title:       "العروض الخاصة",
  description: "أفضل عروض وخصومات أم النور للأدوات المنزلية",
};
export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const raw = await prisma.product.findMany({
    where:   { isOffer: true, available: true },
    orderBy: { createdAt: "desc" },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });

  const products: ProductWithCategoryDTO[] = raw.map((p) => ({
    id:              p.id,
    name:            p.name,
    slug:            p.slug,
    description:     p.description,
    categoryId:      p.categoryId,
    category:        p.category,
    images:          p.images,
    originalPrice:   p.originalPrice,
    discountPrice:   p.discountPrice,
    discountPercent: calcDiscountPercent(p.originalPrice, p.discountPrice),
    available:       p.available,
    isFeatured:      p.isFeatured,
    isOffer:         p.isOffer,
    createdAt:       p.createdAt.toISOString(),
    updatedAt:       p.updatedAt.toISOString(),
  }));

  return (
    <div>
      {/* Hero */}
      <div className="py-16 px-4 text-center"
           style={{ background: "linear-gradient(135deg,#D4AF37,#c49f2a)" }}>
        <h1 className="font-cairo font-black text-3xl md:text-4xl text-white mb-3">
          🏷️ العروض الخاصة
        </h1>
        <p className="font-cairo text-white/80 text-base">
          أسعار خاصة لفترة محدودة — لا تفوّت الفرصة
        </p>
      </div>

      {/* Products */}
      <ProductGrid
        title="جميع العروض"
        products={products}
        limit={products.length}
        emptyMessage="لا توجد عروض متاحة حالياً — تابعنا لمعرفة أحدث العروض"
      />
    </div>
  );
}
