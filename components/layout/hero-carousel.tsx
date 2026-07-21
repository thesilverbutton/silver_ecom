"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const SLIDES = [
  { src: "/hero_images/about_m1_rs-min.webp", alt: "The Silver Button — Handloom fashion" },
  { src: "/hero_images/new_hm_2-min.webp", alt: "Luxury handloom collection" },
  { src: "/hero_images/men_wear2.jpg", alt: "Men's handloom collection" },
  { src: "/hero_images/about_m1_rt-min.webp", alt: "Artisan craftsmanship" },
];

const INTERVAL = 5000;

function HeroCarousel({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, INTERVAL);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative flex h-[85vh] w-full items-center justify-center overflow-hidden">
      {/* Background images */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            i === current ? "opacity-100" : "opacity-0",
          )}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority={i === 0}
          />
        </div>
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-foreground/40" />

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Slide indicators */}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              i === current ? "w-6 bg-white" : "w-2 bg-white/50",
            )}
          />
        ))}
      </div>
    </section>
  );
}

export { HeroCarousel };
