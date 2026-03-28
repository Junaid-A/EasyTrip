"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { useTripBuilderStore } from "@/store/useTripBuilderStore";

export default function ConfirmationPage() {
  const params = useParams();
  const bookingId = String(params.bookingId ?? "");

  const selectedPackageTitle = useTripBuilderStore(
    (state) => state.selectedPackageTitle
  );
  const selectedPackagePrice = useTripBuilderStore(
    (state) => state.selectedPackagePrice
  );
  const adults = useTripBuilderStore((state) => state.adults);
  const roomPreference = useTripBuilderStore((state) => state.roomPreference);
  const serviceFee = useTripBuilderStore((state) => state.serviceFee);
  const selectedAddOns = useTripBuilderStore((state) => state.selectedAddOns);

  const addOnsTotal = selectedAddOns.length * 3250;
  const finalPrice = selectedPackagePrice + addOnsTotal + serviceFee;

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
            We’ve saved your selected trip details, preferences, and pricing
            under the booking reference below.
          </p>

          <div className="mx-auto mt-10 max-w-3xl rounded-[32px] bg-slate-50 p-6 text-left sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] bg-white p-5 ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">Booking ID</p>
                <p className="mt-2 font-semibold text-slate-950">{bookingId}</p>
              </div>

              <div className="rounded-[24px] bg-white p-5 ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">Trip</p>
                <p className="mt-2 font-semibold text-slate-950">
                  {selectedPackageTitle}
                </p>
              </div>

              <div className="rounded-[24px] bg-white p-5 ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">Travelers</p>
                <p className="mt-2 font-semibold text-slate-950">
                  {adults} Adults
                </p>
              </div>

              <div className="rounded-[24px] bg-white p-5 ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">Room Preference</p>
                <p className="mt-2 font-semibold text-slate-950">
                  {roomPreference}
                </p>
              </div>

              <div className="rounded-[24px] bg-white p-5 ring-1 ring-slate-200 sm:col-span-2">
                <p className="text-sm text-slate-500">Selected Add-ons</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedAddOns.length > 0 ? (
                    selectedAddOns.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <p className="font-semibold text-slate-950">
                      No add-ons selected
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-[24px] bg-white p-5 ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">Package Base</p>
                <p className="mt-2 font-semibold text-slate-950">
                  ₹{selectedPackagePrice.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="rounded-[24px] bg-white p-5 ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">Add-ons Total</p>
                <p className="mt-2 font-semibold text-slate-950">
                  ₹{addOnsTotal.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="rounded-[24px] bg-white p-5 ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">Service Charges</p>
                <p className="mt-2 font-semibold text-slate-950">
                  ₹{serviceFee.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="rounded-[24px] bg-white p-5 ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">Final Price</p>
                <p className="mt-2 font-semibold text-slate-950">
                  ₹{finalPrice.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Go to Home
            </Link>

            <Link
              href="/trip-builder"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Build Another Trip
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}