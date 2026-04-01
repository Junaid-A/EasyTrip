"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Check,
  ChevronRight,
  Filter,
  MapPin,
  Minus,
  Plane,
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

type DurationFilter = "all" | "4-5" | "6-7" | "8-9" | "10-11";
type PriceFilter = "all" | "upto-40" | "40-55" | "55-75" | "75-plus";
type HotelFilter = "all" | "3 Star" | "4 Star";
type FlightFilter = "all" | "with-flight" | "without-flight";
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
  rooms: number,
  flightSelectionValue: 0 | 1
) {
  const adultTotal = pkg.basePricePerPerson * adults;
  const childTotal = Math.round(pkg.basePricePerPerson * 0.72 * children);
  const roomAdjustment = Math.max(0, rooms - 1) * 3500;
  const serviceFee = Math.max(
    3000,
    Math.round((adultTotal + childTotal + roomAdjustment) * 0.05)
  );

  const total =
    adultTotal + childTotal + roomAdjustment + serviceFee + flightSelectionValue;

  return {
    pricePerPerson: pkg.basePricePerPerson,
    totalPrice: Math.round(total),
    serviceFee,
    flightSelectionValue,
  };
}

function buildSegments(
  citySplit: StandardPackage["citySplit"],
  departureDate: string
) {
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

function buildStorePricingBreakdown(
  totalPrice: number,
  serviceFee: number,
  flightSelectionValue: 0 | 1
) {
  const subtotal = Math.max(totalPrice - serviceFee - flightSelectionValue, 0);

  const hotelTotal = Math.round(subtotal * 0.46);
  const transferTotal = Math.round(subtotal * 0.1);
  const sightseeingTotal = Math.round(subtotal * 0.14);
  const mealsTotal = Math.round(subtotal * 0.08);
  const basePackage =
    subtotal - hotelTotal - transferTotal - sightseeingTotal - mealsTotal;

  return {
    basePackage,
    flightTotal: flightSelectionValue,
    hotelTotal,
    transferTotal,
    sightseeingTotal,
    mealsTotal,
    grandTotal: totalPrice,
  };
}

function matchesDuration(pkg: StandardPackage, durationFilter: DurationFilter) {
  if (durationFilter === "all") return true;
  if (durationFilter === "4-5") return pkg.durationNights >= 4 && pkg.durationNights <= 5;
  if (durationFilter === "6-7") return pkg.durationNights >= 6 && pkg.durationNights <= 7;
  if (durationFilter === "8-9") return pkg.durationNights >= 8 && pkg.durationNights <= 9;
  return pkg.durationNights >= 10 && pkg.durationNights <= 11;
}

function matchesPrice(pkg: StandardPackage, priceFilter: PriceFilter) {
  if (priceFilter === "all") return true;
  if (priceFilter === "upto-40") return pkg.basePricePerPerson <= 40000;
  if (priceFilter === "40-55")
    return pkg.basePricePerPerson > 40000 && pkg.basePricePerPerson <= 55000;
  if (priceFilter === "55-75")
    return pkg.basePricePerPerson > 55000 && pkg.basePricePerPerson <= 75000;
  return pkg.basePricePerPerson > 75000;
}

function matchesHotel(pkg: StandardPackage, hotelFilter: HotelFilter) {
  return hotelFilter === "all" ? true : pkg.hotelCategory === hotelFilter;
}

function matchesFlight(pkg: StandardPackage, flightFilter: FlightFilter) {
  if (flightFilter === "all") return true;
  if (flightFilter === "with-flight") return pkg.includedFlights;
  return !pkg.includedFlights;
}

const defaultRepresentativeByFamily = new Map(
  standardPackages
    .filter((pkg) => pkg.hotelCategory === "4 Star" && !pkg.includedFlights)
    .map((pkg) => [pkg.packageFamilyId, pkg])
);

export function TripBuilderShell() {
  const router = useRouter();

  const setTripDetails = useTripBuilderStore((state) => state.setTripDetails);
  const setTravelers = useTripBuilderStore((state) => state.setTravelers);
  const selectPackage = useTripBuilderStore((state) => state.selectPackage);
  const setTotals = useTripBuilderStore((state) => state.setTotals);
  const setDayPlans = useTripBuilderStore((state) => state.setDayPlans);

  const [mode, setMode] = useState<BuilderMode>("standard");
  const [activeCategory, setActiveCategory] = useState<PackageCategory>("all");
  const [hotelFilter, setHotelFilter] = useState<HotelFilter>("all");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [flightFilter, setFlightFilter] = useState<FlightFilter>("all");

  const [departureCityId, setDepartureCityId] = useState("dep-bangalore");
  const [destinationCity, setDestinationCity] = useState("Bangkok");
  const [departureDate, setDepartureDate] = useState(getTomorrowISODate());

  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [detailPackageId, setDetailPackageId] = useState<string | null>(null);
  const [customSeedPackageId, setCustomSeedPackageId] = useState<string | null>(null);

  const [flightModalFamilyId, setFlightModalFamilyId] = useState<string | null>(null);

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const selectedDepartureCity =
    departureCities.find((item) => item.id === departureCityId) ?? departureCities[0];

  const totalTravellers = getTotalTravellers(adults, children);

  const filteredVariants = useMemo(() => {
    return standardPackages.filter((pkg) => {
      const categoryMatch =
        activeCategory === "all" ? true : pkg.category.includes(activeCategory);

      return (
        categoryMatch &&
        matchesHotel(pkg, hotelFilter) &&
        matchesDuration(pkg, durationFilter) &&
        matchesPrice(pkg, priceFilter) &&
        matchesFlight(pkg, flightFilter)
      );
    });
  }, [activeCategory, hotelFilter, durationFilter, priceFilter, flightFilter]);

  const familyCards = useMemo(() => {
    const familyIds = [...new Set(filteredVariants.map((pkg) => pkg.packageFamilyId))];

    return familyIds
      .map((familyId) => {
        const familyVariants = standardPackages.filter(
          (pkg) => pkg.packageFamilyId === familyId
        );

        const preferred =
          familyVariants.find(
            (pkg) =>
              matchesHotel(pkg, hotelFilter) &&
              matchesDuration(pkg, durationFilter) &&
              matchesPrice(pkg, priceFilter) &&
              pkg.hotelCategory === "4 Star" &&
              !pkg.includedFlights
          ) ??
          familyVariants.find(
            (pkg) =>
              matchesHotel(pkg, hotelFilter) &&
              matchesDuration(pkg, durationFilter) &&
              matchesPrice(pkg, priceFilter)
          ) ??
          defaultRepresentativeByFamily.get(familyId) ??
          familyVariants[0];

        return {
          representative: preferred,
          variants: familyVariants,
          hasWithFlight: familyVariants.some((pkg) => pkg.includedFlights),
          hasWithoutFlight: familyVariants.some((pkg) => !pkg.includedFlights),
        };
      })
      .sort((a, b) => a.representative.basePricePerPerson - b.representative.basePricePerPerson);
  }, [filteredVariants, hotelFilter, durationFilter, priceFilter]);

  const selectedPackage =
    selectedPackageId != null
      ? standardPackages.find((pkg) => pkg.id === selectedPackageId) ?? null
      : null;

  const detailPackage =
    detailPackageId != null
      ? standardPackages.find((pkg) => pkg.id === detailPackageId) ?? null
      : null;

  const flightModalFamily =
    flightModalFamilyId != null
      ? familyCards.find((item) => item.representative.packageFamilyId === flightModalFamilyId) ??
        null
      : null;

  function syncPackageToStore(pkg: StandardPackage, flightSelectionValue: 0 | 1) {
    const segments = buildSegments(pkg.citySplit, departureDate);
    const endDate = segments.at(-1)?.checkOut ?? departureDate;
    const priced = calculatePackagePrice(pkg, adults, children, rooms, flightSelectionValue);
    const pricing = buildStorePricingBreakdown(
      priced.totalPrice,
      priced.serviceFee,
      flightSelectionValue
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
      priority: pkg.hotelCategory === "4 Star" ? "Better hotel" : "Balanced trip",
      serviceFee: priced.serviceFee,
    });

    setTravelers({ adults, children, rooms });
    setDayPlans(pkg.dayPlan);

    selectPackage({
      selectedPackageId: pkg.id,
      selectedPackageTitle: pkg.title,
      selectedPackagePrice: pricing.basePackage,
      selectedFlightMode: flightSelectionValue,
      selectedFlightLabel: flightSelectionValue === 1 ? "With Flight" : "Without Flight",
    });

    setTotals({
      estimatedFlightTotal: pricing.flightTotal,
      estimatedHotelTotal: pricing.hotelTotal,
      estimatedTransferTotal: pricing.transferTotal,
      estimatedSightseeingTotal: pricing.sightseeingTotal,
      estimatedMealsTotal: pricing.mealsTotal,
      estimatedGrandTotal: pricing.grandTotal,
    });
  }

  function openFlightChoice(familyId: string) {
    setFlightModalFamilyId(familyId);
  }

  function handleChooseFlightOption(flightSelectionValue: 0 | 1) {
    if (!flightModalFamily) return;

    const chosen =
      flightModalFamily.variants.find(
        (pkg) =>
          pkg.includedFlights === (flightSelectionValue === 1) &&
          (hotelFilter === "all" ? true : pkg.hotelCategory === hotelFilter)
      ) ??
      flightModalFamily.variants.find(
        (pkg) => pkg.includedFlights === (flightSelectionValue === 1)
      ) ??
      flightModalFamily.representative;

    setSelectedPackageId(chosen.id);
    syncPackageToStore(chosen, flightSelectionValue);
    setFlightModalFamilyId(null);
  }

  function handleOpenDetail(packageId: string) {
    setDetailPackageId(packageId);
  }

  function handleCustomizePackage(packageId: string) {
    const pkg =
      standardPackages.find((item) => item.id === packageId) ??
      standardPackages.find((item) => item.packageFamilyId === packageId);

    if (!pkg) return;

    setSelectedPackageId(pkg.id);
    setCustomSeedPackageId(pkg.id);
    syncPackageToStore(pkg, pkg.includedFlights ? 1 : 0);
    setMode("custom");
    setDetailPackageId(null);
  }

  function handleContinueBooking() {
    if (!selectedPackage) return;
    router.push("/customize");
  }

  function clearFilters() {
    setHotelFilter("all");
    setDurationFilter("all");
    setPriceFilter("all");
    setFlightFilter("all");
    setActiveCategory("all");
  }

  const categoryCounts = useMemo(() => {
    return categoryTabs.reduce<Record<string, number>>((acc, tab) => {
      if (tab.value === "all") {
        acc[tab.value] = [...new Set(standardPackages.map((pkg) => pkg.packageFamilyId))].length;
      } else {
        acc[tab.value] = [
          ...new Set(
            standardPackages
              .filter((pkg) => pkg.category.includes(tab.value))
              .map((pkg) => pkg.packageFamilyId)
          ),
        ].length;
      }
      return acc;
    }, {});
  }, []);

  const selectedPackageSummaryTotal = selectedPackage
    ? calculatePackagePrice(
        selectedPackage,
        adults,
        children,
        rooms,
        selectedPackage.includedFlights ? 1 : 0
      ).totalPrice
    : null;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#f7f3ee_0%,#f8fafc_48%,#ffffff_100%)] text-slate-950">
      {!mobileSearchOpen && !mobileFiltersOpen ? <PublicHeader /> : null}

      <main className="pb-32 pt-24 sm:pt-28 lg:pt-36">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="hidden overflow-hidden rounded-[36px] border border-black/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.94)_0%,rgba(254,247,237,0.9)_52%,rgba(255,255,255,0.95)_100%)] shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:block">
            <div className="border-b border-black/5 px-8 py-8">
              <div className="max-w-3xl">
                <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-700">
                  Thailand Planner
                </span>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
                  Cleaner package cards, better filters, and one flight choice before the next step.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                  Standard packages stay simple. Once a customer wants edits, move them into Custom.
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
                  options={[{ value: "Bangkok", label: "Bangkok", description: "Thailand" }]}
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
            <div className="rounded-[22px] border border-black/10 bg-white p-2.5 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setMobileSearchOpen(true)}
                  className="min-w-0 flex-1 rounded-[18px] bg-slate-50 px-4 py-3 text-left"
                >
                  <p className="truncate text-[15px] font-semibold text-slate-950">
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
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-slate-200 bg-white text-slate-700"
                >
                  <Filter className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-2 md:grid-cols-3">
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
            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
              <div className="min-w-0 space-y-6">
                <section className="min-w-0">
                  <div className="flex flex-col gap-2 border-b border-slate-200 pb-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-semibold text-slate-950 sm:text-2xl">
                          Standard Thailand packages
                        </h2>
                      </div>

                      <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 sm:inline-flex">
                        <Filter className="h-4 w-4" />
                        {familyCards.length} package families
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
                            {tab.label} ({categoryCounts[tab.value] ?? 0})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-3 rounded-[18px] border border-orange-100 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_100%)] px-4 py-2.5">
                    <p className="break-words text-sm font-semibold text-slate-900">
                      Departing from {selectedDepartureCity.city} · {selectedDepartureCity.airportCode}
                    </p>
                    <p className="mt-1 break-words text-sm text-slate-600">
                      Flight is asked only once when selecting the package.
                    </p>
                  </div>

                  <div className="mt-4 grid min-w-0 gap-5 lg:grid-cols-2">
                    {familyCards.map(({ representative, hasWithFlight, hasWithoutFlight }) => {
                      const isSelected =
                        selectedPackage?.packageFamilyId === representative.packageFamilyId;

                      const examplePrice = calculatePackagePrice(
                        representative,
                        adults,
                        children,
                        rooms,
                        0
                      );

                      return (
                        <article
                          key={representative.packageFamilyId}
                          className={`min-w-0 max-w-full overflow-hidden rounded-[28px] border bg-white transition-all duration-300 ${
                            isSelected
                              ? "border-orange-300 shadow-[0_0_0_2px_rgba(251,146,60,0.38),0_22px_52px_rgba(249,115,22,0.24),0_0_90px_rgba(251,146,60,0.26)] ring-1 ring-orange-300/80"
                              : "border-slate-200 shadow-[0_14px_30px_rgba(15,23,42,0.07)]"
                          }`}
                        >
                          <div className="relative h-40 overflow-hidden">
                            <img
                              src={
                                representative.image ||
                                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80"
                              }
                              alt={representative.title}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.02)_0%,rgba(15,23,42,0.18)_100%)]" />
                            <div className="absolute left-4 top-4 rounded-full bg-white/95 px-4 py-1.5 text-xs font-semibold text-slate-900">
                              {representative.badge}
                            </div>
                            {isSelected ? (
                              <div className="absolute right-4 top-4 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(249,115,22,0.32)]">
                                Selected
                              </div>
                            ) : null}
                          </div>

                          <div className="px-4 pb-4 pt-3.5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <h3 className="text-[1.6rem] font-semibold leading-[1.12] tracking-tight text-slate-950">
                                  {representative.title}
                                </h3>
                              </div>

                              <div className="shrink-0 text-right">
                                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                                  From
                                </p>
                                <p className="mt-1 text-3xl font-semibold leading-none text-slate-950">
                                  {formatINR(examplePrice.pricePerPerson)}
                                </p>
                                <p className="mt-1 text-sm text-slate-500">/ person</p>
                              </div>
                            </div>

                            <div className="mt-2.5 text-lg text-slate-700">
                              {representative.citySplit.map((item, index) => (
                                <span key={`${representative.id}-${item.city}`}>
                                  <span className="font-semibold">{item.nights}N</span>{" "}
                                  {item.city}
                                  {index < representative.citySplit.length - 1 ? " · " : ""}
                                </span>
                              ))}
                            </div>

                            <div className="mt-3 border-t border-slate-200" />

                            <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-1.5 text-base text-slate-700">
                              <CompactPointer
                                text={
                                  <>
                                    <strong>{representative.durationNights}N</strong> /{" "}
                                    <strong>{representative.durationDays}D</strong>
                                  </>
                                }
                              />
                              <CompactPointer text={<strong>{representative.hotelCategory}</strong>} />
                              <CompactPointer
                                text={
                                  <>
                                    <strong>{representative.activitiesCount}</strong> activities
                                  </>
                                }
                              />
                              <CompactPointer
                                text={
                                  hasWithFlight && hasWithoutFlight
                                    ? "With / without flight options"
                                    : hasWithFlight
                                    ? "With flight available"
                                    : "Without flight available"
                                }
                              />
                            </div>

                            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5 text-[15px]">
                              <IncludeTick text={representative.transferType} />
                              <IncludeTick text={representative.mealsLabel} />
                              <IncludeTick text={`${representative.hotelCategory} stay`} />
                              <IncludeTick text="Customization available next" />
                            </div>

                            <div className="mt-4 rounded-[20px] bg-[#e5e7eb] px-4 py-3.5">
                              <div className="flex items-end justify-between gap-3">
                                <div>
                                  <p className="text-sm text-slate-500">Trip Total</p>
                                  <p className="mt-1 text-2xl font-semibold leading-none text-slate-950">
                                    {formatINR(examplePrice.totalPrice)}
                                  </p>
                                </div>
                                <p className="text-xs text-slate-500">
                                  Per person shown above
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleOpenDetail(representative.id)}
                              className="mt-4 w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              View itinerary
                            </button>

                            <div className="mt-3 grid grid-cols-2 gap-3">
                              <button
                                type="button"
                                onClick={() => openFlightChoice(representative.packageFamilyId)}
                                className="rounded-full bg-slate-950 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-slate-800"
                              >
                                Choose package
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCustomizePackage(representative.id)}
                                className="rounded-full border border-orange-200 bg-orange-50 px-4 py-3.5 text-base font-semibold text-orange-700 transition hover:bg-orange-100"
                              >
                                Customize
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {familyCards.length === 0 ? (
                    <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-600">
                      No packages match the current filters. Adjust hotel class, trip length,
                      budget band, or flight filter.
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
                  options={[{ value: "Bangkok", label: "Bangkok", description: "Thailand" }]}
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
                  onChange={(value) => setHotelFilter(value as HotelFilter)}
                  options={[
                    { value: "all", label: "All hotels" },
                    { value: "3 Star", label: "3 Star" },
                    { value: "4 Star", label: "4 Star" },
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
                    { value: "8-9", label: "8N to 9N" },
                    { value: "10-11", label: "10N to 11N" },
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
                    { value: "55-75", label: "₹55K to ₹75K" },
                    { value: "75-plus", label: "₹75K+" },
                  ]}
                />

                <MobileFilterField
                  label="Flight"
                  value={flightFilter}
                  onChange={(value) => setFlightFilter(value as FlightFilter)}
                  options={[
                    { value: "all", label: "All" },
                    { value: "with-flight", label: "With Flight" },
                    { value: "without-flight", label: "Without Flight" },
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

      {flightModalFamily ? (
        <div className="fixed inset-0 z-[95] bg-slate-950/55 px-4 py-8 backdrop-blur-sm">
          <div className="mx-auto max-w-2xl rounded-[32px] bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600">
                  Flight Option
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950">
                  {flightModalFamily.representative.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Choose flight mode once. This is added to billing as{" "}
                  <span className="font-semibold text-slate-950">1</span> or{" "}
                  <span className="font-semibold text-slate-950">0</span>.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setFlightModalFamilyId(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleChooseFlightOption(1)}
                className="rounded-[24px] border border-sky-200 bg-sky-50 p-5 text-left transition hover:border-sky-300 hover:bg-sky-100"
              >
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-700">
                    <Plane className="h-3.5 w-3.5" />
                    With Flight
                  </div>
                  <div className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                    1
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleChooseFlightOption(0)}
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-slate-300 hover:bg-slate-100"
              >
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    <Plane className="h-3.5 w-3.5" />
                    Without Flight
                  </div>
                  <div className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                    0
                  </div>
                </div>
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
                onClick={() => setDetailPackageId(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                <div className="overflow-hidden rounded-[28px]">
                  <img
                    src={detailPackage.image}
                    alt={detailPackage.title}
                    className="h-64 w-full object-cover"
                  />
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <DetailInfoCard label="Hotel" value={detailPackage.hotelCategory} />
                  <DetailInfoCard label="Transfers" value={detailPackage.transferType} />
                  <DetailInfoCard
                    label="Flight Mode"
                    value={detailPackage.includedFlights ? "With Flight" : "Without Flight"}
                  />
                </div>

                <div className="mt-6">
                  <p className="text-lg font-semibold text-slate-950">Day-wise itinerary</p>

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
                          {item.transfer ? <PointRow text={item.transfer} /> : null}
                          {item.hotel ? <PointRow text={item.hotel} /> : null}
                          {item.activities?.map((activity) => (
                            <PointRow key={activity} text={activity} />
                          ))}
                          {item.meals?.map((meal) => (
                            <PointRow key={meal} text={meal} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="border-t border-slate-200 bg-slate-50 px-4 py-4 lg:border-l lg:border-t-0 lg:px-5 lg:py-5">
                <div className="rounded-[20px] border border-slate-200 bg-white p-4 sm:rounded-[24px] sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
                    Current estimate
                  </p>

                  <p className="mt-2 text-3xl font-semibold leading-none text-slate-950">
                    {formatINR(
                      calculatePackagePrice(
                        detailPackage,
                        adults,
                        children,
                        rooms,
                        detailPackage.includedFlights ? 1 : 0
                      ).totalPrice
                    )}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {formatINR(detailPackage.basePricePerPerson)} / person
                  </p>

                  <div className="mt-3 rounded-full bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600">
                    {formatLongDate(departureDate)} · {totalTravellers} guest
                    {totalTravellers > 1 ? "s" : ""} · {rooms} room
                    {rooms > 1 ? "s" : ""}
                  </div>

                  <div className="mt-4 grid gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailPackageId(null)}
                      className="rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Close
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

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto max-w-7xl rounded-[22px] border border-slate-200 bg-white px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
          {selectedPackage ? (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {selectedPackage.title}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {selectedPackage.citySplit
                    .map((item) => `${item.nights}N ${item.city}`)
                    .join(" · ")}
                </p>
                <p className="mt-1 text-base font-semibold text-slate-950">
                  {selectedPackageSummaryTotal != null
                    ? formatINR(selectedPackageSummaryTotal)
                    : "—"}
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
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-950">
                  {familyCards.length} packages available
                </p>
                <p className="text-xs text-slate-500">
                  Select a package to continue
                </p>
              </div>

              <button
                type="button"
                onClick={() => window.scrollTo({ top: 900, behavior: "smooth" })}
                className="shrink-0 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                View packages
              </button>
            </div>
          )}
        </div>
      </div>

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
      className={`rounded-[20px] border px-4 py-3.5 text-left transition sm:rounded-[24px] sm:px-5 sm:py-4 ${
        active
          ? "border-orange-200 bg-orange-50 shadow-[0_8px_20px_rgba(249,115,22,0.08)]"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-lg font-semibold leading-none text-slate-950">
            {title}
          </p>
          <p className="mt-2 text-sm leading-none text-slate-600">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

function PointRow({ text }: { text: string }) {
  return (
    <div className="flex min-w-0 items-start gap-2 rounded-[16px] border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
      <span className="min-w-0 break-words">{text}</span>
    </div>
  );
}

function CompactPointer({ text }: { text: ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-orange-500" />
      <span className="min-w-0 break-words leading-6">{text}</span>
    </div>
  );
}

function IncludeTick({ text }: { text: string }) {
  return (
    <div className="inline-flex min-w-0 items-center gap-2.5">
      <Check className="h-4.5 w-4.5 shrink-0 text-emerald-700" />
      <span className="min-w-0 break-words leading-5 text-emerald-700">{text}</span>
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