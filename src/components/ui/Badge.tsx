import { fr } from "@/i18n/fr";
import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger" | "sponsored" | "ad";

const tones: Record<BadgeTone, string> = {
  neutral: "border-border-strong text-text-secondary",
  accent: "border-accent/40 text-accent",
  success: "border-success/40 text-success",
  warning: "border-warning/40 text-warning",
  danger: "border-danger/40 text-danger",
  sponsored: "border-sponsored/50 text-sponsored",
  ad: "border-border-strong text-text-secondary",
};

interface BadgeProps {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ tone = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border bg-bg/70 px-2.5 py-0.5 font-mono text-[11px] font-medium tracking-[0.12em] uppercase backdrop-blur-sm",
        tones[tone],
        className,
      )}>
      {children}
    </span>
  );
}

/** Required label for paid product boosts and promoted provider listings. */
export function SponsoredBadge({ label = fr.badges.sponsored }: { label?: string }) {
  return (
    <Badge tone="sponsored">
      <svg aria-hidden="true" width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
        <path d="M6 0l1.6 4.4L12 6l-4.4 1.6L6 12 4.4 7.6 0 6l4.4-1.6z" />
      </svg>
      {label}
    </Badge>
  );
}

/** Required label for partner / advertiser banners. */
export function AdBadge() {
  return <Badge tone="ad">{fr.badges.advertisement}</Badge>;
}
