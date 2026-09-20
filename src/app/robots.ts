import type { MetadataRoute } from "next";

const PRODUCTION_FALLBACK_URL = "https://zenithnomads.com";
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION_FALLBACK_URL).replace(/\/+$/, "");

/**
 * Public site is allowed to be crawled/indexed. Everything under /api/ and
 * the two owner-facing booking action pages are excluded — none of them
 * are public content, and the action pages are only ever reached via a
 * signed, single-purpose link emailed to the owner (see
 * src/app/booking/action/page.tsx and .../result/page.tsx, which also
 * carry their own `robots: noindex` metadata as a second layer).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/booking/action", "/booking/action/result"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
