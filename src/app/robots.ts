import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const allowIndexing = !publicEnv.useFixtures;
  return {
    rules: allowIndexing
      ? [{ userAgent: "*", allow: "/", disallow: ["/design", "/api/"] }]
      : [{ userAgent: "*", disallow: "/" }],
    sitemap: `${publicEnv.siteUrl}/sitemap.xml`,
  };
}
