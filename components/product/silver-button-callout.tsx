"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { siteImages } from "@/lib/images";

/*
 * Editorial callout that annotates the sterling silver button on a garment photo,
 * in the style of the brand's print campaign.
 *
 * Layout rule: the frame is split into horizontally disjoint zones so nothing can
 * ever overlap — copy occupies the left rail (5%–53%) and the bottom bar, while the
 * graphics (magnified button, leader line, marker) live in the right half. Copy
 * inside each zone is in normal flow rather than absolutely placed, so lines cannot
 * collide with each other either.
 *
 * The secondary copy only appears from md up. At phone width the gallery frame is
 * ~320px wide and six blocks of campaign text over a garment is illegible clutter,
 * so small screens get the hero callout alone.
 *
 * Geometry lives in a 300x400 viewBox matching the 3:4 frame, so the leader line
 * scales with the image without the stroke distorting. The overlay is inert to
 * pointer events — it must never intercept clicks meant for the photo.
 */

const VB_W = 300;
const VB_H = 400;

/** Magnified button, in viewBox units — upper right, clear of the copy rail. */
const MED_CX = 240;
const MED_CY = 80;
const MED_R = 33;

/** Marker sits on the placket, right of the copy rail. */
const MARKER_X_PCT = 56;
const MARKER_Y_PCT = 46;

/** Reveal order, in ms. */
const DELAY = {
  headline: 120,
  leader: 200,
  medallion: 260,
  marker: 420,
  calloutTitle: 480,
  rule: 560,
  calloutBody: 620,
  legacy: 780,
  bottomLeft: 900,
  bottomRight: 960,
} as const;

const CALLOUT_BODY = [
  "Hand-forged, custom-engraved,",
  "and set by master silversmiths.",
] as const;

const LEGACY_LINES = [
  "A legacy connecting Bhagalpuri weavers and master silversmiths.",
  "Unmatched Bhagalpuri linen. Timeless texture.",
] as const;

/**
 * Leader line from the edge of the magnified button to just short of the marker,
 * bowed slightly so it reads as drawn rather than as a raw diagonal.
 */
function buildLeaderPath(markerX: number, markerY: number) {
  const dx = markerX - MED_CX;
  const dy = markerY - MED_CY;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;

  const startX = MED_CX + ux * (MED_R + 4);
  const startY = MED_CY + uy * (MED_R + 4);
  const endX = markerX - ux * 10;
  const endY = markerY - uy * 10;

  // Control point offset perpendicular to the line, for a gentle arc.
  const ctrlX = (startX + endX) / 2 - uy * 12;
  const ctrlY = (startY + endY) / 2 + ux * 12;

  return `M ${startX.toFixed(1)} ${startY.toFixed(1)} Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`;
}

/** Shared rise-and-fade, driven off a single open state so exit reverses cleanly. */
function reveal(open: boolean, delay: number) {
  return {
    className: cn(
      "transition-all duration-500 ease-out",
      open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
    ),
    style: { transitionDelay: open ? `${delay}ms` : "0ms" },
  };
}

const SHADOW = "[text-shadow:0_1px_10px_rgba(0,0,0,0.55)]";

interface SilverButtonCalloutProps {
  className?: string;
}

