"use client";

type Props = {
  modeLabel: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  area: string;
  adults: number;
  children: number;
  rooms: number;
  budget: string;
  tripStyle: string;
  selectedPackageTitle?: string;
  estimatedPrice?: number;
  onContinue?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
};

export function BookingSummarySticky({
  modeLabel,
  checkIn,
  checkOut,
  nights,
  area,
  adults,
  children,
  rooms,
  budget,
  tripStyle,
  selectedPackageTitle,
  estimatedPrice,
  onContinue,
  continueLabel = "Continue booking",
  continueDisabled = false,
}: Props) {
  const travellerLabel = `${adults} Adult${adults > 1 ? "s" : ""}${
    children ? `, ${children} Child${children > 1 ? "ren" : ""}` : ""
  }`;

  return (
    <aside className="sticky top-24 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-950">Trip summary</p>
      <p className="mt-1 text-xs text-slate-500">{modeLabel}</p>

      <div className="mt-5 space-y-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Destination</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">Bangkok, Thailand</p>
        </div>

        <div className="grid gap-3">
          <Row
            label="Dates"
            value={checkIn && checkOut ? `${checkIn} → ${checkOut}` : "Not selected"}
          />
          <Row
            label="Nights"
            value={nights > 0 ? `${nights} night${nights > 1 ? "s" : ""}` : "Not selected"}
          />
          <Row label="Area / route" value={area || "Bangkok"} />
          <Row label="Travellers" value={travellerLabel} />
          <Row label="Rooms" value={`${rooms}`} />
          <Row label="Budget" value={budget || "Not selected"} />
          <Row label="Trip style" value={tripStyle || "Not selected"} />
          {selectedPackageTitle ? <Row label="Package" value={selectedPackageTitle} /> : null}
        </div>

        <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-sky-600">
            Current estimated total
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {estimatedPrice ? `₹${estimatedPrice.toLocaleString("en-IN")}` : "—"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Estimate updates from package, hotel comfort, transfers, sightseeing, extras, and service fee.
          </p>
        </div>

        <button
          type="button"
          onClick={onContinue}
          disabled={continueDisabled}
          className={`w-full rounded-2xl px-5 py-3 text-sm font-semibold text-white transition ${
            continueDisabled
              ? "cursor-not-allowed bg-slate-300"
              : "bg-slate-950 hover:bg-slate-800"
          }`}
        >
          {continueLabel}
        </button>
      </div>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 px-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}