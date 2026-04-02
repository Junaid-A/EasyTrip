"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ClipboardList,
  MapPin,
  Search,
  Shield,
  Smartphone,
  UtensilsCrossed,
  X,
} from "lucide-react";

import { hotels } from "@/data/hotels";
import { transfers } from "@/data/transfers";
import { meals } from "@/data/meals";
import { sightseeing } from "@/data/sightseeing";
import {
  useTripBuilderStore,
  type CustomTripDay,
  type DayMoment,
} from "@/store/useTripBuilderStore";

type LocalTripExtra = {
  id: string;
  label: string;
  price: number;
  description: string;
  icon: ReactNode;
};

type LocalDayExtra = {
  id: string;
  label: string;
  price: number;
  description: string;
};

const tripLevelExtras: LocalTripExtra[] = [
  {
    id: "trip-extra-sim",
    label: "Local SIM Card",
    price: 700,
    description: "Useful for maps, cab apps, and travel coordination.",
    icon: <Smartphone className="h-4 w-4" />,
  },
  {
    id: "trip-extra-insurance",
    label: "Travel Insurance",
    price: 1200,
    description: "Basic travel coverage for smoother support.",
    icon: <Shield className="h-4 w-4" />,
  },
];

const dayLevelExtras: LocalDayExtra[] = [
  {
    id: "extra-early-checkin",
    label: "Early Check-in",
    price: 1800,
    description: "Helpful for morning arrivals when room access matters.",
  },
  {
    id: "extra-late-checkout",
    label: "Late Check-out",
    price: 1800,
    description: "Useful for evening departures.",
  },
  {
    id: "extra-guide",
    label: "Private Guide Support",
    price: 2600,
    description: "Private guide for easier local movement and context.",
  },
  {
    id: "extra-celebration",
    label: "Celebration Setup",
    price: 3200,
    description: "Room decor or surprise setup for honeymoon or birthdays.",
  },
];

function formatDayType(type: CustomTripDay["dayType"]) {
  if (type === "arrival") return "Arrival Day";
  if (type === "departure") return "Departure Day";
  if (type === "transfer") return "Transfer Day";
  return "Explore Day";
}

