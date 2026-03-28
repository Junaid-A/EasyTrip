"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { useTripBuilderStore } from "@/store/useTripBuilderStore";

const packages = [
  {
    id: "pkg-1",
    title: "Bangkok Signature Escape",
    badge: "Most Booked",
    duration: "4 Nights / 5 Days",
    hotel: "4★ Premium Stay",
    transfers: "Airport + city transfers",
    price: "₹28,900",
  },
  {
    id: "pkg-2",
    title: "Bangkok Luxury Discovery",
    badge: "Recommended",
    duration: "5 Nights / 6 Days",
    hotel: "5★ Luxury Stay",
    transfers: "Private transfers",
    price: "₹39,500",
  },
  {
    id: "pkg-3",
    title: "Bangkok Smart Value Plus",
    badge: "Best Value",
    duration: "4 Nights / 5 Days",
    hotel: "4★ Central Stay",
    transfers: "Shared + optional private",
    price: "₹25,400",
  },
];

export default function ResultsPage() {
  const router = useRouter();

  const destination = useTripBuilderStore((state) => state.destination);
  const travelDates = useTripBuilderStore((state) => state.travelDates);
  const adults = useTripBuilderStore((state) => state.adults);
  const travelStyle = useTripBuilderStore((state) => state.travelStyle);
  const selectPackage = useTripBuilderStore((state) => state.selectPackage);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f8fafc_35%,#ffffff_100%)]">
      <PublicHeader />

      <main>
        <section className="border-b border-slate-200/70 bg-white/60">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.05)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-sky-700">Results</p>
                  <h1 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">
                    Curated options for your {destination} trip
                  </h1>
                  <p className="mt-3 text-sm text-slate-600">
                    {travelDates} • {adults} Adults • {travelStyle} • Premium budget
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/trip-builder"
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    Edit Search
                  </Link>
                  <Link
                    href="/customize"
                    className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Continue
                  </Link>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  "Recommended for your style",
                  "Cleaner package comparison",
                  "Higher-conversion shortlist",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
            <aside className="space-y-6">
              <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.05)]">
                <h2 className="text-lg font-semibold text-slate-950">Filters</h2>
                <div className="mt-5 space-y-4 text-sm">
                  {[
                    "Budget: Premium",
                    "Hotel: 4★ and 5★",
                    "Transfers: Private preferred",
                    `Style: ${travelStyle}`,
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl bg-slate-50 px-4 py-3 text-slate-700"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.05)]">
                <p className="text-sm font-medium text-sky-700">AI Notes</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  These result cards are arranged to feel cleaner, more premium,
                  and easier to compare during a client-facing prototype demo.
                </p>
              </div>
            </aside>

            <section className="space-y-6">
              {packages.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.06)]"
                >
                  <div className="grid gap-0 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="p-6 sm:p-8">
                      <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                        {item.badge}
                      </span>

                      <h2 className="mt-4 text-2xl font-semibold text-slate-950 sm:text-3xl">
                        {item.title}
                      </h2>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                          {item.duration}
                        </div>
                        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                          {item.hotel}
                        </div>
                        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                          {item.transfers}
                        </div>
                      </div>

                      <p className="mt-5 text-sm leading-7 text-slate-600">
                        Designed for a cleaner customer journey with premium hotel
                        positioning, smoother transfers, and better trust in the
                        package presentation.
                      </p>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          Best for polished demos
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          Easy to explain
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          Stronger trust
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 bg-slate-50/70 p-6 xl:border-l xl:border-t-0 xl:p-8">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        Starting at
                      </p>
                      <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                        {item.price}
                      </p>

                      <div className="mt-6 space-y-3">
                        <button
                          type="button"
                          onClick={() => {
                            selectPackage({
                              selectedPackageId: item.id,
                              selectedPackageTitle: item.title,
                              selectedPackagePrice: Number(
                                item.price.replace(/[^\d]/g, "")
                              ),
                            });
                            router.push("/customize");
                          }}
                          className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                          Customize This
                        </button>

                        <Link
                          href="/review"
                          className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                        >
                          Quick Review
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}