"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { label: "Destinations", href: "/results" },
  { label: "Packages", href: "/results" },
  { label: "Plan Your Trip", href: "/trip-builder" },
  { label: "Contact", href: "/" },
];

export function PublicHeader() {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;

      if (currentY < 20) {
        setVisible(true);
        lastY.current = currentY;
        return;
      }

      if (currentY > lastY.current && currentY > 80) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      lastY.current = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-3 z-[70] px-3 transition-all duration-300 sm:top-5 sm:px-5 ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-5 pointer-events-none opacity-0"
      }`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between rounded-[30px] bg-[#f6f1e8]/72 px-4 py-3 backdrop-blur-xl sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#f97316_100%)] text-xs font-bold text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]">
              ET
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-900 sm:text-xs">
                EASYTRIP365
              </p>
              <p className="text-[10px] text-slate-500 sm:text-xs">
                Curated holiday journeys
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-3 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full border border-black/70 bg-transparent px-5 py-2.5 text-sm font-medium text-slate-800 transition hover:border-black hover:text-slate-950"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/trip-builder"
            className="inline-flex rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(249,115,22,0.28)] transition hover:bg-orange-600"
          >
            Start Planning
          </Link>
        </div>
      </div>
    </header>
  );
}
