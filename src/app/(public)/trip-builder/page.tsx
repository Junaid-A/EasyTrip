"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { useTripBuilderStore } from "@/store/useTripBuilderStore";

const travelStyles = [
  "Luxury",
  "Family",
  "Honeymoon",
  "Adventure",
  "Relaxed",
  "Budget Smart",
];

const specialPreferences = [
  "Private transfers",
  "Indian meals",
  "Near city center",
  "Kid friendly",
  "Nightlife",
  "Beach access",
];

export default function TripBuilderPage() {
  const router = useRouter();

  const destination = useTripBuilderStore((state) => state.destination);
  const travelDates = useTripBuilderStore((state) => state.travelDates);
  const nights = useTripBuilderStore((state) => state.nights);
  const adults = useTripBuilderStore((state) => state.adults);
  const children = useTripBuilderStore((state) => state.children);
  const travelStyle = useTripBuilderStore((state) => state.travelStyle);
  const specialPreferencesState = useTripBuilderStore(
    (state) => state.specialPreferences
  );
  const aiPrompt = useTripBuilderStore((state) => state.aiPrompt);

  const setTripDetails = useTripBuilderStore((state) => state.setTripDetails);
  const togglePreference = useTripBuilderStore((state) => state.togglePreference);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f8fafc_35%,#ffffff_100%)]">
      <PublicHeader />

      <main>
        <section className="border-b border-slate-200/70 bg-white/60 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
                Trip Builder
              </span>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Build your trip in a cleaner, more guided way.
              </h1>
              <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
                This prototype keeps the flow simple: define the trip intent, move
                to curated results, customize the package, review the summary, and
                confirm the booking.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {["Choose", "Results", "Customize", "Review", "Confirm"].map(
                (step, index) => (
                  <div
                    key={step}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                      index === 0
                        ? "bg-slate-950 text-white"
                        : "border border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    <span className="text-xs">{`0${index + 1}`}</span>
                    <span>{step}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)] sm:p-8">
              <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-sky-700">
                    Traveler Intent
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                    Start with the core trip details
                  </h2>
                </div>

                <Link
                  href="/"
                  className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Back Home
                </Link>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Destination
                  </label>
                  <input
                    value={destination}
                    onChange={(e) =>
                      setTripDetails({ destination: e.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3.5 text-sm text-slate-950 outline-none transition focus:border-sky-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Travel Dates
                  </label>
                  <input
                    value={travelDates}
                    onChange={(e) =>
                      setTripDetails({ travelDates: e.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3.5 text-sm text-slate-950 outline-none transition focus:border-sky-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Nights
                  </label>
                  <input
                    value={nights}
                    onChange={(e) => setTripDetails({ nights: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3.5 text-sm text-slate-950 outline-none transition focus:border-sky-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Adults
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={adults}
                    onChange={(e) =>
                      setTripDetails({ adults: Number(e.target.value) || 0 })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3.5 text-sm text-slate-950 outline-none transition focus:border-sky-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Children
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={children}
                    onChange={(e) =>
                      setTripDetails({ children: Number(e.target.value) || 0 })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3.5 text-sm text-slate-950 outline-none transition focus:border-sky-400 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-3 block text-sm font-medium text-slate-700">
                    Travel Style
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {travelStyles.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setTripDetails({ travelStyle: item })}
                        className={`rounded-full px-4 py-2.5 text-sm font-medium transition ${
                          item === travelStyle
                            ? "bg-slate-950 text-white"
                            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-3 block text-sm font-medium text-slate-700">
                    Special Preferences
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {specialPreferences.map((item) => {
                      const isActive = specialPreferencesState.includes(item);

                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => togglePreference(item)}
                          className={`rounded-full px-4 py-2.5 text-sm font-medium transition ${
                            isActive
                              ? "bg-sky-50 text-sky-700 ring-1 ring-sky-200"
                              : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    AI Prompt / Notes
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) =>
                      setTripDetails({ aiPrompt: e.target.value })
                    }
                    rows={5}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3.5 text-sm text-slate-950 outline-none transition focus:border-sky-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => router.push("/results")}
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Continue to Results
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  Cancel
                </Link>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.05)]">
                <p className="text-sm font-medium text-sky-700">How it works</p>
                <div className="mt-5 space-y-3">
                  {[
                    "Share your trip details",
                    "Browse curated packages",
                    "Customize your trip",
                    "Review your trip",
                    "Confirm your booking",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-950 ring-1 ring-slate-200">
                        {index + 1}
                      </div>
                      <p className="text-sm text-slate-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.05)]">
                <h2 className="text-lg font-semibold text-slate-950">
                  Live Trip Snapshot
                </h2>
                <div className="mt-5 space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Destination</span>
                    <span className="font-medium text-slate-950">
                      {destination || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Travelers</span>
                    <span className="font-medium text-slate-950">
                      {adults} Adults{children > 0 ? `, ${children} Children` : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Style</span>
                    <span className="font-medium text-slate-950">{travelStyle}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Budget Tier</span>
                    <span className="font-medium text-slate-950">Premium</span>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-[36px] border border-slate-200 bg-[linear-gradient(135deg,#020617_0%,#0f172a_35%,#1d4ed8_100%)] p-6 text-white shadow-[0_20px_70px_rgba(15,23,42,0.10)]">
                <p className="text-sm font-medium text-sky-200">
                  Suggested trip style
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                  Premium city trip with guided upgrades
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/80">
                  A strong match for travelers looking for a modern, comfortable, and more premium city escape.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}