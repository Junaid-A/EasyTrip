"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  Clock3,
  Loader2,
  MapPin,
  Receipt,
  Sparkles,
} from "lucide-react";

import { PortalShell } from "@/components/shared/portal-shell";
import { AgentSidebar } from "@/components/agent/agent-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";
import { useTripBuilderStore } from "@/store/useTripBuilderStore";
import { hotels } from "@/data/hotels";
import { transfers } from "@/data/transfers";
import { meals } from "@/data/meals";
import { sightseeing } from "@/data/sightseeing";

type StoreDay = {
  id?: string | number;
  day?: number;
  dayNumber?: number;
  title?: string;
  city?: string;
  location?: string;
  notes?: string;
  summary?: string;
  description?: string;
  dateLabel?: string;
  dayType?: string;
  hotelCategory?: string;
  selectedHotelId?: string;
  selectedTransferIds?: string[];
  selectedSightseeingIds?: string[];
  selectedMealIds?: string[];
  selectedExtraIds?: string[];
};

type PricingShape = {
  total?: number;
  grandTotal?: number;
  finalTotal?: number;
  hotelTotal?: number;
  transferTotal?: number;
  sightseeingTotal?: number;
  mealsTotal?: number;
  extrasTotal?: number;
  serviceFee?: number;
  markupTotal?: number;
  [key: string]: unknown;
};

