import { ShieldCheck, Sparkles, BadgeCheck } from "lucide-react";

export function TrustNoticeCard() {
  const points = [
    "Clear package comparisons before you commit.",
    "Guided upgrades based on fit, not blind pushing.",
    "A smoother path from trip intent to booking-ready options.",
  ];

  return (
    <div className="rounded-[30px] border border-slate-200 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_100%)] p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:p-6">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-orange-600 shadow-sm">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-600">
            Why this feels better
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">
            Guided planning, not confusing form filling
          </h3>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {points.map((point) => (
          <div
            key={point}
            className="flex items-start gap-3 rounded-[20px] border border-orange-100 bg-white/80 p-4"
          >
            <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <BadgeCheck className="h-4 w-4" />
            </span>
            <p className="text-sm leading-6 text-slate-700">{point}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[22px] bg-slate-950 p-4 text-white">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">Commercially smart, customer-safe</p>
            <p className="mt-1 text-sm leading-6 text-white/75">
              EasyTrip should surface stronger options, but always with fit-first guidance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}