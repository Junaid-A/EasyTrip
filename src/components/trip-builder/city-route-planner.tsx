"use client";

import { useMemo } from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { thailandCities } from "@/lib/mock/bangkok-builder-data";

export type TripSegment = {
  id: string;
  city: string;
  destinationId?: string;
  checkIn: string;
  checkOut: string;
};

type Props = {
  segments: TripSegment[];
  onAddSegment: () => void;
  onRemoveSegment: (id: string) => void;
  onUpdateSegment: (
    id: string,
    values: Partial<{
      city: string;
      destinationId?: string;
      checkIn: string;
      checkOut: string;
    }>
  ) => void;
};

function getNights(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;

  const start = new Date(checkIn);
  const end = new Date(checkOut);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;

  const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

export function CityRoutePlanner({
  segments,
  onAddSegment,
  onRemoveSegment,
  onUpdateSegment,
}: Props) {
  const totalNights = useMemo(
    () => segments.reduce((sum, item) => sum + getNights(item.checkIn, item.checkOut), 0),
    [segments]
  );

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-sky-600" />
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              Route planner
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Add one or multiple city stays. Each stop can have its own dates and nights.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddSegment}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Add city stay
        </button>
      </div>

      <div className="mt-6 grid gap-4">
        {segments.map((segment, index) => {
          const nights = getNights(segment.checkIn, segment.checkOut);

          return (
            <div
              key={segment.id}
              className="rounded-[24px] border border-slate-200 bg-slate-50 p-4"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    Stay {index + 1}
                  </p>
                  <p className="text-xs text-slate-500">
                    {nights > 0 ? `${nights} nights selected` : "Select city and dates"}
                  </p>
                </div>

                {segments.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => onRemoveSegment(segment.id)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr_0.9fr_0.5fr]">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">City</span>
                  <select
                    value={segment.city}
                    onChange={(e) => {
                      const selectedCity = thailandCities.find(
                        (city) => city.name === e.target.value
                      );

                      onUpdateSegment(segment.id, {
                        city: e.target.value,
                        destinationId: selectedCity?.destinationId ?? "",
                      });
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-400"
                  >
                    <option value="">Select city</option>
                    {thailandCities.map((city) => (
                      <option key={city.id} value={city.name}>
                        {city.name} — {city.region}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Check-in</span>
                  <input
                    type="date"
                    value={segment.checkIn}
                    onChange={(e) => onUpdateSegment(segment.id, { checkIn: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-400"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Check-out</span>
                  <input
                    type="date"
                    min={segment.checkIn || undefined}
                    value={segment.checkOut}
                    onChange={(e) => onUpdateSegment(segment.id, { checkOut: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-400"
                  />
                </label>

                <div className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Nights</span>
                  <div className="flex h-[50px] items-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-950">
                    {nights || 0}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl bg-sky-50 px-4 py-3">
        <p className="text-sm font-medium text-slate-900">
          Total planned trip duration: {totalNights} night{totalNights !== 1 ? "s" : ""}
        </p>
      </div>
    </section>
  );
}