import { MapPin, Users, Sparkles, ClipboardList } from "lucide-react";
import { formatTravelerCount } from "@/lib/helpers/format";

type ItinerarySnapshotCardProps = {
  destination: string;
  adults: number;
  children: number;
  travelStyle: string;
  specialPreferences: string[];
};

export function ItinerarySnapshotCard({
  destination,
  adults,
  children,
  travelStyle,
  specialPreferences,
}: ItinerarySnapshotCardProps) {
  const topPreferences = specialPreferences.slice(0, 3);

  return (
    <div className="rounded-[30px] border border-white/80 bg-white/85 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
            Live Trip Snapshot
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">
            Current trip intent
          </h3>
        </div>

        <span className="rounded-full bg-slate-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          Live
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <div className="flex items-start gap-3 rounded-[22px] bg-slate-50 p-4">
          <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
            <MapPin className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Destination
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {destination || "Not selected yet"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-[22px] bg-slate-50 p-4">
          <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
            <Users className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Travelers
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {formatTravelerCount(adults, children)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-[22px] bg-slate-50 p-4">
          <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Style
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {travelStyle || "Balanced"}
            </p>
          </div>
        </div>

        <div className="rounded-[22px] bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
              <ClipboardList className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Preferences
              </p>
              {topPreferences.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {topPreferences.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-sky-200 bg-white px-3 py-1.5 text-xs font-medium text-sky-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-sm text-slate-600">
                  No preferences selected yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}