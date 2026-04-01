import { Sparkles, MapPin, CalendarDays, MoonStar, Users, Wand2 } from "lucide-react";

type TravelerFormProps = {
  destination: string;
  travelDates: string;
  nights: string;
  adults: number;
  children: number;
  travelStyle: string;
  specialPreferences: string[];
  aiPrompt: string;
  travelStyles: string[];
  specialPreferencesOptions: string[];
  onDestinationChange: (value: string) => void;
  onTravelDatesChange: (value: string) => void;
  onNightsChange: (value: string) => void;
  onAdultsChange: (value: number) => void;
  onChildrenChange: (value: number) => void;
  onTravelStyleChange: (value: string) => void;
  onTogglePreference: (value: string) => void;
  onAiPromptChange: (value: string) => void;
};

function FieldLabel({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
        {icon}
      </span>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
    </div>
  );
}

export function TravelerForm({
  destination,
  travelDates,
  nights,
  adults,
  children,
  travelStyle,
  specialPreferences,
  aiPrompt,
  travelStyles,
  specialPreferencesOptions,
  onDestinationChange,
  onTravelDatesChange,
  onNightsChange,
  onAdultsChange,
  onChildrenChange,
  onTravelStyleChange,
  onTogglePreference,
  onAiPromptChange,
}: TravelerFormProps) {
  return (
    <div className="rounded-[32px] border border-white/70 bg-white/80 p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)] backdrop-blur sm:p-6 lg:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
            <Sparkles className="h-3.5 w-3.5" />
            Guided Planner
          </span>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Tell us the trip you want. We’ll guide the rest.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-[15px]">
            Start with the essentials, choose a trip mood, and add a few notes.
            The next step will surface stronger-fit package options and better-value upgrades.
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Planning mode
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            Quick Builder with guided recommendations
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <FieldLabel icon={<MapPin className="h-4 w-4" />} label="Destination" />
          <input
            value={destination}
            onChange={(e) => onDestinationChange(e.target.value)}
            placeholder="Bangkok"
            className="w-full rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm text-slate-950 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
        </div>

        <div>
          <FieldLabel icon={<CalendarDays className="h-4 w-4" />} label="Travel dates" />
          <input
            value={travelDates}
            onChange={(e) => onTravelDatesChange(e.target.value)}
            placeholder="12 Apr 2026 - 17 Apr 2026"
            className="w-full rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm text-slate-950 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
        </div>

        <div>
          <FieldLabel icon={<MoonStar className="h-4 w-4" />} label="Nights" />
          <input
            value={nights}
            onChange={(e) => onNightsChange(e.target.value)}
            placeholder="5 Nights"
            className="w-full rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm text-slate-950 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
        </div>

        <div>
          <FieldLabel icon={<Users className="h-4 w-4" />} label="Adults" />
          <input
            type="number"
            min={1}
            value={adults}
            onChange={(e) => onAdultsChange(Number(e.target.value) || 0)}
            className="w-full rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm text-slate-950 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
        </div>

        <div>
          <FieldLabel icon={<Users className="h-4 w-4" />} label="Children" />
          <input
            type="number"
            min={0}
            value={children}
            onChange={(e) => onChildrenChange(Number(e.target.value) || 0)}
            className="w-full rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm text-slate-950 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
        </div>
      </div>

      <div className="mt-8">
        <FieldLabel icon={<Sparkles className="h-4 w-4" />} label="Trip style" />
        <div className="flex flex-wrap gap-3">
          {travelStyles.map((item) => {
            const isActive = item === travelStyle;

            return (
              <button
                key={item}
                type="button"
                onClick={() => onTravelStyleChange(item)}
                className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-slate-950 text-white shadow-[0_12px_24px_rgba(15,23,42,0.18)]"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <FieldLabel icon={<Wand2 className="h-4 w-4" />} label="Special preferences" />
        <div className="flex flex-wrap gap-3">
          {specialPreferencesOptions.map((item) => {
            const isActive = specialPreferences.includes(item);

            return (
              <button
                key={item}
                type="button"
                onClick={() => onTogglePreference(item)}
                className={`rounded-full px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "border border-sky-200 bg-sky-50 text-sky-700 shadow-[0_10px_20px_rgba(14,165,233,0.08)]"
                    : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <FieldLabel icon={<Sparkles className="h-4 w-4" />} label="Trip notes / AI prompt" />
        <textarea
          value={aiPrompt}
          onChange={(e) => onAiPromptChange(e.target.value)}
          rows={5}
          placeholder="Tell us the kind of trip you want..."
          className="w-full rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm leading-7 text-slate-950 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
        />
      </div>
    </div>
  );
}