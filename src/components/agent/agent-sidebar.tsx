import Link from "next/link";

const links = [
  { href: "/agent/onboarding", label: "Onboarding" },
  { href: "/agent/dashboard", label: "Dashboard" },
  { href: "/agent/create-package", label: "Create Package" },
  { href: "/agent/pricing", label: "Pricing" },
  { href: "/agent/pdf-preview", label: "PDF Preview" },
  { href: "/agent/profile", label: "Profile" },
];

export function AgentSidebar() {
  return (
    <aside className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Agent Panel</h2>
        <p className="text-sm text-slate-500">Quick navigation</p>
      </div>

      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}