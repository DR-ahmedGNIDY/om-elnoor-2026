// ─────────────────────────────────────────────────────────────
// src/app/(store)/page.tsx
// Homepage — Server Component.
// Runs parallel Prisma queries for all homepage sections.
// Category sections are generated dynamically from DB categories.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { calcDiscountPercent } from "@/lib/utils";
import { buildOrganizationLD, buildLocalBusinessLD, buildWebSiteLD } from "@/lib/metadata";
import { ProductGrid } from "@/components/store/ProductGrid";
import HomeBanner from "@/components/store/HomeBanner";
import type { ProductWithCategoryDTO, CategoryDTO } from "@/types";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const DEFAULT_OG_IMAGE = `${BASE}/images/logo.png`;

export const metadata: Metadata = {
  title: "كوكي هوم — كل ما يحتاجه منزلك",
  description:
    "كل ما يحتاجه منزلك... أدوات منزلية عصرية، أدوات مطبخ، تخزين وتنظيم، مفروشات، وإكسسوارات منزلية بأفضل جودة وأفضل الأسعار.",
  alternates: { canonical: BASE },
  openGraph: {
    type:        "website",
    locale:      "ar_EG",
    url:         BASE,
    siteName:    "كوكي هوم",
    title:       "كوكي هوم — كل ما يحتاجه منزلك",
    description: "كل ما يحتاجه منزلك... أدوات منزلية عصرية وإكسسوارات منزلية بأفضل جودة وأفضل الأسعار",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630,
               alt:  "كوكي هوم" }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "كوكي هوم",
    description: "كل ما يحتاجه منزلك... أدوات منزلية عصرية وإكسسوارات منزلية",
    images:      [DEFAULT_OG_IMAGE],
  },
};

export const dynamic = "force-dynamic";

// ── Data fetching ─────────────────────────────────────────────

async function getHomepageData() {
  const CATEGORY_SELECT = { id: true, name: true, slug: true } as const;
  const PRODUCT_FIELDS  = {
    id: true, name: true, slug: true, description: true,
    images: true, originalPrice: true, discountPrice: true,
    available: true, isFeatured: true, isOffer: true,
    categoryId: true, createdAt: true, updatedAt: true,
    category: { select: CATEGORY_SELECT },
  } as const;

  // Load all categories first so we can build sections dynamically
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
    select:  { id: true, name: true, slug: true, imageUrl: true,
               createdAt: true, updatedAt: true },
  });

  // Parallel: featured, offers, and 4 products per category
  const [featured, offers, ...categoryProductArrays] = await Promise.all([
    // الأكثر طلباً
    prisma.product.findMany({
      where:   { isFeatured: true, available: true },
      orderBy: { createdAt: "desc" },
      take:    8,
      select:  PRODUCT_FIELDS,
    }),
    // العروض الخاصة
    prisma.product.findMany({
      where:   { isOffer: true, available: true },
      orderBy: { createdAt: "desc" },
      take:    4,
      select:  PRODUCT_FIELDS,
    }),
    // One query per category — resolves in parallel
    ...categories.map((cat) =>
      prisma.product.findMany({
        where:   { categoryId: cat.id, available: true },
        orderBy: { createdAt: "desc" },
        take:    4,
        select:  PRODUCT_FIELDS,
      })
    ),
  ]);

  function toDTO(p: typeof featured[0]): ProductWithCategoryDTO {
    return {
      ...p,
      discountPercent: calcDiscountPercent(p.originalPrice, p.discountPrice),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }

  const catDTOs: CategoryDTO[] = categories.map((c) => ({
    id:        c.id,
    name:      c.name,
    slug:      c.slug,
    imageUrl:  c.imageUrl,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  // Zip categories with their products
  const categorySections = categories.map((cat, i) => ({
    category: catDTOs[i],
    products: (categoryProductArrays[i] ?? []).map(toDTO),
  }));

  return {
    categories:        catDTOs,
    featured:          featured.map(toDTO),
    offers:            offers.map(toDTO),
    categorySections,
  };
}

// ── Page ──────────────────────────────────────────────────────

export default async function HomePage() {
  const data = await getHomepageData();

  // Load WhatsApp number for JSON-LD
  const settings = await prisma.settings.findUnique({
    where:  { id: "main" },
    select: { whatsappNumber: true },
  });
  const waNumber = settings?.whatsappNumber ?? "+201012506517";

  const EMOJIS = ["🫕", "🍴", "🍽️", "🛋️", "📦"];

  return (
    <div>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebSiteLD()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationLD()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildLocalBusinessLD(waNumber)) }}
      />
      {/* Hero */}
<HeroSection />


{/* Category quick-nav strip */}
      {data.categories.length > 0 && (
        <CategoryStrip categories={data.categories} />
      )}

      {/* الأكثر طلباً */}
      {data.featured.length > 0 && (
        <div className="bg-white">
          <ProductGrid
            title="⭐ الأكثر طلباً"
            products={data.featured}
            viewAllHref="/categories"
            limit={8}
          />
        </div>
      )}

      {/* العروض الخاصة */}
      {data.offers.length > 0 && (
        <div className="bg-gradient-to-b from-yellow-50 to-brand-bg">
          <ProductGrid
            title="🏷️ العروض الخاصة"
            products={data.offers}
            viewAllHref="/offers"
            viewAllLabel="شاهد جميع العروض"
            limit={4}
          />
        </div>
      )}

      {/* Dynamic per-category sections */}
      {data.categorySections.map(({ category, products }, idx) =>
        products.length > 0 ? (
          <div key={category.id} className={idx % 2 === 0 ? "bg-brand-bg" : "bg-white"}>
            <ProductGrid
              title={`${EMOJIS[idx % EMOJIS.length]} ${category.name}`}
              products={products}
              viewAllHref={`/category/${category.slug}`}
              limit={4}
            />
          </div>
        ) : null
      )}

      {/* WhatsApp CTA banner */}
      <WhatsAppBanner />
    </div>
  );
}

