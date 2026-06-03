import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

// ─── Cairo font via next/font (no layout shift) ───────────────────────────────
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
  preload: true,
});

// ─── Site-wide metadata ───────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "أم النور للأدوات المنزلية",
    template: "%s | أم النور للأدوات المنزلية",
  },
  description:
    "كل احتياجات منزلك في مكان واحد — أطقم الحلل، أدوات المطبخ، أطقم السفرة، المفروشات، ومستلزمات التخزين بأفضل الأسعار في منفلوط، أسيوط.",
  keywords: [
    "أدوات منزلية",
    "أطقم حلل",
    "مفروشات",
    "أطباق",
    "أدوات مطبخ",
    "منفلوط",
    "أسيوط",
    "مصر",
    "أم النور",
  ],
  authors: [{ name: "أم النور للأدوات المنزلية" }],
  creator: "أم النور للأدوات المنزلية",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    siteName: "أم النور للأدوات المنزلية",
    title: "أم النور للأدوات المنزلية",
    description: "كل احتياجات منزلك في مكان واحد — منفلوط، أسيوط",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/images/logo.png`,
        width: 1200,
        height: 630,
        alt: "أم النور للأدوات المنزلية",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "أم النور للأدوات المنزلية",
    description: "كل احتياجات منزلك في مكان واحد",
    images: [`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/images/logo.png`],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#173A66",
};

// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="font-cairo antialiased bg-brand-bg text-brand-text">
        {children}
      </body>
    </html>
  );
}
