"use client";

import { tripStyles } from "@/lib/mock/bangkok-builder-data";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function TripStyleChips({ value, onChange }: Props) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-semibold text-slate-950">What kind of trip do you want?</p>
        <p className="text-xs text-slate-500">Pick the vibe that fits your trip best</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tripStyles.map((item) => {
          const active = value === item;

          return (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                active
                  ? "bg-sky-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}