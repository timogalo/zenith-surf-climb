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

const title = "Zenith Surf & Climb";
const description =
  "Zenith Surf & Climb is an adventure retreat in Morocco blending surf, climbing and creative workshops with Moroccan culture and community.";

// The final custom domain hasn't been confirmed by the client yet. Prefer
// NEXT_PUBLIC_SITE_URL (already used elsewhere for booking action links —
// see docs/booking-backend.md) so this tracks whatever's configured per
// environment; fall back to the current production Vercel URL only when
// that isn't set (e.g. local dev without it configured), rather than
// inventing a client domain that doesn't exist yet.
const PRODUCTION_FALLBACK_URL = "https://zenith-surf-climbb.vercel.app";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION_FALLBACK_URL;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
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
    siteName: title,
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${cormorantGaramond.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
