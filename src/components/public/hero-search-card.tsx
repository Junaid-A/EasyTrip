import Link from "next/link";

type HeroSearchCardProps = {
  compact?: boolean;
  mobile?: boolean;
};

const bookingModes = ["Standard Packages", "AI Planner", "Fully Custom"];
const searchFields = [
  { label: "Destination", value: "Bangkok, Phuket, Dubai..." },
  { label: "Travel Dates", value: "Anytime" },
  { label: "Budget", value: "Optional" },
];

export function HeroSearchCard({
  compact = false,
  mobile = false,
}: HeroSearchCardProps) {
  if (mobile) {
    return (
      <div className="rounded-[30px] border border-black/10 bg-white/90 p-3 shadow-[0_18px_50px_rgba(15,23,42,0.10)] backdrop-blur-xl">
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {bookingModes.map((mode, index) => (
            <button
              key={mode}
              type="button"
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                index === 0
                  ? "bg-slate-950 text-white"
                  : "border border-slate-300 bg-white text-slate-700"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <Link
          href="/trip-builder"
          className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-[#fbfaf7] px-4 py-4"
        >
          <div className="min-w-0">
            <p className="text-base font-semibold text-slate-950">
              Search destination
            </p>
            <p className="mt-1 truncate text-sm text-slate-500">
              Anytime • Budget optional
            </p>
          </div>
          <span className="ml-4 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-300 text-lg text-slate-700">
            →
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-[34px] border border-white/10 bg-[#314746]/94 p-3 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] backdrop-blur-xl">
      <div className="mb-3 flex flex-wrap gap-2">
        {bookingModes.map((mode, index) => (
          <button
            key={mode}
            type="button"
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              index === 0
                ? "bg-white text-slate-950"
                : "border border-white/14 bg-white/[0.04] text-white/80 hover:bg-white/[0.08]"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      <div
        className={`grid gap-2 ${
          compact
            ? "lg:grid-cols-[1.3fr_1fr_1fr_auto]"
            : "lg:grid-cols-[1.35fr_1fr_1fr_auto]"
        }`}
      >
        {searchFields.map((field, index) => (
          <div
            key={field.label}
            className={`rounded-[24px] bg-white/[0.04] px-5 py-4 ${
              index > 0 ? "lg:border-l lg:border-white/10" : ""
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
              {field.label}
            </p>
            <p className="mt-2 text-sm font-medium text-white">{field.value}</p>
          </div>
        ))}

        <Link
          href="/trip-builder"
          className="inline-flex min-h-[60px] items-center justify-center rounded-full bg-yellow-400 px-7 text-sm font-bold text-slate-950 transition hover:bg-yellow-300"
        >
          Start Search
        </Link>
      </div>
    </div>
  );
}
