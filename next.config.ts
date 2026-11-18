import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const useFixtures = process.env.NEXT_PUBLIC_USE_FIXTURES === "true";
const isProductionBuild =
  process.env.NODE_ENV === "production" && process.argv.includes("build");

// Rule 8: fixtures are a development aid only. A production build must never
// ship demonstration data.
if (useFixtures && isProductionBuild) {
  throw new Error(
    "Refusing to build with NEXT_PUBLIC_USE_FIXTURES=true. Fixtures are dev-only.",
  );
}

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
];

const nextConfig: NextConfig = {
  // A stray package-lock.json exists in the user's home folder; pin the root
  // so Next never infers the wrong workspace.
  turbopack: { root: path.dirname(fileURLToPath(import.meta.url)) },
  // Dev only: tests and screenshot scripts browse via 127.0.0.1; without this
  // Next blocks dev chunks/HMR for that origin and pages never hydrate.
  allowedDevOrigins: ["127.0.0.1"],
  // The dev "N" badge would otherwise appear in captured fallback frames.
  devIndicators: false,
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Product/provider media are Cloudinary URLs stored by the backend.
    // Transformations are applied by the
    // custom loader in src/lib/cloudinary-loader.ts.
    loader: "custom",
    loaderFile: "./src/lib/cloudinary-loader.ts",
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
