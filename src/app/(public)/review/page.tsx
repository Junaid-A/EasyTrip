"use client";

import { useAuthModalStore } from "@/store/useAuthModalStore";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  CircleCheck,
  Hotel,
  MapPinned,
  Plane,
  Ticket,
  UtensilsCrossed,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { useTripBuilderStore } from "@/store/useTripBuilderStore";
import { hotels } from "@/data/hotels";
import { transfers } from "@/data/transfers";
import { meals } from "@/data/meals";
import { sightseeing } from "@/data/sightseeing";
import { standardPackages } from "@/lib/mock/bangkok-builder-data";

function formatINR(value: number) {
  return `₹${Math.max(0, Math.round(value)).toLocaleString("en-IN")}`;
}

function formatDuration(nightsValue: string) {
  const match = nightsValue.match(/\d+/);
  const nights = match ? Number(match[0]) : 0;
  if (!nights) return nightsValue || "Pending";
  return `${nights}N / ${nights + 1}D`;
}

type ReviewDayBlock = {
  id: string;
  dayLabel: string;
  dateText?: string;
  city: string;
  title: string;
  description: string;
  transfer?: string;
  hotel?: string;
  activities: string[];
  meals: string[];
  extras: string[];
};

type TravellerForm = {
  id: string;
  name: string;
  age: string;
  gender: string;
};

type ReviewAddon = {
  id: string;
  title: string;
  description: string;
  price: number;
  badge?: string;
};

const reviewAddons: ReviewAddon[] = [
  {
    id: "addon-insurance",
    title: "$500K Travel Insurance",
    description:
      "Emergency medical, trip interruption, baggage and travel inconvenience support.",
    price: 1344,
    badge: "Most popular",
  },
  {
    id: "addon-airport-assist",
    title: "Airport Assistance",
    description:
      "Meet-and-greet style support for smoother arrival or departure handling.",
    price: 1890,
  },
  {
    id: "addon-visa-priority",
    title: "Priority Visa Support",
    description:
      "Faster documentation coordination and application handling support.",
    price: 2490,
  },
];

