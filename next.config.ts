import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Image optimization ──────────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http",  hostname: "localhost" },
    ],
    // Device sizes for responsive images
    deviceSizes:   [640, 768, 1024, 1280, 1536],
    imageSizes:    [16, 32, 64, 96, 128, 256, 384],
    minimumCacheTTL: 3600,
  },

  // ── Compression ─────────────────────────────────────────────
  compress: true,

  // ── Experimental ────────────────────────────────────────────
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    // Optimise CSS: deduplicate Tailwind classes at build time
    optimizeCss: true,
  },

  // ── Headers ─────────────────────────────────────────────────
  async headers() {
    return [
      // Static uploads — long cache
      {
        source: "/uploads/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Security headers for all routes
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",    value: "nosniff"        },
          { key: "X-Frame-Options",           value: "SAMEORIGIN"     },
          { key: "X-XSS-Protection",          value: "1; mode=block"  },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },

  // ── Redirects ────────────────────────────────────────────────
  async redirects() {
    return [
      // Convenience: /admin → /admin (already handled, just ensuring root)
      {
        source:      "/dashboard",
        destination: "/admin",
        permanent:   true,
      },
    ];
  },
};

export default nextConfig;
