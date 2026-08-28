"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const EDGE_TOLERANCE = 2;

function DraggableHeroImage() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, startX: 0, scrollLeft: 0 });
  const [dragging, setDragging] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateEdges = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    setCanScrollLeft(viewport.scrollLeft > EDGE_TOLERANCE);
    setCanScrollRight(
      viewport.scrollLeft < viewport.scrollWidth - viewport.clientWidth - EDGE_TOLERANCE,
    );
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const showFirstStep = () => {
      viewport.scrollLeft = 0;
      updateEdges();
    };

    showFirstStep();
    const observer = new ResizeObserver(showFirstStep);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [updateEdges]);

  const scroll = (direction: -1 | 1) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    viewport.scrollBy({
      left: direction * viewport.clientWidth * 0.55,
      behavior: "smooth",
    });
  };

  return (
    <div className="group relative overflow-hidden">
      <div
        ref={viewportRef}
        role="region"
        aria-label="Scrollable craft journey"
        tabIndex={0}
        onScroll={updateEdges}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            scroll(-1);
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            scroll(1);
          }
        }}
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse" || event.button !== 0) return;
          const viewport = viewportRef.current;
          if (!viewport) return;

          dragRef.current = {
            active: true,
            startX: event.clientX,
            scrollLeft: viewport.scrollLeft,
          };
          viewport.setPointerCapture(event.pointerId);
          setDragging(true);
        }}
        onPointerMove={(event) => {
          if (!dragRef.current.active) return;
          const viewport = viewportRef.current;
          if (!viewport) return;

          viewport.scrollLeft =
            dragRef.current.scrollLeft - (event.clientX - dragRef.current.startX);
        }}
        onPointerUp={(event) => {
          if (!dragRef.current.active) return;
          dragRef.current.active = false;
          event.currentTarget.releasePointerCapture(event.pointerId);
          setDragging(false);
        }}
        onPointerCancel={() => {
          dragRef.current.active = false;
          setDragging(false);
        }}
        className={cn(
          "scrollbar-hidden overflow-x-auto overscroll-x-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#635341]",
          dragging ? "cursor-grabbing select-none" : "cursor-grab",
        )}
      >
        <Image
          src="/hero_image.webp"
          alt="The craft journey: farming, fibre preparation, hand weaving, handcrafting, silver craftsmanship and the finished garment"
          width={1774}
          height={887}
          priority
          quality={70}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
          draggable={false}
          className="h-auto w-[180%] max-w-none sm:w-[150%] lg:w-[120%]"
        />
      </div>

      <button
        type="button"
        aria-label="Scroll artwork left"
        onClick={() => scroll(-1)}
        className={cn(
          "absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#3C332A] shadow-md backdrop-blur-sm transition-opacity hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635341] sm:flex",
          canScrollLeft ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Scroll artwork right"
        onClick={() => scroll(1)}
        className={cn(
          "absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#3C332A] shadow-md backdrop-blur-sm transition-opacity hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635341] sm:flex",
          canScrollRight ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#F6F3ED]/85 px-2 py-1 text-[9px] font-medium uppercase tracking-[0.08em] text-[#4F4232] backdrop-blur-sm sm:hidden">
        Swipe to explore
      </p>
    </div>
  );
}

export { DraggableHeroImage };