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
    description:
      "A balanced Bangkok trip with comfortable stays, city connectivity, and popular inclusions for first-time travelers.",
    tags: ["Popular choice", "Comfort stay", "Smooth itinerary"],
  },
  {
    id: "pkg-2",
    title: "Bangkok Luxury Discovery",
    badge: "Recommended",
    duration: "5 Nights / 6 Days",
    hotel: "5★ Luxury Stay",
    transfers: "Private transfers",
    price: "₹39,500",
    description:
      "A more premium option for travelers who want better hotels, added comfort, and a more private overall experience.",
    tags: ["Premium stay", "Private transfers", "Higher comfort"],
  },
  {
    id: "pkg-3",
    title: "Bangkok Smart Value Plus",
    badge: "Best Value",
    duration: "4 Nights / 5 Days",
    hotel: "4★ Central Stay",
    transfers: "Shared + optional private",
    price: "₹25,400",
    description:
      "A value-focused package with a central stay, practical inclusions, and flexibility for upgrades during customization.",
    tags: ["Value option", "Central location", "Upgrade friendly"],
  },
];

export default function ResultsPage() {
  const router = useRouter();

  const destination = useTripBuilderStore((state) => state.destination);
  const travelDates = useTripBuilderStore((state) => state.travelDates);
  const adults = useTripBuilderStore((state) => state.adults);
  const travelStyle = useTripBuilderStore((state) => state.travelStyle);
  const selectedPackageId = useTripBuilderStore((state) => state.selectedPackageId);
  const selectPackage = useTripBuilderStore((state) => state.selectPackage);

  const handlePackageSelect = (item: (typeof packages)[number]) => {
    selectPackage({
      selectedPackageId: item.id,
      selectedPackageTitle: item.title,
      selectedPackagePrice: Number(item.price.replace(/[^\d]/g, "")),
    });
    router.push("/customize");
  };

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
                    {travelDates} • {adults} Adults • {travelStyle}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/trip-builder"
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    Edit Search
                  </Link>

                  {selectedPackageId ? (
                    <Link
                      href="/customize"
                      className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Continue with Selected Package
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  "Shortlisted for your travel style",
                  "Easy to compare",
                  "Flexible upgrades available",
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
                <h2 className="text-lg font-semibold text-slate-950">Trip Filters</h2>
                <div className="mt-5 space-y-4 text-sm">
                  {[
                    "Budget: Premium",
                    "Hotel: 4★ and 5★ options",
                    "Transfers: Comfort-focused",
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
                <p className="text-sm font-medium text-sky-700">Planning Note</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Select a package to continue. You’ll be able to customize room
                  preference and add-ons in the next step.
                </p>
              </div>
            </aside>

            <section className="space-y-6">
              {packages.map((item) => {
                const isSelected = selectedPackageId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`overflow-hidden rounded-[36px] border bg-white shadow-[0_20px_70px_rgba(15,23,42,0.06)] transition ${
                      isSelected ? "border-sky-300 ring-2 ring-sky-100" : "border-slate-200"
                    }`}
                  >
                    <div className="grid gap-0 xl:grid-cols-[1.1fr_0.9fr]">
                      <div className="p-6 sm:p-8">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                            {item.badge}
                          </span>
                          {isSelected ? (
                            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                              Selected
                            </span>
                          ) : null}
                        </div>

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
                          {item.description}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-slate-200 bg-slate-50/70 p-6 xl:border-l xl:border-t-0 xl:p-8">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                          Starting at
                        </p>
                        <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                          {item.price}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          Per package before add-ons and service charges
                        </p>

                        <div className="mt-6 space-y-3">
                          <button
                            type="button"
                            onClick={() => handlePackageSelect(item)}
                            className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                          >
                            {isSelected ? "Customize Selected Package" : "Select & Customize"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              selectPackage({
                                selectedPackageId: item.id,
                                selectedPackageTitle: item.title,
                                selectedPackagePrice: Number(
                                  item.price.replace(/[^\d]/g, "")
                                ),
                              })
                            }
                            className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                          >
                            {isSelected ? "Package Selected" : "Select This Package"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}