"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { Modal } from "@/components/ui/Dialog";
import { BlueprintIllustration } from "@/components/ui/States";
import { cn } from "@/lib/cn";

/**
 * Accessible gallery: swipe (native scroll-snap), ← → keys, thumbnails,
 * and a full-size view in a native dialog.
 */
export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const track = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (i: number) => {
      const next = (i + images.length) % images.length;
      setIndex(next);
      const el = track.current;
      if (el) el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    },
    [images.length],
  );

  if (images.length === 0) {
    return (
      <div className="blueprint-grid flex aspect-[4/3] items-center justify-center rounded-xl border border-border bg-surface-1">
        <BlueprintIllustration className="h-32 w-40 opacity-70" />
        <span className="sr-only">Pas de photo pour cette annonce</span>
      </div>
    );
  }

  return (
    <div
      className="space-y-3"
      role="region"
      aria-roledescription="carrousel"
      aria-label={`Photos — ${title}`}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
      }}>
      <div className="relative">
        <div
          ref={track}
          tabIndex={0}
          className="flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto rounded-xl border border-border bg-surface-1 [scrollbar-width:none]"
          onScroll={(e) => {
            const el = e.currentTarget;
            const i = Math.round(el.scrollLeft / el.clientWidth);
            if (i !== index) setIndex(i);
          }}>
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setZoom(true)}
              className="relative h-full w-full shrink-0 snap-center"
              aria-label={`Agrandir la photo ${i + 1} sur ${images.length}`}>
              <Image src={src} alt="" fill priority={i === 0} sizes="(min-width: 1024px) 50vw, 100vw" className="object-contain" />
            </button>
          ))}
        </div>
        {images.length > 1 && (
          <>
            <button type="button" onClick={() => go(index - 1)} aria-label="Photo précédente" className="absolute start-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border-strong bg-bg/80 sm:inline-flex">←</button>
            <button type="button" onClick={() => go(index + 1)} aria-label="Photo suivante" className="absolute end-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border-strong bg-bg/80 sm:inline-flex">→</button>
            <p className="absolute end-3 bottom-3 rounded-full bg-bg/80 px-2.5 py-1 font-mono text-xs" aria-live="polite">
              {index + 1} / {images.length}
            </p>
          </>
        )}
      </div>
      {images.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <li key={src + i}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-label={`Afficher la photo ${i + 1}`}
                aria-current={i === index}
                className={cn("relative block h-16 w-20 overflow-hidden rounded-md border", i === index ? "border-accent" : "border-border opacity-70 hover:opacity-100")}>
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Modal open={zoom} onClose={() => setZoom(false)} title={`${title} — photo ${index + 1}/${images.length}`}>
        <div className="relative aspect-[4/3] w-full">
          <Image src={images[index]!} alt="" fill sizes="90vw" className="object-contain" />
        </div>
      </Modal>
    </div>
  );
}
