"use client";

import { useRouter } from "next/navigation";
import { standardPackages, type StandardPackage } from "@/lib/mock/bangkok-builder-data";
import { useTripBuilderStore } from "@/store/useTripBuilderStore";

type ReadyPackagesFlowProps = {
  adults?: number;
  children?: number;
  rooms?: number;
  startDate?: string;
  departureAirportCode?: string;
  destination?: string;
  budget?: string;
  tripStyle?: string;
};

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
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
    totalPrice: Math.round(total),
    serviceFee,
    flightTotal,
    pricePerPerson:
      pkg.basePricePerPerson +
      (includedFlights ? getFlightAddOn(departureAirportCode, true) : 0),
  };
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

function choosePackages(params: {
  budget: string;
  tripStyle: string;
}) {
  const normalizedBudget = params.budget.toLowerCase();
  const normalizedStyle = params.tripStyle.toLowerCase();

  let pool = standardPackages.filter((pkg) => !pkg.includedFlights);

  if (normalizedBudget.includes("luxury") || normalizedBudget.includes("premium")) {
    pool = pool.filter((pkg) => pkg.hotelCategory === "4 Star");
  }

  if (normalizedStyle.includes("family")) {
    const familyPool = pool.filter((pkg) => pkg.category.includes("family"));
    if (familyPool.length) pool = familyPool;
  }

  if (normalizedStyle.includes("romantic") || normalizedStyle.includes("couple")) {
    const romanticPool = pool.filter((pkg) => pkg.category.includes("honeymoon"));
    if (romanticPool.length) pool = romanticPool;
  }

  return pool.slice(0, 3);
}

export function ReadyPackagesFlow({
  adults = 2,
  children = 0,
  rooms = 1,
  startDate = "",
  departureAirportCode = "BLR",
  destination = "Bangkok",
  budget = "medium",
  tripStyle = "balanced",
}: ReadyPackagesFlowProps) {
  const router = useRouter();

  const setTripDetails = useTripBuilderStore((state) => state.setTripDetails);
  const setSelectedMode = useTripBuilderStore((state) => state.setSelectedMode);
  const setBudget = useTripBuilderStore((state) => state.setBudget);
  const setMood = useTripBuilderStore((state) => state.setMood);
  const setTravelStyle = useTripBuilderStore((state) => state.setTravelStyle);
  const setTravellingWith = useTripBuilderStore((state) => state.setTravellingWith);
  const setPriority = useTripBuilderStore((state) => state.setPriority);
  const setTravelers = useTripBuilderStore((state) => state.setTravelers);
  const setDayPlans = useTripBuilderStore((state) => state.setDayPlans);
  const selectPackage = useTripBuilderStore((state) => state.selectPackage);
  const setTotals = useTripBuilderStore((state) => state.setTotals);

  const cards = choosePackages({ budget, tripStyle });

  function handleSelect(pkg: StandardPackage) {
    const priced = calculatePackagePrice({
      pkg,
      adults,
      children,
      rooms,
      departureAirportCode,
      includedFlights: false,
    });

    const pricing = buildStorePricingBreakdown(
      priced.totalPrice,
      priced.serviceFee,
      priced.flightTotal
    );

    const segments = buildSegments(pkg.citySplit, startDate);
    const endDate = segments.at(-1)?.checkOut ?? startDate;

    const travellingWith =
      adults >= 2 && children === 0 ? "Couple" : children > 0 ? "Family" : "Group";

    setSelectedMode("standard");
    setBudget(budget);
    setMood(
      pkg.category.includes("honeymoon")
        ? "Romantic"
        : pkg.category.includes("family")
        ? "Family Fun"
        : "Balanced"
    );
    setTravelStyle(tripStyle);
    setTravellingWith(travellingWith);
    setPriority(pkg.hotelCategory === "4 Star" ? "Better hotel" : "Balanced trip");

    setTripDetails({
      selectedMode: "standard",
      destination,
      destinationId: "dest-bangkok",
      segments,
      travelDates:
        startDate && endDate
          ? `${formatLongDate(startDate)} - ${formatLongDate(endDate)}`
          : "",
      nights: `${pkg.durationNights} Nights`,
      budget,
      travelStyle: tripStyle,
      travellingWith,
      priority: pkg.hotelCategory === "4 Star" ? "Better hotel" : "Balanced trip",
      serviceFee: priced.serviceFee,
    });

    setTravelers({ adults, children, rooms });
    setDayPlans(pkg.dayPlan);

    selectPackage({
      selectedPackageId: pkg.id,
      selectedPackageTitle: pkg.title,
      selectedPackagePrice: pricing.basePackage,
      selectedFlightMode: 0,
      selectedFlightLabel: "Without Flight",
    });

    setTotals({
      estimatedFlightTotal: pricing.flightTotal,
      estimatedHotelTotal: pricing.hotelTotal,
      estimatedTransferTotal: pricing.transferTotal,
      estimatedSightseeingTotal: pricing.sightseeingTotal,
      estimatedMealsTotal: pricing.mealsTotal,
      estimatedGrandTotal: pricing.grandTotal,
    });

    router.push("/review");
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Ready Packages
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Quick packages based on your selected dates, passengers, budget, and trip style.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((pkg) => {
          const priced = calculatePackagePrice({
            pkg,
            adults,
            children,
            rooms,
            departureAirportCode,
            includedFlights: false,
          });

          return (
            <div
              key={pkg.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="mb-2 inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                {pkg.badge}
              </div>

              <h4 className="text-base font-semibold text-slate-900">
                {pkg.title}
              </h4>

              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>
                  {pkg.durationNights}N / {pkg.durationDays}D
                </p>
                <p>{pkg.hotelCategory}</p>
                <p>{pkg.transferType}</p>
                <p>Budget: {budget}</p>
                <p>Style: {tripStyle}</p>
                {startDate ? <p>Travel: {formatLongDate(startDate)}</p> : null}
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <span className="text-lg font-bold text-slate-900">
                    {formatINR(priced.totalPrice)}
                  </span>
                  <p className="text-xs text-slate-500">without flights</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelect(pkg)}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Continue
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}