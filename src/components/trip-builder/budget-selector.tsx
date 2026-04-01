"use client";

import { budgetTiers } from "@/lib/mock/bangkok-builder-data";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function BudgetSelector({ value, onChange }: Props) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-semibold text-slate-950">What is your budget comfort level?</p>
        <p className="text-xs text-slate-500">This helps us show the right hotels and package range</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {budgetTiers.map((tier) => {
          const active = value === tier;

          return (
            <button
              key={tier}
              type="button"
              onClick={() => onChange(tier)}
              className={`rounded-2xl border px-4 py-4 text-left transition ${
                active
                  ? "border-sky-500 bg-sky-50"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <p className="text-sm font-semibold text-slate-950">{tier}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}