function formatINR(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function getDestinationIdFromCity(city: string) {
  const normalized = city.trim().toLowerCase();

  const map: Record<string, string> = {
    bangkok: "dest-bangkok",
    pattaya: "dest-pattaya",
    phuket: "dest-phuket",
    krabi: "dest-krabi",
    "chiang mai": "dest-chiang-mai",
  };

  return map[normalized] ?? "dest-bangkok";
}

function getTransferLabel(purpose: string) {
  if (purpose === "airport-arrival") return "Arrival";
  if (purpose === "airport-departure") return "Departure";
  if (purpose === "sightseeing") return "Sightseeing";
  if (purpose === "intercity") return "Intercity";
  if (purpose === "full-day") return "Full Day";
  return "Transfer";
}

function matchesText(text: string, query: string) {
  return text.toLowerCase().includes(query.trim().toLowerCase());
}

function normalizeMealType(value: string) {
  const lower = value.toLowerCase();

  if (lower.includes("breakfast") || lower === "b/f" || lower === "bf") return "breakfast";
  if (lower.includes("lunch")) return "lunch";
  if (lower.includes("dinner")) return "dinner";

  return "other";
}

function isDayComplete(day: CustomTripDay) {
  const selectedMeals = meals.filter((item) => day.selectedMealIds.includes(item.id));

  const hasBreakfast = selectedMeals.some(
    (item) => normalizeMealType(item.mealType) === "breakfast"
  );
  const hasLunch = selectedMeals.some((item) => normalizeMealType(item.mealType) === "lunch");
  const hasDinner = selectedMeals.some((item) => normalizeMealType(item.mealType) === "dinner");

  return (
    Boolean(day.city?.trim()) &&
    Boolean(day.hotelCategory?.trim()) &&
    Boolean(day.selectedHotelId) &&
    day.selectedSightseeingIds.length >= 1 &&
    day.selectedSightseeingIds.length <= 4 &&
    hasBreakfast &&
    hasLunch &&
    hasDinner &&
    day.selectedTransferIds.length === 1
  );
}

export function CustomTripFlow() {
  const adults = useTripBuilderStore((state) => state.adults);
  const children = useTripBuilderStore((state) => state.children);
  const rooms = useTripBuilderStore((state) => state.rooms);
  const selectedPackagePrice = useTripBuilderStore((state) => state.selectedPackagePrice);
  const customTripDays = useTripBuilderStore((state) => state.customTripDays);
  const dayPlans = useTripBuilderStore((state) => state.dayPlans);
  const initializeCustomTripDays = useTripBuilderStore((state) => state.initializeCustomTripDays);
  const updateCustomTripDay = useTripBuilderStore((state) => state.updateCustomTripDay);
  const toggleCustomTripDayItem = useTripBuilderStore((state) => state.toggleCustomTripDayItem);
  const recalculateCustomTripTotals = useTripBuilderStore(
    (state) => state.recalculateCustomTripTotals
  );

  const [activeDayId, setActiveDayId] = useState<string>("");
  const [hotelSearch, setHotelSearch] = useState("");
  const [transferSearch, setTransferSearch] = useState("");
  const [sightseeingSearch, setSightseeingSearch] = useState("");
  const [mealSearch, setMealSearch] = useState("");
  const [selectedTripExtraIds, setSelectedTripExtraIds] = useState<string[]>([]);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [expandedSummaryDayIds, setExpandedSummaryDayIds] = useState<string[]>([]);

  const totalPax = adults + children;

  useEffect(() => {
    if (customTripDays.length === 0) {
      initializeCustomTripDays(dayPlans);
    }
  }, [customTripDays.length, dayPlans, initializeCustomTripDays]);

  useEffect(() => {
    if (!activeDayId && customTripDays.length > 0) {
      setActiveDayId(customTripDays[0].id);
    }
  }, [activeDayId, customTripDays]);

  useEffect(() => {
    setHotelSearch("");
    setTransferSearch("");
    setSightseeingSearch("");
    setMealSearch("");
  }, [activeDayId]);

  const activeDay = useMemo(
    () => customTripDays.find((day) => day.id === activeDayId) ?? customTripDays[0],
    [activeDayId, customTripDays]
  );

  const availableCities = useMemo(
    () => [...new Set(customTripDays.map((day) => day.city))],
    [customTripDays]
  );

  const activeDestinationId = useMemo(() => {
    if (!activeDay) return "dest-bangkok";
    return getDestinationIdFromCity(activeDay.city);
  }, [activeDay]);

  const destinationHotels = useMemo(() => {
    if (!activeDay) return [];

    return hotels
      .filter((item) => {
        if (!item.isActive) return false;
        if (item.destinationId !== activeDestinationId) return false;
        if (item.category !== activeDay.hotelCategory) return false;

        const haystack = `${item.name} ${item.area} ${item.category} ${item.amenities.join(" ")}`;
        return matchesText(haystack, hotelSearch);
      })
      .sort((a, b) => {
        const aSelected = a.id === activeDay.selectedHotelId ? -1 : 0;
        const bSelected = b.id === activeDay.selectedHotelId ? -1 : 0;
        if (aSelected !== bSelected) return aSelected - bSelected;
        return a.nightlyRate - b.nightlyRate;
      });
  }, [activeDay, activeDestinationId, hotelSearch]);

  const dayTransfers = useMemo(() => {
    if (!activeDay) return [];

    return transfers
      .filter((item) => {
        if (!item.isActive) return false;
        if (!item.destinationIds.includes(activeDestinationId)) return false;
        if (totalPax < item.minPax || totalPax > item.maxPax) return false;

        const haystack = `${item.name} ${item.description} ${item.vehicleClass} ${item.purpose}`;
        return matchesText(haystack, transferSearch);
      })
      .sort((a, b) => {
        const aSelected = activeDay.selectedTransferIds.includes(a.id) ? -1 : 0;
        const bSelected = activeDay.selectedTransferIds.includes(b.id) ? -1 : 0;
        if (aSelected !== bSelected) return aSelected - bSelected;
        return a.price - b.price;
      });
  }, [activeDay, activeDestinationId, totalPax, transferSearch]);

  const daySightseeing = useMemo(() => {
    if (!activeDay) return [];

    return sightseeing
      .filter((item) => {
        if (!item.isActive) return false;
        if (item.destinationId !== activeDestinationId) return false;

        if (activeDay.activeSlotFilter !== "all") {
          if (!item.availableSlots.includes(activeDay.activeSlotFilter)) return false;
        }

        const haystack = `${item.name} ${item.type} ${item.area} ${item.tags.join(" ")}`;
        return matchesText(haystack, sightseeingSearch);
      })
      .sort((a, b) => {
        const aSelected = activeDay.selectedSightseeingIds.includes(a.id) ? -1 : 0;
        const bSelected = activeDay.selectedSightseeingIds.includes(b.id) ? -1 : 0;
        if (aSelected !== bSelected) return aSelected - bSelected;
        return a.price - b.price;
      });
  }, [activeDay, activeDestinationId, sightseeingSearch]);

  const dayMeals = useMemo(() => {
    if (!activeDay) return [];

    return meals
      .filter((item) => {
        if (!item.isActive) return false;
        if (!item.destinationIds.includes(activeDestinationId)) return false;

        const haystack = `${item.name} ${item.mealType} ${item.preference} ${item.cuisine} ${item.description}`;
        return matchesText(haystack, mealSearch);
      })
      .sort((a, b) => {
        const aSelected = activeDay.selectedMealIds.includes(a.id) ? -1 : 0;
        const bSelected = activeDay.selectedMealIds.includes(b.id) ? -1 : 0;
        if (aSelected !== bSelected) return aSelected - bSelected;
        return a.price - b.price;
      });
  }, [activeDay, activeDestinationId, mealSearch]);

  const selectedMealsForActiveDay = useMemo(
    () => meals.filter((item) => activeDay?.selectedMealIds.includes(item.id)),
    [activeDay]
  );

  const selectedBreakfast = selectedMealsForActiveDay.find(
    (item) => normalizeMealType(item.mealType) === "breakfast"
  );
  const selectedLunch = selectedMealsForActiveDay.find(
    (item) => normalizeMealType(item.mealType) === "lunch"
  );
  const selectedDinner = selectedMealsForActiveDay.find(
    (item) => normalizeMealType(item.mealType) === "dinner"
  );

  const breakfastSelected = Boolean(selectedBreakfast);
  const lunchSelected = Boolean(selectedLunch);
  const dinnerSelected = Boolean(selectedDinner);

  const breakfastMeals = dayMeals.filter(
    (item) => normalizeMealType(item.mealType) === "breakfast"
  );
  const lunchMeals = dayMeals.filter((item) => normalizeMealType(item.mealType) === "lunch");
  const dinnerMeals = dayMeals.filter((item) => normalizeMealType(item.mealType) === "dinner");

  const tripExtrasTotal = useMemo(() => {
    return selectedTripExtraIds.reduce((sum, id) => {
      const match = tripLevelExtras.find((item) => item.id === id);
      return sum + (match ? match.price : 0);
    }, 0);
  }, [selectedTripExtraIds]);

  const pricing = useMemo(() => {
    const hotelTotal = customTripDays.reduce((sum, day) => {
      const selectedHotel = hotels.find((item) => item.id === day.selectedHotelId);
      return sum + (selectedHotel ? selectedHotel.nightlyRate : 0);
    }, 0);

    const transferTotal = customTripDays.reduce((sum, day) => {
      return (
        sum +
        day.selectedTransferIds.reduce((inner, id) => {
          const transfer = transfers.find((item) => item.id === id);
          return inner + (transfer ? transfer.price : 0);
        }, 0)
      );
    }, 0);

    const sightseeingTotal = customTripDays.reduce((sum, day) => {
      return (
        sum +
        day.selectedSightseeingIds.reduce((inner, id) => {
          const option = sightseeing.find((item) => item.id === id);
          return inner + (option ? option.price : 0);
        }, 0)
      );
    }, 0);

    const mealsTotal = customTripDays.reduce((sum, day) => {
      return (
        sum +
        day.selectedMealIds.reduce((inner, id) => {
          const meal = meals.find((item) => item.id === id);
          return inner + (meal ? meal.price * totalPax : 0);
        }, 0)
      );
    }, 0);

    const dayExtrasTotal = customTripDays.reduce((sum, day) => {
      return (
        sum +
        day.selectedExtraIds.reduce((inner, id) => {
          const extra = dayLevelExtras.find((item) => item.id === id);
          return inner + (extra ? extra.price : 0);
        }, 0)
      );
    }, 0);

    return {
      basePrice: selectedPackagePrice,
      hotelTotal,
      transferTotal,
      sightseeingTotal,
      mealsTotal,
      tripExtrasTotal,
      dayExtrasTotal,
      extrasTotal: tripExtrasTotal + dayExtrasTotal,
      grandTotal:
        selectedPackagePrice +
        hotelTotal +
        transferTotal +
        sightseeingTotal +
        mealsTotal +
        tripExtrasTotal +
        dayExtrasTotal,
    };
  }, [customTripDays, selectedPackagePrice, tripExtrasTotal, totalPax]);

  useEffect(() => {
    recalculateCustomTripTotals({
      hotelTotal: pricing.hotelTotal,
      transferTotal: pricing.transferTotal,
      sightseeingTotal: pricing.sightseeingTotal,
      mealsTotal: pricing.mealsTotal,
      extrasTotal: pricing.extrasTotal,
    });
  }, [pricing, recalculateCustomTripTotals]);

  const allDaysCompleted = useMemo(
    () => customTripDays.length > 0 && customTripDays.every(isDayComplete),
    [customTripDays]
  );

  if (!activeDay) return null;

  function toggleTripExtra(id: string) {
    setSelectedTripExtraIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function toggleSummaryDay(dayId: string) {
    setExpandedSummaryDayIds((prev) =>
      prev.includes(dayId) ? prev.filter((item) => item !== dayId) : [...prev, dayId]
    );
  }

  function handleTransferSelect(transferId: string) {
    const alreadySelected = activeDay.selectedTransferIds.includes(transferId);

    if (alreadySelected) {
      toggleCustomTripDayItem(activeDay.id, "selectedTransferIds", transferId);
      return;
    }

    const currentSelected = [...activeDay.selectedTransferIds];

    currentSelected.forEach((id) => {
      toggleCustomTripDayItem(activeDay.id, "selectedTransferIds", id);
    });

    toggleCustomTripDayItem(activeDay.id, "selectedTransferIds", transferId);
  }

  function handleSightseeingToggle(sightseeingId: string) {
    const alreadySelected = activeDay.selectedSightseeingIds.includes(sightseeingId);

    if (alreadySelected) {
      toggleCustomTripDayItem(activeDay.id, "selectedSightseeingIds", sightseeingId);
      return;
    }

    if (activeDay.selectedSightseeingIds.length >= 4) {
      return;
    }

    toggleCustomTripDayItem(activeDay.id, "selectedSightseeingIds", sightseeingId);
  }

  function handleMealSelect(mealId: string) {
    const meal = meals.find((item) => item.id === mealId);
    if (!meal) return;

    const mealType = normalizeMealType(meal.mealType);
    const alreadySelected = activeDay.selectedMealIds.includes(mealId);

    if (alreadySelected) {
      toggleCustomTripDayItem(activeDay.id, "selectedMealIds", mealId);
      return;
    }

    const selectedIdsOfSameType = activeDay.selectedMealIds.filter((id) => {
      const existingMeal = meals.find((item) => item.id === id);
      if (!existingMeal) return false;
      return normalizeMealType(existingMeal.mealType) === mealType;
    });

    selectedIdsOfSameType.forEach((id) => {
      toggleCustomTripDayItem(activeDay.id, "selectedMealIds", id);
    });

    toggleCustomTripDayItem(activeDay.id, "selectedMealIds", mealId);
  }

  function openSummary() {
    if (expandedSummaryDayIds.length === 0 && customTripDays.length > 0) {
      setExpandedSummaryDayIds([customTripDays[0].id]);
    }
    setSummaryOpen(true);
  }

  function getDayTotal(day: CustomTripDay) {
    const hotelTotal = hotels.find((item) => item.id === day.selectedHotelId)?.nightlyRate ?? 0;

    const transferTotal = day.selectedTransferIds.reduce((sum, id) => {
      const match = transfers.find((item) => item.id === id);
      return sum + (match ? match.price : 0);
    }, 0);

    const sightseeingTotal = day.selectedSightseeingIds.reduce((sum, id) => {
      const match = sightseeing.find((item) => item.id === id);
      return sum + (match ? match.price : 0);
    }, 0);

    const mealsTotal = day.selectedMealIds.reduce((sum, id) => {
      const match = meals.find((item) => item.id === id);
      return sum + (match ? match.price * totalPax : 0);
    }, 0);

    const extrasTotal = day.selectedExtraIds.reduce((sum, id) => {
      const match = dayLevelExtras.find((item) => item.id === id);
      return sum + (match ? match.price : 0);
    }, 0);

    return hotelTotal + transferTotal + sightseeingTotal + mealsTotal + extrasTotal;
  }

  return (
    <div className="space-y-5 pb-32 xl:pb-10">
      <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_100%)] p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
              Custom Trip Studio
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Build the trip day by day
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              Complete each day with province, hotel stars, hotel, sightseeing, meals, transfer,
              and optional extras.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryMini label="Travellers" value={`${totalPax}`} />
            <SummaryMini label="Rooms" value={`${rooms}`} />
            <SummaryMini label="Days" value={`${customTripDays.length}`} />
            <SummaryMini label="Current Total" value={formatINR(pricing.grandTotal)} />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
          Day Selector
        </p>
        <h3 className="mt-2 text-[2rem] font-semibold leading-tight tracking-tight text-slate-950">
          Switch day instantly
        </h3>

        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
          {customTripDays.map((day) => {
            const active = day.id === activeDay.id;
            const complete = isDayComplete(day);

            return (
              <button
                key={day.id}
                type="button"
                onClick={() => setActiveDayId(day.id)}
                className={`rounded-[24px] border px-5 py-5 text-left transition ${
                  active
                    ? "border-orange-300 bg-[#fffaf3]"
                    : "border-slate-200 bg-[#f8fafc] hover:bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-slate-950">
                      Day {day.dayNumber}
                    </p>
                    <p className="mt-2 truncate text-[13px] text-slate-600">{day.city}</p>
                    <p className="mt-1 truncate text-[13px] text-slate-400">
                      {formatDayType(day.dayType)}
                    </p>
                  </div>

                  <span
                    className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      complete
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    <Check className="h-4 w-4" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <main className="space-y-6">
          <SectionCard
            title={`Day ${activeDay.dayNumber} · ${activeDay.city}`}
            subtitle={formatDayType(activeDay.dayType)}
          >
            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    <MapPin className="h-4 w-4" />
                    Province
                  </div>
                  <select
                    value={activeDay.city}
                    onChange={(event) =>
                      updateCustomTripDay(activeDay.id, {
                        city: event.target.value,
                        selectedHotelId: "",
                        selectedTransferIds: [],
                        selectedSightseeingIds: [],
                        selectedMealIds: [],
                      })
                    }
                    className="mt-2 w-full bg-transparent text-sm font-semibold text-slate-950 outline-none"
                  >
                    {availableCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Completion
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">
                    {isDayComplete(activeDay) ? "Ready to continue" : "Selections pending"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Hotel, sightseeing, meals, and transfer are mandatory.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(["all", "morning", "afternoon", "evening", "night"] as const).map((slot) => {
                  const active = activeDay.activeSlotFilter === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() =>
                        updateCustomTripDay(activeDay.id, {
                          activeSlotFilter: slot as DayMoment | "all",
                        })
                      }
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        active
                          ? "bg-slate-950 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {slot === "all" ? "All Slots" : slot}
                    </button>
                  );
                })}
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Trip-level Extras"
            subtitle="Select once for the full trip. These do not repeat every day."
          >
            <div className="grid gap-4 md:grid-cols-2">
              {tripLevelExtras.map((item) => {
                const active = selectedTripExtraIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleTripExtra(item.id)}
                    className={`rounded-[24px] border p-4 text-left transition ${
                      active
                        ? "border-orange-300 bg-orange-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span
                          className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${
                            active ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {item.icon}
                        </span>
                        <div>
                          <p className="text-base font-semibold text-slate-950">{item.label}</p>
                          <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-slate-950">{formatINR(item.price)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard
            title="Hotel Stars + Hotel Selection"
            subtitle="Hotel stars are mandatory. Hotel selection is mandatory."
          >
            <SearchField
              placeholder="Search hotel by name, area, category or amenity"
              value={hotelSearch}
              onChange={setHotelSearch}
            />

            <div className="mt-4 flex flex-wrap gap-3">
              {(["3 Star", "4 Star", "5 Star"] as const).map((category) => {
                const active = activeDay.hotelCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      updateCustomTripDay(activeDay.id, {
                        hotelCategory: category,
                        selectedHotelId: "",
                      })
                    }
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-orange-500 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {destinationHotels.map((hotel) => {
                const active = activeDay.selectedHotelId === hotel.id;
                return (
                  <button
                    key={hotel.id}
                    type="button"
                    onClick={() =>
                      updateCustomTripDay(activeDay.id, { selectedHotelId: hotel.id })
                    }
                    className={`overflow-hidden rounded-[24px] border text-left transition ${
                      active
                        ? "border-orange-300 bg-orange-50 shadow-[0_12px_26px_rgba(249,115,22,0.14)]"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="relative h-44 overflow-hidden bg-slate-100">
                      <img src={hotel.image} alt={hotel.name} className="h-full w-full object-cover" />
                      {active ? (
                        <div className="absolute right-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
                          Selected
                        </div>
                      ) : null}
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-slate-950">{hotel.name}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {hotel.area} · {hotel.category}
                          </p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                          {hotel.rating.toFixed(1)}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {hotel.amenities.slice(0, 3).map((item) => (
                          <Pill key={item} value={item} />
                        ))}
                      </div>

                      <p className="mt-4 text-sm font-semibold text-slate-950">
                        {formatINR(hotel.nightlyRate)} / night
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard
            title="Sightseeing"
            subtitle="Select minimum 1 and maximum 4. Results follow the active time-slot filter."
          >
            <SearchField
              placeholder="Search sightseeing by name, area, type or tags"
              value={sightseeingSearch}
              onChange={setSightseeingSearch}
            />

            <div className="mt-3 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              Selected:{" "}
              <span className="font-semibold">
                {activeDay.selectedSightseeingIds.length}/4
              </span>
            </div>

            <div className="mt-5 space-y-5">
              {daySightseeing.map((item) => {
                const active = activeDay.selectedSightseeingIds.includes(item.id);
                const limitReached =
                  !active && activeDay.selectedSightseeingIds.length >= 4;

                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={limitReached}
                    onClick={() => handleSightseeingToggle(item.id)}
                    className={`w-full rounded-[24px] border p-4 text-left transition ${
                      active
                        ? "border-orange-300 bg-orange-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    } ${limitReached ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                      <div className="grid grid-cols-[1.2fr_0.8fr] gap-3">
                        <div className="h-52 overflow-hidden rounded-[18px] bg-slate-100">
                          <img src={item.gallery[0]} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="grid gap-3">
                          {item.gallery.slice(1, 3).map((image) => (
                            <div key={image} className="h-[100px] overflow-hidden rounded-[18px] bg-slate-100">
                              <img src={image} alt={item.name} className="h-full w-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex flex-wrap gap-2">
                          {item.availableSlots.map((slot) => (
                            <Pill key={slot} value={slot} />
                          ))}
                          {item.pickupIncluded ? <Pill value="Pickup Included" /> : null}
                          {item.suitableOnArrivalDay ? <Pill value="Arrival Friendly" /> : null}
                        </div>

                        <h4 className="mt-4 text-xl font-semibold text-slate-950">{item.name}</h4>
                        <p className="mt-2 text-sm text-slate-600">
                          {item.type} · {item.duration} · {item.area}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {item.tags.map((tag) => (
                            <Pill key={tag} value={tag} />
                          ))}
                        </div>

                        <p className="mt-5 text-base font-semibold text-slate-950">
                          {formatINR(item.price)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard
            title="Meals"
            subtitle={`Select exactly one breakfast, one lunch, and one dinner for each day. Pricing below is for ${totalPax} traveller${totalPax > 1 ? "s" : ""}.`}
          >
            <SearchField
              placeholder="Search meals by name, cuisine, preference or meal type"
              value={mealSearch}
              onChange={setMealSearch}
            />

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <StatusBox
                label="Breakfast"
                complete={breakfastSelected}
                value={selectedBreakfast?.name ?? "Not selected"}
              />
              <StatusBox
                label="Lunch"
                complete={lunchSelected}
                value={selectedLunch?.name ?? "Not selected"}
              />
              <StatusBox
                label="Dinner"
                complete={dinnerSelected}
                value={selectedDinner?.name ?? "Not selected"}
              />
            </div>

            <div className="mt-6 space-y-6">
              <MealGroup
                title="Breakfast"
                items={breakfastMeals}
                selectedMealId={selectedBreakfast?.id}
                onSelect={handleMealSelect}
                totalPax={totalPax}
              />

              <MealGroup
                title="Lunch"
                items={lunchMeals}
                selectedMealId={selectedLunch?.id}
                onSelect={handleMealSelect}
                totalPax={totalPax}
              />

              <MealGroup
                title="Dinner"
                items={dinnerMeals}
                selectedMealId={selectedDinner?.id}
                onSelect={handleMealSelect}
                totalPax={totalPax}
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Transfers"
            subtitle="Exactly one transfer must be selected for each day."
          >
            <SearchField
              placeholder="Search transfer by purpose, vehicle or description"
              value={transferSearch}
              onChange={setTransferSearch}
            />

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {dayTransfers.map((item) => {
                const active = activeDay.selectedTransferIds.includes(item.id);
                const transferImage =
                  (item as { image?: string }).image ??
                  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80";

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTransferSelect(item.id)}
                    className={`overflow-hidden rounded-[24px] border text-left transition ${
                      active
                        ? "border-orange-300 bg-orange-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="h-40 overflow-hidden bg-slate-100">
                      <img src={transferImage} alt={item.name} className="h-full w-full object-cover" />
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                            {getTransferLabel(item.purpose)}
                          </span>
                          <p className="mt-3 text-base font-semibold text-slate-950">{item.name}</p>
                          <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                          <p className="mt-2 text-xs text-slate-500">
                            {item.vehicleClass} · {item.minPax}-{item.maxPax} pax
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-950">
                            {formatINR(item.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard
            title="Extras"
            subtitle="Extras are optional and can be chosen day-wise."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              {dayLevelExtras.map((item) => {
                const active = activeDay.selectedExtraIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      toggleCustomTripDayItem(activeDay.id, "selectedExtraIds", item.id)
                    }
                    className={`rounded-[24px] border p-4 text-left transition ${
                      active
                        ? "border-orange-300 bg-orange-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-slate-950">{item.label}</p>
                        <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-950">{formatINR(item.price)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard
            title="Day Notes"
            subtitle="Operational notes for this day."
          >
            <textarea
              value={activeDay.notes}
              onChange={(event) =>
                updateCustomTripDay(activeDay.id, { notes: event.target.value })
              }
              placeholder="Add notes like slow arrival day, vegetarian only, avoid early morning, senior-friendly pace, etc."
              className="min-h-[120px] w-full rounded-[22px] border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-300"
            />
          </SectionCard>
        </main>

        <aside className="hidden space-y-4 xl:sticky xl:top-28 xl:block xl:self-start">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
              Pricing Summary
            </p>

            <div className="mt-5 space-y-4 text-sm">
              <PriceRow label="Package base" value={pricing.basePrice} />
              <PriceRow label="Hotels" value={pricing.hotelTotal} />
              <PriceRow label="Transfers" value={pricing.transferTotal} />
              <PriceRow label="Sightseeing" value={pricing.sightseeingTotal} />
              <PriceRow label={`Meals (${totalPax} pax)`} value={pricing.mealsTotal} />
              <PriceRow label="Trip extras" value={pricing.tripExtrasTotal} />
              <PriceRow label="Day extras" value={pricing.dayExtrasTotal} />
            </div>

            <button
              type="button"
              onClick={openSummary}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ClipboardList className="h-4 w-4" />
              Summary
            </button>

            <button
              type="button"
              disabled={!allDaysCompleted}
              className={`mt-3 w-full rounded-full px-4 py-3 text-sm font-semibold transition ${
                allDaysCompleted
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "cursor-not-allowed bg-slate-200 text-slate-500"
              }`}
            >
              Continue
            </button>

            {!allDaysCompleted ? (
              <p className="mt-3 text-xs leading-6 text-slate-500">
                Continue unlocks only after every day has province, hotel stars, hotel,
                1 to 4 sightseeing items, breakfast, lunch, dinner, and exactly 1 transfer.
              </p>
            ) : null}
          </div>
        </aside>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur xl:hidden">
        <div className="mx-auto max-w-md">
          <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
                  Day {activeDay.dayNumber}
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-slate-950">
                  {activeDay.city} · {formatDayType(activeDay.dayType)}
                </p>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {customTripDays.filter(isDayComplete).length}/{customTripDays.length} days complete
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Total
                </p>
                <p className="mt-1 text-xl font-semibold leading-none text-slate-950">
                  {formatINR(pricing.grandTotal)}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={openSummary}
                className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Summary
              </button>

              <button
                type="button"
                disabled={!allDaysCompleted}
                className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                  allDaysCompleted
                    ? "bg-emerald-500 text-white"
                    : "cursor-not-allowed bg-slate-200 text-slate-500"
                }`}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>

      {summaryOpen ? (
        <div className="fixed inset-0 z-[120] bg-slate-950/55 p-4">
          <div className="mx-auto flex h-full max-w-3xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
                  Summary
                </p>
                <h3 className="mt-1 text-xl font-semibold text-slate-950">
                  Day-wise trip selections
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSummaryOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="space-y-4">
                {customTripDays.map((day) => {
                  const expanded = expandedSummaryDayIds.includes(day.id);
                  const hotel = hotels.find((item) => item.id === day.selectedHotelId);
                  const transferNames = day.selectedTransferIds
                    .map((id) => transfers.find((item) => item.id === id)?.name)
                    .filter(Boolean) as string[];
                  const sightseeingNames = day.selectedSightseeingIds
                    .map((id) => sightseeing.find((item) => item.id === id)?.name)
                    .filter(Boolean) as string[];
                  const mealNames = day.selectedMealIds
                    .map((id) => {
                      const meal = meals.find((item) => item.id === id);
                      if (!meal) return null;
                      return `${meal.name} × ${totalPax}`;
                    })
                    .filter(Boolean) as string[];
                  const extraNames = day.selectedExtraIds
                    .map((id) => dayLevelExtras.find((item) => item.id === id)?.label)
                    .filter(Boolean) as string[];

                  return (
                    <div
                      key={day.id}
                      className="overflow-hidden rounded-[24px] border border-slate-200 bg-white"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSummaryDay(day.id)}
                        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-base font-semibold text-slate-950">
                              Day {day.dayNumber} · {day.city}
                            </p>
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                isDayComplete(day)
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {isDayComplete(day) ? "Complete" : "Pending"}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-500">{formatDayType(day.dayType)}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <p className="text-sm font-semibold text-slate-950">
                            {formatINR(getDayTotal(day))}
                          </p>
                          <ChevronDown
                            className={`h-5 w-5 text-slate-500 transition ${
                              expanded ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </button>

                      {expanded ? (
                        <div className="border-t border-slate-200 px-4 py-4">
                          <div className="space-y-3">
                            <SummaryListRow label="Province" value={day.city || "Not selected"} />
                            <SummaryListRow
                              label="Hotel Stars"
                              value={day.hotelCategory || "Not selected"}
                            />
                            <SummaryListRow
                              label="Hotel"
                              value={hotel?.name ?? "Not selected"}
                            />
                            <SummaryListRow
                              label="Sightseeing"
                              value={
                                sightseeingNames.length
                                  ? sightseeingNames.join(", ")
                                  : "Not selected"
                              }
                            />
                            <SummaryListRow
                              label="Meals"
                              value={mealNames.length ? mealNames.join(", ") : "Not selected"}
                            />
                            <SummaryListRow
                              label="Transfer"
                              value={
                                transferNames.length
                                  ? transferNames.join(", ")
                                  : "Not selected"
                              }
                            />
                            <SummaryListRow
                              label="Extras"
                              value={extraNames.length ? extraNames.join(", ") : "No extras"}
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}

                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-950">Trip-level extras</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {selectedTripExtraIds.length
                      ? selectedTripExtraIds
                          .map((id) => tripLevelExtras.find((item) => item.id === id)?.label)
                          .filter(Boolean)
                          .join(", ")
                      : "No trip-level extras selected"}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Grand Total
                  </p>
                  <p className="mt-1 text-xl font-semibold text-slate-950">
                    {formatINR(pricing.grandTotal)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSummaryOpen(false)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SearchField({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[18px] border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
      />
    </div>
  );
}

function StatusBox({
  label,
  complete,
  value,
}: {
  label: string;
  complete: boolean;
  value: string;
}) {
  return (
    <div
      className={`rounded-[18px] border px-4 py-3 ${
        complete ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-slate-900">{label}</span>
        <span
          className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${
            complete ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
          }`}
        >
          <Check className="h-3 w-3" />
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-500">{value}</p>
    </div>
  );
}

function MealGroup({
  title,
  items,
  selectedMealId,
  onSelect,
  totalPax,
}: {
  title: string;
  items: typeof meals;
  selectedMealId?: string;
  onSelect: (mealId: string) => void;
  totalPax: number;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700">
          <UtensilsCrossed className="h-4 w-4" />
        </span>
        <p className="text-base font-semibold text-slate-950">{title}</p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {items.map((item) => {
          const active = selectedMealId === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`overflow-hidden rounded-[24px] border text-left transition ${
                active
                  ? "border-orange-300 bg-orange-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="h-40 overflow-hidden bg-slate-100">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-slate-950">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.mealType} · {item.preference} · {item.cuisine}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-950">
                      {formatINR(item.price * totalPax)}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formatINR(item.price)} × {totalPax}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600">{item.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SummaryListRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_minmax(0,1fr)]">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-950">{value}</span>
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SummaryMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-orange-100 bg-white/80 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function Pill({ value }: { value: string }) {
  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
      {value}
    </span>
  );
}

function PriceRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-950">{formatINR(value)}</span>
    </div>
  );
}