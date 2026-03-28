import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_100%)] text-sm font-bold text-white">
              ET
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.08em] text-slate-900">
                EASYTRIP365
              </p>
              <p className="text-xs text-slate-500">Premium travel planning</p>
            </div>
          </div>

          <p className="mt-5 max-w-sm text-sm leading-7 text-slate-600">
            A cleaner, more premium way to discover, compare, customize, and
            present destination packages.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">Explore</p>
          <div className="mt-4 space-y-3">
            <Link href="/results" className="block text-sm text-slate-600 hover:text-slate-950">
              Bangkok Packages
            </Link>
            <Link href="/results" className="block text-sm text-slate-600 hover:text-slate-950">
              Luxury Trips
            </Link>
            <Link href="/trip-builder" className="block text-sm text-slate-600 hover:text-slate-950">
              Build My Trip
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">Company</p>
          <div className="mt-4 space-y-3">
            <Link href="/" className="block text-sm text-slate-600 hover:text-slate-950">
              About
            </Link>
            <Link href="/" className="block text-sm text-slate-600 hover:text-slate-950">
              Support
            </Link>
            <Link href="/" className="block text-sm text-slate-600 hover:text-slate-950">
              Contact
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">Flow</p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>Trip Builder</p>
            <p>Results</p>
            <p>Customize</p>
            <p>Review</p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© 2026 EasyTrip365. All rights reserved.</p>
          <p>Built as a premium travel prototype.</p>
        </div>
      </div>
    </footer>
  );
}