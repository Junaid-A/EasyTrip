import { ReactNode } from "react";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  className = "",
}: PageHeroProps) {
  return (
    <section
      className={`rounded-[32px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 px-6 py-12 text-white shadow-lg sm:px-10 sm:py-16 ${className}`}
    >
      <div className="max-w-3xl space-y-5">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
            {eyebrow}
          </p>
        ) : null}

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {title}
        </h1>

        <p className="max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
          {description}
        </p>

        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}