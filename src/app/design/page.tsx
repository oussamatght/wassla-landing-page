import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DesignPlayground } from "./DesignPlayground";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

/** Dev-only component gallery (404 in production builds). */
export default function DesignPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <DesignPlayground />;
}
