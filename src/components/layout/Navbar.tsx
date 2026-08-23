"use client";

import { useState } from "react";
import { siteContent } from "@/data/content";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { name } = siteContent.brand;
  const { links } = siteContent.nav;

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7 sm:px-8 lg:px-12"
      >
        <a
          href="#"
          className="font-heading text-xl font-semibold tracking-tight text-warm-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-white focus-visible:ring-offset-2 focus-visible:ring-offset-ocean-navy sm:text-2xl"
        >
          {name}
        </a>

        <ul className="hidden items-center gap-12 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="relative inline-block font-body text-xs font-medium uppercase tracking-[0.14em] text-warm-white/90 transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-terracotta after:transition-transform after:duration-300 after:ease-out after:content-[''] hover:text-warm-white hover:after:scale-x-100 focus-visible:text-warm-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-white focus-visible:ring-offset-2 focus-visible:ring-offset-ocean-navy focus-visible:after:scale-x-100 motion-reduce:after:transition-none"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="flex h-10 w-10 items-center justify-center text-warm-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-white focus-visible:ring-offset-2 focus-visible:ring-offset-ocean-navy md:hidden"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            className="h-6 w-6"
          >
            {isMenuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={`${
          isMenuOpen ? "block" : "hidden"
        } bg-ocean-navy px-6 pb-6 md:hidden`}
      >
        <ul className="flex flex-col gap-4">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block font-body text-base font-medium text-warm-white/90 transition-colors hover:text-warm-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-white focus-visible:ring-offset-2 focus-visible:ring-offset-ocean-navy"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
