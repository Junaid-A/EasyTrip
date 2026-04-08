"use client";

import { ReactElement, ReactNode, cloneElement, isValidElement, useState } from "react";

type PortalShellProps = {
  title?: string;
  subtitle?: string;
  sidebar: ReactNode;
  children: ReactNode;
  compactHeader?: boolean;
};

export function PortalShell({
  title,
  subtitle,
  sidebar,
  children,
  compactHeader = false,
}: PortalShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  const resolvedSidebar = isValidElement(sidebar)
    ? cloneElement(sidebar as ReactElement<{ collapsed?: boolean }>, { collapsed })
    : sidebar;

  return (
    <div className="h-screen overflow-hidden bg-[linear-gradient(180deg,#f7f3ee_0%,#f8fafc_52%,#ffffff_100%)] text-[#171717]">
      <div className="mx-auto h-full max-w-[1680px] px-3 py-3 sm:px-5 sm:py-5">
        <div
          className={[
            "grid h-full gap-5 transition-all duration-300",
            collapsed ? "xl:grid-cols-[96px_minmax(0,1fr)]" : "xl:grid-cols-[290px_minmax(0,1fr)]",
          ].join(" ")}
        >
          <aside className="hidden h-full min-h-0 xl:block">
            <div className="flex h-full min-h-0 flex-col gap-3">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setCollapsed((prev) => !prev)}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--hero-ink)]"
                >
                  {collapsed ? "→" : "←"}
                </button>
              </div>

              <div className="min-h-0 flex-1">
                <div className="h-full">{resolvedSidebar}</div>
              </div>
            </div>
          </aside>

          <main className="min-w-0 overflow-hidden rounded-[34px] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,253,249,0.96)_0%,rgba(255,255,255,0.92)_100%)] shadow-[0_20px_70px_rgba(23,23,23,0.06)]">
            <div className="flex h-full min-w-0 flex-col">
              {!compactHeader ? (
                <section className="border-b border-[var(--line)] px-5 py-5 sm:px-7 sm:py-6">
                  <div className="min-w-0">
                    {title ? (
                      <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.03em] text-[var(--hero-ink)] sm:text-[34px]">
                        {title}
                      </h1>
                    ) : null}

                    {subtitle ? (
                      <p className="mt-2 max-w-4xl text-sm leading-7 text-[var(--muted)] sm:text-[15px]">
                        {subtitle}
                      </p>
                    ) : null}
                  </div>
                </section>
              ) : null}

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}