export default function ReviewPage() {
  const openAuthModal = useAuthModalStore((state) => state.openAuthModal);

  const selectedMode = useTripBuilderStore((state) => state.selectedMode);
  const destination = useTripBuilderStore((state) => state.destination);
  const travelDates = useTripBuilderStore((state) => state.travelDates);
  const nights = useTripBuilderStore((state) => state.nights);
  const adults = useTripBuilderStore((state) => state.adults);
  const children = useTripBuilderStore((state) => state.children);
  const rooms = useTripBuilderStore((state) => state.rooms);
  const selectedPackageTitle = useTripBuilderStore(
    (state) => state.selectedPackageTitle
  );
  const selectedPackagePrice = useTripBuilderStore(
    (state) => state.selectedPackagePrice
  );
  const selectedFlightLabel = useTripBuilderStore(
    (state) => state.selectedFlightLabel
  );
  const selectedExtras = useTripBuilderStore((state) => state.selectedExtras);
  const selectedAddOns = useTripBuilderStore((state) => state.selectedAddOns);
  const serviceFee = useTripBuilderStore((state) => state.serviceFee);
  const bookingId = useTripBuilderStore((state) => state.bookingId);
  const specialRequestFromStore = useTripBuilderStore(
    (state) => state.specialRequest
  );

  const dayPlans = useTripBuilderStore((state) => state.dayPlans);
  const customTripDays = useTripBuilderStore((state) => state.customTripDays);

  const estimatedFlightTotal = useTripBuilderStore(
    (state) => state.estimatedFlightTotal
  );
  const estimatedHotelTotal = useTripBuilderStore(
    (state) => state.estimatedHotelTotal
  );
  const estimatedTransferTotal = useTripBuilderStore(
    (state) => state.estimatedTransferTotal
  );
  const estimatedSightseeingTotal = useTripBuilderStore(
    (state) => state.estimatedSightseeingTotal
  );
  const estimatedMealsTotal = useTripBuilderStore(
    (state) => state.estimatedMealsTotal
  );
  const estimatedGrandTotal = useTripBuilderStore(
    (state) => state.estimatedGrandTotal
  );

  const totalTravellers = adults + children;
  const initialTravellerCount = Math.max(totalTravellers, 1);

  const [travellers, setTravellers] = useState<TravellerForm[]>(
    Array.from({ length: initialTravellerCount }, (_, index) => ({
      id: `traveller-${index + 1}`,
      name: "",
      age: "",
      gender: "",
    }))
  );

  const [openDayIds, setOpenDayIds] = useState<string[]>([
    "day-1",
    "custom-day-1",
  ]);
  const [email, setEmail] = useState("");
  const [mobileCode, setMobileCode] = useState("+91");
  const [mobile, setMobile] = useState("");
  const [gstState, setGstState] = useState("");
  const [specialRequest, setSpecialRequest] = useState(
    specialRequestFromStore || ""
  );
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

  const fallbackExtrasTotal =
    selectedExtras.length * 900 + selectedAddOns.length * 1200;

  const selectedAddonTotal = selectedAddonIds.reduce((sum, id) => {
    const addon = reviewAddons.find((item) => item.id === id);
    return sum + (addon?.price ?? 0);
  }, 0);

  const baseFinalPrice =
    estimatedGrandTotal > 0
      ? estimatedGrandTotal
      : selectedPackagePrice +
        estimatedFlightTotal +
        estimatedHotelTotal +
        estimatedTransferTotal +
        estimatedSightseeingTotal +
        Math.max(estimatedMealsTotal, fallbackExtrasTotal) +
        serviceFee;

  const finalPrice = baseFinalPrice + selectedAddonTotal;

  const travelerSummary = `${adults} Adult${adults > 1 ? "s" : ""}${
    children ? `, ${children} Child${children > 1 ? "ren" : ""}` : ""
  }`;

  const roomSummary = `${rooms} Room${rooms > 1 ? "s" : ""}`;

  const modeLabel =
    selectedMode === "ai"
      ? "AI Assisted"
      : selectedMode === "custom"
      ? "Custom Trip"
      : "Standard Package";

  const selectedPackageImage = useMemo(() => {
    const match = standardPackages.find(
      (pkg) => pkg.title === selectedPackageTitle
    );
    return (
      match?.image ||
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop"
    );
  }, [selectedPackageTitle]);

  const reviewDays = useMemo<ReviewDayBlock[]>(() => {
    if (selectedMode === "custom" && customTripDays.length > 0) {
      return customTripDays.map((day) => {
        const hotelItem = hotels.find((item) => item.id === day.selectedHotelId);
        const transferItems = transfers.filter((item) =>
          day.selectedTransferIds.includes(item.id)
        );
        const sightseeingItems = sightseeing.filter((item) =>
          day.selectedSightseeingIds.includes(item.id)
        );
        const mealItems = meals.filter((item) =>
          day.selectedMealIds.includes(item.id)
        );

        const extraLabels = day.selectedExtraIds.map((id) =>
          id
            .replace(/^extra-/, "")
            .replace(/^trip-extra-/, "")
            .replace(/-/g, " ")
            .replace(/\b\w/g, (m) => m.toUpperCase())
        );

        return {
          id: day.id,
          dayLabel: `Day ${day.dayNumber}`,
          dateText: day.dateLabel,
          city: day.city || destination || "Bangkok",
          title:
            day.dayType === "arrival"
              ? "Arrival and hotel check-in"
              : day.dayType === "departure"
              ? "Departure and airport transfer"
              : day.dayType === "transfer"
              ? "Transfer and check-in flow"
              : `Sightseeing and free time in ${
                  day.city || destination || "Bangkok"
                }`,
          description:
            day.notes?.trim() ||
            `Day structured around selected stay, transfer, sightseeing, meals, and extras in ${
              day.city || destination || "Bangkok"
            }.`,
          transfer:
            transferItems.length > 0
              ? transferItems.map((item) => item.name).join(" • ")
              : undefined,
          hotel: hotelItem
            ? `${hotelItem.name} • ${hotelItem.category} • ${hotelItem.area}`
            : undefined,
          activities: sightseeingItems.map((item) => item.name),
          meals: mealItems.map((item) => `${item.mealType} included • ${item.name}`),
          extras: extraLabels,
        };
      });
    }

    return dayPlans.map((day) => ({
      id: `day-${day.day}`,
      dayLabel: `Day ${day.day}`,
      city: day.city,
      title: day.title,
      description: day.description,
      transfer: day.transfer,
      hotel: day.hotel,
      activities: day.activities ?? [],
      meals: day.meals ?? [],
      extras: [],
    }));
  }, [selectedMode, customTripDays, dayPlans, destination]);

  const allTravellerFieldsValid =
    travellers.length >= 1 &&
    travellers.every(
      (traveller) =>
        traveller.name.trim() &&
        traveller.age.trim() &&
        traveller.gender.trim()
    );

  const mandatoryFieldsComplete =
    email.trim() &&
    mobileCode.trim() &&
    mobile.trim() &&
    allTravellerFieldsValid;

  function handleContinue() {
    if (!mandatoryFieldsComplete) return;
    openAuthModal("login");
  }

  function toggleDay(dayId: string) {
    setOpenDayIds((current) =>
      current.includes(dayId)
        ? current.filter((id) => id !== dayId)
        : [...current, dayId]
    );
  }

  function updateTraveller(
    id: string,
    field: keyof Omit<TravellerForm, "id">,
    value: string
  ) {
    setTravellers((current) =>
      current.map((traveller) =>
        traveller.id === id ? { ...traveller, [field]: value } : traveller
      )
    );
  }

  function addTraveller() {
    setTravellers((current) => [
      ...current,
      {
        id: `traveller-${Date.now()}`,
        name: "",
        age: "",
        gender: "",
      },
    ]);
  }

  function removeTraveller(id: string) {
    setTravellers((current) => {
      if (current.length <= 1) return current;
      return current.filter((traveller) => traveller.id !== id);
    });
  }

  function toggleAddon(addonId: string) {
    setSelectedAddonIds((current) =>
      current.includes(addonId)
        ? current.filter((id) => id !== addonId)
        : [...current, addonId]
    );
  }

  const visibleAddonPills = [
    ...selectedExtras,
    ...selectedAddOns,
    ...selectedAddonIds
      .map((id) => reviewAddons.find((item) => item.id === id)?.title)
      .filter(Boolean),
  ] as string[];

  return (
    <div className="min-h-screen bg-[#f3f3f3] text-slate-950">
      <PublicHeader />

      <main className="pb-40 pt-24 sm:pt-28 lg:pb-16 lg:pt-32">
        <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
            <div className="min-w-0 space-y-4">
              <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
                <div className="relative min-h-[260px] overflow-hidden sm:min-h-[340px]">
                  <img
                    src={selectedPackageImage}
                    alt={selectedPackageTitle || "Selected package"}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.18)_0%,rgba(15,23,42,0.58)_100%)]" />

                  <div className="absolute left-4 top-4 z-10">
                    <span className="rounded-full border border-white/20 bg-white/12 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                      {bookingId || "Booking ref pending"}
                    </span>
                  </div>

                  <div className="absolute right-4 top-4 z-10">
                    <span className="rounded-full border border-white/20 bg-white/12 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                      {modeLabel}
                    </span>
                  </div>
                </div>

                <div className="bg-[#0d3558] px-4 py-5 text-white sm:px-6">
                  <h1 className="text-[26px] font-semibold leading-tight sm:text-[34px]">
                    {selectedPackageTitle || "Selected trip package"}
                  </h1>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/80">
                    <span>{formatDuration(nights)}</span>
                    <span>{destination || "Bangkok"}</span>
                    <span>{travelDates || "Dates pending"}</span>
                    <span>{roomSummary}</span>
                    <span>{travelerSummary}</span>
                  </div>

                  <div className="mt-5 grid gap-3">
                    <TopMeta
                      label="Flights"
                      value={selectedFlightLabel || "Without Flight"}
                      dark
                    />
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
                <SectionHeader
                  index="1."
                  title="Traveller details"
                  rightText="Login now"
                  onRightAction={() => openAuthModal("login")}
                />

                <div className="px-4 py-4 sm:px-6">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Login to view your saved travellers list, get special offers,
                    and continue faster.
                  </div>

                  <div className="mt-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-xl font-semibold text-slate-950">
                        {travellers.length} Traveller
                        {travellers.length > 1 ? "s" : ""}
                        <span className="text-base font-normal text-slate-500">
                          {" "}
                          • {roomSummary} • {travelerSummary}
                        </span>
                      </h3>

                      <button
                        type="button"
                        onClick={addTraveller}
                        className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700"
                      >
                        <UserPlus className="h-4 w-4" />
                        Add Traveller
                      </button>
                    </div>

                    <div className="mt-4 grid gap-3">
                      {travellers.map((traveller, index) => (
                        <div
                          key={traveller.id}
                          className="rounded-2xl border border-slate-200 bg-white p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-900">
                              Traveller {index + 1}
                            </p>

                            {travellers.length > 1 ? (
                              <button
                                type="button"
                                onClick={() => removeTraveller(traveller.id)}
                                className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"
                              >
                                <UserMinus className="h-3.5 w-3.5" />
                                Remove
                              </button>
                            ) : null}
                          </div>

                          <div className="mt-4 grid gap-3 md:grid-cols-3">
                            <InputField
                              required
                              label="Name"
                              placeholder="Enter full name"
                              value={traveller.name}
                              onChange={(value) =>
                                updateTraveller(traveller.id, "name", value)
                              }
                            />
                            <InputField
                              required
                              label="Age"
                              placeholder="Enter age"
                              value={traveller.age}
                              onChange={(value) =>
                                updateTraveller(traveller.id, "age", value)
                              }
                            />
                            <SelectField
                              required
                              label="Gender"
                              value={traveller.gender}
                              onChange={(value) =>
                                updateTraveller(traveller.id, "gender", value)
                              }
                              options={["", "Male", "Female", "Other"]}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-slate-950">
                      Please enter contact details
                    </h3>

                    <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_0.7fr_1fr]">
                      <InputField
                        required
                        label="Email"
                        placeholder="Eg. jyotsna@email.com"
                        value={email}
                        onChange={setEmail}
                      />
                      <SelectField
                        required
                        label="Mobile Code"
                        value={mobileCode}
                        onChange={setMobileCode}
                        options={["+91", "+971", "+65", "+44"]}
                      />
                      <InputField
                        required
                        label="Mobile"
                        placeholder="Eg. 98212 34321"
                        value={mobile}
                        onChange={setMobile}
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-slate-950">
                      Please enter GST details
                    </h3>

                    <div className="mt-4 max-w-sm">
                      <InputField
                        label="GST State"
                        placeholder="Select state"
                        value={gstState}
                        onChange={setGstState}
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-slate-950">
                      Special Requests
                    </h3>
                    <label className="mt-4 block">
                      <span className="text-sm text-slate-500">
                        Special Requests
                      </span>
                      <textarea
                        rows={4}
                        value={specialRequest}
                        onChange={(e) => setSpecialRequest(e.target.value)}
                        placeholder="Enter special requests"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
                      />
                    </label>
                  </div>

                  <div className="mt-6 rounded-2xl border border-[#ecdccf] bg-[#fbf5ef] px-4 py-4">
                    <p className="text-sm font-semibold text-slate-900">
                      TCS (Tax Collected at Source) is mandatory for international
                      holiday packages
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Any cancellation, amendment, visa, or remittance-linked
                      adjustment may require additional documentation.
                      India-specific holiday booking compliance will be handled
                      during final confirmation.
                    </p>
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
                <SectionHeader index="2." title="Package add-ons" />

                <div className="px-4 py-4 sm:px-6">
                  <div className="grid gap-3">
                    {reviewAddons.map((addon) => {
                      const isSelected = selectedAddonIds.includes(addon.id);

                      return (
                        <button
                          key={addon.id}
                          type="button"
                          onClick={() => toggleAddon(addon.id)}
                          className={`rounded-2xl border p-4 text-left transition ${
                            isSelected
                              ? "border-sky-300 bg-sky-50"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-slate-950">
                                  {addon.title}
                                </p>
                                {addon.badge ? (
                                  <span className="rounded-full bg-violet-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-700">
                                    {addon.badge}
                                  </span>
                                ) : null}
                              </div>

                              <p className="mt-2 text-sm leading-6 text-slate-600">
                                {addon.description}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-lg font-semibold text-slate-950">
                                + {formatINR(addon.price)}
                              </p>
                              <div
                                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                  isSelected
                                    ? "bg-rose-600 text-white"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {isSelected ? "Remove" : "Select"}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {visibleAddonPills.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {visibleAddonPills.map((item) => (
                        <Tag key={item}>{item}</Tag>
                      ))}
                    </div>
                  ) : null}
                </div>
              </section>

              <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
                <SectionHeader index="3." title="Package itinerary & inclusions" />

                <div className="px-4 py-4 sm:px-6">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-950">
                      Package features
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <FeaturePill
                        icon={<Plane className="h-4 w-4" />}
                        text={selectedFlightLabel || "Without Flight"}
                      />
                      <FeaturePill
                        icon={<Hotel className="h-4 w-4" />}
                        text="Hotel stay"
                      />
                      <FeaturePill
                        icon={<MapPinned className="h-4 w-4" />}
                        text="Transfers included"
                      />
                      <FeaturePill
                        icon={<UtensilsCrossed className="h-4 w-4" />}
                        text="Meals as per plan"
                      />
                    </div>

                    <p className="mt-4 text-sm text-slate-600">
                      Itinerary / {estimatedFlightTotal > 0 ? "Flights" : "Land-only"} / Hotels / Transfers / Activities
                    </p>
                  </div>

                  <div className="mt-5 space-y-4">
                    {reviewDays.map((day, index) => {
                      const isOpen = openDayIds.includes(day.id);

                      return (
                        <div
                          key={day.id}
                          className="overflow-hidden rounded-[22px] border border-slate-200 bg-white"
                        >
                          <button
                            type="button"
                            onClick={() => toggleDay(day.id)}
                            className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left"
                          >
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                                  Day {index + 1}
                                </span>
                                <span className="text-sm text-slate-500">
                                  {day.dateText || day.dayLabel}
                                </span>
                              </div>
                              <h3 className="mt-3 text-lg font-semibold text-slate-950">
                                {day.title}
                              </h3>
                              <p className="mt-1 text-sm text-slate-600">
                                {day.city}
                              </p>
                            </div>

                            <div className="shrink-0 text-slate-500">
                              {isOpen ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </div>
                          </button>

                          {isOpen && (
                            <div className="border-t border-slate-200 px-4 py-4">
                              <p className="text-sm leading-6 text-slate-600">
                                {day.description}
                              </p>

                              <div className="mt-4 space-y-3">
                                {day.transfer ? (
                                  <ItineraryLine
                                    title="Transfer"
                                    value={day.transfer}
                                    icon={<MapPinned className="h-4 w-4" />}
                                  />
                                ) : null}

                                {day.hotel ? (
                                  <ItineraryLine
                                    title="Hotel"
                                    value={day.hotel}
                                    icon={<Hotel className="h-4 w-4" />}
                                  />
                                ) : null}

                                {day.activities.map((activity) => (
                                  <ItineraryLine
                                    key={`${day.id}-${activity}`}
                                    title="Activity"
                                    value={activity}
                                    icon={<CircleCheck className="h-4 w-4" />}
                                  />
                                ))}

                                {day.meals.map((meal) => (
                                  <ItineraryLine
                                    key={`${day.id}-${meal}`}
                                    title="Meals"
                                    value={meal}
                                    icon={<UtensilsCrossed className="h-4 w-4" />}
                                  />
                                ))}

                                {day.extras.map((extra) => (
                                  <ItineraryLine
                                    key={`${day.id}-${extra}`}
                                    title="Extra"
                                    value={extra}
                                    icon={<Ticket className="h-4 w-4" />}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-lg font-semibold text-slate-950">
                      Package exclusions
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      <li>
                        Package price does not include Gala dinner surcharge
                        where applicable.
                      </li>
                      <li>Visa cost is not included in the package cost.</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
                <SectionHeader index="4." title="Cancellation & date change" />

                <div className="space-y-5 px-4 py-4 sm:px-6">
                  <PolicyCard
                    title="Package Cancellation Policy"
                    goodDate="Till 12 Apr 26"
                    badDate="After 12 Apr 26"
                    points={[
                      "Cancellation slabs vary by component and supplier policy.",
                      "TCS, visa, and remittance-linked deductions may apply where relevant.",
                      "Support team will verify supplier-side penalties before final refund advice.",
                    ]}
                  />

                  <PolicyCard
                    title="Package Date Change Policy"
                    goodDate="Till 12 Apr 26"
                    badDate="After 12 Apr 26"
                    points={[
                      "Date change depends on hotel, airline, and supplier availability.",
                      "Fare difference and revision charges may apply.",
                      "Amendment timelines are tighter closer to departure.",
                    ]}
                  />
                </div>
              </section>
            </div>

            <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
              <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
                <div className="border-b border-slate-200 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Grand total
                  </p>
                  <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
                    {formatINR(finalPrice)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Review all cost lines before login and confirmation.
                  </p>
                </div>

                <div className="space-y-3 px-4 py-4">
                  <PriceRow
                    label="Package Base"
                    value={formatINR(selectedPackagePrice)}
                  />
                  <PriceRow
                    label="Flight"
                    value={formatINR(estimatedFlightTotal)}
                  />
                  <PriceRow
                    label="Hotel estimate"
                    value={formatINR(estimatedHotelTotal)}
                  />
                  <PriceRow
                    label="Transfer estimate"
                    value={formatINR(estimatedTransferTotal)}
                  />
                  <PriceRow
                    label="Sightseeing estimate"
                    value={formatINR(estimatedSightseeingTotal)}
                  />
                  <PriceRow
                    label="Meals / extras"
                    value={formatINR(
                      Math.max(estimatedMealsTotal, fallbackExtrasTotal)
                    )}
                  />
                  <PriceRow
                    label="Review add-ons"
                    value={formatINR(selectedAddonTotal)}
                  />
                  <PriceRow
                    label="Service charge"
                    value={formatINR(serviceFee)}
                  />

                  <div className="border-t border-slate-200 pt-3">
                    <PriceRow
                      label="Final Price"
                      value={formatINR(finalPrice)}
                      strong
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200 px-4 py-4">
                  <button
                    type="button"
                    onClick={handleContinue}
                    disabled={!mandatoryFieldsComplete}
                    className={`w-full rounded-full px-4 py-3.5 text-sm font-semibold transition ${
                      mandatoryFieldsComplete
                        ? "bg-slate-950 text-white hover:bg-slate-800"
                        : "cursor-not-allowed bg-slate-200 text-slate-500"
                    }`}
                  >
                    Continue
                  </button>

                  <Link
                    href="/trip-builder"
                    className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    Back to Trip Builder
                  </Link>

                  {!mandatoryFieldsComplete ? (
                    <p className="mt-3 text-xs text-slate-500">
                      Complete all mandatory traveller and contact fields to continue.
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Snapshot
                </p>
                <div className="mt-3 space-y-3">
                  <MiniSummaryRow
                    label="Package"
                    value={selectedPackageTitle || "Selected trip"}
                  />
                  <MiniSummaryRow
                    label="Duration"
                    value={formatDuration(nights)}
                  />
                  <MiniSummaryRow
                    label="Flights"
                    value={selectedFlightLabel || "Without Flight"}
                  />
                  <MiniSummaryRow
                    label="Travellers"
                    value={travelerSummary}
                  />
                  <MiniSummaryRow label="Rooms" value={roomSummary} />
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-3 backdrop-blur xl:hidden">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Final Price
              </p>
              <p className="truncate text-xl font-semibold text-slate-950">
                {formatINR(finalPrice)}
              </p>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!mandatoryFieldsComplete}
              className={`shrink-0 rounded-full px-6 py-3 text-sm font-semibold transition ${
                mandatoryFieldsComplete
                  ? "bg-slate-950 text-white"
                  : "cursor-not-allowed bg-slate-200 text-slate-500"
              }`}
            >
              Continue
            </button>
          </div>

          {!mandatoryFieldsComplete ? (
            <p className="mt-2 text-[11px] text-slate-500">
              Fill mandatory details to continue.
            </p>
          ) : null}
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}

function SectionHeader({
  index,
  title,
  rightText,
  onRightAction,
}: {
  index: string;
  title: string;
  rightText?: string;
  onRightAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-6">
      <p className="text-base font-semibold text-slate-800">
        {index} {title}
      </p>
      {rightText ? (
        <button
          type="button"
          onClick={onRightAction}
          className="text-sm font-semibold text-sky-700"
        >
          {rightText}
        </button>
      ) : null}
    </div>
  );
}

function TopMeta({
  label,
  value,
  dark,
}: {
  label: string;
  value: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 ${
        dark ? "border-white/12 bg-white/10" : "border-slate-200 bg-slate-50"
      }`}
    >
      <p
        className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
          dark ? "text-white/65" : "text-slate-500"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-2 text-sm font-semibold ${
          dark ? "text-white" : "text-slate-950"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function InputField({
  label,
  placeholder,
  value,
  onChange,
  required,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm text-slate-500">
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm text-slate-500">
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
      >
        {options.map((option) => (
          <option key={option || "empty"} value={option}>
            {option || "Select"}
          </option>
        ))}
      </select>
    </label>
  );
}

function FeaturePill({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
      {icon}
      {text}
    </span>
  );
}

function ItineraryLine({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 px-3 py-3">
      <div className="mt-0.5 shrink-0 text-slate-500">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          {title}
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-700">{value}</p>
      </div>
    </div>
  );
}

function PolicyCard({
  title,
  goodDate,
  badDate,
  points,
}: {
  title: string;
  goodDate: string;
  badDate: string;
  points: string[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xl font-semibold text-slate-950">{title}</p>

      <div className="mt-4">
        <div className="h-1 rounded-full bg-[linear-gradient(90deg,#89c56b_0%,#f3cf7d_50%,#ee9b63_100%)]" />
        <div className="mt-2 flex items-center justify-between text-sm">
          <div>
            <p className="font-semibold text-sky-900">{goodDate}</p>
            <p className="text-slate-500">Lower charge zone</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-orange-700">{badDate}</p>
            <p className="text-slate-500">Higher charge zone</p>
          </div>
        </div>
      </div>

      <ul className="mt-4 space-y-2 text-sm text-slate-600">
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </div>
  );
}

function PriceRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span
        className={
          strong
            ? "text-sm font-semibold text-slate-800"
            : "text-sm text-slate-500"
        }
      >
        {label}
      </span>
      <span
        className={
          strong
            ? "text-sm font-semibold text-slate-950"
            : "text-sm font-medium text-slate-950"
        }
      >
        {value}
      </span>
    </div>
  );
}

function MiniSummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 px-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="max-w-[62%] text-right text-sm font-medium text-slate-900">
        {value}
      </span>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
      {children}
    </span>
  );
}