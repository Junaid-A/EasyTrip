import { ReactNode } from "react";

type InfoCardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function InfoCard({
  title,
  description,
  children,
  className = "",
}: InfoCardProps) {
  return (
    <div
      className={`rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}
    >
      {(title || description) && (
        <div className="mb-4 space-y-1">
          {title ? <h3 className="text-lg font-semibold text-slate-900">{title}</h3> : null}
          {description ? (
            <p className="text-sm leading-6 text-slate-600">{description}</p>
          ) : null}
        </div>
      )}

      {children}
    </div>
  );
}