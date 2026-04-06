"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const items = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Bookings", href: "/admin/bookings" },
  { label: "Products", href: "/admin/products" },
  { label: "Rates", href: "/admin/rates" },
  { label: "Packages", href: "/admin/packages" },
  { label: "Recommendations", href: "/admin/recommendations" },
  { label: "Agents", href: "/admin/agents" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Settings", href: "/admin/settings" },
  { label: "CRM Customers", href: "/admin/crm/customers" },
  { label: "CRM Agents", href: "/admin/crm/agents" },
  { label: "Payments", href: "/admin/payments" },
  { label: "Receivables", href: "/admin/receivables" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ collapsed = false }: { collapsed?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex h-full min-h-0 flex-col rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
      <Link
        href="/"
        className={[
          "flex items-center gap-3 border-b border-[var(--line)] pb-4",
          collapsed ? "justify-center" : "",
        ].join(" ")}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--hero-ink)] text-sm font-bold text-white">
          AD
        </div>

        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-[0.08em] text-[var(--hero-ink)]">
              ADMIN PANEL
            </p>
            <p className="truncate text-xs text-[var(--muted)]">
              EasyTrip365 operations
            </p>
          </div>
        ) : null}
      </Link>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="space-y-2">
          {items.map((item) => {
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={[
                  "flex items-center rounded-2xl transition",
                  collapsed ? "justify-center px-2 py-3 text-xs font-semibold" : "px-4 py-3",
                  active
                    ? "bg-[var(--brand)] text-white shadow-[0_10px_24px_rgba(249,115,22,0.22)]"
                    : "text-[var(--foreground)] hover:bg-white",
                ].join(" ")}
              >
                {collapsed ? item.label.slice(0, 2).toUpperCase() : item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-4 border-t border-[var(--line)] pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className={[
            "rounded-2xl bg-[var(--hero-ink)] py-3 text-sm font-semibold text-white transition hover:opacity-95",
            collapsed ? "w-full px-2" : "w-full px-4",
          ].join(" ")}
        >
          {collapsed ? "↩" : "Logout"}
        </button>
      </div>
    </div>
  );
}