// ─────────────────────────────────────────────────────────────
// src/components/store/CategoryMarquee.tsx
// Premium infinite category marquee — Client Component.
//
// The loop is driven entirely by a CSS @keyframes animation
// (cokieMarqueeRTL, defined in globals.css). No requestAnimationFrame,
// no per-frame accumulator, no percentage-valued transforms:
//   - rAF accumulators can overshoot and get stuck off-screen if the
//     tab is backgrounded/throttled and resumes with a large delta.
//   - Percentage-valued translateX inside a running keyframe can
//     drift out of sync with what Chromium's compositor actually
//     paints, which shows up as the track scrolling past the
//     intended point and leaving a blank gap.
// Instead, --marquee-distance is a concrete pixel value measured
// directly off one rendered category set via ResizeObserver, and
// the category list is duplicated dynamically (not a fixed 3x)
// until the total rendered width clears 3x the viewport — so
// there's always at least two full extra screens' worth of cards
// queued up on either side of the visible window, regardless of
// how few categories exist or how wide the screen is.
//
// Critical detail: the animation is NEVER started before its
// --marquee-distance is known, and is NEVER mutated while running.
// translate3d promotes the track to its own compositor layer, and
// mutating a custom property an *already running* compositor
// animation depends on can desync the compositor-painted position
// from what getComputedStyle reports on the main thread — visually,
// that showed up as the track scrolling far past the intended
// point and leaving a blank gap, even though the math was correct.
// So every (re)start goes through startAnimation(), which sets the
// distance, forces a synchronous reflow, and only then applies the
// animation — guaranteeing the very first composited frame already
// uses the right value.
//
// Hover pause / drag are handled by toggling animation-play-state
// and, for drag, temporarily swapping the CSS animation for a
// manual transform; on release we resume the animation with a
// negative animation-delay computed from the dragged position so
// autoplay continues exactly where the user left it — no jump.
// ─────────────────────────────────────────────────────────────
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { CategoryDTO } from "@/types";

const SPEED_PX_PER_SEC = 42;
const MIN_DURATION_SEC = 10;
const MIN_COPIES = 2;
const MAX_COPIES = 14;
const INITIAL_COPIES = 6;
const FALLBACK_EMOJIS = ["🫕", "🍴", "🍽️", "🛋️", "📦"];
const DRAG_THRESHOLD = 5;
const ANIMATION_NAME = "cokieMarqueeRTL";

