"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronRight,
  Filter,
  MapPin,
  Plane,
  Sparkles,
  Users,
  X,
  Check,
} from "lucide-react";

import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { AIGuidedFlow } from "@/components/trip-builder/ai-guided-flow";
import { CustomTripFlow } from "@/components/trip-builder/custom-trip-flow";
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

type FamilyCard = {
  representative: StandardPackage;
  variants: StandardPackage[];
  hasWithFlight: boolean;
  hasWithoutFlight: boolean;
};

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

function getFlightAddOn(departureAirportCode: string, includedFlights: boolean) {
  if (!includedFlights) return 0;

  const flightMap: Record<string, number> = {
    BLR: 16500,
    BOM: 18500,
    DEL: 21200,
    HYD: 17200,
    MAA: 16800,
    CCU: 19800,
    COK: 17500,
    AMD: 18600,
    PNQ: 17900,
    GOX: 17100,
    JAI: 19400,
    LKO: 20100,
    IXC: 20500,
    IDR: 18700,
    NAG: 18400,
    VTZ: 17700,
    CJB: 16900,
    TRV: 17600,
    BBI: 18800,
    GAU: 21400,
  };

  return flightMap[departureAirportCode] ?? 18200;
}

function calculatePackagePrice(params: {
  pkg: StandardPackage;
  adults: number;
  children: number;
  rooms: number;
  departureAirportCode: string;
  includedFlights: boolean;
}) {
  const { pkg, adults, children, rooms, departureAirportCode, includedFlights } = params;

  const adultTotal = pkg.basePricePerPerson * adults;
  const childTotal = Math.round(pkg.basePricePerPerson * 0.72 * children);
  const roomAdjustment = Math.max(0, rooms - 1) * 3500;
  const flightTotal = getFlightAddOn(departureAirportCode, includedFlights) * (adults + children);
  const serviceFee = Math.max(
    3000,
    Math.round((adultTotal + childTotal + roomAdjustment + flightTotal) * 0.05)
  );

  const total = adultTotal + childTotal + roomAdjustment + flightTotal + serviceFee;

  return {
    pricePerPerson:
      pkg.basePricePerPerson +
      (includedFlights ? getFlightAddOn(departureAirportCode, true) : 0),
    totalPrice: Math.round(total),
    serviceFee,
    flightTotal,
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

function buildStorePricingBreakdown(totalPrice: number, serviceFee: number, flightTotal: number) {
  const subtotal = Math.max(totalPrice - serviceFee - flightTotal, 0);

  const hotelTotal = Math.round(subtotal * 0.46);
  const transferTotal = Math.round(subtotal * 0.1);
  const sightseeingTotal = Math.round(subtotal * 0.14);
  const mealsTotal = Math.round(subtotal * 0.08);
  const basePackage = subtotal - hotelTotal - transferTotal - sightseeingTotal - mealsTotal;

  return {
    basePackage,
    flightTotal,
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
  const setSelectedMode = useTripBuilderStore((state) => state.setSelectedMode);
  const setBudget = useTripBuilderStore((state) => state.setBudget);
  const setMood = useTripBuilderStore((state) => state.setMood);
  const setTravelStyle = useTripBuilderStore((state) => state.setTravelStyle);
  const setTravellingWith = useTripBuilderStore((state) => state.setTravellingWith);
  const setPriority = useTripBuilderStore((state) => state.setPriority);
  const setSpecialRequest = useTripBuilderStore((state) => state.setSpecialRequest);
  const setAiPrompt = useTripBuilderStore((state) => state.setAiPrompt);
  const addAiChatMessage = useTripBuilderStore((state) => state.addAiChatMessage);
  const resetAiChat = useTripBuilderStore((state) => state.resetAiChat);
  const dayPlans = useTripBuilderStore((state) => state.dayPlans);
  const initializeCustomTripDays = useTripBuilderStore(
    (state) => state.initializeCustomTripDays
  );
  const selectedPackageTitleFromStore = useTripBuilderStore(
    (state) => state.selectedPackageTitle
  );

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
  const [pendingPackageSource, setPendingPackageSource] = useState<"standard" | "ai">(
    "standard"
  );

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const selectedDepartureCity =
    departureCities.find((item) => item.id === departureCityId) ?? departureCities[0];

  useEffect(() => {
    if (mode === "custom") {
      initializeCustomTripDays(dayPlans);
    }
  }, [mode, dayPlans, initializeCustomTripDays]);

  const filteredVariants = useMemo(() => {
    return standardPackages.filter((pkg) => {
      const categoryMatch = activeCategory === "all" ? true : pkg.category.includes(activeCategory);

      return (
        categoryMatch &&
        matchesHotel(pkg, hotelFilter) &&
        matchesDuration(pkg, durationFilter) &&
        matchesPrice(pkg, priceFilter) &&
        matchesFlight(pkg, flightFilter)
      );
    });
  }, [activeCategory, hotelFilter, durationFilter, priceFilter, flightFilter]);

  const familyCards = useMemo<FamilyCard[]>(() => {
    const familyIds = [...new Set(filteredVariants.map((pkg) => pkg.packageFamilyId))];

    return familyIds
      .map((familyId) => {
        const familyVariants = standardPackages.filter((pkg) => pkg.packageFamilyId === familyId);

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
      ? familyCards.find(
          (item) => item.representative.packageFamilyId === flightModalFamilyId
        ) ?? null
      : null;

  const selectedPackageSummaryTotal = selectedPackage
    ? calculatePackagePrice({
        pkg: selectedPackage,
        adults,
        children,
        rooms,
        departureAirportCode: selectedDepartureCity.airportCode,
        includedFlights: selectedPackage.includedFlights,
      }).totalPrice
    : null;

  const categoryCounts = useMemo(() => {
    return categoryTabs.reduce<Record<string, number>>((acc, tab) => {
      if (tab.value === "all") {
        acc[tab.value] = [...new Set(standardPackages.map((pkg) => pkg.packageFamilyId))]
          .length;
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

  function syncPackageToStore(pkg: StandardPackage, includedFlights: boolean) {
    const segments = buildSegments(pkg.citySplit, departureDate);
    const endDate = segments.at(-1)?.checkOut ?? departureDate;

    const priced = calculatePackagePrice({
      pkg,
      adults,
      children,
      rooms,
      departureAirportCode: selectedDepartureCity.airportCode,
      includedFlights,
    });

    const pricing = buildStorePricingBreakdown(
      priced.totalPrice,
      priced.serviceFee,
      priced.flightTotal
    );

    const derivedBudget =
      priced.pricePerPerson <= 40000
        ? "Comfort"
        : priced.pricePerPerson <= 65000
        ? "Premium"
        : "Luxury";

    const derivedMood =
      activeCategory === "honeymoon"
        ? "Romantic"
        : activeCategory === "family"
        ? "Family Fun"
        : activeCategory === "beach"
        ? "Relaxed"
        : "Balanced";

    const derivedTravelStyle =
      pkg.hotelCategory === "4 Star" ? "Easy & Comfortable" : "Balanced";

    const travellingWith =
      adults >= 2 && children === 0 ? "Couple" : children > 0 ? "Family" : "Group";

    setTripDetails({
      selectedMode: mode,
      destination: destinationCity,
      destinationId: "dest-bangkok",
      segments,
      travelDates: `${formatLongDate(departureDate)} - ${formatLongDate(endDate)}`,
      nights: `${pkg.durationNights} Nights`,
      budget: derivedBudget,
      mood: derivedMood,
      travelStyle: derivedTravelStyle,
      travellingWith,
      priority: pkg.hotelCategory === "4 Star" ? "Better hotel" : "Balanced trip",
      serviceFee: priced.serviceFee,
    });

    setSelectedMode(mode);
    setBudget(derivedBudget);
    setMood(derivedMood);
    setTravelStyle(derivedTravelStyle);
    setTravellingWith(travellingWith);
    setPriority(pkg.hotelCategory === "4 Star" ? "Better hotel" : "Balanced trip");

    setTravelers({ adults, children, rooms });
    setDayPlans(pkg.dayPlan);

    selectPackage({
      selectedPackageId: pkg.id,
      selectedPackageTitle: pkg.title,
      selectedPackagePrice: pricing.basePackage,
      selectedFlightMode: includedFlights ? 1 : 0,
      selectedFlightLabel: includedFlights ? "With Flight" : "Without Flight",
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

  function openFlightChoice(familyId: string, source: "standard" | "ai" = "standard") {
    setPendingPackageSource(source);
    setFlightModalFamilyId(familyId);
  }

  function handleChooseFlightOption(includedFlights: boolean) {
    if (!flightModalFamily) return;

    const chosen =
      flightModalFamily.variants.find(
        (pkg) =>
          pkg.includedFlights === includedFlights &&
          (hotelFilter === "all" ? true : pkg.hotelCategory === hotelFilter)
      ) ??
      flightModalFamily.variants.find((pkg) => pkg.includedFlights === includedFlights) ??
      flightModalFamily.representative;

    setSelectedPackageId(chosen.id);
    syncPackageToStore(chosen, includedFlights);
    setFlightModalFamilyId(null);

    if (pendingPackageSource === "ai") {
      setMode("standard");
    }
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
    syncPackageToStore(pkg, pkg.includedFlights);
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

  function handleAiPromptCommit(
    prompt: string,
    meta?: { mood?: string; budget?: string; priority?: string }
  ) {
    setAiPrompt(prompt);
    addAiChatMessage({
      id: `user-${Date.now()}`,
      role: "user",
      text: prompt,
    });

    if (meta?.mood) setMood(meta.mood);
    if (meta?.budget) setBudget(meta.budget);
    if (meta?.priority) setPriority(meta.priority);
    if (meta?.mood) setSpecialRequest(meta.mood);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#f7f3ee_0%,#f8fafc_48%,#ffffff_100%)] text-slate-950">
      {!mobileSearchOpen && !mobileFiltersOpen ? <PublicHeader /> : null}

      <main className="pb-40 pt-24 sm:pt-28 lg:pt-36">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="hidden overflow-hidden rounded-[36px] border border-black/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.94)_0%,rgba(254,247,237,0.9)_52%,rgba(255,255,255,0.95)_100%)] shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:block">
            <div className="border-b border-black/5 px-8 py-8">
              <div className="max-w-3xl">
                <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-700">
                  Thailand Planner
                </span>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
                  Standard, AI Assist, and fully custom trip planning in one smooth flow.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                  AI Assist now works like a guided planning chat mockup with prompt chips and
                  Surprise Me recommendations. Flights are still asked only once when selecting a
                  package.
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
            <div className="rounded-[20px] border border-black/10 bg-white p-2 shadow-[0_8px_22px_rgba(15,23,42,0.05)]">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setMobileSearchOpen(true)}
                  className="min-w-0 flex-1 rounded-[16px] bg-slate-50 px-4 py-2.5 text-left"
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
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-slate-200 bg-white text-slate-700"
                >
                  <Filter className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="-mx-1 mt-4 flex gap-3 overflow-x-auto px-1 pb-1 sm:justify-center sm:overflow-visible">
            <ModeCircle
              active={mode === "standard"}
              title="Standard"
              subtitle="Ready"
              onClick={() => setMode("standard")}
              icon={<MapPin className="h-5 w-5" />}
            />
            <ModeCircle
              active={mode === "ai"}
              title="AI Assist"
              subtitle="Guided"
              onClick={() => setMode("ai")}
              icon={<Sparkles className="h-5 w-5" />}
            />
            <ModeCircle
              active={mode === "custom"}
              title="Custom"
              subtitle="Control"
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
                        <p className="mt-1 text-sm text-slate-600">
                          Clean package cards. Flight decision is asked only once when you choose a
                          package.
                        </p>
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

                  <div className="mt-3 rounded-[18px] border border-orange-100 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_100%)] px-4 py-3">
                    <p className="break-words text-sm font-semibold text-slate-900">
                      Departing from {selectedDepartureCity.city} ·{" "}
                      {selectedDepartureCity.airportCode}
                    </p>
                    <p className="mt-1 break-words text-sm text-slate-600">
                      Same departure details are also carried into AI Assist and Surprise Me.
                    </p>
                  </div>

                  <div className="mt-4 grid min-w-0 gap-5 lg:grid-cols-2">
                    {familyCards.map(({ representative }) => {
                      const isSelected =
                        selectedPackage?.packageFamilyId === representative.packageFamilyId;

                      const examplePriceWithoutFlight = calculatePackagePrice({
                        pkg: representative,
                        adults,
                        children,
                        rooms,
                        departureAirportCode: selectedDepartureCity.airportCode,
                        includedFlights: false,
                      });

                      const examplePriceWithFlight = calculatePackagePrice({
                        pkg: representative,
                        adults,
                        children,
                        rooms,
                        departureAirportCode: selectedDepartureCity.airportCode,
                        includedFlights: true,
                      });

                      return (
                        <article
                          key={representative.packageFamilyId}
                          className={`min-w-0 max-w-full overflow-hidden rounded-[28px] border bg-white transition-all duration-300 ${
                            isSelected
                              ? "border-orange-300 shadow-[0_0_0_2px_rgba(251,146,60,0.38),0_22px_52px_rgba(249,115,22,0.24),0_0_90px_rgba(251,146,60,0.26)] ring-1 ring-orange-300/80"
                              : "border-slate-200 shadow-[0_14px_30px_rgba(15,23,42,0.07)]"
                          }`}
                        >
                          <div className="relative h-44 overflow-hidden">
                            <img
                              src={representative.image}
                              alt={representative.title}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.02)_0%,rgba(15,23,42,0.28)_100%)]" />
                            <div className="absolute left-4 top-4 rounded-full bg-white/95 px-4 py-1.5 text-xs font-semibold text-slate-900">
                              {representative.badge}
                            </div>
                            {isSelected ? (
                              <div className="absolute right-4 top-4 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(249,115,22,0.32)]">
                                Selected
                              </div>
                            ) : null}
                          </div>

                          <div className="px-4 pb-4 pt-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <h3 className="text-[1.5rem] font-semibold leading-[1.08] tracking-tight text-slate-950 sm:text-[1.6rem]">
                                  {representative.title}
                                </h3>
                              </div>

                              <div className="shrink-0 text-right">
                                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                                  From
                                </p>
                                <p className="mt-1 text-3xl font-semibold leading-none text-slate-950">
                                  {formatINR(examplePriceWithoutFlight.pricePerPerson)}
                                </p>
                                <p className="mt-1 text-sm text-slate-500">/ person</p>
                              </div>
                            </div>

                            <div className="mt-2 text-lg text-slate-700">
                              {representative.citySplit.map((item, index) => (
                                <span key={`${representative.id}-${item.city}`}>
                                  <span className="font-semibold">{item.nights}N</span>{" "}
                                  {item.city}
                                  {index < representative.citySplit.length - 1 ? " · " : ""}
                                </span>
                              ))}
                            </div>

                            <div className="mt-3 border-t border-slate-200 pt-4">
                              <div className="flex flex-wrap gap-3">
                                <div className="inline-flex min-w-[190px] items-center justify-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-5 py-3 text-base font-semibold text-orange-700">
                                  <Sparkles className="h-4 w-4" />
                                  {representative.activitiesCount} activities
                                </div>

                                <div className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-base font-semibold text-slate-700">
                                  {representative.durationNights}N /{" "}
                                  {representative.durationDays}D
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 grid gap-3 text-[15px]">
                              <IncludeTick text={representative.transferType} />
                              <IncludeTick text={representative.mealsLabel} />
                              <IncludeTick text={`${representative.hotelCategory} stay`} />
                              <IncludeTick text="Customization available next" />
                            </div>

                            <div className="mt-4 rounded-[20px] bg-[#dfe3e8] px-4 py-4">
                              <p className="text-sm text-slate-500">Trip Total</p>

                              <div className="mt-3 grid grid-cols-2 gap-3">
                                <div className="rounded-2xl bg-white/70 px-3 py-3">
                                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                    Without flight
                                  </p>
                                  <p className="mt-2 text-2xl font-semibold leading-none text-slate-950">
                                    {formatINR(examplePriceWithoutFlight.totalPrice)}
                                  </p>
                                </div>

                                <div className="rounded-2xl bg-white/70 px-3 py-3">
                                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                    With flight
                                  </p>
                                  <p className="mt-2 text-2xl font-semibold leading-none text-slate-950">
                                    {formatINR(examplePriceWithFlight.totalPrice)}
                                  </p>
                                </div>
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
                                onClick={() =>
                                  openFlightChoice(
                                    representative.packageFamilyId,
                                    "standard"
                                  )
                                }
                                className="rounded-full bg-slate-950 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-slate-800"
                              >
                                Choose package
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openFlightChoice(
                                    representative.packageFamilyId,
                                    "standard"
                                  )
                                }
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
                      <p className="mt-3 text-xl font-semibold text-slate-950">
                        {selectedPackageSummaryTotal
                          ? formatINR(selectedPackageSummaryTotal)
                          : "—"}
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

          {mode === "standard" && selectedPackage ? (
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur xl:hidden">
              <div className="mx-auto max-w-md">
                <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
                        Booking Summary
                      </p>
                      <p className="mt-1 truncate text-sm font-semibold text-slate-950">
                        {selectedPackage.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {selectedPackage.citySplit
                          .map((item) => `${item.nights}N ${item.city}`)
                          .join(" · ")}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        Total
                      </p>
                      <p className="mt-1 text-xl font-semibold leading-none text-slate-950">
                        {selectedPackageSummaryTotal
                          ? formatINR(selectedPackageSummaryTotal)
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleContinueBooking}
                    className="mt-4 w-full rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Continue booking
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {mode === "ai" && (
            <section className="mt-6">
              <AIGuidedFlow
                departureCityLabel={`${selectedDepartureCity.city} · ${selectedDepartureCity.airportCode}`}
                departureDate={departureDate}
                destinationCity={destinationCity}
                adults={adults}
                children={children}
                rooms={rooms}
                onResetConversation={() => resetAiChat()}
              />
            </section>
          )}

          {mode === "custom" && (
            <section className="mt-6 space-y-4">
              <div className="rounded-[28px] border border-orange-200 bg-orange-50 p-5">
                <p className="text-sm font-semibold text-orange-700">
                  Custom Trip Studio enabled
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Full control is now day-wise. Customers can edit hotel quality, choose
                  daily transfers, filter sightseeing by timing, select meals, add extras,
                  and review live pricing.
                </p>

                {customSeedPackageId || selectedPackageTitleFromStore ? (
                  <p className="mt-2 text-sm text-slate-700">
                    Starting from package:{" "}
                    <span className="font-semibold">
                      {standardPackages.find((pkg) => pkg.id === customSeedPackageId)
                        ?.title ??
                        selectedPackageTitleFromStore ??
                        "Selected package"}
                    </span>
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-slate-700">
                    Starting from scratch. You can build the trip day by day.
                  </p>
                )}
              </div>

              <CustomTripFlow />
            </section>
          )}
        </section>
      </main>

      {detailPackage ? (
        <PackageDetailModal
          pkg={detailPackage}
          departureAirportCode={selectedDepartureCity.airportCode}
          adults={adults}
          children={children}
          rooms={rooms}
          onClose={() => setDetailPackageId(null)}
          onChoose={() => {
            setSelectedPackageId(detailPackage.id);
            syncPackageToStore(detailPackage, detailPackage.includedFlights);
            setDetailPackageId(null);
            router.push("/results");
          }}
          onCustomize={() => handleCustomizePackage(detailPackage.id)}
        />
      ) : null}

      {flightModalFamily ? (
        <FlightChoiceModal
          family={flightModalFamily}
          departureCityLabel={`${selectedDepartureCity.city} · ${selectedDepartureCity.airportCode}`}
          onClose={() => setFlightModalFamilyId(null)}
          onChoose={(includedFlights) => handleChooseFlightOption(includedFlights)}
          onCustomize={(includedFlights) => {
            const chosen =
              flightModalFamily.variants.find(
                (pkg) => pkg.includedFlights === includedFlights
              ) ?? flightModalFamily.representative;

            setSelectedPackageId(chosen.id);
            syncPackageToStore(chosen, includedFlights);
            setCustomSeedPackageId(chosen.id);
            setMode("custom");
            setFlightModalFamilyId(null);
          }}
        />
      ) : null}

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

      <PublicFooter />
    </div>
  );
}

function ModeCircle({
  active,
  title,
  subtitle,
  onClick,
  icon,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group shrink-0 rounded-full border px-4 py-3 transition ${
        active
          ? "border-orange-300 bg-orange-50 text-orange-700 shadow-[0_10px_25px_rgba(249,115,22,0.18)]"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            active ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-700"
          }`}
        >
          {icon}
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
    </button>
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
  return (
    <label className="rounded-[22px] border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {icon}
        {label}
      </div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full bg-transparent text-sm font-semibold text-slate-950 outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
  min: string;
  icon: ReactNode;
}) {
  return (
    <label className="rounded-[22px] border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {icon}
        {label}
      </div>
      <input
        type="date"
        value={value}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full bg-transparent text-sm font-semibold text-slate-950 outline-none"
      />
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
    <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        <Users className="h-4 w-4" />
        Guests & Rooms
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <MiniCounter label="Adults" value={adults} setValue={setAdults} min={1} />
        <MiniCounter label="Children" value={children} setValue={setChildren} min={0} />
        <MiniCounter label="Rooms" value={rooms} setValue={setRooms} min={1} />
      </div>
    </div>
  );
}

function MiniCounter({
  label,
  value,
  setValue,
  min,
}: {
  label: string;
  value: number;
  setValue: (value: number) => void;
  min: number;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 px-2 py-2">
      <p className="text-[11px] text-slate-500">{label}</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setValue(Math.max(min, value - 1))}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-sm"
        >
          -
        </button>
        <span className="text-sm font-semibold text-slate-950">{value}</span>
        <button
          type="button"
          onClick={() => setValue(value + 1)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-sm"
        >
          +
        </button>
      </div>
    </div>
  );
}

function IncludeTick({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-emerald-700">
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
        <Check className="h-3.5 w-3.5" />
      </span>
      <span>{text}</span>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 px-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}

function PackageDetailModal({
  pkg,
  departureAirportCode,
  adults,
  children,
  rooms,
  onClose,
  onChoose,
  onCustomize,
}: {
  pkg: StandardPackage;
  departureAirportCode: string;
  adults: number;
  children: number;
  rooms: number;
  onClose: () => void;
  onChoose: () => void;
  onCustomize: () => void;
}) {
  const priceWithoutFlight = calculatePackagePrice({
    pkg,
    adults,
    children,
    rooms,
    departureAirportCode,
    includedFlights: false,
  });

  const priceWithFlight = calculatePackagePrice({
    pkg,
    adults,
    children,
    rooms,
    departureAirportCode,
    includedFlights: true,
  });

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/50 p-4">
      <div className="mx-auto max-h-[90vh] max-w-4xl overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
        <div className="relative h-56 overflow-hidden">
          <img src={pkg.image} alt={pkg.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.12)_0%,rgba(15,23,42,0.48)_100%)]" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="absolute bottom-5 left-5 right-5">
            <span className="inline-flex rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-900">
              {pkg.badge}
            </span>
            <h3 className="mt-3 text-2xl font-semibold text-white">{pkg.title}</h3>
            <p className="mt-1 text-white/85">{pkg.subtitle}</p>
          </div>
        </div>

        <div className="max-h-[calc(90vh-224px)] overflow-y-auto px-5 py-5">
          <div className="grid gap-4 md:grid-cols-3">
            <StatTile
              label="Route"
              value={pkg.citySplit.map((item) => `${item.nights}N ${item.city}`).join(" · ")}
            />
            <StatTile label="Stay" value={pkg.hotelCategory} />
            <StatTile label="Duration" value={`${pkg.durationNights}N / ${pkg.durationDays}D`} />
          </div>

          <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">Highlights</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {pkg.highlightList.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Itinerary
            </p>

            {pkg.dayPlan.map((day) => (
              <div
                key={`${pkg.id}-${day.day}`}
                className="rounded-[24px] border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
                      Day {day.day} · {day.city}
                    </p>
                    <h4 className="mt-1 text-lg font-semibold text-slate-950">{day.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{day.description}</p>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {day.transfer ? <SoftInfo title="Transfer" value={day.transfer} /> : null}
                  {day.hotel ? <SoftInfo title="Stay" value={day.hotel} /> : null}
                </div>

                {day.activities?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {day.activities.map((activity) => (
                      <span
                        key={activity}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700"
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[24px] bg-[#dfe3e8] p-4">
            <p className="text-sm text-slate-500">Pricing Summary</p>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/70 px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  Without flight
                </p>
                <p className="mt-2 text-2xl font-semibold leading-none text-slate-950">
                  {formatINR(priceWithoutFlight.totalPrice)}
                </p>
              </div>

              <div className="rounded-2xl bg-white/70 px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  With flight
                </p>
                <p className="mt-2 text-2xl font-semibold leading-none text-slate-950">
                  {formatINR(priceWithFlight.totalPrice)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onChoose}
              className="rounded-full bg-slate-950 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-slate-800"
            >
              Choose package
            </button>
            <button
              type="button"
              onClick={onCustomize}
              className="rounded-full border border-orange-200 bg-orange-50 px-4 py-3.5 text-base font-semibold text-orange-700 transition hover:bg-orange-100"
            >
              Customize this trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function SoftInfo({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function FlightChoiceModal({
  family,
  departureCityLabel,
  onClose,
  onChoose,
  onCustomize,
}: {
  family: FamilyCard;
  departureCityLabel: string;
  onClose: () => void;
  onChoose: (includedFlights: boolean) => void;
  onCustomize: (includedFlights: boolean) => void;
}) {
  const baseVariant =
    family.variants.find((item) => !item.includedFlights && item.hotelCategory === "4 Star") ??
    family.variants.find((item) => !item.includedFlights) ??
    family.representative;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/50 p-4">
      <div className="mx-auto max-w-xl rounded-[28px] bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
              Flight selection
            </p>
            <h3 className="mt-1 text-2xl font-semibold text-slate-950">
              {family.representative.title}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Departure route: {departureCityLabel} → Bangkok
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Ask this once here. Do not ask again inside itinerary.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onChoose(false)}
            className="rounded-[24px] border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
          >
            <div className="flex items-center gap-2">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  Choose without flights
                </p>
                <p className="text-xs text-slate-500">Land-only package</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-600">
              Use this for customer-owned ticketing or flexible airline choice.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onChoose(true)}
            className="rounded-[24px] border border-orange-200 bg-orange-50 p-4 text-left transition hover:bg-orange-100"
          >
            <div className="flex items-center gap-2">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white">
                <Plane className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">Choose with flights</p>
                <p className="text-xs text-slate-500">Package + flight pricing</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-600">
              Use this when customer wants bundled trip pricing with flights.
            </p>
          </button>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onCustomize(false)}
            className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Customize without flights
          </button>

          <button
            type="button"
            onClick={() => onCustomize(true)}
            className="rounded-full border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
          >
            Customize with flights
          </button>
        </div>

        <div className="mt-4 rounded-[20px] bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-950">
            {baseVariant.citySplit.map((item) => `${item.nights}N ${item.city}`).join(" · ")}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {baseVariant.hotelCategory} · {baseVariant.transferType}
          </p>
        </div>
      </div>
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
  return (
    <label className="block rounded-[24px] border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full bg-transparent text-base font-semibold text-slate-950 outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
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
  min: string;
  helper?: string;
}) {
  return (
    <label className="block rounded-[24px] border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <input
        type="date"
        value={value}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full bg-transparent text-base font-semibold text-slate-950 outline-none"
      />
      {helper ? <p className="mt-2 text-xs text-slate-500">{helper}</p> : null}
    </label>
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
    <div className="rounded-[24px] border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        Guests & Rooms
      </p>
      <div className="mt-3 space-y-3">
        <MobileCounter label="Adults" value={adults} setValue={setAdults} min={1} />
        <MobileCounter label="Children" value={children} setValue={setChildren} min={0} />
        <MobileCounter label="Rooms" value={rooms} setValue={setRooms} min={1} />
      </div>
    </div>
  );
}

function MobileCounter({
  label,
  value,
  setValue,
  min,
}: {
  label: string;
  value: number;
  setValue: (value: number) => void;
  min: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setValue(Math.max(min, value - 1))}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white"
        >
          -
        </button>
        <span className="min-w-[24px] text-center text-sm font-semibold text-slate-950">
          {value}
        </span>
        <button
          type="button"
          onClick={() => setValue(value + 1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white"
        >
          +
        </button>
      </div>
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
    <label className="block rounded-[24px] border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full bg-transparent text-base font-semibold text-slate-950 outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default TripBuilderShell;