import { ReactNode } from "react";

type PortalShellProps = {
  title: string;
  subtitle?: string;
  sidebar: ReactNode;
  children: ReactNode;
};

export function PortalShell({
  title,
  subtitle,
  sidebar,
  children,
}: PortalShellProps) {
  return (
    <div className="h-screen overflow-hidden bg-[linear-gradient(180deg,#f7f3ee_0%,#f8fafc_52%,#ffffff_100%)] text-[#171717]">
      <div className="mx-auto h-full max-w-[1680px] px-3 py-3 sm:px-5 sm:py-5">
        <div className="grid h-full gap-5 xl:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="hidden h-full xl:block">{sidebar}</aside>

          <main className="min-w-0 overflow-hidden rounded-[34px] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,253,249,0.96)_0%,rgba(255,255,255,0.92)_100%)] shadow-[0_20px_70px_rgba(23,23,23,0.06)]">
            <div className="flex h-full min-w-0 flex-col">
              <section className="border-b border-[var(--line)] px-5 py-5 sm:px-7 sm:py-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(249,115,22,0.18)] bg-[rgba(249,115,22,0.08)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-dark)]">
                      EasyTrip365 Operations
                    </div>

                    <h1 className="mt-3 text-[28px] font-semibold leading-tight tracking-[-0.03em] text-[var(--hero-ink)] sm:text-[34px]">
                      {title}
                    </h1>

                    {subtitle ? (
                      <p className="mt-2 max-w-4xl text-sm leading-7 text-[var(--muted)] sm:text-[15px]">
                        {subtitle}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:w-auto">
                    <div className="rounded-[22px] border border-[rgba(23,23,23,0.06)] bg-white/85 px-4 py-3 shadow-[0_10px_24px_rgba(23,23,23,0.04)]">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                        Surface
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[var(--hero-ink)]">
                        Live dashboard
                      </p>
                    </div>

                    <div className="rounded-[22px] border border-[rgba(23,23,23,0.06)] bg-white/85 px-4 py-3 shadow-[0_10px_24px_rgba(23,23,23,0.04)]">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                        Mode
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[var(--hero-ink)]">
                        Admin cockpit
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}