import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontBody, fontDisplay, fontMono } from "@/styles/fonts";
import { fr } from "@/i18n/fr";
import { publicEnv } from "@/lib/env";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { DemoRibbon } from "@/components/layout/DemoRibbon";

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
  title: { default: fr.meta.title, template: fr.meta.titleTemplate },
  description: fr.meta.description,
  applicationName: "WASSLA",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_DZ",
    siteName: "WASSLA",
    title: fr.meta.title,
    description: fr.meta.description,
    images: [{ url: "/brand/og-default.jpg", width: 1200, height: 630, alt: "WASSLA — Pièces auto · Services · Algérie" }],
  },
  icons: { icon: "/brand/favicon-48.png", apple: "/brand/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#020523",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      dir="ltr"
      className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-surface-2 focus:px-4 focus:py-2 focus:text-sm focus:font-medium">
          {fr.a11y.skipToContent}
        </a>
        {publicEnv.useFixtures && <DemoRibbon />}
        <SiteHeader />
        <main id="contenu" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
