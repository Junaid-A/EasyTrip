"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  FileText,
  UserRound,
  LogOut,
} from "lucide-react";

const items = [
  { label: "Dashboard", href: "/agent/dashboard", icon: LayoutDashboard },
  { label: "Quotes", href: "/agent/quotes", icon: FileText },
  { label: "Profile", href: "/agent/profile", icon: UserRound },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AgentSidebar({ collapsed = false }: { collapsed?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/agent/login");
    router.refresh();
  }

  return (
    <div
      className={[
        "flex h-full min-h-0 flex-col rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[0_16px_50px_rgba(15,23,42,0.05)]",
        collapsed ? "items-center" : "",
      ].join(" ")}
    >
      <Link
        href="/agent/dashboard"
        className={[
          "flex w-full items-center border-b border-[var(--line)] pb-4",
          collapsed ? "justify-center" : "gap-3",
        ].join(" ")}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--hero-ink)] text-sm font-bold text-white">
          AG
        </div>

        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-[0.08em] text-[var(--hero-ink)]">
              AGENT PANEL
            </p>
            <p className="truncate text-xs text-[var(--muted)]">
              EasyTrip365 workspace
            </p>
          </div>
        ) : null}
      </Link>

      <div className="mt-4 min-h-0 w-full flex-1 overflow-y-auto">
        <div className="space-y-2">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                title={item.label}
                className={[
                  "flex w-full rounded-2xl transition",
                  collapsed
                    ? "items-center justify-center px-0 py-3"
                    : "items-center px-4 py-3 text-[15px]",
                  active
                    ? "bg-[var(--brand)] text-white shadow-[0_10px_24px_rgba(249,115,22,0.22)]"
                    : "text-[var(--foreground)] hover:bg-white",
                ].join(" ")}
              >
                {collapsed ? <Icon size={18} strokeWidth={2.1} /> : item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-4 w-full border-t border-[var(--line)] pt-4">
        <button
          type="button"
          onClick={handleLogout}
          title="Logout"
          className={[
            "flex w-full rounded-2xl bg-[var(--hero-ink)] py-3 text-sm font-semibold text-white transition hover:opacity-95",
            collapsed ? "items-center justify-center px-0" : "items-center justify-center px-4",
          ].join(" ")}
        >
          {collapsed ? <LogOut size={18} /> : "Logout"}
        </button>
      </div>
    </div>
  );
}