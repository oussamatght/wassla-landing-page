import { CHAPTERS } from "@/three/timeline.config";
import { cn } from "@/lib/cn";

/**
 * Static chapter key frames (rendered from the real scene into
 * public/fallbacks/). Used without WebGL, on context loss, under
 * prefers-reduced-motion, and as a poster while the 3D chunk loads.
 * CSS backgrounds: a missing file degrades to the page colour, never a
 * broken-image icon.
 */
export function StoryFallback({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      {CHAPTERS.map((chapter, index) => (
        <div
          key={chapter.id}
          className={cn(
            "absolute inset-0 bg-cover bg-no-repeat transition-opacity duration-(--duration-slow) max-md:bg-[center_70%] md:bg-right",
            index === activeIndex ? "opacity-100" : "opacity-0",
          )}
          // Only the active chapter and its neighbours fetch their poster: the others
          // would compete with the hero image (LCP) for bandwidth on first load.
          style={Math.abs(index - activeIndex) <= 1 ? { backgroundImage: `url(${chapter.fallbackImage})` } : undefined}
        />
      ))}
    </div>
  );
}
