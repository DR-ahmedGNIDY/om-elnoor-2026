// ─────────────────────────────────────────────────────────────
// src/app/(store)/product/[slug]/page.tsx
// Product detail page — Server Component shell.
// ImageGallery and AddToCart are client components.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { calcDiscountPercent, formatPrice, effectivePrice } from "@/lib/utils";
import { buildProductMetadata, buildProductLD, buildBreadcrumbLD } from "@/lib/metadata";
import { ProductGallery } from "@/components/store/ProductGallery";
import { AddToCartButton } from "@/components/store/AddToCartButton";
import { WhatsAppOrderButton } from "@/components/store/WhatsAppOrderButton";
import { ProductGrid } from "@/components/store/ProductGrid";
import type { ProductWithCategoryDTO } from "@/types";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const raw = await prisma.product.findUnique({
    where:   { slug },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
  if (!raw) return { title: "المنتج غير موجود" };

  const product: ProductWithCategoryDTO = {
    id: raw.id, name: raw.name, slug: raw.slug,
    description: raw.description, categoryId: raw.categoryId,
    category: raw.category, images: raw.images,
    originalPrice: raw.originalPrice, discountPrice: raw.discountPrice,
    discountPercent: calcDiscountPercent(raw.originalPrice, raw.discountPrice),
    available: raw.available, isFeatured: raw.isFeatured, isOffer: raw.isOffer,
    createdAt: raw.createdAt.toISOString(), updatedAt: raw.updatedAt.toISOString(),
  };

  return buildProductMetadata(product);
}

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const raw = await prisma.product.findUnique({
    where:   { slug },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });

  if (!raw) notFound();

  const product: ProductWithCategoryDTO = {
    id:              raw.id,
    name:            raw.name,
    slug:            raw.slug,
    description:     raw.description,
    categoryId:      raw.categoryId,
    category:        raw.category,
    images:          raw.images,
    originalPrice:   raw.originalPrice,
    discountPrice:   raw.discountPrice,
    discountPercent: calcDiscountPercent(raw.originalPrice, raw.discountPrice),
    available:       raw.available,
    isFeatured:      raw.isFeatured,
    isOffer:         raw.isOffer,
    createdAt:       raw.createdAt.toISOString(),
    updatedAt:       raw.updatedAt.toISOString(),
  };

  // Fetch settings for WhatsApp number
  const settings = await prisma.settings.findUnique({ where: { id: "main" } });
  const whatsappNumber = settings?.whatsappNumber ?? "+201012506517";

  // Related products — same category, exclude current, max 4
  const relatedRaw = await prisma.product.findMany({
    where:   { categoryId: raw.categoryId, id: { not: raw.id }, available: true },
    orderBy: { createdAt: "desc" },
    take:    4,
    include: { category: { select: { id: true, name: true, slug: true } } },
  });

  const related: ProductWithCategoryDTO[] = relatedRaw.map((p) => ({
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

  const price = effectivePrice(product);

  return (
    <div className="container-store py-8 md:py-12">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildProductLD(product, whatsappNumber)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbLD([
            { name: "الرئيسية",         path: "/" },
            { name: "الأقسام",          path: "/categories" },
            { name: product.category.name, path: `/category/${product.category.slug}` },
            { name: product.name,       path: `/product/${product.slug}` },
          ])),
        }}
      />
      <nav className="flex items-center gap-2 text-sm font-cairo text-brand-text/50 mb-8 flex-wrap">
        <Link href="/"                                     className="hover:text-primary">الرئيسية</Link>
        <span>/</span>
        <Link href="/categories"                           className="hover:text-primary">الأقسام</Link>
        <span>/</span>
        <Link href={`/category/${product.category.slug}`} className="hover:text-primary">{product.category.name}</Link>
        <span>/</span>
        <span className="text-brand-text truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Gallery */}
        <ProductGallery images={product.images} name={product.name} />

        {/* Details */}
        <div className="flex flex-col gap-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/category/${product.category.slug}`}
              className="badge badge-gray hover:bg-gray-200 transition-colors"
            >
              {product.category.name}
            </Link>
            {product.isOffer    && <span className="badge badge-gold">عرض خاص</span>}
            {product.isFeatured && <span className="badge badge-primary">الأكثر طلباً</span>}
            <span className={`badge ${product.available ? "badge-success" : "badge-danger"}`}>
              {product.available ? "✓ متوفر" : "✗ غير متوفر"}
            </span>
          </div>

          {/* Name */}
          <h1 className="font-cairo font-black text-2xl md:text-3xl text-brand-text leading-snug">
            {product.name}
          </h1>

          {/* Description */}
          {product.description && (
            <p className="font-cairo text-brand-text/70 leading-relaxed text-base">
              {product.description}
            </p>
          )}

          {/* Pricing */}
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5 space-y-2">
            <div className="flex items-end gap-3 flex-wrap">
              <span className="font-cairo font-black text-3xl text-primary">
                {formatPrice(price)}
              </span>
              {product.discountPercent > 0 && (
                <>
                  <span className="font-cairo text-lg text-brand-text/40 line-through mb-0.5">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="badge badge-gold">
                    وفّر {product.discountPercent}%
                  </span>
                </>
              )}
            </div>
            {product.discountPercent > 0 && (
              <p className="font-cairo text-sm text-green-700 font-bold">
                💰 توفير {formatPrice(product.originalPrice - price)}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <AddToCartButton product={product} />
            <WhatsAppOrderButton
              product={product}
              whatsappNumber={whatsappNumber}
            />
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: "✅", label: "جودة مضمونة" },
              { icon: "📦", label: "توصيل سريع"  },
              { icon: "💬", label: "دعم واتساب"  },
            ].map(({ icon, label }) => (
              <div key={label} className="text-center p-3 rounded-xl bg-gray-50">
                <p className="text-xl mb-1">{icon}</p>
                <p className="font-cairo text-xs text-brand-text/60 font-bold">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="border-t border-gray-100 mt-12">
          <ProductGrid
            title="منتجات مشابهة"
            products={related}
            viewAllHref={`/category/${product.category.slug}`}
            viewAllLabel="شاهد جميع منتجات القسم"
            limit={4}
          />
        </div>
      )}
    </div>
  );
}
