import Link from "next/link";

const fields = [
  { label: "Destination", value: "Bangkok" },
  { label: "Travel Dates", value: "12 Apr - 17 Apr" },
  { label: "Budget", value: "Premium" },
  { label: "Style", value: "Luxury" },
];

export function HeroSearchCard() {
  return (
    <div className="rounded-[32px] border border-white/70 bg-white/90 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:p-5">
      <div className="grid gap-3 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
        {fields.map((field) => (
          <div
            key={field.label}
            className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {field.label}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {field.value}
            </p>
          </div>
        ))}

        <Link
          href="/trip-builder"
          className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Build My Trip
        </Link>
      </div>
    </div>
  );
}