import { Wallet, ArrowUpRight, BadgeIndianRupee } from "lucide-react";
import { formatCurrency } from "@/lib/helpers/format";

type LivePriceSidebarProps = {
  selectedPackagePrice: number;
  serviceFee: number;
  travelStyle: string;
};

function getPlanningMultiplier(travelStyle: string) {
  const value = travelStyle.toLowerCase();

  if (value.includes("luxury")) return 1.28;
  if (value.includes("honeymoon")) return 1.18;
  if (value.includes("family")) return 1.12;
  if (value.includes("adventure")) return 1.1;
  if (value.includes("budget")) return 0.92;

  return 1;
}

export function LivePriceSidebar({
  selectedPackagePrice,
  serviceFee,
  travelStyle,
}: LivePriceSidebarProps) {
  const styleMultiplier = getPlanningMultiplier(travelStyle);
  const planningEstimate = Math.round(selectedPackagePrice * styleMultiplier);
  const estimatedTotal = planningEstimate + serviceFee;

  return (
    <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
      <div className="bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_100%)] p-5 text-white sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
              Planning Estimate
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">
              {formatCurrency(estimatedTotal)}
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/80">
              Early estimate based on your current trip style and saved base package.
            </p>
          </div>

          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
            <Wallet className="h-5 w-5" />
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Saved base package</span>
          <span className="font-semibold text-slate-900">
            {formatCurrency(selectedPackagePrice)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Style-led planning impact</span>
          <span className="font-semibold text-slate-900">
            {formatCurrency(planningEstimate - selectedPackagePrice)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Service fee</span>
          <span className="font-semibold text-slate-900">
            {formatCurrency(serviceFee)}
          </span>
        </div>

        <div className="rounded-[22px] bg-slate-50 p-4">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
              <BadgeIndianRupee className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Better-fit options will show next
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                In Results, we’ll prioritize stronger-fit packages, best-value picks,
                and worthwhile upgrades instead of dumping random options.
              </p>
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
          <ArrowUpRight className="h-3.5 w-3.5" />
          {travelStyle || "Balanced"} planning mode
        </div>
      </div>
    </div>
  );
}