"use client";

import Link from "next/link";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { useTripBuilderStore } from "@/store/useTripBuilderStore";

export default function ReviewPage() {
  const selectedPackageTitle = useTripBuilderStore(
    (state) => state.selectedPackageTitle
  );
  const selectedPackagePrice = useTripBuilderStore(
    (state) => state.selectedPackagePrice
  );
  const adults = useTripBuilderStore((state) => state.adults);
  const roomPreference = useTripBuilderStore((state) => state.roomPreference);
  const serviceFee = useTripBuilderStore((state) => state.serviceFee);
  const bookingId = useTripBuilderStore((state) => state.bookingId);
  const selectedAddOns = useTripBuilderStore((state) => state.selectedAddOns);

  const addOnsTotal = selectedAddOns.length * 3250;
  const finalPrice = selectedPackagePrice + addOnsTotal + serviceFee;

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
                Review the final trip before confirmation.
              </h1>
              <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
                This screen acts as the last polished summary before the final
                booking confirmation state.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)] sm:p-8">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">
                  {selectedPackageTitle}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {adults} Adults • {roomPreference} • Private transfers
                </p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-500">Hotel</p>
                  <p className="mt-2 font-semibold text-slate-950">
                    Premium stay selected in package
                  </p>
                </div>
                <div className="rounded-[24px] bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-500">Transfers</p>
                  <p className="mt-2 font-semibold text-slate-950">
                    Private airport and city transfers
                  </p>
                </div>
                <div className="rounded-[24px] bg-slate-50 p-5 sm:col-span-2">
                  <p className="text-sm font-medium text-slate-500">
                    Selected Add-ons
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedAddOns.length > 0 ? (
                      selectedAddOns.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm font-medium text-slate-950">
                        No add-ons selected
                      </p>
                    )}
                  </div>
                </div>
                <div className="rounded-[24px] bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-500">Meals</p>
                  <p className="mt-2 font-semibold text-slate-950">
                    Daily breakfast + selected premium options
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-[28px] border border-slate-200 p-5">
                <h3 className="text-base font-semibold text-slate-950">
                  Client-facing notes
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  This itinerary is positioned as a premium, smooth, and highly
                  comfortable travel experience with stronger presentation and
                  cleaner trip structuring.
                </p>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.05)]">
                <h2 className="text-lg font-semibold text-slate-950">
                  Price Summary
                </h2>
                <div className="mt-5 space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Package base</span>
                    <span className="font-medium text-slate-950">
                      ₹{selectedPackagePrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Selected add-ons</span>
                    <span className="font-medium text-slate-950">
                      {selectedAddOns.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Add-ons total</span>
                    <span className="font-medium text-slate-950">
                      ₹{addOnsTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Markup / service</span>
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
                <p className="text-sm font-medium text-sky-700">
                  Trust Positioning
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  The final review page should feel calmer and more authoritative
                  than a cluttered booking summary.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  href={`/confirmation/${bookingId}`}
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Confirm Prototype Booking
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