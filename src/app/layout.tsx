import type { Metadata } from "next";
import { Space_Grotesk, Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["italic"],
});

const title = "Zenith Nomads | Surf, Climb & Create in Morocco";
const description =
  "Zenith Nomads is a week-long surf, climbing and creative retreat in Morocco, with accommodation, activities and Moroccan culture included.";

// Canonical production domain. NEXT_PUBLIC_SITE_URL (already used
// elsewhere for booking action links — see docs/booking-backend.md) is
// preferred so this tracks whatever's configured per environment (e.g.
// http://localhost:3000 locally); the fallback below is the confirmed
// canonical domain, not a guess, for any environment where that var isn't
// set.
const PRODUCTION_FALLBACK_URL = "https://zenithnomads.com";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION_FALLBACK_URL;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "Zenith Nomads",
  creator: "Zenith Nomads",
  publisher: "Zenith Nomads",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title,
    description,
    siteName: "Zenith Nomads",
    type: "website",
    locale: "en_US",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

// Conservative Organization JSON-LD — only facts already established
// elsewhere in this project (name, canonical URL, the same description
// used above). Deliberately omits address, geo, phone, social profiles,
// logo, founding date, and any LodgingBusiness/Offer properties, none of
// which exist as confirmed facts anywhere in this codebase yet.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Zenith Nomads",
  url: siteUrl,
  description,
};

// Escaping "<" defends against the JSON-LD payload ever being able to
// prematurely close the script tag (e.g. a future field containing
// "</script>") — not a live risk with today's static, developer-authored
// content, but the standard safe pattern for embedding JSON-LD.
const organizationJsonLdScript = JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c");

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${cormorantGaramond.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: organizationJsonLdScript }}
        />
        {children}
      </body>
    </html>
  );
}
