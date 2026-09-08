// Small shared helper for building absolute URLs (email action links) from
// the canonical public site URL. Reads a NEXT_PUBLIC_ var, so there is no
// secrecy concern reading it server-side — it's only ever used there today.

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL is missing. Set it in your environment — see .env.example and " +
        "docs/booking-backend.md."
    );
  }
  return raw.replace(/\/+$/, "");
}
