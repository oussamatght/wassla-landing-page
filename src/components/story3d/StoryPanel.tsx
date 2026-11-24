import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface StoryPanelProps {
  id: string;
  heightVh: number;
  children: ReactNode;
  className?: string;
  /** Pin the text block while the chapter scrubs (readability). */
  sticky?: boolean;
}

/**
 * Server-rendered chapter panel. Text lives in normal flow (natural
 * scrolling, crawlable, readable without JS or WebGL); the 3D stage sits
 * behind it.
 */
export function StoryPanel({ id, heightVh, children, className, sticky = true }: StoryPanelProps) {
  return (
    <div id={id} data-chapter={id} className="relative z-10" style={{ minHeight: `${heightVh}vh` }}>
      <div
        className={cn(
          "mx-auto flex max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8",
          sticky ? "sticky top-16 min-h-[calc(100vh-4rem)]" : "min-h-[calc(100vh-4rem)]",
          className,
        )}>
        {children}
      </div>
    </div>
  );
}
