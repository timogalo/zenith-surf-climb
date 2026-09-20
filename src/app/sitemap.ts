import type { MetadataRoute } from "next";

const PRODUCTION_FALLBACK_URL = "https://zenithnomads.com";
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION_FALLBACK_URL).replace(/\/+$/, "");

/**
 * The public site is effectively a single page (the homepage — every
 * "section" is an anchor within it, not a separate route), so this lists
 * only the canonical homepage URL. /api/*, the booking action pages, and
 * any www/deployment-domain variant are deliberately excluded — none are
 * public canonical content (see robots.ts and the noindex metadata on the
 * booking action pages themselves).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
