// components/SiteNav.tsx
"use client";

import { NAV_ITEMS } from "@/data/nav";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu when route changes
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header className="border-b sticky top-0 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="font-semibold tracking-tight">
          Token
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-6">
            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`text-sm hover:underline underline-offset-4 ${
                      active ? "font-semibold" : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Hamburger (mobile) */}
        <button
          aria-label="Toggle Menu"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((o) => !o)}
          className="md:hidden px-3 py-2 rounded-xl border"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile drawer */}
      <nav
        id="primary-nav"
        className={`md:hidden border-t ${open ? "block" : "hidden"}`}
      >
        <ul className="flex flex-col p-2">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block w-full px-3 py-2 rounded-lg hover:bg-black/5 ${
                    active ? "font-semibold" : ""
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
