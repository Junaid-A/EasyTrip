"use client";

import { useMemo } from "react";
import { CalendarDays } from "lucide-react";

type Props = {
  checkIn: string;
  checkOut: string;
  onChange: (values: { checkIn?: string; checkOut?: string }) => void;
};

function getNights(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;

  const start = new Date(checkIn);
  const end = new Date(checkOut);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;

  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}

function formatDateLabel(value: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DateRangePicker({ checkIn, checkOut, onChange }: Props) {
  const nights = useMemo(() => getNights(checkIn, checkOut), [checkIn, checkOut]);
  const today = useMemo(() => getTodayDateString(), []);

  const summary = useMemo(() => {
    if (!checkIn || !checkOut || nights <= 0) {
      return "Select check-in and check-out";
    }

    return `${formatDateLabel(checkIn)} → ${formatDateLabel(checkOut)} · ${nights} Night${
      nights > 1 ? "s" : ""
    }`;
  }, [checkIn, checkOut, nights]);

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-sky-600" />
        <div>
          <p className="text-sm font-semibold text-slate-950">Travel dates</p>
          <p className="text-xs text-slate-500">Trip duration is calculated automatically</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Check-in</span>
          <input
            type="date"
            min={today}
            value={checkIn}
            onChange={(e) => onChange({ checkIn: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-400 focus:bg-white"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Check-out</span>
          <input
            type="date"
            value={checkOut}
            min={checkIn || today}
            onChange={(e) => onChange({ checkOut: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-400 focus:bg-white"
          />
        </label>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3">
        <p className="text-sm font-medium text-slate-800">{summary}</p>
        <p className="mt-1 text-xs text-slate-500">
          {nights > 0 ? `${nights} Nights · ${nights + 1} Days` : "Trip duration will appear here"}
        </p>
      </div>
    </div>
  );
}