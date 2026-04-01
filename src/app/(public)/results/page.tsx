"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { readyPackages } from "@/lib/mock/bangkok-builder-data";
import { getRecommendedPackages } from "@/lib/helpers/recommendation";
import { useTripBuilderStore } from "@/store/useTripBuilderStore";

export default function ResultsPage() {
  const router = useRouter();

  const destination = useTripBuilderStore((state) => state.destination);
  const segments = useTripBuilderStore((state) => state.segments);
  const adults = useTripBuilderStore((state) => state.adults);
  const children = useTripBuilderStore((state) => state.children);
  const budget = useTripBuilderStore((state) => state.budget);
  const travelStyle = useTripBuilderStore((state) => state.travelStyle);
  const selectedPackageId = useTripBuilderStore((state) => state.selectedPackageId);
  const selectPackage = useTripBuilderStore((state) => state.selectPackage);

  const tripLabel = segments
    .map((segment) => segment.city)
    .filter(Boolean)
    .join(" → ");

  const recommendedPackages = getRecommendedPackages(
    readyPackages.map((item, index) => ({
      id: item.id,
      title: item.title,
      basePrice: item.price,
      popularityScore: index === 0 ? 10 : 7 - index,
      marginScore: item.hotelCategory === "4 Star" ? 8 : 7,
      budgetFitScore:
        budget === "Luxury"
          ? item.price >= 40000
            ? 9
            : 5
          : budget === "Premium"
          ? item.price >= 30000 && item.price < 50000
            ? 9
            : 6
          : budget === "Economy"
          ? item.price < 32000
            ? 9
            : 5
          : 8,
      tripMoodFitScore:
        travelStyle === "Mixed"
          ? 8
          : item.title.toLowerCase().includes(travelStyle.toLowerCase().split(" ")[0])
          ? 9
          : 6,
      recommendedLabel: item.tag,
    }))
      .map((scored) => {
        const original = readyPackages.find((pkg) => pkg.id === scored.id)!;
        return {
          ...original,
          score: scored,
        };
      })
      .sort((a, b) => {
        const aScore =
          (a.score.popularityScore || 0) +
          (a.score.marginScore || 0) +
          (a.score.budgetFitScore || 0) +
          (a.score.tripMoodFitScore || 0);
        const bScore =
          (b.score.popularityScore || 0) +
          (b.score.marginScore || 0) +
          (b.score.budgetFitScore || 0) +
          (b.score.tripMoodFitScore || 0);

        return bScore - aScore;
      })
      .map((item) => item)
  );

  function handlePackageSelect(item: (typeof readyPackages)[number]) {
    selectPackage({
      selectedPackageId: item.id,
      selectedPackageTitle: item.title,
      selectedPackagePrice: item.price,
    });

    router.push("/customize");
  }

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
                    {tripLabel || destination} • {adults} Adults
                    {children ? `, ${children} Children` : ""} • {travelStyle}
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
                      Continue to Customize
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  `Budget: ${budget}`,
                  "Package-led recommendations",
                  "Custom edits available next",
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
                    `Budget: ${budget}`,
                    `Style: ${travelStyle}`,
                    `Travellers: ${adults + children}`,
                    tripLabel ? `Route: ${tripLabel}` : "Route: Bangkok",
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
                  Select a package to continue. In the next step you can refine room preference,
                  extras, and trip-level choices before review.
                </p>
              </div>
            </aside>

            <section className="space-y-6">
              {recommendedPackages.map((item) => {
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
                            {item.tag}
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
                            {item.nights} Nights
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                            {item.hotelCategory}
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                            {item.area}
                          </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                          {item.includes.map((tag) => (
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
                          ₹{item.price.toLocaleString("en-IN")}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          Package estimate before later custom refinements
                        </p>

                        <div className="mt-6 space-y-3">
                          <button
                            type="button"
                            onClick={() => handlePackageSelect(item)}
                            className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                          >
                            {isSelected ? "Continue to Customize" : "Select Package"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              selectPackage({
                                selectedPackageId: item.id,
                                selectedPackageTitle: item.title,
                                selectedPackagePrice: item.price,
                              })
                            }
                            className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                          >
                            {isSelected ? "Package Selected" : "Save Selection"}
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