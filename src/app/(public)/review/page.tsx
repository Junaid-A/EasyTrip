"use client";

import Link from "next/link";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { useTripBuilderStore } from "@/store/useTripBuilderStore";

export default function ReviewPage() {
  const selectedPackageTitle = useTripBuilderStore((state) => state.selectedPackageTitle);
  const selectedPackagePrice = useTripBuilderStore((state) => state.selectedPackagePrice);
  const adults = useTripBuilderStore((state) => state.adults);
  const children = useTripBuilderStore((state) => state.children);
  const roomPreference = useTripBuilderStore((state) => state.roomPreference);
  const serviceFee = useTripBuilderStore((state) => state.serviceFee);
  const bookingId = useTripBuilderStore((state) => state.bookingId);
  const selectedExtras = useTripBuilderStore((state) => state.selectedExtras);
  const estimatedHotelTotal = useTripBuilderStore((state) => state.estimatedHotelTotal);
  const estimatedTransferTotal = useTripBuilderStore((state) => state.estimatedTransferTotal);
  const estimatedSightseeingTotal = useTripBuilderStore((state) => state.estimatedSightseeingTotal);
  const estimatedMealsTotal = useTripBuilderStore((state) => state.estimatedMealsTotal);
  const estimatedGrandTotal = useTripBuilderStore((state) => state.estimatedGrandTotal);

  const fallbackExtrasTotal = selectedExtras.length * 900;
  const finalPrice =
    estimatedGrandTotal > 0
      ? estimatedGrandTotal
      : selectedPackagePrice + fallbackExtrasTotal + serviceFee;

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
                Review your trip before confirming.
              </h1>
              <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
                Check your selected trip details, useful extras, and current final estimate before confirmation.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)] sm:p-8">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">
                  {selectedPackageTitle || "Selected trip"}
                </h2>
               <p className="mt-2 text-sm text-slate-600">
  {adults} Adults{children ? `, ${children} Children` : ""} • {roomPreference} •
  Day-wise custom trip review
</p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-500">Stay</p>
                  <p className="mt-2 font-semibold text-slate-950">
                    ₹{estimatedHotelTotal.toLocaleString("en-IN")} hotel estimate
                  </p>
                </div>

                <div className="rounded-[24px] bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-500">Transfers</p>
                  <p className="mt-2 font-semibold text-slate-950">
                    ₹{estimatedTransferTotal.toLocaleString("en-IN")} movement estimate
                  </p>
                </div>

                <div className="rounded-[24px] bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-500">Room Preference</p>
                  <p className="mt-2 font-semibold text-slate-950">{roomPreference}</p>
                </div>

                <div className="rounded-[24px] bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-500">Travelers</p>
                  <p className="mt-2 font-semibold text-slate-950">
                    {adults} Adults{children ? `, ${children} Children` : ""}
                  </p>
                </div>

                <div className="rounded-[24px] bg-slate-50 p-5 sm:col-span-2">
                  <p className="text-sm font-medium text-slate-500">Selected Extras</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedExtras.length > 0 ? (
                      selectedExtras.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm font-medium text-slate-950">
                        No extras selected
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-[24px] bg-slate-50 p-5 sm:col-span-2">
                  <p className="text-sm font-medium text-slate-500">Experiences & meals</p>
                  <p className="mt-2 font-semibold text-slate-950">
                    ₹{estimatedSightseeingTotal.toLocaleString("en-IN")} sightseeing • ₹
                    {Math.max(estimatedMealsTotal, fallbackExtrasTotal).toLocaleString("en-IN")} meals/extras
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-[28px] border border-slate-200 p-5">
                <h3 className="text-base font-semibold text-slate-950">Booking Summary</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
  This review now reflects the Trip Studio totals, including day-wise stay, transfer,
  sightseeing, meal, and extras selections.
</p>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.05)]">
                <h2 className="text-lg font-semibold text-slate-950">Price Summary</h2>
                <div className="mt-5 space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Package base</span>
                    <span className="font-medium text-slate-950">
                      ₹{selectedPackagePrice.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Hotel estimate</span>
                    <span className="font-medium text-slate-950">
                      ₹{estimatedHotelTotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Transfer estimate</span>
                    <span className="font-medium text-slate-950">
                      ₹{estimatedTransferTotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Sightseeing estimate</span>
                    <span className="font-medium text-slate-950">
                      ₹{estimatedSightseeingTotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Meals / extras estimate</span>
                    <span className="font-medium text-slate-950">
                      ₹{Math.max(estimatedMealsTotal, fallbackExtrasTotal).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Service charges</span>
                    <span className="font-medium text-slate-950">
                      ₹{serviceFee.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-slate-200 pt-4">
                    <span className="text-slate-700">Final Price</span>
                    <span className="text-lg font-semibold text-slate-950">
                      ₹{finalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.05)]">
                <p className="text-sm font-medium text-sky-700">Reference ID</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Your trip details have been saved under reference{" "}
                  <span className="font-semibold text-slate-950">{bookingId}</span>.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  href={`/confirmation/${bookingId}`}
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Confirm Booking
                </Link>

                <Link
                  href="/customize"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  Back to Customize
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