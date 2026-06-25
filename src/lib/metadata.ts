// ─────────────────────────────────────────────────────────────
// src/lib/metadata.ts
// Reusable metadata builders for Open Graph, Twitter Cards,
// and JSON-LD structured data.
// Used by page-level generateMetadata() functions.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import type { ProductWithCategoryDTO, CategoryWithCountDTO } from "@/types";
import { formatPrice, effectivePrice } from "@/lib/utils";

const BASE  = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const BRAND = "كوكي هوم";
const LOGO  = `${BASE}/images/logo.png`;

// ── Generic page metadata ─────────────────────────────────────

export function buildPageMetadata(opts: {
  title:        string;
  description:  string;
  path?:        string;
  image?:       string;
  noIndex?:     boolean;
}): Metadata {
  const url   = `${BASE}${opts.path ?? ""}`;
  const image = opts.image ?? LOGO;

  return {
    title:       opts.title,
    description: opts.description,
    metadataBase: new URL(BASE),
    alternates:  { canonical: url },
    robots:      opts.noIndex
      ? { index: false, follow: false }
      : { index: true,  follow: true  },
    openGraph: {
      type:        "website",
      locale:      "ar_EG",
      url,
      title:       opts.title,
      description: opts.description,
      siteName:    BRAND,
      images:      [{ url: image, width: 1200, height: 630, alt: opts.title }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       opts.title,
      description: opts.description,
      images:      [image],
    },
  };
}

// ── Product metadata ──────────────────────────────────────────

export function buildProductMetadata(product: ProductWithCategoryDTO): Metadata {
  const price       = effectivePrice(product);
  const url         = `${BASE}/product/${product.slug}`;
  const image       = product.images[0] ?? LOGO;
  const description =
    product.description ||
    `${product.name} — ${formatPrice(price)} — ${BRAND}`;

  return {
    title:       product.name,
    description,
    metadataBase: new URL(BASE),
    alternates:  { canonical: url },
    openGraph: {
      type:        "website",
      locale:      "ar_EG",
      url,
      title:       `${product.name} | ${BRAND}`,
      description,
      siteName:    BRAND,
      images:      product.images.slice(0, 4).map((img) => ({
        url:   img,
        width:  800,
        height: 800,
        alt:   product.name,
      })),
    },
    twitter: {
      card:        "summary_large_image",
      title:       product.name,
      description,
      images:      [image],
    },
  };
}

// ── Category metadata ─────────────────────────────────────────

export function buildCategoryMetadata(
  category: Pick<CategoryWithCountDTO, "name" | "slug" | "imageUrl">
): Metadata {
  const url         = `${BASE}/category/${category.slug}`;
  const description = `تصفح منتجات قسم ${category.name} في ${BRAND} — منفلوط، أسيوط`;
  const image       = category.imageUrl || LOGO;

  return {
    title:       category.name,
    description,
    metadataBase: new URL(BASE),
    alternates:  { canonical: url },
    openGraph: {
      type:        "website",
      locale:      "ar_EG",
      url,
      title:       `${category.name} | ${BRAND}`,
      description,
      siteName:    BRAND,
      images:      [{ url: image, width: 1200, height: 630, alt: category.name }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       `${category.name} | ${BRAND}`,
      description,
      images:      [image],
    },
  };
}

// ── JSON-LD builders ──────────────────────────────────────────

/** WebSite schema with SearchAction for homepage */
export function buildWebSiteLD() {
  return {
    "@context": "https://schema.org",
    "@type":    "WebSite",
    name:       BRAND,
    url:        BASE,
    inLanguage: "ar",
    potentialAction: {
      "@type":       "SearchAction",
      target:        `${BASE}/categories`,
      "query-input": "required name=search_term_string",
    },
  };
}

/** Organization schema for the homepage */
export function buildOrganizationLD() {
  return {
    "@context": "https://schema.org",
    "@type":    "Organization",
    name:       BRAND,
    url:        BASE,
    logo:       LOGO,
    address: {
      "@type":           "PostalAddress",
      addressLocality:   "منفلوط",
      addressRegion:     "أسيوط",
      addressCountry:    "EG",
    },
    contactPoint: {
      "@type":           "ContactPoint",
      contactType:       "customer service",
      availableLanguage: "Arabic",
    },
  };
}

/** LocalBusiness schema for homepage */
export function buildLocalBusinessLD(whatsappNumber: string) {
  return {
    "@context": "https://schema.org",
    "@type":    "HomeGoodsStore",
    name:       BRAND,
    url:        BASE,
    logo:       LOGO,
    telephone:  whatsappNumber,
    address: {
      "@type":           "PostalAddress",
      addressLocality:   "منفلوط",
      addressRegion:     "أسيوط",
      addressCountry:    "EG",
    },
    geo: {
      "@type":    "GeoCoordinates",
      latitude:   27.31,
      longitude:  30.87,
    },
    priceRange: "EGP",
    openingHours: "Mo-Su 09:00-21:00",
  };
}

/** Product schema for product detail pages */
export function buildProductLD(
  product:        ProductWithCategoryDTO,
  whatsappNumber: string
) {
  const price = effectivePrice(product);
  return {
    "@context": "https://schema.org",
    "@type":    "Product",
    name:       product.name,
    description: product.description || product.name,
    image:      product.images,
    url:        `${BASE}/product/${product.slug}`,
    brand: {
      "@type": "Brand",
      name:    BRAND,
    },
    offers: {
      "@type":        "Offer",
      priceCurrency:  "EGP",
      price:          price.toFixed(2),
      availability:   product.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name:    BRAND,
      },
    },
  };
}

/** BreadcrumbList schema */
export function buildBreadcrumbLD(
  items: Array<{ name: string; path: string }>
) {
  return {
    "@context":        "https://schema.org",
    "@type":           "BreadcrumbList",
    itemListElement:   items.map((item, i) => ({
      "@type":    "ListItem",
      position:   i + 1,
      name:       item.name,
      item:       `${BASE}${item.path}`,
    })),
  };
}
