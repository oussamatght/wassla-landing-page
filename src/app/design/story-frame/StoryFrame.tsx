"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { storyState } from "@/three/story-state";
import type { DeviceTier } from "@/three/device-tier";

const StoryCanvas = dynamic(() => import("@/components/story3d/StoryCanvas"), { ssr: false });

function Frame() {
  const params = useSearchParams();
  const p = Math.min(1, Math.max(0, Number(params.get("p") ?? "0")));
  const tierParam = params.get("tier");
  const tier: Exclude<DeviceTier, "none"> = tierParam === "mid" || tierParam === "low" ? tierParam : "high";

  useEffect(() => {
    storyState.frozenAt = p;
    return () => {
      storyState.frozenAt = null;
    };
  }, [p]);

  return (
    <div className="fixed inset-0 z-[200] bg-bg" data-frame-progress={p}>
      <StoryCanvas tier={tier} active onDowngrade={() => undefined} onContextLost={() => undefined} />
    </div>
  );
}

export function StoryFrame() {
  return (
    <Suspense fallback={null}>
      <Frame />
    </Suspense>
  );
}