function SilverButtonCallout({ className }: SilverButtonCalloutProps) {
  // Hover is the intended trigger, but touch devices have none — there the callout
  // is shown by default rather than left unreachable.
  const [hovered, setHovered] = useState(false);
  const [hoverCapable, setHoverCapable] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setHoverCapable(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const open = hovered || !hoverCapable;

  const markerX = (MARKER_X_PCT / 100) * VB_W;
  const markerY = (MARKER_Y_PCT / 100) * VB_H;
  const leaderPath = buildLeaderPath(markerX, markerY);

  const rHeadline = reveal(open, DELAY.headline);
  const rTitle = reveal(open, DELAY.calloutTitle);
  const rBottomLeft = reveal(open, DELAY.bottomLeft);
  const rBrand = reveal(open, DELAY.bottomRight);
  const rTagline = reveal(open, DELAY.bottomRight + 80);

  return (
    <div
      className={cn("absolute inset-0 z-10", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Scrim — the copy has to stay legible over an arbitrary garment photograph. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-500",
          "bg-[linear-gradient(115deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.5)_38%,rgba(0,0,0,0.18)_62%,rgba(0,0,0,0.05)_100%)]",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-500",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      {/* ---- Graphics: right half ---- */}

      <svg
        aria-hidden
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <path
          d={leaderPath}
          fill="none"
          stroke="rgba(255,255,255,0.92)"
          strokeWidth={0.9}
          strokeLinecap="round"
          pathLength={1}
          className={cn(
            "[stroke-dasharray:1] transition-[stroke-dashoffset] duration-700 ease-out",
            open ? "[stroke-dashoffset:0]" : "[stroke-dashoffset:1]",
          )}
          style={{ transitionDelay: open ? `${DELAY.leader}ms` : "0ms" }}
        />
      </svg>

      {/* Marker pinned on the button */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{ left: `${MARKER_X_PCT}%`, top: `${MARKER_Y_PCT}%` }}
      >
        <div className="relative -translate-x-1/2 -translate-y-1/2">
          {open && (
            <>
              <span className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 animate-pulse-ring" />
              <span
                className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50 animate-pulse-ring"
                style={{ animationDelay: "1.3s" }}
              />
            </>
          )}
          <span
            className={cn(
              "block h-2.5 w-2.5 rounded-full bg-white/95 ring-1 ring-white/60 transition-all duration-500",
              open ? "scale-100 opacity-100" : "scale-0 opacity-0",
            )}
            style={{ transitionDelay: open ? `${DELAY.marker}ms` : "0ms" }}
          />
        </div>
      </div>

      {/* Magnified button */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          left: `${(MED_CX / VB_W) * 100}%`,
          top: `${(MED_CY / VB_H) * 100}%`,
          width: `${((MED_R * 2) / VB_W) * 100}%`,
        }}
      >
        <div
          className={cn(
            "relative aspect-square -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full",
            "ring-1 ring-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.45)]",
            "transition-all duration-700 ease-out",
            open ? "scale-100 rotate-0 opacity-100" : "scale-[0.7] -rotate-12 opacity-0",
          )}
          style={{ transitionDelay: open ? `${DELAY.medallion}ms` : "0ms" }}
        >
          <Image
            src={siteImages.silverButtonMacro}
            alt=""
            fill
            sizes="220px"
            className="scale-[1.06] object-cover"
          />
          {/* Polished-metal sweep */}
          {open && (
            <span
              className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/45 to-transparent animate-sheen"
              style={{ animationDelay: "0.7s" }}
            />
          )}
        </div>
      </div>

      {/* ---- Copy: left rail (never crosses the marker at 56%) ---- */}
      <div className="pointer-events-none absolute left-[5%] top-[5%] w-[48%]" aria-hidden>
        <h3
          style={rHeadline.style}
          className={cn(
            rHeadline.className,
            SHADOW,
            "hidden font-[family-name:var(--font-serif)] text-[15px] font-semibold uppercase leading-[1.1] tracking-[0.06em] text-white md:block lg:text-lg",
          )}
        >
          Own the
          <br />
          distinction.
        </h3>

        <div className="md:mt-6">
          <p
            style={rTitle.style}
            className={cn(
              rTitle.className,
              SHADOW,
              "font-[family-name:var(--font-serif)] text-[10px] font-semibold uppercase leading-tight tracking-[0.12em] text-white sm:text-xs md:text-[13px]",
            )}
          >
            Solid 925 Sterling Silver
          </p>

          <span
            className={cn(
              "mt-1.5 block h-px w-full origin-left bg-white/70 transition-transform duration-500 ease-out md:mt-2",
              open ? "scale-x-100" : "scale-x-0",
            )}
            style={{ transitionDelay: open ? `${DELAY.rule}ms` : "0ms" }}
          />

          <div className="mt-1.5 md:mt-2.5">
            {CALLOUT_BODY.map((line, i) => {
              const r = reveal(open, DELAY.calloutBody + i * 80);
              return (
                <p
                  key={line}
                  style={r.style}
                  className={cn(
                    r.className,
                    SHADOW,
                    "text-[9px] leading-snug text-white/90 sm:text-[11px] md:text-xs",
                  )}
                >
                  {line}
                </p>
              );
            })}
          </div>
        </div>

        <div className="mt-6 hidden space-y-2 md:block">
          {LEGACY_LINES.map((line, i) => {
            const r = reveal(open, DELAY.legacy + i * 80);
            return (
              <p
                key={line}
                style={r.style}
                className={cn(r.className, SHADOW, "text-[11px] leading-snug text-white/85")}
              >
                {line}
              </p>
            );
          })}
        </div>
      </div>

      {/* ---- Brand lockup: bottom bar ---- */}
      <div
        className="pointer-events-none absolute inset-x-[5%] bottom-[5%] hidden items-end justify-between gap-6 md:flex"
        aria-hidden
      >
        <p
          style={rBottomLeft.style}
          className={cn(
            rBottomLeft.className,
            SHADOW,
            "max-w-[52%] font-[family-name:var(--font-serif)] text-[11px] italic leading-snug text-white/90 lg:text-xs",
          )}
        >
          Differentiate with an heirloom. A sartorial statement of taste.
        </p>

        <div className="shrink-0 text-right">
          <p
            style={rBrand.style}
            className={cn(
              rBrand.className,
              SHADOW,
              "font-[family-name:var(--font-serif)] text-[11px] font-semibold uppercase tracking-[0.14em] text-white lg:text-sm",
            )}
          >
            The Silver Button.
          </p>
          <p
            style={rTagline.style}
            className={cn(
              rTagline.className,
              SHADOW,
              "mt-0.5 text-[9px] leading-snug text-white/75 lg:text-[10px]",
            )}
          >
            Legacy woven, silver secured. For the few.
          </p>
        </div>
      </div>

      {/* Screen readers get the same information as prose, once. */}
      <p className="sr-only">
        Finished with solid 925 sterling silver buttons — hand-forged, custom-engraved, and set by
        master silversmiths. A legacy connecting Bhagalpuri weavers and master silversmiths, on
        unmatched Bhagalpuri linen.
      </p>
    </div>
  );
}

export { SilverButtonCallout };
