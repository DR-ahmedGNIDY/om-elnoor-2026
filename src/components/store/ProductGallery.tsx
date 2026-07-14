"use client";

// ─────────────────────────────────────────────────────────────
// src/components/store/ProductGallery.tsx
// Image gallery with main view and thumbnail strip.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import Image from "next/image";
import { coverImage } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  name:   string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [current, setCurrent] = useState(0);
  const hasImages = images.length > 0;
  const src = hasImages ? images[current] : coverImage([]);

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-card">
        <Image
          src={src}
          alt={name}
          fill
          sizes="(max-width:1024px) 100vw, 50vw"
          className="object-contain"
          priority
          unoptimized={src.startsWith("/")}
        />
        {!hasImages && (
          <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-30">
            🏠
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                i === current
                  ? "border-primary shadow-sm"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
              aria-label={`صورة ${i + 1}`}
            >
              <Image
                src={img}
                alt={`${name} — صورة ${i + 1}`}
                fill
                className="object-cover"
                unoptimized={img.startsWith("/")}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
