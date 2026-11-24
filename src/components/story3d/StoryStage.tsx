"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { loadGsap } from "@/three/gsap";
import { storyState } from "@/three/story-state";
import { CHAPTERS, SCRUB } from "@/three/timeline.config";
import { detectTier, downgrade, type DeviceTier } from "@/three/device-tier";
import { StoryFallback } from "@/components/story3d/StoryFallback";

// The 3D chunk never blocks first paint: client-only, loaded on idle.
const StoryCanvas = dynamic(() => import("@/components/story3d/StoryCanvas"), { ssr: false });

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia(reducedMotionQuery);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
const getReducedMotion = () => window.matchMedia(reducedMotionQuery).matches;

function chapterIndexAt(progress: number): number {
  const i = CHAPTERS.findIndex((c) => progress >= c.start && progress < c.end);
  return i === -1 ? CHAPTERS.length - 1 : i;
}

/**
 * Sticky stage behind the story panels. Owns the ONE master GSAP timeline
 * (single ScrollTrigger, scrub 0.8) whose progress is written into
 * storyState and read by the R3F scene in useFrame (no per-frame React).
 */
export function StoryStage({ enabled3d }: { enabled3d: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);
  const [tier, setTier] = useState<DeviceTier | "pending">("pending");
  const [activeIndex, setActiveIndex] = useState(0);
  const [onScreen, setOnScreen] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);

  // Tier detection on idle (it creates a throwaway WebGL context).
  useEffect(() => {
    if (!enabled3d || reducedMotion) return;
    // QA override (?story-tier=high|mid|low) — used by tests and screenshot
    // scripts because headless browsers render WebGL in software. It cannot
    // force 3D where WebGL is unavailable.
    const forced = new URLSearchParams(window.location.search).get("story-tier");
    let removeInteractionWait: (() => void) | undefined;
    const run = () => {
      const detected = detectTier();
      const canForce = forced === "high" || forced === "mid" || forced === "low";
      const hasWebGL = !!document.createElement("canvas").getContext("webgl");
      const tierToUse = canForce && hasWebGL ? forced : detected;
      // Phones (low tier): the ~1 MB 3D chunk and its shader compilation start at the
      // first interaction instead of on idle, so loading never competes with the first
      // seconds of the page. The static chapter poster is shown until then.
      if (tierToUse === "low" && !canForce && window.scrollY === 0) {
        const events = ["scroll", "pointerdown", "touchstart", "keydown", "wheel"] as const;
        const start = () => {
          removeInteractionWait?.();
          setTier("low");
        };
        events.forEach((e) => window.addEventListener(e, start, { passive: true, once: true }));
        removeInteractionWait = () => events.forEach((e) => window.removeEventListener(e, start));
        return;
      }
      setTier(tierToUse);
    };
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(run, { timeout: 1500 });
      return () => {
        w.cancelIdleCallback?.(id);
        removeInteractionWait?.();
      };
    }
    const id = window.setTimeout(run, 300);
    return () => {
      window.clearTimeout(id);
      removeInteractionWait?.();
    };
  }, [enabled3d, reducedMotion]);

  // Master timeline: one ScrollTrigger over the whole story section.
  useEffect(() => {
    const section = stageRef.current?.closest<HTMLElement>("[data-story]");
    if (!section) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    let removeInteractionWait: (() => void) | undefined;

    // At the very top nothing scrolls yet (progress 0): GSAP (~110 KB) is fetched on the
    // first interaction instead of competing with the first paint. A page restored
    // mid-scroll loads it immediately.
    const whenNeeded = new Promise<void>((resolve) => {
      if (window.scrollY > 0) return resolve();
      const events = ["scroll", "wheel", "touchstart", "pointerdown", "keydown"] as const;
      const go = () => {
        removeInteractionWait?.();
        resolve();
      };
      events.forEach((e) => window.addEventListener(e, go, { passive: true, once: true }));
      removeInteractionWait = () => events.forEach((e) => window.removeEventListener(e, go));
    });

    void whenNeeded.then(() => (disposed ? null : loadGsap())).then((mod) => {
      if (!mod) return;
      const { gsap, ScrollTrigger } = mod;
      if (disposed) return;
      const ctx = gsap.context(() => {
        const proxy = { p: 0 };
        let lastIndex = -1;
        const report = (p: number) => {
          storyState.progress = p;
          const idx = chapterIndexAt(p);
          if (idx !== lastIndex) {
            lastIndex = idx;
            setActiveIndex(idx);
          }
        };
        if (reducedMotion) {
          // No scrub, no camera moves: just pick the chapter key frame.
          ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => report(self.progress),
          });
        } else {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: section,
                start: "top top",
                end: "bottom bottom",
                scrub: SCRUB,
                onUpdate: (self) => {
                  storyState.velocity = self.getVelocity();
                },
              },
            })
            .to(proxy, { p: 1, ease: "none", duration: 1, onUpdate: () => report(proxy.p) });
        }
      }, section);

      let resizeTimer = 0;
      const onResize = () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => ScrollTrigger.refresh(), 200);
      };
      window.addEventListener("resize", onResize);
      void document.fonts?.ready.then(() => ScrollTrigger.refresh());

      cleanup = () => {
        window.removeEventListener("resize", onResize);
        window.clearTimeout(resizeTimer);
        ctx.revert();
      };
    });

    return () => {
      disposed = true;
      removeInteractionWait?.();
      cleanup?.();
      storyState.progress = 0;
      storyState.velocity = 0;
    };
  }, [reducedMotion]);

  // Pause rendering when the story is off-screen or the tab is hidden.
  useEffect(() => {
    const section = stageRef.current?.closest<HTMLElement>("[data-story]");
    if (!section) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(Boolean(entry?.isIntersecting)), { rootMargin: "100px" });
    io.observe(section);
    const onVisibility = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const handleDowngrade = useCallback(() => setTier((t) => (t === "pending" ? t : downgrade(t))), []);
  const handleContextLost = useCallback(() => setTier("none"), []);

  const show3d = enabled3d && !reducedMotion && tier !== "pending" && tier !== "none";

  return (
    <div
      ref={stageRef}
      className="pointer-events-none sticky top-0 -mb-[100vh] h-screen overflow-hidden"
      aria-hidden="true"
      data-story-mode={show3d ? `3d-${tier}` : reducedMotion ? "reduced-motion" : tier === "none" ? "fallback" : "poster"}>
      {!show3d && <StoryFallback activeIndex={activeIndex} />}
      {show3d && (
        <StoryCanvas tier={tier} active={onScreen && pageVisible} onDowngrade={handleDowngrade} onContextLost={handleContextLost} />
      )}
      {/* Readability scrim: text always sits on a dark field, never on a highlight. */}
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/70 to-transparent max-md:bg-gradient-to-b max-md:from-bg max-md:via-bg/80 max-md:to-bg/20" />
    </div>
  );
}
