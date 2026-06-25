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
    default: "كوكي هوم",
    template: "%s | كوكي هوم",
  },
  description:
    "كل ما يحتاجه منزلك... أدوات منزلية عصرية، أدوات مطبخ، تخزين وتنظيم، مفروشات، وإكسسوارات منزلية بأفضل جودة وأفضل الأسعار.",
  keywords: [
    "أدوات منزلية",
    "أطقم حلل",
    "مفروشات",
    "أطباق",
    "أدوات مطبخ",
    "منفلوط",
    "أسيوط",
    "مصر",
    "كوكي هوم",
  ],
  authors: [{ name: "كوكي هوم" }],
  creator: "كوكي هوم",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    siteName: "كوكي هوم",
    title: "كوكي هوم",
    description: "كل ما يحتاجه منزلك... أدوات منزلية عصرية وإكسسوارات منزلية بأفضل جودة وأفضل الأسعار",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/images/logo.png`,
        width: 1200,
        height: 630,
        alt: "كوكي هوم",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "كوكي هوم",
    description: "كل ما يحتاجه منزلك... أدوات منزلية عصرية وإكسسوارات منزلية",
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
