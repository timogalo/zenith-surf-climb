import type { Metadata } from "next";
import type { ReactNode } from "react";

// Applies to every /admin/** route (login included). Belt-and-suspenders
// with robots.ts's disallow rule — neither the admin login gate nor the
// booking data behind it is ever public content.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
