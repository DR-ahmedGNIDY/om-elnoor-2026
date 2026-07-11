// ─────────────────────────────────────────────────────────────
// prisma/seed.ts
// Run: npm run db:seed
// ─────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import slugify from "slugify";

const prisma = new PrismaClient();

function toSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: "ar",
    trim: true,
  });
}

async function main() {
  console.log("🌱 Seeding database…\n");

  // ── Settings ────────────────────────────────────────────────
  await prisma.settings.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id:             "main",
      whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+201012506517",
      facebookUrl:    "",
      instagramUrl:   "",
      tiktokUrl:      "",
      telegramUrl:    "",
    },
  });
  console.log("✅ Settings");

  // ── Admin ────────────────────────────────────────────────────
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const hash = await bcrypt.hash(password, 12);

  await prisma.admin.upsert({
    where: { username },
    update: {},
    create: { username, password: hash },
  });
  console.log(`✅ Admin: ${username} / ${password}`);

  // ── Categories ───────────────────────────────────────────────
  const categoryData = [
    { name: "أطقم الحلل",        slug: "atqam-alhellal" },
    { name: "أدوات المطبخ",      slug: "adwat-almatbakh" },
    { name: "أطقم السفرة",       slug: "atqam-alsafra" },
    { name: "المفروشات",          slug: "almafroshat" },
    { name: "التخزين والتنظيم",  slug: "altakhzeen-waltanzeem" },
  ];

  const categories: Record<string, string> = {};

  for (const cat of categoryData) {
    const record = await prisma.category.upsert({
      where:  { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug, imageUrl: "" },
    });
    categories[cat.slug] = record.id;
    console.log(`  ✅ Category: ${cat.name}`);
  }

  // ── Products ─────────────────────────────────────────────────
  const products = [
    {
      name: "طقم حلل جرانيت 7 قطع",
      slug: "taqm-hellal-granite-7-qeta",
      description: "طقم حلل من الجرانيت عالي الجودة مكوّن من 7 قطع بأحجام مختلفة، مناسب لجميع أنواع المواقد بما فيها الحث الكهربائي.",
      categorySlug: "atqam-alhellal",
      originalPrice: 850,
      discountPrice: 699,
      available: true,
      isFeatured: true,
      isOffer: true,
    },
    {
      name: "طقم حلل ستانلس ستيل 5 قطع",
      slug: "taqm-hellal-stainless-5-qeta",
      description: "طقم حلل من الستانلس ستيل الطبي 18/10، لا يتأثر بالأحماض والحرارة، قاع سميك لتوزيع الحرارة بالتساوي.",
      categorySlug: "atqam-alhellal",
      originalPrice: 1200,
      discountPrice: null,
      available: true,
      isFeatured: true,
      isOffer: false,
    },
    {
      name: "طقم حلل تفلون 9 قطع",
      slug: "taqm-hellal-teflon-9-qeta",
      description: "طقم حلل بطلاء التفلون الصحي المعتمد، يمنع التصاق الطعام ويوفر الزيت، سهل التنظيف.",
      categorySlug: "atqam-alhellal",
      originalPrice: 650,
      discountPrice: 550,
      available: true,
      isFeatured: false,
      isOffer: true,
    },
    {
      name: "حلة ضغط 10 لتر",
      slug: "hellat-daght-10-liter",
      description: "حلة ضغط عالية الجودة سعة 10 لتر، توفر وقت الطهي بنسبة 70%، مع صمام أمان مزدوج وغطاء قفل آمن.",
      categorySlug: "atqam-alhellal",
      originalPrice: 480,
      discountPrice: null,
      available: true,
      isFeatured: false,
      isOffer: false,
    },
    {
      name: "طقم أواني طهي سيراميك",
      slug: "taqm-awani-siraameek",
      description: "طقم أواني طهي من السيراميك الصحي الخالي من المواد الضارة PFOA/PFAS، مقاوم للخدش والحرارة حتى 450 درجة.",
      categorySlug: "adwat-almatbakh",
      originalPrice: 320,
      discountPrice: 259,
      available: true,
      isFeatured: true,
      isOffer: true,
    },
    {
      name: "مجموعة سكاكين مطبخ ألمانية",
      slug: "majmoat-sakaakeen-almania",
      description: "سكاكين مطبخ من الفولاذ الألماني عالي الكربون، مجموعة 6 قطع مع حامل خشبي، محافظة على حدة الشفرة.",
      categorySlug: "adwat-almatbakh",
      originalPrice: 280,
      discountPrice: null,
      available: true,
      isFeatured: false,
      isOffer: false,
    },
    {
      name: "خلاط كهربائي متعدد الوظائف",
      slug: "khalaat-kahrabai-mutaadid",
      description: "خلاط كهربائي 800 واط مع ملحقات للخلط والعجن والتقطيع، سرعات متعددة وأمان تشغيل.",
      categorySlug: "adwat-almatbakh",
      originalPrice: 550,
      discountPrice: 450,
      available: true,
      isFeatured: true,
      isOffer: false,
    },
    {
      name: "طقم صواني فرن تفلون",
      slug: "taqm-sawani-forn-teflon",
      description: "صواني فرن بطلاء التفلون المقاوم للحرارة حتى 260 درجة مئوية، مثالية للخبز والشواء والتحمير.",
      categorySlug: "adwat-almatbakh",
      originalPrice: 180,
      discountPrice: 145,
      available: true,
      isFeatured: false,
      isOffer: true,
    },
    {
      name: "طقم كأسات كريستال 12 قطعة",
      slug: "taqm-kasaat-crystal-12-qeta",
      description: "طقم كأسات من الكريستال الشفاف عالي الجودة، مثالي للمناسبات والضيافة، مقاوم للكسر.",
      categorySlug: "atqam-alsafra",
      originalPrice: 220,
      discountPrice: null,
      available: true,
      isFeatured: true,
      isOffer: false,
    },
    {
      name: "طقم أطباق بورسلان 24 قطعة",
      slug: "taqm-atbaq-borsalan-24-qeta",
      description: "طقم أطباق بورسلان فاخر لـ 6 أشخاص، تصميم عصري أنيق، آمن للميكروويف وغسالة الأطباق.",
      categorySlug: "atqam-alsafra",
      originalPrice: 380,
      discountPrice: 299,
      available: true,
      isFeatured: true,
      isOffer: true,
    },
    {
      name: "طقم أدوات مائدة ستانلس 24 قطعة",
      slug: "taqm-adwat-maaida-stainless-24",
      description: "أدوات مائدة من الستانلس ستيل الفاخر 18/10، 24 قطعة تشمل ملاعق وشوك وسكاكين وملاعق شاي.",
      categorySlug: "atqam-alsafra",
      originalPrice: 250,
      discountPrice: null,
      available: true,
      isFeatured: false,
      isOffer: false,
    },
    {
      name: "طقم مفرش سرير قطني 6 قطع",
      slug: "taqm-mafrash-sareer-qotni-6",
      description: "طقم مفرش سرير من القطن المصري 100%، ناعم وقابل للتنفس، يشمل الغطاء والشرشف وأغطية الوسائد.",
      categorySlug: "almafroshat",
      originalPrice: 450,
      discountPrice: 349,
      available: true,
      isFeatured: true,
      isOffer: true,
    },
    {
      name: "طقم وسائد مريحة للنوم",
      slug: "taqm-wasaaid-mreha-linawm",
      description: "وسائد طبية مريحة بحشوة ألياف دقيقة فائقة النعومة، تدعم الرقبة وتوفر نوماً صحياً.",
      categorySlug: "almafroshat",
      originalPrice: 160,
      discountPrice: null,
      available: true,
      isFeatured: false,
      isOffer: false,
    },
    {
      name: "بطانية فليس دافئة",
      slug: "battaniya-flees-dafea",
      description: "بطانية فليس ناعمة دافئة خفيفة الوزن، مثالية للشتاء، متوفرة بأحجام وألوان متعددة.",
      categorySlug: "almafroshat",
      originalPrice: 120,
      discountPrice: 95,
      available: true,
      isFeatured: false,
      isOffer: true,
    },
    {
      name: "طقم حاويات تخزين هيرمتيك 10 قطع",
      slug: "taqm-haawiyaat-hermetik-10",
      description: "حاويات تخزين محكمة الإغلاق من البلاستيك الصحي الخالي من BPA، مناسبة لحفظ المواد الغذائية.",
      categorySlug: "altakhzeen-waltanzeem",
      originalPrice: 150,
      discountPrice: 119,
      available: true,
      isFeatured: true,
      isOffer: true,
    },
    {
      name: "منظم خزانة ملابس",
      slug: "munazzim-khizanat-malabis",
      description: "منظم خزانة متعدد المقصورات من القماش المقوى، يوفر مساحة أكبر ويرتب الملابس بشكل أنيق.",
      categorySlug: "altakhzeen-waltanzeem",
      originalPrice: 90,
      discountPrice: null,
      available: true,
      isFeatured: false,
      isOffer: false,
    },
    {
      name: "سلة غسيل قابلة للطي",
      slug: "sallat-ghaseel-qabilat-liltatwy",
      description: "سلة غسيل من الخيزران الطبيعي مع بطانة قماشية، قابلة للطي، سعة 60 لتر، سهلة الحمل.",
      categorySlug: "altakhzeen-waltanzeem",
      originalPrice: 75,
      discountPrice: 59,
      available: true,
      isFeatured: false,
      isOffer: true,
    },
  ];

  for (const p of products) {
    const categoryId = categories[p.categorySlug];
    if (!categoryId) {
      console.warn(`  ⚠️  Category not found: ${p.categorySlug}`);
      continue;
    }
    await prisma.product.upsert({
      where:  { slug: p.slug },
      update: {},
      create: {
        name:          p.name,
        slug:          p.slug,
        description:   p.description,
        categoryId,
        images:        [],
        originalPrice: p.originalPrice,
        discountPrice: p.discountPrice ?? null,
        available:     p.available,
        isFeatured:    p.isFeatured,
        isOffer:       p.isOffer,
      },
    });
    console.log(`  ✅ Product: ${p.name}`);
  }

  console.log("\n🎉 Seeding complete!");
  console.log("   Visit http://localhost:3000/admin to log in.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
