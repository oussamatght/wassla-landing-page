import Image from "next/image";
import Link from "next/link";

/**
 * The official artwork is used as supplied (never recoloured, stretched or
 * cropped). Only a square PNG with a baked navy background exists today, so
 * the header shows the rounded app-icon tile; a mark-only SVG is listed as a
 * required asset in docs/DESIGN_SYSTEM.md.
 */
export function BrandLogo({ size = 40 }: { size?: number }) {
  return (
    <Link
      href="/"
      className="inline-flex shrink-0 items-center gap-3 rounded-lg"
      aria-label="WASSLA — accueil">
      {/* Proportional downscale of the official artwork (no crop/recolour). */}
      <Image
        src="/brand/wassla-app-icon-96.webp"
        alt=""
        width={size}
        height={size}
        priority
        unoptimized
        className="rounded-[22%]"
      />
      <span className="font-display text-lg font-semibold tracking-[0.08em] text-text-primary">
        WASSLA
      </span>
    </Link>
  );
}
