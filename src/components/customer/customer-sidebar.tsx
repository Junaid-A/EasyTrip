import Link from "next/link";

const items = [
  { label: "Dashboard", href: "/customer/dashboard" },
  { label: "Bookings", href: "/customer/bookings" },
  { label: "Trips", href: "/customer/trips" },
  { label: "Profile", href: "/customer/profile" },
  { label: "Support", href: "/customer/support" },
];

export function CustomerSidebar() {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
      <Link href="/" className="flex items-center gap-3 border-b border-slate-200 pb-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_100%)] text-sm font-bold text-white">
          ET
        </div>
        <div>
          <p className="text-sm font-semibold tracking-[0.08em] text-slate-900">
            EASYTRIP365
          </p>
          <p className="text-xs text-slate-500">Customer Panel</p>
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