type ResolvedDayItem = {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  notes?: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function safeNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function normalizeMealType(value: string) {
  const lower = value.toLowerCase();

  if (lower.includes("breakfast") || lower === "b/f" || lower === "bf") return "Breakfast";
  if (lower.includes("lunch")) return "Lunch";
  if (lower.includes("dinner")) return "Dinner";

  return "Meal";
}

function formatDayType(value?: string) {
  if (value === "arrival") return "Arrival Day";
  if (value === "departure") return "Departure Day";
  if (value === "transfer") return "Transfer Day";
  if (value === "explore") return "Explore Day";
  return "Trip Day";
}

function resolveDayItems(day: StoreDay): ResolvedDayItem[] {
  const resolved: ResolvedDayItem[] = [];

  const selectedHotel = hotels.find((item) => item.id === day.selectedHotelId);
  if (selectedHotel) {
    resolved.push({
      id: `hotel-${selectedHotel.id}`,
      type: "Hotel",
      title: selectedHotel.name,
      subtitle: [selectedHotel.area, selectedHotel.category].filter(Boolean).join(" · "),
      notes: `${formatCurrency(selectedHotel.nightlyRate)} / night`,
    });
  }

  (Array.isArray(day.selectedSightseeingIds) ? day.selectedSightseeingIds : []).forEach((id) => {
    const item = sightseeing.find((entry) => entry.id === id);
    if (!item) return;

    resolved.push({
      id: `sightseeing-${item.id}`,
      type: "Sightseeing",
      title: item.name,
      subtitle: [item.type, item.area].filter(Boolean).join(" · "),
      notes: formatCurrency(item.price),
    });
  });

  (Array.isArray(day.selectedMealIds) ? day.selectedMealIds : []).forEach((id) => {
    const item = meals.find((entry) => entry.id === id);
    if (!item) return;

    resolved.push({
      id: `meal-${item.id}`,
      type: normalizeMealType(item.mealType),
      title: item.name,
      subtitle: [item.preference, item.cuisine].filter(Boolean).join(" · "),
      notes: formatCurrency(item.price),
    });
  });

  (Array.isArray(day.selectedTransferIds) ? day.selectedTransferIds : []).forEach((id) => {
    const item = transfers.find((entry) => entry.id === id);
    if (!item) return;

    resolved.push({
      id: `transfer-${item.id}`,
      type: "Transfer",
      title: item.name,
      subtitle: [item.vehicleClass, item.purpose].filter(Boolean).join(" · "),
      notes: formatCurrency(item.price),
    });
  });

  return resolved;
}

export default function AgentQuoteReviewPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const customTripDays = useTripBuilderStore((state) => state.customTripDays) as StoreDay[] | undefined;
  const selectedPackagePrice = useTripBuilderStore((state) => state.selectedPackagePrice);

  const pricing = undefined as PricingShape | undefined;

  const hotelTotalFromRoot = useTripBuilderStore((state) => state.estimatedHotelTotal);
  const transferTotalFromRoot = useTripBuilderStore((state) => state.estimatedTransferTotal);
  const sightseeingTotalFromRoot = useTripBuilderStore((state) => state.estimatedSightseeingTotal);
  const mealsTotalFromRoot = useTripBuilderStore((state) => state.estimatedMealsTotal);
  const extrasTotalFromRoot = 0;
  const estimatedGrandTotal = useTripBuilderStore((state) => state.estimatedGrandTotal);
  const serviceFeeFromRoot = useTripBuilderStore((state) => state.serviceFee);

  const selectedPackageTitle = useTripBuilderStore((state) => state.selectedPackageTitle);
  const destination = useTripBuilderStore((state) => state.destination);
  const departureCity = useTripBuilderStore((state: any) => state.departureCity);
  const travelDates = useTripBuilderStore((state) => state.travelDates);
  const nights = useTripBuilderStore((state) => state.nights);
  const adults = useTripBuilderStore((state) => state.adults);
  const children = useTripBuilderStore((state) => state.children);
  const selectedFlightLabel = useTripBuilderStore((state) => state.selectedFlightLabel);

  const customerName = useTripBuilderStore((state: any) => state.customerName);
  const customerEmail = useTripBuilderStore((state: any) => state.customerEmail);
  const customerPhone = useTripBuilderStore((state: any) => state.customerPhone);
  const notes = useTripBuilderStore((state: any) => state.quoteNotes ?? state.notes);

  const days = useMemo(() => {
    if (!Array.isArray(customTripDays)) return [];

    return customTripDays.map((day, index) => {
      const selectedHotel = hotels.find((item) => item.id === day.selectedHotelId);
      const selectedTransfer = transfers.find((item) =>
        (Array.isArray(day.selectedTransferIds) ? day.selectedTransferIds : []).includes(item.id),
      );

      return {
        key: String(day.id ?? index + 1),
        raw: day,
        dayNumber: safeNumber(day.day ?? day.dayNumber ?? index + 1),
        title: day.title || day.dateLabel || `Day ${index + 1}`,
        city: day.city || day.location || "",
        hotelName: selectedHotel?.name || "",
        transferName: selectedTransfer?.name || "",
        notes: day.notes || day.summary || day.description || "",
        dayType: formatDayType(day.dayType),
        items: resolveDayItems(day),
      };
    });
  }, [customTripDays]);

  const resolvedHotelTotal = safeNumber(pricing?.hotelTotal ?? hotelTotalFromRoot);
  const resolvedTransferTotal = safeNumber(pricing?.transferTotal ?? transferTotalFromRoot);
  const resolvedSightseeingTotal = safeNumber(pricing?.sightseeingTotal ?? sightseeingTotalFromRoot);
  const resolvedMealsTotal = safeNumber(pricing?.mealsTotal ?? mealsTotalFromRoot);
  const resolvedExtrasTotal = safeNumber(pricing?.extrasTotal ?? extrasTotalFromRoot);
  const resolvedServiceFee = safeNumber(serviceFeeFromRoot);
  const resolvedMarkupTotal = 0;

  const resolvedGrandTotal = safeNumber(
    estimatedGrandTotal ||
      selectedPackagePrice +
        resolvedHotelTotal +
        resolvedTransferTotal +
        resolvedSightseeingTotal +
        resolvedMealsTotal +
        resolvedExtrasTotal +
        resolvedServiceFee,
  );

  const travellersLabel = `${safeNumber(adults)} Adult${safeNumber(adults) === 1 ? "" : "s"}${
    safeNumber(children) > 0 ? `, ${safeNumber(children)} Child${safeNumber(children) === 1 ? "" : "ren"}` : ""
  }`;

  async function handleCreateQuote() {
    setSubmitError("");

    if (!destination?.trim()) {
      setSubmitError("Destination is required before creating the quote.");
      return;
    }

    if (!Array.isArray(customTripDays) || customTripDays.length === 0) {
      setSubmitError("Itinerary is missing. Please complete the custom trip flow first.");
      return;
    }

    if (resolvedGrandTotal <= 0) {
      setSubmitError("Grand total is invalid. Please verify pricing before creating the quote.");
      return;
    }

    const payload = {
      destination,
      departureCity,
      travelDates,
      nights,
      adults: safeNumber(adults),
      children: safeNumber(children),
      selectedFlightLabel,
      customTripDays,
      pricing: {
        hotelTotal: resolvedHotelTotal,
        transferTotal: resolvedTransferTotal,
        sightseeingTotal: resolvedSightseeingTotal,
        mealsTotal: resolvedMealsTotal,
        extrasTotal: resolvedExtrasTotal,
        serviceFee: resolvedServiceFee,
        markupTotal: resolvedMarkupTotal,
        grandTotal: resolvedGrandTotal,
      },
      selectedPackagePrice: safeNumber(selectedPackagePrice),
      hotelTotal: resolvedHotelTotal,
      transferTotal: resolvedTransferTotal,
      sightseeingTotal: resolvedSightseeingTotal,
      mealsTotal: resolvedMealsTotal,
      extrasTotal: resolvedExtrasTotal,
      notes: notes || "",
      customerName: customerName || "",
      customerEmail: customerEmail || "",
      customerPhone: customerPhone || "",
    };

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/agent/quotes/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setSubmitError(result?.error || result?.details || "Failed to create quote.");
        return;
      }

      const createdQuoteRef = result?.quote_ref;

      if (createdQuoteRef) {
        router.push(`/agent/quotes?created=${createdQuoteRef}`);
        return;
      }

      router.push("/agent/quotes");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Something went wrong while creating the quote.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PortalShell
      title="Quote Review"
      subtitle="Final itinerary and pricing snapshot before quote creation."
      sidebar={<AgentSidebar />}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <InfoPanel
            title="Trip Snapshot"
            action={
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            }
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Quote Name
                </p>
                <p className="mt-2 text-base font-semibold text-slate-950">
                  {selectedPackageTitle || "Custom Trip Quote"}
                </p>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Destination
                </p>
                <p className="mt-2 flex items-center gap-2 text-base font-semibold text-slate-950">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  {destination || "—"}
                </p>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Travel Dates
                </p>
                <p className="mt-2 flex items-center gap-2 text-base font-semibold text-slate-950">
                  <CalendarDays className="h-4 w-4 text-slate-500" />
                  {travelDates || "—"}
                </p>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Duration
                </p>
                <p className="mt-2 flex items-center gap-2 text-base font-semibold text-slate-950">
                  <Clock3 className="h-4 w-4 text-slate-500" />
                  {nights || `${days.length} Nights`}
                </p>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Travellers
                </p>
                <p className="mt-2 text-base font-semibold text-slate-950">{travellersLabel}</p>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Flight / Origin
                </p>
                <p className="mt-2 text-base font-semibold text-slate-950">
                  {[selectedFlightLabel, departureCity].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
            </div>
          </InfoPanel>

          <InfoPanel title="Day-wise Itinerary">
            {days.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                <p className="text-base font-semibold text-slate-900">No itinerary data found.</p>
                <p className="mt-2 text-sm text-slate-600">
                  The route works, but `customTripDays` is empty in store.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {days.map((day) => (
                  <div
                    key={day.key}
                    className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
                  >
                    <div className="border-b border-slate-200 bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)] px-5 py-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
                            Day {day.dayNumber}
                          </div>
                          <h3 className="mt-3 text-lg font-semibold text-slate-950">{day.title}</h3>
                          {day.city ? <p className="mt-1 text-sm text-slate-600">{day.city}</p> : null}
                          <p className="mt-1 text-xs text-slate-500">{day.dayType}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {day.hotelName ? (
                            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                              Hotel: {day.hotelName}
                            </span>
                          ) : null}
                          {day.transferName ? (
                            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                              Transfer: {day.transferName}
                            </span>
                          ) : null}
                          {day.raw.hotelCategory ? (
                            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                              {day.raw.hotelCategory}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {day.notes ? (
                        <p className="mt-4 text-sm leading-6 text-slate-600">{day.notes}</p>
                      ) : null}
                    </div>

                    <div className="px-5 py-5">
                      {day.items.length === 0 ? (
                        <div className="rounded-[22px] bg-slate-50 px-4 py-4 text-sm text-slate-500">
                          No selections saved for this day yet.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {day.items.map((item) => (
                            <div
                              key={item.id}
                              className="rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-4"
                            >
                              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                <div>
                                  <div className="inline-flex rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                                    {item.type}
                                  </div>
                                  <p className="mt-2 text-sm font-semibold text-slate-950">
                                    {item.title}
                                  </p>
                                  {item.subtitle ? (
                                    <p className="mt-1 text-xs text-slate-500">{item.subtitle}</p>
                                  ) : null}
                                </div>

                                {item.notes ? (
                                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                                    {item.notes}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </InfoPanel>
        </div>

        <div className="xl:sticky xl:top-6 xl:self-start">
          <InfoPanel title="Pricing Summary">
            <div className="space-y-4">
              <div className="rounded-[26px] border border-orange-200 bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)] p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-orange-700">
                  <Receipt className="h-4 w-4" />
                  Final Quote Value
                </div>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  {formatCurrency(resolvedGrandTotal)}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  This value is being sent as the stored pricing snapshot.
                </p>
              </div>

              <div className="rounded-[26px] border border-slate-200 bg-white p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-slate-700">
                    <span>Hotels</span>
                    <span className="font-semibold text-slate-950">{formatCurrency(resolvedHotelTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-700">
                    <span>Transfers</span>
                    <span className="font-semibold text-slate-950">{formatCurrency(resolvedTransferTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-700">
                    <span>Sightseeing</span>
                    <span className="font-semibold text-slate-950">{formatCurrency(resolvedSightseeingTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-700">
                    <span>Meals</span>
                    <span className="font-semibold text-slate-950">{formatCurrency(resolvedMealsTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-700">
                    <span>Extras</span>
                    <span className="font-semibold text-slate-950">{formatCurrency(resolvedExtrasTotal)}</span>
                  </div>

                  {resolvedServiceFee > 0 ? (
                    <div className="flex items-center justify-between text-sm text-slate-700">
                      <span>Service Fee</span>
                      <span className="font-semibold text-slate-950">{formatCurrency(resolvedServiceFee)}</span>
                    </div>
                  ) : null}

                  {resolvedMarkupTotal > 0 ? (
                    <div className="flex items-center justify-between text-sm text-slate-700">
                      <span>Markup</span>
                      <span className="font-semibold text-slate-950">{formatCurrency(resolvedMarkupTotal)}</span>
                    </div>
                  ) : null}

                  <div className="my-1 border-t border-dashed border-slate-200" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">Grand Total</span>
                    <span className="text-lg font-semibold text-slate-950">{formatCurrency(resolvedGrandTotal)}</span>
                  </div>
                </div>
              </div>

              {submitError ? (
                <div className="rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {submitError}
                </div>
              ) : null}

              <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Create Quote</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      This will persist the itinerary snapshot and pricing snapshot exactly as shown here.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreateQuote}
                  disabled={isSubmitting}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Quote...
                    </>
                  ) : (
                    "Create Quote"
                  )}
                </button>
              </div>
            </div>
          </InfoPanel>
        </div>
      </div>
    </PortalShell>
  );
}