// ── Sub-components (unchanged) ────────────────────────────────

function HeroSection() {
  return (
    <section
      className="relative flex items-center justify-center lg:justify-end bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/images/banner.png')",
        minHeight: "clamp(650px, 80vh, 750px)",
      }}
    >
      {/* Dark navy overlay for readability */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(rgba(6,25,56,.65), rgba(6,25,56,.65))",
        }}
      />

      <div className="container-store relative flex justify-center lg:justify-end">
        <div
          className="w-full text-center lg:text-right py-16"
          style={{ maxWidth: "600px" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/20 border border-gold/30 mb-6">
            <span className="text-gold text-sm font-cairo">✨</span>
            <span className="font-cairo text-sm text-gold">أفضل جودة بأفضل سعر</span>
          </div>

          <h1 className="font-cairo font-black text-white mb-4"
            style={{ fontSize: "clamp(1.75rem,5vw,3.5rem)", lineHeight: 1.25 }}>
            كوكي هوم<br />
            <span className="text-gold">COKIE HOME</span>
          </h1>

          <p className="font-cairo text-white/80 text-lg mb-8 max-w-xl mx-auto lg:mx-0">
            كل احتياجات منزلك في مكان واحد — منفلوط، أسيوط
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <Link href="/categories" className="btn-gold btn-lg">تصفح المنتجات</Link>
            <Link href="/offers" className="btn border-2 border-white/40 text-white hover:bg-white/10 btn-lg">
              العروض الخاصة
            </Link>
          </div>

          <div className="flex flex-wrap justify-center lg:justify-start gap-8 mt-14">
            {[
              { value: "٥٠٠+", label: "منتج متاح"     },
              { value: "٥",    label: "أقسام متنوعة"  },
              { value: "١٠٠٪", label: "جودة مضمونة"  },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="font-cairo font-black text-gold text-2xl">{stat.value}</p>
                <p className="font-cairo text-white/60 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryStrip({ categories }: { categories: CategoryDTO[] }) {
  return (
    <div className="bg-white border-b border-gray-100 py-4 overflow-x-auto">
      <div className="container-store flex items-center gap-3 min-w-max sm:min-w-0 flex-nowrap sm:flex-wrap">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-100 hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <span className="font-cairo font-bold text-sm text-brand-text group-hover:text-primary transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function WhatsAppBanner() {
  return (
    <section className="bg-hero-gradient py-16">
      <div className="container-store text-center">
        <p className="font-cairo font-black text-white text-2xl mb-3">
          هل تحتاج مساعدة في الاختيار؟
        </p>
        <p className="font-cairo text-white/70 mb-8">
          تواصل معنا مباشرة عبر واتساب وسنساعدك بكل سرور
        </p>
        <Link href="/contact" className="btn-whatsapp btn-lg inline-flex">
          <WhatsAppIcon />
          تواصل معنا الآن
        </Link>
      </div>
    </section>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
