import { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string;
  note?: string;
  hint?: string;
  icon?: LucideIcon;
};

export function StatCard({ label, value, note, hint, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-[2rem] font-semibold tracking-[-0.04em] text-slate-950">
            {value}
          </p>

          {(note || hint) ? (
            <p className="mt-2 text-sm text-slate-500">{note || hint}</p>
          ) : null}
        </div>

        {Icon ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-600">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </div>
  );
}