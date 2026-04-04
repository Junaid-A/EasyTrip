"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuthModalStore } from "@/store/useAuthModalStore";
import { useAuth } from "@/components/providers/auth-provider";

const navItems = [
  { label: "Destinations", href: "/results" },
  { label: "Packages", href: "/results" },
  { label: "Plan Your Trip", href: "/trip-builder" },
  { label: "Contact", href: "/" },
];

export function PublicHeader() {
  const [visible, setVisible] = useState(true);
  const [accountOpen, setAccountOpen] = useState(false);
  const lastY = useRef(0);

  const openAuthModal = useAuthModalStore((state) => state.openAuthModal);
  const { user, profile, loading, logout } = useAuth();

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

  useEffect(() => {
    function handleOutsideClick() {
      setAccountOpen(false);
    }

    if (accountOpen) {
      window.addEventListener("click", handleOutsideClick);
    }

    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, [accountOpen]);

  const fullLabel =
    profile?.full_name?.trim() || user?.email || "My Account";

  const firstLetter =
    (profile?.full_name?.trim()?.charAt(0) ||
      user?.email?.charAt(0) ||
      "M").toUpperCase();

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
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#f97316_100%)] text-xs font-bold text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]">
              ET
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold tracking-[0.18em] text-slate-900 sm:text-xs">
                EASYTRIP365
              </p>
              <p className="hidden text-[10px] text-slate-500 sm:block sm:text-xs">
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

          <div className="flex items-center gap-2 sm:gap-3">
            {loading ? (
              <div className="inline-flex shrink-0 rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-500 sm:px-5 sm:py-2.5 sm:text-sm">
                Loading...
              </div>
            ) : user ? (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setAccountOpen((current) => !current)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-sm font-bold text-slate-800 transition hover:bg-slate-50 sm:h-11 sm:w-11"
                  title={fullLabel}
                >
                  {firstLetter}
                </button>

                {accountOpen ? (
                  <div className="absolute right-0 top-[calc(100%+10px)] w-[240px] overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Signed in
                      </p>
                      <p className="mt-2 truncate text-sm font-semibold text-slate-900">
                        {profile?.full_name || "Traveller"}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {user.email}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {profile?.phone || "Phone not added"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        await logout();
                        setAccountOpen(false);
                      }}
                      className="mt-3 w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="inline-flex shrink-0 rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-50 sm:px-5 sm:py-2.5 sm:text-sm"
              >
                Login
              </button>
            )}

            <Link
              href="/trip-builder"
              className="inline-flex shrink-0 rounded-full bg-orange-500 px-3 py-2 text-xs font-semibold text-white shadow-[0_14px_30px_rgba(249,115,22,0.28)] transition hover:bg-orange-600 sm:px-5 sm:py-2.5 sm:text-sm"
            >
              Start Planning
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}