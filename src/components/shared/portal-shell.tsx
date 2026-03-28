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
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f8fafc_35%,#ffffff_100%)]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside>{sidebar}</aside>

        <main className="space-y-8">
          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-8">
            <p className="text-sm font-medium text-sky-700">Clickable Prototype</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-3 max-w-3xl text-base leading-8 text-slate-600">
                {subtitle}
              </p>
            ) : null}
          </section>

          {children}
        </main>
      </div>
    </div>
  );
}