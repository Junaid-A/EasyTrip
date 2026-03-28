import Link from "next/link";

const items = [
  { label: "Dashboard", href: "/admin/dashboard" },
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

export function AdminSidebar() {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
      <Link href="/" className="flex items-center gap-3 border-b border-slate-200 pb-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#020617_0%,#1d4ed8_100%)] text-sm font-bold text-white">
          AD
        </div>
        <div>
          <p className="text-sm font-semibold tracking-[0.08em] text-slate-900">
            ADMIN PANEL
          </p>
          <p className="text-xs text-slate-500">Operations prototype</p>
        </div>
      </Link>

      <div className="mt-5 space-y-2">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}