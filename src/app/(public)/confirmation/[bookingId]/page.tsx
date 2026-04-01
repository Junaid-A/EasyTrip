"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { useTripBuilderStore } from "@/store/useTripBuilderStore";

export default function ConfirmationPage() {
  const params = useParams();
  const bookingIdFromRoute = String(params.bookingId ?? "");

  const selectedPackageTitle = useTripBuilderStore((state) => state.selectedPackageTitle);
  const selectedPackagePrice = useTripBuilderStore((state) => state.selectedPackagePrice);
  const adults = useTripBuilderStore((state) => state.adults);
  const children = useTripBuilderStore((state) => state.children);
  const roomPreference = useTripBuilderStore((state) => state.roomPreference);
  const serviceFee = useTripBuilderStore((state) => state.serviceFee);
  const bookingIdFromStore = useTripBuilderStore((state) => state.bookingId);
  const selectedExtras = useTripBuilderStore((state) => state.selectedExtras);
  const estimatedHotelTotal = useTripBuilderStore((state) => state.estimatedHotelTotal);
  const estimatedTransferTotal = useTripBuilderStore((state) => state.estimatedTransferTotal);
  const estimatedSightseeingTotal = useTripBuilderStore((state) => state.estimatedSightseeingTotal);
  const estimatedMealsTotal = useTripBuilderStore((state) => state.estimatedMealsTotal);
  const estimatedGrandTotal = useTripBuilderStore((state) => state.estimatedGrandTotal);

  const bookingId = bookingIdFromRoute || bookingIdFromStore;
  const fallbackExtrasTotal = selectedExtras.length * 900;
  const finalPrice =
    estimatedGrandTotal > 0
      ? estimatedGrandTotal
      : selectedPackagePrice + fallbackExtrasTotal + serviceFee;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f8fafc_35%,#ffffff_100%)]">
      <PublicHeader />

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="rounded-[40px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-10 lg:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sky-50 text-3xl ring-1 ring-sky-200">
            ✓
          </div>

          <span className="mt-6 inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
            Confirmation
          </span>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Your booking request has been received
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            We’ve saved your selected trip details, preferences, and current pricing
            estimate under the booking reference below.
          </p>

          <div className="mx-auto mt-10 max-w-3xl rounded-[32px] bg-slate-50 p-6 text-left sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard label="Booking ID" value={bookingId || "Pending"} />
              <InfoCard label="Trip" value={selectedPackageTitle || "Selected trip"} />

              <InfoCard
                label="Travelers"
                value={`${adults} Adults${children ? `, ${children} Children` : ""}`}
              />

              <InfoCard
                label="Room Preference"
                value={roomPreference || "Standard preference"}
              />

              <div className="rounded-[24px] bg-white p-5 ring-1 ring-slate-200 sm:col-span-2">
                <p className="text-sm text-slate-500">Selected Extras</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedExtras.length > 0 ? (
                    selectedExtras.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <p className="font-semibold text-slate-950">No extras selected</p>
                  )}
                </div>
              </div>

              <InfoCard
                label="Package Base"
                value={`₹${selectedPackagePrice.toLocaleString("en-IN")}`}
              />

              <InfoCard
                label="Hotel Estimate"
                value={`₹${estimatedHotelTotal.toLocaleString("en-IN")}`}
              />

              <InfoCard
                label="Transfer Estimate"
                value={`₹${estimatedTransferTotal.toLocaleString("en-IN")}`}
              />

              <InfoCard
                label="Sightseeing Estimate"
                value={`₹${estimatedSightseeingTotal.toLocaleString("en-IN")}`}
              />

              <InfoCard
                label="Meals / Extras Estimate"
                value={`₹${Math.max(estimatedMealsTotal, fallbackExtrasTotal).toLocaleString("en-IN")}`}
              />

              <InfoCard
                label="Service Charges"
                value={`₹${serviceFee.toLocaleString("en-IN")}`}
              />

              <div className="rounded-[24px] bg-white p-5 ring-1 ring-slate-200 sm:col-span-2">
                <p className="text-sm text-slate-500">Final Price</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  ₹{finalPrice.toLocaleString("en-IN")}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  This reflects the current centralized trip estimate carried forward from your
                  builder, customize, and review flow.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Back to Home
            </Link>

            <Link
              href="/trip-builder"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Start Another Trip
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] bg-white p-5 ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 font-semibold text-slate-950">{value}</p>
    </div>
  );
}