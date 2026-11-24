import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StoryFrame } from "./StoryFrame";

export const metadata: Metadata = { title: "Story frame", robots: { index: false, follow: false } };

/**
 * Dev-only: renders the 3D scene at a frozen progress (?p=0.26&tier=high)
 * with no text or scrim, so Playwright can capture chapter key frames into
 * public/fallbacks/ and local screenshot series. 404 in production.
 */
export default function StoryFramePage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <StoryFrame />;
}
