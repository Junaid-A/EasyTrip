"use client";

import Link from "next/link";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { useTripBuilderStore } from "@/store/useTripBuilderStore";

const addOns = [
  "Private airport pickup",
  "Safari World",
  "Dinner cruise",
  "Floating market tour",
  "Indian dinner package",
  "Luxury room upgrade",
];

const roomOptions = ["Deluxe Room", "Suite", "Pool View"];

export default function CustomizePage() {
  const selectedPackageTitle = useTripBuilderStore(
    (state) => state.selectedPackageTitle
  );
  const selectedPackagePrice = useTripBuilderStore(
    (state) => state.selectedPackagePrice
  );
  const selectedAddOns = useTripBuilderStore((state) => state.selectedAddOns);
  const roomPreference = useTripBuilderStore((state) => state.roomPreference);
  const serviceFee = useTripBuilderStore((state) => state.serviceFee);
  const toggleAddOn = useTripBuilderStore((state) => state.toggleAddOn);
  const setRoomPreference = useTripBuilderStore(
    (state) => state.setRoomPreference
  );

  const addOnsTotal = selectedAddOns.length * 3250;
  const total = selectedPackagePrice + addOnsTotal + serviceFee;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f8fafc_35%,#ffffff_100%)]">
      <PublicHeader />

      <main>
        <section className="border-b border-slate-200/70 bg-white/60">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
                Customize
              </span>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Fine-tune the selected trip with cleaner add-ons and upgrades.
              </h1>
              <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
                This page is positioned as a premium refinement layer before the
                final review step.
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
                  Selected package • Premium configuration
                </p>
              </div>

              <div className="mt-8">
                <h3 className="text-base font-semibold text-slate-950">Add-ons</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {addOns.map((item) => {
                    const isActive = selectedAddOns.includes(item);

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleAddOn(item)}
                        className={`rounded-[24px] border px-4 py-4 text-left text-sm font-medium transition ${
                          isActive
                            ? "border-sky-200 bg-sky-50 text-sky-700"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-base font-semibold text-slate-950">
                  Room Preference
                </h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  {roomOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setRoomPreference(item)}
                      className={`rounded-full px-4 py-2.5 text-sm font-medium transition ${
                        roomPreference === item
                          ? "bg-slate-950 text-white"
                          : "border border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-base font-semibold text-slate-950">
                  Internal Notes
                </h3>
                <textarea
                  defaultValue="Keep the package premium but clean. Avoid too many sightseeing inclusions. Maintain strong conversion quality."
                  rows={5}
                  className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3.5 text-sm text-slate-950 outline-none transition focus:border-sky-400 focus:bg-white"
                />
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.05)]">
                <h2 className="text-lg font-semibold text-slate-950">
                  Live Pricing Summary
                </h2>
                <div className="mt-5 space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Base package</span>
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
                    <span className="text-slate-700">Total</span>
                    <span className="text-lg font-semibold text-slate-950">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-[36px] border border-slate-200 bg-[linear-gradient(135deg,#020617_0%,#0f172a_35%,#1d4ed8_100%)] p-6 text-white shadow-[0_20px_70px_rgba(15,23,42,0.10)]">
                <p className="text-sm font-medium text-sky-200">
                  Upgrade Logic
                </p>
                <p className="mt-3 text-sm leading-7 text-white/80">
                  Add-ons are shown as premium refinements rather than cluttered
                  upsells. This makes the experience feel more curated and branded.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  href="/review"
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Continue to Review
                </Link>
                <Link
                  href="/results"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  Back to Results
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