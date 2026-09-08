import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Reads a local file and generates the image at build time (statically
// optimized/cached — see next/dist/docs/.../opengraph-image.md), so this
// has zero runtime cost. Requires the Node.js runtime for filesystem
// access (Edge, the default for this route type, has no `fs`).
export const runtime = "nodejs";

export const alt = "Zenith Surf & Climb — a turquoise pool in a Paradise Valley canyon, Morocco";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Temporary, photography-led share image using an existing Zenith photo —
// no logo exists yet (public/logo/ is an empty placeholder; see
// docs/booking-backend.md-adjacent audit notes), so this deliberately
// avoids inventing one. Paradise Valley's dominant canyon-pool shot was
// chosen because its native ~2:1 ratio needs almost no cropping to fill
// 1200x630, and it's already the site's strongest single composition.
const PHOTO_PATH = "public/images/paradise-valley/paradise-valley-06.jpg";

export default async function Image() {
  const photo = await readFile(join(process.cwd(), PHOTO_PATH));
  const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#102A43",
        }}
      >
        {/* next/og's ImageResponse (Satori) renders this into a static PNG
            — it has no DOM, so next/image can't be used here and there's
            no assistive-tech surface for `alt`; the module-level `alt`
            export above is what actually becomes the resulting
            og:image:alt tag. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoSrc}
          alt=""
          width={1200}
          height={630}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Scrim for text legibility only, matching the same bottom-scrim
            treatment used on the real Hero section. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(27,27,27,0.78) 0%, rgba(27,27,27,0.25) 42%, rgba(27,27,27,0) 68%)",
            display: "flex",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 64,
            bottom: 56,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: 24,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#D9C3A5",
            }}
          >
            Zenith Surf &amp; Climb
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 58,
              fontWeight: 600,
              color: "#F8F7F3",
            }}
          >
            Surf. Climb. Create.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
