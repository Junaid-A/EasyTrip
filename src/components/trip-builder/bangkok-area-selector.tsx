"use client";

import { useMemo, useState } from "react";
import { bangkokAreas } from "@/lib/mock/bangkok-builder-data";
import { MapPin, Search } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function BangkokAreaSelector({ value, onChange }: Props) {
  const [query, setQuery] = useState("");

  const filteredAreas = useMemo(() => {
    const base = bangkokAreas.filter((area) =>
      area.name.toLowerCase().includes(query.toLowerCase())
    );

    if (query.trim()) return base;

    const popular = bangkokAreas.filter((area) => area.popular);
    const others = bangkokAreas.filter((area) => !area.popular);
    return [...popular, ...others];
  }, [query]);

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-sky-600" />
        <div>
          <p className="text-sm font-semibold text-slate-950">
            Where do you want to stay?
          </p>
          <p className="text-xs text-slate-500">
            Choose the city or stay area that should shape better hotel suggestions
          </p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search city or area"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-950 outline-none transition focus:border-sky-400 focus:bg-white"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filteredAreas.map((area) => {
          const active = value === area.name;

          return (
            <button
              key={area.id}
              type="button"
              onClick={() => onChange(area.name)}
              className={`rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-sky-500 bg-sky-50"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-950">{area.name}</span>
                {area.popular ? (
                  <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white">
                    Popular
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-600">{area.shortDescription}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}