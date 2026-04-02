"use client";

import Link from "next/link";
import { useMemo } from "react";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { useTripBuilderStore } from "@/store/useTripBuilderStore";

function formatINR(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function ReviewPage() {
  const selectedMode = useTripBuilderStore((state) => state.selectedMode);
  const destination = useTripBuilderStore((state) => state.destination);
  const travelDates = useTripBuilderStore((state) => state.travelDates);
  const nights = useTripBuilderStore((state) => state.nights);
  const adults = useTripBuilderStore((state) => state.adults);
  const children = useTripBuilderStore((state) => state.children);
  const rooms = useTripBuilderStore((state) => state.rooms);
  const budget = useTripBuilderStore((state) => state.budget);
  const mood = useTripBuilderStore((state) => state.mood);
  const travelStyle = useTripBuilderStore((state) => state.travelStyle);
  const travellingWith = useTripBuilderStore((state) => state.travellingWith);
  const priority = useTripBuilderStore((state) => state.priority);

  const selectedPackageTitle = useTripBuilderStore((state) => state.selectedPackageTitle);
  const selectedFlightLabel = useTripBuilderStore((state) => state.selectedFlightLabel);
  const selectedExtras = useTripBuilderStore((state) => state.selectedExtras);
  const selectedAddOns = useTripBuilderStore((state) => state.selectedAddOns);

  const roomPreference = useTripBuilderStore((state) => state.roomPreference);
  const serviceFee = useTripBuilderStore((state) => state.serviceFee);
  const bookingId = useTripBuilderStore((state) => state.bookingId);

  const dayPlans = useTripBuilderStore((state) => state.dayPlans);
  const customTripDays = useTripBuilderStore((state) => state.customTripDays);

  const selectedPackagePrice = useTripBuilderStore((state) => state.selectedPackagePrice);
  const estimatedFlightTotal = useTripBuilderStore((state) => state.estimatedFlightTotal);
  const estimatedHotelTotal = useTripBuilderStore((state) => state.estimatedHotelTotal);
  const estimatedTransferTotal = useTripBuilderStore((state) => state.estimatedTransferTotal);
  const estimatedSightseeingTotal = useTripBuilderStore((state) => state.estimatedSightseeingTotal);
  const estimatedMealsTotal = useTripBuilderStore((state) => state.estimatedMealsTotal);
  const estimatedGrandTotal = useTripBuilderStore((state) => state.estimatedGrandTotal);

  const modeLabel =
    selectedMode === "ai"
      ? "AI Assisted"
      : selectedMode === "custom"
        ? "Custom Trip"
        : "Standard Package";

  const fallbackExtrasTotal = selectedExtras.length * 900 + selectedAddOns.length * 1200;

  const finalPrice =
    estimatedGrandTotal > 0
      ? estimatedGrandTotal
      : selectedPackagePrice +
        estimatedFlightTotal +
        estimatedHotelTotal +
        estimatedTransferTotal +
        estimatedSightseeingTotal +
        Math.max(estimatedMealsTotal, fallbackExtrasTotal) +
        serviceFee;

  const dayWiseSummary = useMemo(() => {
    if (selectedMode === "custom" && customTripDays.length > 0) {
      return customTripDays.map((day) => ({
        id: day.id,
        dayLabel: day.dateLabel,
        city: day.city,
        summary: [
          day.selectedHotelId ? "Hotel selected" : null,
          day.selectedTransferIds.length > 0
            ? `${day.selectedTransferIds.length} transfer choice`
            : null,
          day.selectedSightseeingIds.length > 0
            ? `${day.selectedSightseeingIds.length} sightseeing`
            : null,
          day.selectedMealIds.length > 0 ? `${day.selectedMealIds.length} meal choices` : null,
          day.selectedExtraIds.length > 0 ? `${day.selectedExtraIds.length} extras` : null,
        ]
          .filter(Boolean)
          .join(" • "),
      }));
    }

    if (dayPlans.length > 0) {
      return dayPlans.map((day) => ({
        id: `day-${day.day}`,
        dayLabel: `Day ${day.day}`,
        city: day.city,
        summary: [
          day.transfer,
          day.hotel,
          day.activities?.length ? `${day.activities.length} activities` : null,
          day.meals?.length ? day.meals.join(", ") : null,
        ]
          .filter(Boolean)
          .join(" • "),
      }));
    }

    return [];
  }, [selectedMode, customTripDays, dayPlans]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f8fafc_35%,#ffffff_100%)]">
      <PublicHeader />

      <main>
        <section className="border-b border-slate-200/70 bg-white/60">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
                Review
              </span>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Review your trip before login and booking.
              </h1>
              <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
                This is now the single handoff step after Trip Builder. Check the trip, pricing,
                and day-wise structure before moving into login and booking confirmation.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)] sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-sky-700">{modeLabel}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    {selectedPackageTitle || "Selected trip"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {destination || "Bangkok"} • {travelDates || "Dates pending"} •{" "}
                    {nights || "Nights pending"}
                  </p>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Booking reference
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">{bookingId}</p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <InfoTile
                  label="Travelers"
                  value={`${adults} Adults${children ? `, ${children} Children` : ""}`}
                />
                <InfoTile
                  label="Rooms"
                  value={`${rooms} Room${rooms > 1 ? "s" : ""}`}
                />
                <InfoTile label="Room Preference" value={roomPreference} />
                <InfoTile label="Flights" value={selectedFlightLabel || "Without Flight"} />
                <InfoTile label="Budget" value={budget || "Not selected"} />
                <InfoTile label="Trip Style" value={travelStyle || "Not selected"} />
                <InfoTile label="Traveling With" value={travellingWith || "Not selected"} />
                <InfoTile label="Priority" value={priority || "Not selected"} />
              </div>

              <div className="mt-8 rounded-[28px] border border-slate-200 p-5">
                <h3 className="text-base font-semibold text-slate-950">Trip direction</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {mood ? <Tag>{mood}</Tag> : null}
                  {budget ? <Tag>{budget}</Tag> : null}
                  {travelStyle ? <Tag>{travelStyle}</Tag> : null}
                  {selectedFlightLabel ? <Tag>{selectedFlightLabel}</Tag> : null}
                </div>
              </div>

              <div className="mt-8 rounded-[28px] border border-slate-200 p-5">
                <h3 className="text-base font-semibold text-slate-950">Extras and add-ons</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedExtras.length === 0 && selectedAddOns.length === 0 ? (
                    <p className="text-sm text-slate-500">No extras selected</p>
                  ) : (
                    <>
                      {selectedExtras.map((item) => (
                        <Tag key={`extra-${item}`}>{item}</Tag>
                      ))}
                      {selectedAddOns.map((item) => (
                        <Tag key={`addon-${item}`}>{item}</Tag>
                      ))}
                    </>
                  )}
                </div>
              </div>

              <div className="mt-8 rounded-[28px] border border-slate-200 p-5">
                <h3 className="text-base font-semibold text-slate-950">Day-wise review</h3>

                {dayWiseSummary.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {dayWiseSummary.map((day) => (
                      <div
                        key={day.id}
                        className="rounded-[22px] bg-slate-50 px-4 py-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-950">
                              {day.dayLabel} • {day.city}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              {day.summary || "Selections pending"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">
                    Day-wise summary will appear here as soon as itinerary data is available.
                  </p>
                )}
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.05)]">
                <h2 className="text-lg font-semibold text-slate-950">Price Summary</h2>
                <div className="mt-5 space-y-4 text-sm">
                  <PriceRow
                    label="Package base"
                    value={formatINR(selectedPackagePrice)}
                  />
                  <PriceRow
                    label="Flights"
                    value={formatINR(estimatedFlightTotal)}
                  />
                  <PriceRow
                    label="Hotel estimate"
                    value={formatINR(estimatedHotelTotal)}
                  />
                  <PriceRow
                    label="Transfer estimate"
                    value={formatINR(estimatedTransferTotal)}
                  />
                  <PriceRow
                    label="Sightseeing estimate"
                    value={formatINR(estimatedSightseeingTotal)}
                  />
                  <PriceRow
                    label="Meals / extras estimate"
                    value={formatINR(
                      Math.max(estimatedMealsTotal, fallbackExtrasTotal)
                    )}
                  />
                  <PriceRow
                    label="Service charges"
                    value={formatINR(serviceFee)}
                  />

                  <div className="flex justify-between border-t border-slate-200 pt-4">
                    <span className="text-slate-700">Final Price</span>
                    <span className="text-lg font-semibold text-slate-950">
                      {formatINR(finalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.05)]">
                <p className="text-sm font-medium text-sky-700">Next step</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Review is now complete. After this, we will connect login and traveler details
                  before final booking confirmation.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Continue to Login
                </button>

                <Link
                  href="/trip-builder"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  Back to Trip Builder
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] bg-slate-50 p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-950">{value}</span>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
      {children}
    </span>
  );
}