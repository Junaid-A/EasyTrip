"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import {
  CalendarDays,
  ChevronRight,
  Filter,
  MapPin,
  Minus,
  Plus,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { AIGuidedFlow } from "./ai-guided-flow";
import { CustomTripFlow } from "./custom-trip-flow";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import {
  categoryTabs,
  departureCities,
  standardPackages,
  type PackageCategory,
  type StandardPackage,
} from "@/lib/mock/bangkok-builder-data";
import { useTripBuilderStore } from "@/store/useTripBuilderStore";

type DurationFilter = "all" | "4-5" | "6-7";
type PriceFilter = "all" | "upto-40" | "40-55" | "55-plus";
type BuilderMode = "standard" | "ai" | "custom";

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getTomorrowISODate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function formatLongDate(value: string) {
  if (!value) return "Not selected";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function clampMinimum(value: number, min: number) {
  return Math.max(min, value);
}

function getTotalTravellers(adults: number, children: number) {
  return adults + children;
}

function calculatePackagePrice(
  pkg: StandardPackage,
  adults: number,
  children: number,
  rooms: number
) {
  const adultTotal = pkg.basePricePerPerson * adults;
  const childTotal = Math.round(pkg.basePricePerPerson * 0.72 * children);
  const roomAdjustment = Math.max(0, rooms - 1) * 3500;
  const serviceFee = Math.max(
    3000,
    Math.round((adultTotal + childTotal + roomAdjustment) * 0.05)
  );

  const total = adultTotal + childTotal + roomAdjustment + serviceFee;

  return {
    pricePerPerson: pkg.basePricePerPerson,
    totalPrice: Math.round(total),
    serviceFee,
  };
}

function buildSegments(citySplit: StandardPackage["citySplit"], departureDate: string) {
  const segments: Array<{
    id: string;
    city: string;
    destinationId: string;
    checkIn: string;
    checkOut: string;
  }> = [];

  const start = new Date(departureDate);
  if (Number.isNaN(start.getTime())) return segments;

  let cursor = new Date(start);

  citySplit.forEach((segment, index) => {
    const checkIn = new Date(cursor);
    const checkOut = new Date(cursor);
    checkOut.setDate(checkOut.getDate() + segment.nights);

    segments.push({
      id: `segment-${index + 1}`,
      city: segment.city,
      destinationId: `dest-${segment.city.toLowerCase().replace(/\s+/g, "-")}`,
      checkIn: checkIn.toISOString().slice(0, 10),
      checkOut: checkOut.toISOString().slice(0, 10),
    });

    cursor = new Date(checkOut);
  });

  return segments;
}

function buildStorePricingBreakdown(totalPrice: number, serviceFee: number) {
  const subtotal = Math.max(totalPrice - serviceFee, 0);

  const hotelTotal = Math.round(subtotal * 0.46);
  const transferTotal = Math.round(subtotal * 0.1);
  const sightseeingTotal = Math.round(subtotal * 0.14);
  const mealsTotal = Math.round(subtotal * 0.08);
  const basePackage =
    subtotal - hotelTotal - transferTotal - sightseeingTotal - mealsTotal;

  return {
    basePackage,
    hotelTotal,
    transferTotal,
    sightseeingTotal,
    mealsTotal,
    grandTotal: totalPrice,
  };
}

export function TripBuilderShell() {
  const router = useRouter();

  const setTripDetails = useTripBuilderStore((state) => state.setTripDetails);
  const setTravelers = useTripBuilderStore((state) => state.setTravelers);
  const selectPackage = useTripBuilderStore((state) => state.selectPackage);
  const setTotals = useTripBuilderStore((state) => state.setTotals);

  const [mode, setMode] = useState<BuilderMode>("standard");
  const [activeCategory, setActiveCategory] = useState<PackageCategory>("all");
  const [hotelFilter, setHotelFilter] = useState<"all" | "3 Star" | "4 Star" | "5 Star">(
    "all"
  );
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");

  const [departureCityId, setDepartureCityId] = useState("dep-bangalore");
  const [destinationCity, setDestinationCity] = useState("Bangkok");
  const [departureDate, setDepartureDate] = useState(getTomorrowISODate());

  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [detailPackageId, setDetailPackageId] = useState<string | null>(null);
  const [customSeedPackageId, setCustomSeedPackageId] = useState<string | null>(null);

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const selectedDepartureCity =
    departureCities.find((item) => item.id === departureCityId) ?? departureCities[0];

  const totalTravellers = getTotalTravellers(adults, children);

  const filteredPackages = useMemo(() => {
    return standardPackages.filter((pkg) => {
      const categoryMatch =
        activeCategory === "all" ? true : pkg.category.includes(activeCategory);

      const hotelMatch = hotelFilter === "all" ? true : pkg.hotelCategory === hotelFilter;

      const durationMatch =
        durationFilter === "all"
          ? true
          : durationFilter === "4-5"
          ? pkg.durationNights >= 4 && pkg.durationNights <= 5
          : pkg.durationNights >= 6 && pkg.durationNights <= 7;

      const priceMatch =
        priceFilter === "all"
          ? true
          : priceFilter === "upto-40"
            ? pkg.basePricePerPerson <= 40000
            : priceFilter === "40-55"
              ? pkg.basePricePerPerson > 40000 && pkg.basePricePerPerson <= 55000
              : pkg.basePricePerPerson > 55000;

      return categoryMatch && hotelMatch && durationMatch && priceMatch;
    });
  }, [activeCategory, durationFilter, hotelFilter, priceFilter]);

  const packageCards = useMemo(() => {
    return filteredPackages.map((pkg) => ({
      ...pkg,
      pricing: calculatePackagePrice(pkg, adults, children, rooms),
    }));
  }, [filteredPackages, adults, children, rooms]);

  const selectedPackage =
    packageCards.find((pkg) => pkg.id === selectedPackageId) ?? null;

  const detailPackage =
    packageCards.find((pkg) => pkg.id === detailPackageId) ?? null;

  function syncPackageToStore(pkg: (typeof packageCards)[number]) {
    const segments = buildSegments(pkg.citySplit, departureDate);
    const endDate = segments.at(-1)?.checkOut ?? departureDate;
    const pricing = buildStorePricingBreakdown(
      pkg.pricing.totalPrice,
      pkg.pricing.serviceFee
    );

    setTripDetails({
      selectedMode: mode,
      destination: destinationCity,
      destinationId: "dest-bangkok",
      segments,
      travelDates: `${formatLongDate(departureDate)} - ${formatLongDate(endDate)}`,
      nights: `${pkg.durationNights} Nights`,
      budget:
        pkg.basePricePerPerson <= 40000
          ? "Comfort"
          : pkg.basePricePerPerson <= 55000
            ? "Premium"
            : "Luxury",
      travelStyle:
        activeCategory === "honeymoon"
          ? "Luxury"
          : activeCategory === "family"
            ? "Family Fun"
            : activeCategory === "beach"
              ? "Relaxed"
              : "Mixed",
      travellingWith:
        adults >= 2 && children === 0 ? "Couple" : children > 0 ? "Family" : "Group",
      priority: pkg.hotelCategory === "5 Star" ? "Better hotel" : "Balanced trip",
      serviceFee: pkg.pricing.serviceFee,
    });

    setTravelers({ adults, children, rooms });

    selectPackage({
      selectedPackageId: pkg.id,
      selectedPackageTitle: pkg.title,
      selectedPackagePrice: pricing.basePackage,
    });

    setTotals({
      estimatedHotelTotal: pricing.hotelTotal,
      estimatedTransferTotal: pricing.transferTotal,
      estimatedSightseeingTotal: pricing.sightseeingTotal,
      estimatedMealsTotal: pricing.mealsTotal,
      estimatedGrandTotal: pricing.grandTotal,
    });
  }

  function handleSelectPackage(packageId: string) {
    setSelectedPackageId(packageId);
    const pkg = packageCards.find((item) => item.id === packageId);
    if (pkg) syncPackageToStore(pkg);
  }

  function handleOpenDetail(packageId: string) {
    setDetailPackageId(packageId);
  }

  function handleCloseDetail() {
    setDetailPackageId(null);
  }

  function handleCustomizePackage(packageId: string) {
    setSelectedPackageId(packageId);
    setCustomSeedPackageId(packageId);

    const pkg = packageCards.find((item) => item.id === packageId);
    if (pkg) syncPackageToStore(pkg);

    setMode("custom");
    setDetailPackageId(null);
  }

  function handleContinueBooking() {
    if (!selectedPackage) return;
    syncPackageToStore(selectedPackage);
    router.push("/customize");
  }

  function clearFilters() {
    setHotelFilter("all");
    setDurationFilter("all");
    setPriceFilter("all");
    setActiveCategory("all");
  }

  const activeFilterCount =
    Number(hotelFilter !== "all") +
    Number(durationFilter !== "all") +
    Number(priceFilter !== "all");

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#f7f3ee_0%,#f8fafc_48%,#ffffff_100%)] text-slate-950">
      {!mobileSearchOpen && !mobileFiltersOpen ? <PublicHeader /> : null}

      <main className="pb-28 pt-28 sm:pt-32 lg:pt-36">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="hidden overflow-hidden rounded-[36px] border border-black/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.94)_0%,rgba(254,247,237,0.9)_52%,rgba(255,255,255,0.95)_100%)] shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:block">
            <div className="border-b border-black/5 px-8 py-8">
              <div className="max-w-3xl">
                <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-700">
                  Thailand Planner
                </span>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
                  Plan cleaner Thailand trips with ready packages, AI help, or a full custom build.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                  Keep the homepage tone, reduce confusion, and move customers into the right
                  booking path faster.
                </p>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="grid gap-3 xl:grid-cols-[1.2fr_0.92fr_0.8fr_1fr_132px]">
                <SearchSelect
                  label="From"
                  value={departureCityId}
                  onChange={setDepartureCityId}
                  icon={<MapPin className="h-4 w-4" />}
                  options={departureCities.map((item) => ({
                    value: item.id,
                    label: `${item.city} · ${item.airportCode}`,
                    description: item.airport,
                  }))}
                />

                <SearchSelect
                  label="To"
                  value={destinationCity}
                  onChange={setDestinationCity}
                  icon={<MapPin className="h-4 w-4" />}
                  options={[
                    {
                      value: "Bangkok",
                      label: "Bangkok",
                      description: "Thailand",
                    },
                  ]}
                />

                <SearchDateField
                  label="Departure"
                  value={departureDate}
                  onChange={setDepartureDate}
                  min={getTomorrowISODate()}
                  icon={<CalendarDays className="h-4 w-4" />}
                />

                <GuestsField
                  adults={adults}
                  children={children}
                  rooms={rooms}
                  setAdults={setAdults}
                  setChildren={setChildren}
                  setRooms={setRooms}
                />

                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-[22px] bg-orange-500 px-4 py-4 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(249,115,22,0.24)] transition hover:bg-orange-600"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="lg:hidden">
            <div className="rounded-[26px] border border-black/10 bg-white p-3 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setMobileSearchOpen(true)}
                  className="min-w-0 flex-1 rounded-[20px] bg-slate-50 px-4 py-3 text-left"
                >
                  <p className="truncate text-sm font-semibold text-slate-950">
                    {selectedDepartureCity.city} → {destinationCity}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {formatLongDate(departureDate)} · {adults} Adults
                    {children ? `, ${children} Children` : ""} · {rooms} Room
                    {rooms > 1 ? "s" : ""}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="inline-flex h-12 shrink-0 items-center gap-2 rounded-[18px] border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
                >
                  <Filter className="h-4 w-4" />
                  {activeFilterCount > 0 ? activeFilterCount : null}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <ModeCard
              active={mode === "standard"}
              title="Standard"
              description="Ready packages"
              onClick={() => setMode("standard")}
              icon={<MapPin className="h-5 w-5" />}
            />
            <ModeCard
              active={mode === "ai"}
              title="AI Assist"
              description="Guided help"
              onClick={() => setMode("ai")}
              icon={<Sparkles className="h-5 w-5" />}
            />
            <ModeCard
              active={mode === "custom"}
              title="Custom"
              description="Full control"
              onClick={() => setMode("custom")}
              icon={<ChevronRight className="h-5 w-5" />}
            />
          </div>

          {mode === "standard" && (
            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
              <div className="min-w-0 space-y-6">
                <section className="min-w-0 overflow-hidden rounded-[32px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-6">
                  <div className="flex flex-col gap-4 border-b border-slate-200 pb-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600">
                          Curated
                        </p>
                        <h2 className="mt-1 text-xl font-semibold text-slate-950 sm:text-2xl">
                          Standard Thailand packages
                        </h2>
                      </div>

                      <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 sm:inline-flex">
                        <Filter className="h-4 w-4" />
                        Filters
                      </div>
                    </div>

                    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-1">
                      {categoryTabs.map((tab) => {
                        const active = activeCategory === tab.value;

                        return (
                          <button
                            key={tab.value}
                            type="button"
                            onClick={() => setActiveCategory(tab.value)}
                            className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                              active
                                ? "bg-slate-950 text-white"
                                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-5 hidden grid-cols-3 gap-3 md:grid">
                    <FilterCard
                      label="Hotel Class"
                      value={hotelFilter}
                      onChange={(value) =>
                        setHotelFilter(value as "all" | "3 Star" | "4 Star" | "5 Star")
                      }
                      options={[
                        { value: "all", label: "All hotels" },
                        { value: "3 Star", label: "3 Star" },
                        { value: "4 Star", label: "4 Star" },
                        { value: "5 Star", label: "5 Star" },
                      ]}
                    />
                    <FilterCard
                      label="Trip Length"
                      value={durationFilter}
                      onChange={(value) => setDurationFilter(value as DurationFilter)}
                      options={[
                        { value: "all", label: "Any length" },
                        { value: "4-5", label: "4N to 5N" },
                        { value: "6-7", label: "6N to 7N" },
                      ]}
                    />
                    <FilterCard
                      label="Budget Band"
                      value={priceFilter}
                      onChange={(value) => setPriceFilter(value as PriceFilter)}
                      options={[
                        { value: "all", label: "All budgets" },
                        { value: "upto-40", label: "Up to ₹40K" },
                        { value: "40-55", label: "₹40K to ₹55K" },
                        { value: "55-plus", label: "₹55K+" },
                      ]}
                    />
                  </div>

                  <div className="mt-5 min-w-0 overflow-hidden rounded-[24px] border border-orange-100 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_100%)] px-4 py-4">
                    <p className="break-words text-sm font-semibold text-slate-900">
                      Departing from {selectedDepartureCity.city} · {selectedDepartureCity.airportCode}
                    </p>
                    <p className="mt-1 break-words text-sm text-slate-600">
                      Bangkok is fixed as the destination entry point for this flow. Departure set for{" "}
                      <span className="font-semibold text-slate-900">
                        {formatLongDate(departureDate)}
                      </span>
                      .
                    </p>
                  </div>

                  <div className="mt-6 grid min-w-0 gap-5 lg:grid-cols-2">
                    {packageCards.map((pkg) => (
                      <article
  key={pkg.id}
  className="min-w-0 max-w-full overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_14px_42px_rgba(15,23,42,0.05)]"
>
                        <div className={`relative h-44 sm:h-52 bg-gradient-to-br ${pkg.accentFrom} ${pkg.accentTo}`}>
                          <div className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-slate-900">
                            {pkg.badge}
                          </div>

                          <div className="absolute bottom-4 left-4 right-4 min-w-0 rounded-[20px] bg-white/92 p-4 backdrop-blur">
                            <p className="break-words text-base font-semibold text-slate-950 sm:text-lg">
                              {pkg.title}
                            </p>
                            <p className="mt-1 break-words text-xs text-slate-600 sm:text-sm">
                              {pkg.citySplit
                                .map((item) => `${item.nights}N ${item.city}`)
                                .join(" · ")}
                            </p>
                          </div>
                        </div>

                        <div className="min-w-0 p-4 sm:p-5">
                          <p className="break-words text-sm leading-6 text-slate-600">{pkg.subtitle}</p>

                          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <FactPill label={`${pkg.durationNights}N / ${pkg.durationDays}D`} />
                            <FactPill label={pkg.hotelCategory} />
                            <FactPill
                              label={pkg.includedFlights ? "With flights" : "Without flights"}
                            />
                            <FactPill label={`${pkg.activitiesCount} activities`} />
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {pkg.bestFor.map((item) => (
                              <span
                                key={item}
                                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
                              >
                                {item}
                              </span>
                            ))}
                          </div>

                          <div className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                            <InfoBullet text={pkg.transferType} />
                            <InfoBullet text={pkg.mealsLabel} />
                            {pkg.highlightList.slice(0, 4).map((item) => (
                              <InfoBullet key={item} text={item} />
                            ))}
                          </div>

                          <div className="mt-5 rounded-[22px] bg-slate-50 p-4">
                            <div className="flex items-end justify-between gap-4">
                              <div>
                                <p className="text-sm text-slate-500">From</p>
                                <p className="text-2xl font-semibold text-slate-950">
                                  {formatINR(pkg.pricing.pricePerPerson)}
                                  <span className="ml-1 text-sm font-medium text-slate-500">
                                    / person
                                  </span>
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-slate-500">Trip total</p>
                                <p className="text-lg font-semibold text-slate-950">
                                  {formatINR(pkg.pricing.totalPrice)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-5 grid gap-2 sm:grid-cols-2">
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(pkg.id)}
                              className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                            >
                              View itinerary
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSelectPackage(pkg.id)}
                              className="rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                              Choose package
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCustomizePackage(pkg.id)}
                            className="mt-2 w-full rounded-full border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
                          >
                            Customize this package
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>

                  {packageCards.length === 0 ? (
                    <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-600">
                      No packages match the current filters. Adjust hotel class, trip length, or
                      budget band.
                    </div>
                  ) : null}
                </section>
              </div>

              <aside className="hidden space-y-4 xl:sticky xl:top-28 xl:block xl:self-start">
                <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
                    Booking Summary
                  </p>

                  <div className="mt-4 space-y-3">
                    <SummaryRow
                      label="From"
                      value={`${selectedDepartureCity.city} · ${selectedDepartureCity.airportCode}`}
                    />
                    <SummaryRow label="To" value={destinationCity} />
                    <SummaryRow label="Departure" value={formatLongDate(departureDate)} />
                    <SummaryRow
                      label="Guests"
                      value={`${adults}A${children ? `, ${children}C` : ""}`}
                    />
                    <SummaryRow label="Rooms" value={`${rooms}`} />
                  </div>

                  {selectedPackage ? (
                    <div className="mt-4 rounded-[24px] bg-orange-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
                        Selected package
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">
                        {selectedPackage.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {selectedPackage.citySplit
                          .map((item) => `${item.nights}N ${item.city}`)
                          .join(" · ")}
                      </p>
                      <p className="mt-4 text-3xl font-semibold text-slate-950">
                        {formatINR(selectedPackage.pricing.totalPrice)}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatINR(selectedPackage.pricing.pricePerPerson)} / person
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                      Choose a package to activate pricing and continue booking.
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleContinueBooking}
                    disabled={!selectedPackage}
                    className={`mt-5 w-full rounded-full px-4 py-3 text-sm font-semibold transition ${
                      selectedPackage
                        ? "bg-slate-950 text-white hover:bg-slate-800"
                        : "cursor-not-allowed bg-slate-200 text-slate-500"
                    }`}
                  >
                    Continue booking
                  </button>
                </div>

                <div className="rounded-[30px] border border-slate-200 bg-[linear-gradient(135deg,#111827_0%,#1f2937_42%,#f97316_160%)] p-5 text-white shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
                  <p className="text-sm font-semibold text-orange-200">Need a different city split?</p>
                  <p className="mt-2 text-sm leading-7 text-white/80">
                    Standard packages stay fixed. The moment the customer wants to change nights,
                    cities, hotels, transfers, or day items, move them into Personal Custom.
                  </p>
                </div>
              </aside>
            </div>
          )}

          {mode === "ai" && (
            <section className="mt-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
              <AIGuidedFlow />
            </section>
          )}

          {mode === "custom" && (
            <section className="mt-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
              <div className="mb-5 rounded-[26px] border border-orange-200 bg-orange-50 p-4">
                <p className="text-sm font-semibold text-orange-700">Custom mode enabled</p>
                <p className="mt-1 text-sm text-slate-600">
                  Build city-night splits like 2N Bangkok · 2N Krabi · 2N Pattaya and edit day-level
                  items more neatly.
                </p>
                {customSeedPackageId ? (
                  <p className="mt-2 text-sm text-slate-700">
                    Starting from package:{" "}
                    <span className="font-semibold">
                      {standardPackages.find((pkg) => pkg.id === customSeedPackageId)?.title ??
                        "Selected package"}
                    </span>
                  </p>
                ) : null}
              </div>

              <CustomTripFlow />
            </section>
          )}
        </section>
      </main>

      {mobileSearchOpen ? (
  <div className="fixed inset-0 z-[90] overflow-x-hidden bg-white lg:hidden">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600">
                  Search
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">
                  Edit your trip
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
  <div className="space-y-4">
    <MobileSelectField
      label="From"
      value={departureCityId}
      onChange={setDepartureCityId}
      options={departureCities.map((item) => ({
        value: item.id,
        label: `${item.city} · ${item.airportCode}`,
        description: item.airport,
      }))}
    />

    <MobileSelectField
      label="To"
      value={destinationCity}
      onChange={setDestinationCity}
      options={[
        {
          value: "Bangkok",
          label: "Bangkok",
          description: "Thailand",
        },
      ]}
    />

    <MobileDateField
      label="Departure"
      value={departureDate}
      onChange={setDepartureDate}
      min={getTomorrowISODate()}
      helper="Only future departures"
    />

    <MobileGuestsField
      adults={adults}
      children={children}
      rooms={rooms}
      setAdults={setAdults}
      setChildren={setChildren}
      setRooms={setRooms}
    />
  </div>
</div>

            <div className="border-t border-slate-200 px-4 py-4">
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="w-full rounded-full bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white"
              >
                Apply search
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {mobileFiltersOpen ? (
  <div className="fixed inset-0 z-[90] overflow-x-hidden bg-white lg:hidden">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600">
                  Filters
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">
                  Refine packages
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

           <div className="flex-1 overflow-y-auto px-4 py-4">
  <div className="space-y-4">
    <MobileFilterField
      label="Hotel Class"
      value={hotelFilter}
      onChange={(value) =>
        setHotelFilter(value as "all" | "3 Star" | "4 Star" | "5 Star")
      }
      options={[
        { value: "all", label: "All hotels" },
        { value: "3 Star", label: "3 Star" },
        { value: "4 Star", label: "4 Star" },
        { value: "5 Star", label: "5 Star" },
      ]}
    />

    <MobileFilterField
      label="Trip Length"
      value={durationFilter}
      onChange={(value) => setDurationFilter(value as DurationFilter)}
      options={[
        { value: "all", label: "Any length" },
        { value: "4-5", label: "4N to 5N" },
        { value: "6-7", label: "6N to 7N" },
      ]}
    />

    <MobileFilterField
      label="Budget Band"
      value={priceFilter}
      onChange={(value) => setPriceFilter(value as PriceFilter)}
      options={[
        { value: "all", label: "All budgets" },
        { value: "upto-40", label: "Up to ₹40K" },
        { value: "40-55", label: "₹40K to ₹55K" },
        { value: "55-plus", label: "₹55K+" },
      ]}
    />
  </div>
</div>

            <div className="grid gap-3 border-t border-slate-200 px-4 py-4">
              <button
                type="button"
                onClick={clearFilters}
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700"
              >
                Reset filters
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full rounded-full bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white"
              >
                Apply filters
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {detailPackage ? (
        <div className="fixed inset-0 z-50 bg-slate-950/50 px-2 pb-2 pt-8 backdrop-blur-sm sm:p-4">
          <div className="mx-auto flex h-full max-w-[94vw] flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl sm:max-w-5xl sm:rounded-[32px]">
            <div className="flex items-start justify-between border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">
                  Standard Package Detail
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950 sm:text-2xl">
                  {detailPackage.title}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {detailPackage.citySplit
                    .map((item) => `${item.nights}N ${item.city}`)
                    .join(" · ")}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseDetail}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                <div
  className={`rounded-[22px] bg-gradient-to-br ${detailPackage.accentFrom} ${detailPackage.accentTo} p-4 sm:rounded-[28px] sm:p-6`}
>
                  <p className="text-sm font-semibold text-slate-700">{detailPackage.subtitle}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {detailPackage.citySplit.map((item) => (
                      <span
                        key={`${detailPackage.id}-${item.city}`}
                        className="rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-slate-900"
                      >
                        {item.nights}N {item.city}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <DetailInfoCard label="Hotel" value={detailPackage.hotelCategory} />
                  <DetailInfoCard label="Transfers" value={detailPackage.transferType} />
                  <DetailInfoCard label="Meals" value={detailPackage.mealsLabel} />
                </div>

                <div className="mt-6">
                  <p className="text-lg font-semibold text-slate-950">Day-wise itinerary</p>
                  <p className="mt-1 text-sm text-slate-500">
                    This is the standard plan. Editing any day should move the trip into Personal
                    Custom.
                  </p>

                  <div className="mt-5 space-y-4">
                    {detailPackage.dayPlan.map((item) => (
                      <div
                        key={`${detailPackage.id}-day-${item.day}`}
                        className="rounded-[24px] border border-slate-200 bg-white p-5"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                              Day {item.day}
                            </div>
                            <h3 className="mt-3 text-lg font-semibold text-slate-950">
                              {item.title}
                            </h3>
                            <p className="mt-1 text-sm font-medium text-orange-700">
                              {item.city}
                            </p>
                            <p className="mt-3 text-sm leading-6 text-slate-600">
                              {item.description}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCustomizePackage(detailPackage.id)}
                            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
                          >
                            Modify day
                          </button>
                        </div>

                        <div className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                          {item.transfer ? <InfoBullet text={item.transfer} /> : null}
                          {item.hotel ? <InfoBullet text={item.hotel} /> : null}
                          {item.activities?.map((activity) => (
                            <InfoBullet key={activity} text={activity} />
                          ))}
                          {item.meals?.map((meal) => (
                            <InfoBullet key={meal} text={meal} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="border-t border-slate-200 bg-slate-50 px-4 py-4 lg:border-l lg:border-t-0 lg:px-5 lg:py-5">
  <div className="rounded-[20px] border border-slate-200 bg-white p-4 sm:rounded-[24px] sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
          Current estimate
        </p>
        <p className="mt-2 text-3xl font-semibold leading-none text-slate-950">
          {formatINR(detailPackage.pricing.totalPrice)}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          {formatINR(detailPackage.pricing.pricePerPerson)} / person
        </p>
      </div>
    </div>

    <div className="mt-3 rounded-full bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600">
      {formatLongDate(departureDate)} · {totalTravellers} guest
      {totalTravellers > 1 ? "s" : ""} · {rooms} room
      {rooms > 1 ? "s" : ""}
    </div>

    <div className="mt-4 grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => {
          handleSelectPackage(detailPackage.id);
          handleCloseDetail();
        }}
        className="rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Choose
      </button>
      <button
        type="button"
        onClick={() => handleCustomizePackage(detailPackage.id)}
        className="rounded-full border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
      >
        Customize
      </button>
    </div>
  </div>
</aside>
            </div>
          </div>
        </div>
      ) : null}

      {selectedPackage ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">
                {selectedPackage.title}
              </p>
              <p className="text-sm text-slate-500">
                {formatINR(selectedPackage.pricing.totalPrice)}
              </p>
            </div>

            <button
              type="button"
              onClick={handleContinueBooking}
              className="shrink-0 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Continue
            </button>
          </div>
        </div>
      ) : null}

      {!mobileSearchOpen && !mobileFiltersOpen ? <PublicFooter /> : null}
    </div>
  );
}

function SearchSelect({
  label,
  value,
  onChange,
  options,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; description?: string }>;
  icon: ReactNode;
}) {
  const selected = options.find((item) => item.value === value) ?? options[0];

  return (
    <label className="rounded-[24px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <span className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {icon}
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-transparent text-sm font-semibold text-slate-950 outline-none"
      >
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      {selected.description ? (
        <p className="mt-1 text-xs text-slate-500">{selected.description}</p>
      ) : null}
    </label>
  );
}

function SearchDateField({
  label,
  value,
  onChange,
  min,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  icon: ReactNode;
}) {
  return (
    <label className="rounded-[24px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <span className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {icon}
        {label}
      </span>
      <input
        type="date"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm font-semibold text-slate-950 outline-none"
      />
      <p className="mt-1 text-xs text-slate-500">Only future departures</p>
    </label>
  );
}

function GuestsField({
  adults,
  children,
  rooms,
  setAdults,
  setChildren,
  setRooms,
}: {
  adults: number;
  children: number;
  rooms: number;
  setAdults: (value: number) => void;
  setChildren: (value: number) => void;
  setRooms: (value: number) => void;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        <Users className="h-4 w-4" />
        Rooms & Guests
      </div>

      <div className="grid grid-cols-3 gap-2">
        <CounterMini
          label="Adults"
          value={adults}
          onMinus={() => setAdults(clampMinimum(adults - 1, 1))}
          onPlus={() => setAdults(adults + 1)}
        />
        <CounterMini
          label="Children"
          value={children}
          onMinus={() => setChildren(clampMinimum(children - 1, 0))}
          onPlus={() => setChildren(children + 1)}
        />
        <CounterMini
          label="Rooms"
          value={rooms}
          onMinus={() => setRooms(clampMinimum(rooms - 1, 1))}
          onPlus={() => setRooms(rooms + 1)}
        />
      </div>
    </div>
  );
}

function CounterMini({
  label,
  value,
  onMinus,
  onPlus,
}: {
  label: string;
  value: number;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <div className="rounded-[18px] bg-slate-50 px-2.5 py-2.5">
      <div className="mb-1 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </div>
      <div className="flex items-center justify-between gap-1">
        <button
          type="button"
          onClick={onMinus}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="text-sm font-semibold text-slate-950">{value}</span>
        <button
          type="button"
          onClick={onPlus}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function FilterCard({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-transparent text-sm font-semibold text-slate-950 outline-none"
      >
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ModeCard({
  active,
  title,
  description,
  onClick,
  icon,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[22px] border p-4 text-left transition sm:rounded-[30px] sm:p-5 ${
        active
          ? "border-orange-200 bg-orange-50 shadow-[0_12px_34px_rgba(249,115,22,0.10)]"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="rounded-full bg-slate-100 p-3 text-slate-700">{icon}</div>
        <div>
          <p className="text-base font-semibold text-slate-950 sm:text-lg">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
    </button>
  );
}

function FactPill({ label }: { label: string }) {
  return (
    <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-medium text-slate-700">
      {label}
    </div>
  );
}

function InfoBullet({ text }: { text: string }) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
      <span className="min-w-0 break-words">{text}</span>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[18px] border border-slate-100 bg-white px-4 py-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}

function DetailInfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function MobileSelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; description?: string }>;
}) {
  const selected = options.find((item) => item.value === value) ?? options[0];

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>

      <div className="mt-2 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-transparent text-base font-semibold text-slate-950 outline-none"
        >
          {options.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {selected.description ? (
        <p className="mt-2 text-sm text-slate-500">{selected.description}</p>
      ) : null}
    </div>
  );
}

function MobileDateField({
  label,
  value,
  onChange,
  min,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  helper?: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>

      <div className="mt-2 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
        <input
          type="date"
          value={value}
          min={min}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-base font-semibold text-slate-950 outline-none"
        />
      </div>

      {helper ? <p className="mt-2 text-sm text-slate-500">{helper}</p> : null}
    </div>
  );
}

function MobileFilterField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>

      <div className="mt-2 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-transparent text-base font-semibold text-slate-950 outline-none"
        >
          {options.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function MobileGuestsField({
  adults,
  children,
  rooms,
  setAdults,
  setChildren,
  setRooms,
}: {
  adults: number;
  children: number;
  rooms: number;
  setAdults: (value: number) => void;
  setChildren: (value: number) => void;
  setRooms: (value: number) => void;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        Rooms & Guests
      </div>

      <div className="grid grid-cols-3 gap-2">
        <CounterMini
          label="Adults"
          value={adults}
          onMinus={() => setAdults(clampMinimum(adults - 1, 1))}
          onPlus={() => setAdults(adults + 1)}
        />
        <CounterMini
          label="Children"
          value={children}
          onMinus={() => setChildren(clampMinimum(children - 1, 0))}
          onPlus={() => setChildren(children + 1)}
        />
        <CounterMini
          label="Rooms"
          value={rooms}
          onMinus={() => setRooms(clampMinimum(rooms - 1, 1))}
          onPlus={() => setRooms(rooms + 1)}
        />
      </div>
    </div>
  );
}

export default TripBuilderShell;