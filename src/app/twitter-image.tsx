// Twitter/X shares the exact same generated image as Open Graph — see
// opengraph-image.tsx for the implementation and reasoning. Re-exporting
// rather than duplicating the ImageResponse markup. `runtime` is a route
// segment config value and must be declared literally in this file — Next
// only statically parses it, it can't follow a re-export.
export { default, alt, size, contentType } from "./opengraph-image";

export const runtime = "nodejs";
