"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/shared/portal-shell";
import { AgentSidebar } from "@/components/agent/agent-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";
import { useTripBuilderStore } from "@/store/useTripBuilderStore";
import { createAgentQuoteInDb } from "@/lib/quotes/quote-client";

type QuoteStatus = "draft" | "saved" | "discarded";

type MarkupConfig = {
  globalFlat: number;
  globalPercent: number;
  hotelFlat: number;
  hotelPercent: number;
  sightseeingFlat: number;
  sightseeingPercent: number;
  mealsFlat: number;
  mealsPercent: number;
  transfersFlat: number;
  transfersPercent: number;
};

function num(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(value)));
}

export default function AgentQuoteReviewPage() {
  const router = useRouter();

  const destination = useTripBuilderStore((state) => state.destination);
  const travelDates = useTripBuilderStore((state) => state.travelDates);
  const nights = useTripBuilderStore((state) => state.nights);
  const adults = useTripBuilderStore((state) => state.adults);
  const children = useTripBuilderStore((state) => state.children);
  const rooms = useTripBuilderStore((state) => state.rooms);
  const selectedPackageTitle = useTripBuilderStore((state) => state.selectedPackageTitle);
  const selectedFlightLabel = useTripBuilderStore((state) => state.selectedFlightLabel);
  const selectedExtras = useTripBuilderStore((state) => state.selectedExtras);
  const selectedAddOns = useTripBuilderStore((state) => state.selectedAddOns);
  const dayPlans = useTripBuilderStore((state) => state.dayPlans);
  const customTripDays = useTripBuilderStore((state) => state.customTripDays);
  const selectedMode = useTripBuilderStore((state) => state.selectedMode);

  const estimatedFlightTotal = useTripBuilderStore((state) => state.estimatedFlightTotal);
  const estimatedHotelTotal = useTripBuilderStore((state) => state.estimatedHotelTotal);
  const estimatedTransferTotal = useTripBuilderStore((state) => state.estimatedTransferTotal);
  const estimatedSightseeingTotal = useTripBuilderStore((state) => state.estimatedSightseeingTotal);
  const estimatedMealsTotal = useTripBuilderStore((state) => state.estimatedMealsTotal);
  const serviceFee = useTripBuilderStore((state) => state.serviceFee);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [validTill, setValidTill] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  const [markup, setMarkup] = useState<MarkupConfig>({
    globalFlat: 0,
    globalPercent: 0,
    hotelFlat: 0,
    hotelPercent: 0,
    sightseeingFlat: 0,
    sightseeingPercent: 0,
    mealsFlat: 0,
    mealsPercent: 0,
    transfersFlat: 0,
    transfersPercent: 0,
  });

  const base = useMemo(() => {
    const hotel = estimatedHotelTotal;
    const sightseeing = estimatedSightseeingTotal;
    const meals = estimatedMealsTotal;
    const transfers = estimatedTransferTotal;
    const flights = estimatedFlightTotal;
    const extras = 0;
    const total = hotel + sightseeing + meals + transfers + flights + extras + serviceFee;

    return {
      hotel,
      sightseeing,
      meals,
      transfers,
      flights,
      extras,
      serviceFee,
      total,
    };
  }, [
    estimatedHotelTotal,
    estimatedSightseeingTotal,
    estimatedMealsTotal,
    estimatedTransferTotal,
    estimatedFlightTotal,
    serviceFee,
  ]);

  const markupBreakdown = useMemo(() => {
    const hotel =
      markup.hotelFlat + (base.hotel * markup.hotelPercent) / 100;

    const sightseeing =
      markup.sightseeingFlat + (base.sightseeing * markup.sightseeingPercent) / 100;

    const meals =
      markup.mealsFlat + (base.meals * markup.mealsPercent) / 100;

    const transfers =
      markup.transfersFlat + (base.transfers * markup.transfersPercent) / 100;

    const categorySubtotal = hotel + sightseeing + meals + transfers;
    const postCategoryBase = base.total + categorySubtotal;

    const global =
      markup.globalFlat + (postCategoryBase * markup.globalPercent) / 100;

    const total = categorySubtotal + global;

    return {
      hotel,
      sightseeing,
      meals,
      transfers,
      global,
      total,
    };
  }, [base, markup]);

  const sellTotal = base.total + markupBreakdown.total;

  const builderPayload = useMemo(() => {
    return {
      selectedMode,
      destination,
      travelDates,
      nights,
      adults,
      children,
      rooms,
      selectedPackageTitle,
      selectedFlightLabel,
      selectedExtras,
      selectedAddOns,
      dayPlans,
      customTripDays,
      totals: {
        estimatedFlightTotal,
        estimatedHotelTotal,
        estimatedTransferTotal,
        estimatedSightseeingTotal,
        estimatedMealsTotal,
        serviceFee,
      },
    };
  }, [
    selectedMode,
    destination,
    travelDates,
    nights,
    adults,
    children,
    rooms,
    selectedPackageTitle,
    selectedFlightLabel,
    selectedExtras,
    selectedAddOns,
    dayPlans,
    customTripDays,
    estimatedFlightTotal,
    estimatedHotelTotal,
    estimatedTransferTotal,
    estimatedSightseeingTotal,
    estimatedMealsTotal,
    serviceFee,
  ]);

  async function saveQuote(status: QuoteStatus) {
    await createAgentQuoteInDb({
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      destination: destination || "Bangkok",
      valid_till: validTill || null,
      status,
      currency: "INR",
      base_total: base.total,
      sell_total: sellTotal,
      markup_total: markupBreakdown.total,
      pricing_snapshot: {
        base,
        markup: markupBreakdown,
        sell: {
          total: sellTotal,
        },
      },
      builder_payload: builderPayload,
      markup_config: markup,
      internal_note: internalNote,
      customer_note: customerNote,
      amount: sellTotal,
    });

    router.push("/agent/quotes");
  }

  return (
    <PortalShell
      title="Review Quote"
      subtitle="Apply markup, review totals, and save the quote."
      sidebar={<AgentSidebar />}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <InfoPanel title="Customer Details">
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer name"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              />
              <input
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Customer email"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              />
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Customer phone"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              />
              <input
                type="date"
                value={validTill}
                onChange={(e) => setValidTill(e.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              />
            </div>
          </InfoPanel>

          <InfoPanel title="Trip Snapshot">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">Package</p>
                <p className="mt-1 font-semibold text-slate-950">
                  {selectedPackageTitle || "Custom Trip"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">Destination</p>
                <p className="mt-1 font-semibold text-slate-950">{destination || "Bangkok"}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">Dates</p>
                <p className="mt-1 font-semibold text-slate-950">{travelDates || "—"}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">Travellers</p>
                <p className="mt-1 font-semibold text-slate-950">
                  {adults} Adults{children ? `, ${children} Children` : ""} • {rooms} Rooms
                </p>
              </div>
            </div>
          </InfoPanel>

          <InfoPanel title="Markup Controls">
            <div className="grid gap-4 md:grid-cols-2">
              <MarkupInput label="Hotel Flat" value={markup.hotelFlat} onChange={(v) => setMarkup((s) => ({ ...s, hotelFlat: v }))} />
              <MarkupInput label="Hotel %" value={markup.hotelPercent} onChange={(v) => setMarkup((s) => ({ ...s, hotelPercent: v }))} />
              <MarkupInput label="Sightseeing Flat" value={markup.sightseeingFlat} onChange={(v) => setMarkup((s) => ({ ...s, sightseeingFlat: v }))} />
              <MarkupInput label="Sightseeing %" value={markup.sightseeingPercent} onChange={(v) => setMarkup((s) => ({ ...s, sightseeingPercent: v }))} />
              <MarkupInput label="Meals Flat" value={markup.mealsFlat} onChange={(v) => setMarkup((s) => ({ ...s, mealsFlat: v }))} />
              <MarkupInput label="Meals %" value={markup.mealsPercent} onChange={(v) => setMarkup((s) => ({ ...s, mealsPercent: v }))} />
              <MarkupInput label="Transfers Flat" value={markup.transfersFlat} onChange={(v) => setMarkup((s) => ({ ...s, transfersFlat: v }))} />
              <MarkupInput label="Transfers %" value={markup.transfersPercent} onChange={(v) => setMarkup((s) => ({ ...s, transfersPercent: v }))} />
              <MarkupInput label="Global Flat" value={markup.globalFlat} onChange={(v) => setMarkup((s) => ({ ...s, globalFlat: v }))} />
              <MarkupInput label="Global %" value={markup.globalPercent} onChange={(v) => setMarkup((s) => ({ ...s, globalPercent: v }))} />
            </div>
          </InfoPanel>

          <InfoPanel title="Notes">
            <div className="grid gap-4">
              <textarea
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Internal note"
                rows={4}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              />
              <textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Customer note"
                rows={4}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              />
            </div>
          </InfoPanel>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => saveQuote("draft")}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800"
            >
              Save Draft
            </button>

            <button
              type="button"
              onClick={() => saveQuote("saved")}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Save Quote
            </button>

            <button
              type="button"
              onClick={() => saveQuote("discarded")}
              className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700"
            >
              Discard
            </button>
          </div>
        </div>

        <div className="xl:sticky xl:top-6 xl:self-start">
          <InfoPanel title="Quote Summary">
            <div className="space-y-3 text-sm">
              <SummaryRow label="Hotel Base" value={formatINR(base.hotel)} />
              <SummaryRow label="Sightseeing Base" value={formatINR(base.sightseeing)} />
              <SummaryRow label="Meals Base" value={formatINR(base.meals)} />
              <SummaryRow label="Transfers Base" value={formatINR(base.transfers)} />
              <SummaryRow label="Flights Base" value={formatINR(base.flights)} />
              <SummaryRow label="Service Fee" value={formatINR(base.serviceFee)} />
              <SummaryRow label="Base Total" value={formatINR(base.total)} strong />

              <div className="border-t border-slate-200 pt-3" />

              <SummaryRow label="Hotel Markup" value={formatINR(markupBreakdown.hotel)} />
              <SummaryRow label="Sightseeing Markup" value={formatINR(markupBreakdown.sightseeing)} />
              <SummaryRow label="Meals Markup" value={formatINR(markupBreakdown.meals)} />
              <SummaryRow label="Transfers Markup" value={formatINR(markupBreakdown.transfers)} />
              <SummaryRow label="Global Markup" value={formatINR(markupBreakdown.global)} />
              <SummaryRow label="Markup Total" value={formatINR(markupBreakdown.total)} strong />

              <div className="border-t border-slate-200 pt-3" />

              <SummaryRow label="Final Sell Total" value={formatINR(sellTotal)} strong />
            </div>
          </InfoPanel>
        </div>
      </div>
    </PortalShell>
  );
}

function MarkupInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-600">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(num(e.target.value))}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
      />
    </label>
  );
}

function SummaryRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className={strong ? "font-semibold text-slate-800" : "text-slate-500"}>
        {label}
      </span>
      <span className={strong ? "font-semibold text-slate-950" : "font-medium text-slate-950"}>
        {value}
      </span>
    </div>
  );
}