export default function CategoryMarquee({ categories }: { categories: CategoryDTO[] }) {
  const wrapRef       = useRef<HTMLDivElement>(null);
  const trackRef      = useRef<HTMLDivElement>(null);
  const firstSetRef   = useRef<HTMLDivElement>(null);
  const durationSec   = useRef(28);
  const oneSetWidthPx = useRef(0);
  const hovering      = useRef(false);
  const dragging      = useRef(false);
  const dragStartX    = useRef(0);
  const dragStartPx   = useRef(0);
  const wasDragged    = useRef(false);
  const captured      = useRef(false);
  const reducedMotion = useRef(false);

  const [copies, setCopies] = useState(INITIAL_COPIES);

  const applyPlayState = () => {
    const track = trackRef.current;
    if (!track || reducedMotion.current) return;
    track.style.animationPlayState = hovering.current || dragging.current ? "paused" : "running";
  };

  // Cleanly (re)starts the animation with a given distance/duration —
  // never mutates a live compositor animation's target value in place.
  const startAnimation = (track: HTMLDivElement, distancePx: number, delaySec = 0) => {
    track.style.animation = "none";
    track.style.setProperty("--marquee-distance", `${-distancePx}px`);
    void track.offsetHeight; // force a synchronous reflow before re-applying
    track.style.animation = `${ANIMATION_NAME} ${durationSec.current}s linear infinite`;
    track.style.animationDelay = `${delaySec}s`;
    applyPlayState();
  };

  const recompute = useCallback(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    const firstSet = firstSetRef.current;
    if (!wrap || !track || !firstSet) return;

    // The true distance from the start of one set to the start of the
    // next is the set's own width PLUS the track's own gap between set
    // divs — omitting the gap would leave a small but real seam at
    // every loop point.
    const trackGap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const stepDistance = firstSet.scrollWidth + trackGap;
    if (stepDistance <= 0 || Math.abs(stepDistance - oneSetWidthPx.current) < 1) return;
    oneSetWidthPx.current = stepDistance;

    const viewportWidth = wrap.getBoundingClientRect().width || window.innerWidth;
    const needed = Math.min(
      MAX_COPIES,
      Math.max(MIN_COPIES, Math.ceil((viewportWidth * 3) / stepDistance))
    );
    setCopies((prev) => (prev === needed ? prev : needed));

    durationSec.current = Math.max(MIN_DURATION_SEC, stepDistance / SPEED_PX_PER_SEC);
    startAnimation(track, stepDistance);
  }, []);

  useEffect(() => {
    if (categories.length === 0) return;
    const track = trackRef.current;
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion.current) {
      if (track) track.style.animation = "none";
      return;
    }

    recompute();

    const ro = new ResizeObserver(recompute);
    if (firstSetRef.current) ro.observe(firstSetRef.current);
    if (wrapRef.current) ro.observe(wrapRef.current);

    // Dev-only watchdog: the track (all duplicated sets) must always
    // extend past the wrap's right edge. If it doesn't, the marquee
    // would show a blank gap — log loudly so it's never silently shipped.
    let watchdog: number | undefined;
    if (process.env.NODE_ENV !== "production") {
      let warned = false;
      watchdog = window.setInterval(() => {
        const wrap = wrapRef.current;
        const track = trackRef.current;
        if (!wrap || !track) return;
        const wrapRect = wrap.getBoundingClientRect();
        const trackRect = track.getBoundingClientRect();
        const gap = trackRect.right < wrapRect.right;
        if (gap && !warned) {
          warned = true;
          console.error(
            new Error(
              `[CategoryMarquee] Infinite marquee gap detected: track right edge ` +
              `(${trackRect.right.toFixed(1)}px) is inside the viewport's right edge ` +
              `(${wrapRect.right.toFixed(1)}px). Needs more duplicated copies.`
            )
          );
        } else if (!gap) {
          warned = false;
        }
      }, 1000);
    }

    return () => {
      ro.disconnect();
      if (watchdog) window.clearInterval(watchdog);
    };
  }, [categories.length, recompute]);

  if (categories.length === 0) return null;

  const readCurrentPx = (track: HTMLDivElement) => {
    const raw = getComputedStyle(track).transform;
    if (!raw || raw === "none") return 0;
    try {
      return new DOMMatrixReadOnly(raw).m41;
    } catch {
      return 0;
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || reducedMotion.current) return;

    dragging.current = true;
    wasDragged.current = false;
    captured.current = false;
    dragStartX.current = e.clientX;

    // Freeze the animation at its exact current visual position,
    // then hand control over to a plain inline transform for the
    // duration of the drag.
    const px = readCurrentPx(track);
    dragStartPx.current = px;
    track.style.animation = "none";
    track.style.transform = `translate3d(${px}px,0,0)`;

    // NOTE: pointer capture is intentionally NOT taken here. Once an
    // element has pointer capture, the browser dispatches the ensuing
    // `click` to the capturing element instead of the element under the
    // pointer — which would steal every plain click from the card's
    // <Link> and silently break navigation. We only capture once an
    // actual drag is detected (see onPointerMove), so a simple tap/click
    // always reaches the anchor and navigates.
    e.currentTarget.style.cursor = "grabbing";
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || !dragging.current) return;

    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > DRAG_THRESHOLD) {
      wasDragged.current = true;
      // Only now that a real drag is underway do we capture the pointer,
      // so drag tracking survives the pointer leaving the element. A plain
      // click never reaches this branch, so its `click` still targets the
      // card's <Link> and navigation works.
      if (!captured.current) {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
          captured.current = true;
        } catch {
          /* pointer may already be gone; ignore */
        }
      }
    }

    const w = oneSetWidthPx.current;
    let next = dragStartPx.current + dx;
    if (w > 0) {
      while (next <= -w) next += w;
      while (next > 0) next -= w;
    }
    track.style.transform = `translate3d(${next}px,0,0)`;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    dragging.current = false;
    e.currentTarget.style.cursor = "grab";
    if (captured.current) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* not captured / already released; ignore */
      }
      captured.current = false;
    }
    if (!track || reducedMotion.current) return;

    // Resume the keyframe animation from the exact spot the drag
    // left off, using a negative delay to seek its timeline instead
    // of restarting from 0 — no visible jump. Goes through the same
    // clean-restart helper as the initial start, so the compositor
    // never has to re-interpolate a live animation mid-flight.
    const w = oneSetWidthPx.current;
    const px = readCurrentPx(track);
    const fraction = w > 0 ? Math.min(Math.max(-px / w, 0), 1) : 0;

    track.style.transform = "";
    startAnimation(track, w, -(fraction * durationSec.current));
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (wasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-brand-bg to-white py-16">
      {/* Decorative ambient glows */}
      <div aria-hidden className="pointer-events-none absolute -top-32 -right-20 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      {/* Title */}
      <div className="container-store relative mb-10 text-center">
        <h2 className="font-cairo font-black text-3xl md:text-4xl text-brand-text">
          تسوق حسب الأقسام
        </h2>
        <span aria-hidden className="mx-auto mt-4 block h-[3px] w-20 rounded-full bg-gold-gradient" />
      </div>

      {/* Marquee
          dir="ltr" is deliberate: the page is RTL, and a block wider than
          its container gets right-aligned (overflowing leftward) in RTL
          instead of left-aligned (overflowing rightward). Since the loop
          math assumes the track starts at the wrap's left edge and grows
          rightward, an inherited rtl here would silently invert it —
          the track's right edge would retreat past the viewport as the
          animation progresses instead of staying anchored beyond it,
          producing exactly the blank-gap bug this component exists to
          prevent. Card content restores dir="rtl" individually so the
          Arabic titles still read naturally. */}
      <div
        ref={wrapRef}
        dir="ltr"
        className="relative w-full select-none overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
        style={{ cursor: "grab", touchAction: "pan-y" }}
        onMouseEnter={() => { hovering.current = true; applyPlayState(); }}
        onMouseLeave={() => { hovering.current = false; applyPlayState(); }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
      >
        <div
          ref={trackRef}
          className="flex w-max gap-6 px-4 will-change-transform"
        >
          {Array.from({ length: copies }).map((_, setIndex) => (
            <div
              key={setIndex}
              ref={setIndex === 0 ? firstSetRef : undefined}
              className="flex gap-6"
              aria-hidden={setIndex > 0}
            >
              {categories.map((cat, i) => (
                <CategoryCard key={`${setIndex}-${cat.id}`} category={cat} index={i} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* View all CTA */}
      <div className="container-store relative mt-10 text-center">
        <Link href="/categories" className="btn-outline btn-sm inline-flex">
          عرض كل الأقسام
        </Link>
      </div>
    </section>
  );
}

function CategoryCard({ category, index }: { category: CategoryDTO; index: number }) {
  const emoji = FALLBACK_EMOJIS[index % FALLBACK_EMOJIS.length];

  return (
    <Link
      href={`/category/${category.slug}`}
      draggable={false}
      dir="rtl"
      className="group relative aspect-[4/5] flex-shrink-0 overflow-hidden rounded-[24px]
                 bg-card-gradient shadow-card transition-all duration-300 ease-out
                 hover:-translate-y-1 hover:scale-[1.045] hover:shadow-2xl hover:shadow-primary/25
                 w-[46vw] min-w-[150px] max-w-[220px]
                 sm:w-[30vw] sm:max-w-[240px]
                 lg:w-[17vw] lg:max-w-none"
    >
      {category.imageUrl ? (
        <Image
          src={category.imageUrl}
          alt={category.name}
          fill
          draggable={false}
          sizes="(max-width:640px) 46vw, (max-width:1024px) 30vw, 17vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          unoptimized={category.imageUrl.startsWith("/")}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-15 transition-transform duration-500 ease-out group-hover:scale-110">
          {emoji}
        </div>
      )}

      {/* Overlay gradient — decorative only, must never intercept clicks */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B1C33]/55 via-[#0B1C33]/10 to-transparent" />

      {/* Gold ring accent on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-[24px] ring-1 ring-white/10 transition-all duration-300 ease-out group-hover:ring-2 group-hover:ring-gold/70" />

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <span aria-hidden className="mb-2 block h-[2px] w-8 rounded-full bg-gold transition-all duration-300 ease-out group-hover:w-12" />
        <h3 className="font-cairo font-black text-white text-base sm:text-lg leading-snug">
          {category.name}
        </h3>
      </div>
    </Link>
  );
}
