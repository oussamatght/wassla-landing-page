import Link from "next/link";
import { preload } from "react-dom";
import { fr } from "@/i18n/fr";
import { isFeatureEnabled } from "@/lib/flags";
import { SearchBar } from "@/components/ui/SearchBar";
import { ButtonLink } from "@/components/ui/Button";
import { StoryStage } from "@/components/story3d/StoryStage";
import { StoryPanel } from "@/components/story3d/StoryPanel";
import { CHAPTERS, STORY_HEIGHT_VH, type ChapterId } from "@/three/timeline.config";
import { HomeSections } from "@/components/home/HomeSections";
import { dataSource } from "@/services/data-source";

export const revalidate = 60;

const CATEGORY_SHORTCUTS = [
  { href: "/categories/automobile", ...fr.categories.automobile, code: "AUTO" },
  { href: "/categories/motos", ...fr.categories.moto, code: "MOTO" },
  { href: "/categories/poids-lourds", ...fr.categories.heavy, code: "PL" },
] as const;

const panelVh = (id: ChapterId) => CHAPTERS.find((c) => c.id === id)?.panelVh ?? 100;

function ChapterText({
  kicker,
  title,
  body,
  cta,
  href,
  children,
}: {
  kicker: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="max-w-xl space-y-5 py-12">
      <p className="font-mono text-xs tracking-[0.25em] text-accent uppercase">{kicker}</p>
      <h2 className="text-3xl leading-tight font-semibold sm:text-4xl lg:text-5xl">{title}</h2>
      <p className="text-lg text-text-secondary">{body}</p>
      {children}
      <ButtonLink href={href} variant="secondary">
        {cta}
      </ButtonLink>
    </div>
  );
}

/**
 * Home. The first viewport (headline, search, category shortcuts) is plain
 * server-rendered HTML, interactive before any WebGL code downloads; the 3D
 * stage is lazy and sits behind the story panels.
 */
export default async function HomePage() {
  // The hero poster is the LCP element (a CSS background): fetch it with the HTML.
  const heroPoster = CHAPTERS[0]?.fallbackImage;
  if (heroPoster) preload(heroPoster, { as: "image", fetchPriority: "high" });
  const story = fr.story;
  const { data: settings } = await dataSource.settings();
  const story3d = isFeatureEnabled("story3d", settings?.flags);
  return (
    <>
    <section
      data-story
      aria-label={story.sectionLabel}
      className="relative isolate -mt-16"
      style={{ minHeight: `${STORY_HEIGHT_VH}vh` }}>
      <StoryStage enabled3d={story3d} />

      {/* 0 · Hero */}
      <StoryPanel id="accueil" heightVh={panelVh("hero")} sticky={false} className="gap-9 pt-28 pb-12 md:pt-32">
        <div className="max-w-2xl space-y-6">
          <p className="font-mono text-xs tracking-[0.25em] text-accent uppercase">Pièces auto · Services · Algérie</p>
          <h1 className="text-4xl leading-[1.05] font-semibold sm:text-5xl lg:text-6xl">{fr.hero.title}</h1>
          <p className="max-w-xl text-lg text-text-secondary">{fr.hero.subtitle}</p>
        </div>
        <SearchBar className="max-w-2xl" />
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/catalogue" size="lg">
            {fr.hero.ctaParts}
          </ButtonLink>
          <ButtonLink href="/prestataires" variant="secondary" size="lg">
            {fr.hero.ctaProviders}
          </ButtonLink>
        </div>
        <nav aria-label="Catégories" className="max-w-2xl">
          <ul className="grid gap-3 sm:grid-cols-3">
            {CATEGORY_SHORTCUTS.map((category) => (
              <li key={category.href}>
                <Link
                  href={category.href}
                  className="flex h-full flex-col gap-1 rounded-lg border border-border bg-surface-1/80 p-4 backdrop-blur-sm transition-colors hover:border-border-strong hover:bg-surface-2">
                  <span className="font-mono text-[11px] tracking-[0.2em] text-text-muted">{category.code}</span>
                  <span className="font-display text-lg font-semibold">{category.title}</span>
                  <span className="text-sm text-text-secondary">{category.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </StoryPanel>

      {/* 1 · Automobile */}
      <StoryPanel id="automobile" heightVh={panelVh("automobile")}>
        <ChapterText {...story.automobile} href="/categories/automobile">
          <ul className="grid max-w-md grid-cols-2 gap-2" aria-label="Pièces de l'ensemble de freinage">
            {story.automobile.parts.map((part) => (
              <li key={part} className="flex items-center gap-2 font-mono text-xs tracking-[0.12em] text-text-secondary uppercase">
                <span aria-hidden="true" className="h-px w-4 bg-accent" />
                {part}
              </li>
            ))}
          </ul>
        </ChapterText>
      </StoryPanel>

      {/* 2 · Motos */}
      <StoryPanel id="motos" heightVh={panelVh("moto")}>
        <ChapterText {...story.moto} href="/categories/motos" />
      </StoryPanel>

      {/* 3 · Poids lourds */}
      <StoryPanel id="poids-lourds" heightVh={panelVh("heavy")}>
        <ChapterText {...story.heavy} href="/categories/poids-lourds" />
      </StoryPanel>

      {/* 4 · Marketplace — sponsored product cards join here once the Boost
          backend supports them; no placeholder grid is ever shown. */}
      <StoryPanel id="marketplace" heightVh={panelVh("marketplace")} sticky={false}>
        <div className="max-w-xl space-y-5 py-16">
          <p className="font-mono text-xs tracking-[0.25em] text-accent uppercase">{story.marketplace.kicker}</p>
          <h2 className="text-3xl leading-tight font-semibold sm:text-4xl">{story.marketplace.title}</h2>
          <p className="text-lg text-text-secondary">{story.marketplace.body}</p>
          <ButtonLink href="/catalogue" size="lg">
            {story.marketplace.cta}
          </ButtonLink>
        </div>
      </StoryPanel>
    </section>
    <HomeSections settings={settings} />
    </>
  );
}
