import type { MetadataRoute } from "next";

const PRODUCTION_FALLBACK_URL = "https://zenithnomads.com";
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION_FALLBACK_URL).replace(/\/+$/, "");

/**
 * Public site is allowed to be crawled/indexed. Everything under /api/,
 * the two owner-facing booking action pages, and the private /admin area
 * are excluded — none of them are public content. /admin and the booking
 * action pages also carry their own `robots: noindex` metadata as a
 * second layer (src/app/admin/layout.tsx, src/app/booking/action/page.tsx,
 * .../result/page.tsx).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/booking/action", "/booking/action/result", "/admin"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
