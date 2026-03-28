import Link from "next/link";

const navItems = [
  { label: "Destinations", href: "/results" },
  { label: "Packages", href: "/results" },
  { label: "Build Trip", href: "/trip-builder" },
  { label: "Contact", href: "/" },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_100%)] text-sm font-bold text-white shadow-[0_12px_30px_rgba(37,99,235,0.22)]">
            ET
          </div>
          <div>
            <p className="text-sm font-semibold tracking-[0.08em] text-slate-900">
              EASYTRIP365
            </p>
            <p className="text-xs text-slate-500">Premium travel planning</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/results"
            className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
          >
            Explore
          </Link>
          <Link
            href="/trip-builder"
            className="inline-flex rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Start Planning
          </Link>
        </div>
      </div>
    </header>
  );
}