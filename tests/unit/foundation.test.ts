import { describe, expect, it } from "vitest";
import { z } from "zod";
import { formatPriceDA } from "@/lib/format";
import cloudinaryLoader from "@/lib/cloudinary-loader";
import { STORE_LINKS } from "@/lib/constants";
import { buildUrl } from "@/services/api/client";

describe("formatPriceDA", () => {
  it("uses narrow no-break space separators and the DA suffix", () => {
    expect(formatPriceDA(12500)).toBe("12 500 DA");
    expect(formatPriceDA(1500000)).toBe("1 500 000 DA");
    expect(formatPriceDA(950)).toBe("950 DA");
  });

  it("rounds to whole dinars and never prints NaN", () => {
    expect(formatPriceDA(999.6)).toBe("1 000 DA");
    expect(formatPriceDA(Number.NaN)).toBe("—");
  });
});

describe("cloudinaryLoader", () => {
  it("inserts delivery transformations after /upload/", () => {
    const src = "https://res.cloudinary.com/demo/image/upload/v1712/wassla/products/abc.jpg";
    expect(cloudinaryLoader({ src, width: 640 })).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_640/v1712/wassla/products/abc.jpg",
    );
  });

  it("leaves local assets unchanged apart from a width hint", () => {
    expect(cloudinaryLoader({ src: "/brand/wassla-logo.png", width: 96 })).toBe("/brand/wassla-logo.png?w=96");
  });
});

describe("store links", () => {
  it("are exactly the owner-supplied URLs", () => {
    expect(STORE_LINKS).toEqual({
      googlePlay: "https://play.google.com/store/apps/details?id=com.wassla.dz.app",
      appStore: "https://apps.apple.com/us/app/wassla-app/id6782409544",
    });
  });
});

describe("buildUrl", () => {
  it("joins paths and drops empty parameters", () => {
    expect(buildUrl("http://127.0.0.1:5000/api/", "/products/search", { q: "filtre", page: 2, empty: "", none: undefined })).toBe(
      "http://127.0.0.1:5000/api/products/search?q=filtre&page=2",
    );
  });

  it("repeats array parameters", () => {
    expect(buildUrl("http://x/api", "a", { tag: ["1", "2"] })).toBe("http://x/api/a?tag=1&tag=2");
  });

  it("zod is available for response schemas", () => {
    expect(z.object({ a: z.number() }).safeParse({ a: 1 }).success).toBe(true);
  });
});
