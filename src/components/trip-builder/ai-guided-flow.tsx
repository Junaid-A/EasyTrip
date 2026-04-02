"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  SendHorizonal,
  Shuffle,
} from "lucide-react";
import { standardPackages, type StandardPackage } from "@/lib/mock/bangkok-builder-data";
import { useTripBuilderStore } from "@/store/useTripBuilderStore";

type Props = {
  departureCityLabel: string;
  destinationCity: string;
  departureDate: string;
  adults: number;
  children: number;
  rooms: number;
  onResetConversation?: () => void;
};

type Message = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

type StepKey = "idle" | "mood" | "budget" | "duration" | "flights" | "done";

type SurpriseState = {
  mood: string;
  budget: string;
  duration: string;
  flights: string;
};

const moodOptions = [
  "Relaxed",
  "Romantic",
  "Family Fun",
  "Adventure",
  "Luxury",
  "Nightlife",
  "Shopping",
  "Balanced",
];

const budgetOptions = ["Budget", "Comfort", "Premium", "Luxury"];
const durationOptions = ["3N-4N", "5N-6N", "7N-8N", "9N+"];
const flightOptions = ["With Flights", "Without Flights", "Decide Later"];

const promptIdeas = [
  "Plan a smooth couple trip",
  "I want a family-friendly holiday",
  "Show me something premium",
  "Give me a relaxed trip",
  "I want more shopping and nightlife",
  "Surprise me",
];

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

function buildItineraryText(state: SurpriseState, destinationCity: string) {
  const mood = state.mood.toLowerCase();
  const withFlights = state.flights === "With Flights";

  if (state.duration === "3N-4N") {
    return [
      `Day 1: Arrival in ${destinationCity}, hotel check-in, lighter evening, and local area settling.`,
      `Day 2: Main sightseeing and shopping flow based on the ${mood} mood.`,
      `Day 3: Flexible day for themed experiences, upgrades, or free time.`,
      `Day 4: Breakfast, checkout, and departure${withFlights ? " with flight-inclusive flow." : "."}`,
    ].join("\n");
  }

  if (state.duration === "7N-8N" || state.duration === "9N+") {
    return [
      `Day 1: Arrival, check-in, and easy evening.`,
      `Day 2: City orientation and core highlights.`,
      `Day 3: Full activity day aligned to ${mood} mood.`,
      `Day 4: Flexible leisure or intercity extension day.`,
      `Day 5: Signature experiences and shopping / free-time balance.`,
      `Day 6: Lighter recovery or luxury add-on day.`,
      `Day 7: Final city time and wrap-up.`,
      withFlights
        ? `Last Day: Checkout and return with flight-inclusive package flow.`
        : `Last Day: Checkout and departure without flights in package.`,
    ].join("\n");
  }

  return [
    `Day 1: Arrival in ${destinationCity}, hotel check-in, and relaxed evening.`,
    `Day 2: Popular city highlights and orientation.`,
    `Day 3: Experience day shaped around ${mood} preference.`,
    `Day 4: Free time, shopping, or optional add-ons.`,
    `Day 5: Balanced sightseeing and lighter evening.`,
    withFlights
      ? `Day 6: Checkout and departure with flight-inclusive package flow.`
      : `Day 6: Checkout and departure without flights in package.`,
  ].join("\n");
}

function buildPackageSummary(state: SurpriseState, destinationCity: string) {
  return `Best fit direction: ${state.duration} ${destinationCity} plan · ${state.mood} mood · ${state.budget} budget · ${state.flights}.`;
}

function getDurationRange(value: string) {
  if (value === "3N-4N") return { min: 3, max: 4 };
  if (value === "5N-6N") return { min: 5, max: 6 };
  if (value === "7N-8N") return { min: 7, max: 8 };
  return { min: 9, max: 20 };
}

function chooseRecommendedPackage(state: SurpriseState) {
  const { min, max } = getDurationRange(state.duration);
  const wantsFlights = state.flights === "With Flights";

  const durationMatches = standardPackages.filter(
    (pkg) => pkg.durationNights >= min && pkg.durationNights <= max
  );

  const flightMatches = durationMatches.filter(
    (pkg) => pkg.includedFlights === wantsFlights
  );

  const sourcePool = flightMatches.length > 0 ? flightMatches : durationMatches;

  if (sourcePool.length === 0) {
    return standardPackages[0] ?? null;
  }

  if (state.budget === "Luxury") {
    return (
      sourcePool.find((pkg) => pkg.category.includes("premium")) ??
      sourcePool[sourcePool.length - 1]
    );
  }

  if (state.budget === "Premium") {
    return (
      sourcePool.find((pkg) => pkg.hotelCategory === "4 Star") ??
      sourcePool[Math.floor(sourcePool.length / 2)]
    );
  }

  if (state.mood === "Romantic") {
    return (
      sourcePool.find((pkg) => pkg.category.includes("honeymoon")) ??
      sourcePool[0]
    );
  }

  if (state.mood === "Family Fun") {
    return (
      sourcePool.find((pkg) => pkg.category.includes("family")) ??
      sourcePool[0]
    );
  }

  return sourcePool[0];
}

export function AIGuidedFlow({
  departureCityLabel,
  destinationCity,
  departureDate,
  adults,
  children,
  rooms,
}: Props) {
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

  const contextLine = `${departureCityLabel} → ${destinationCity} · ${formatLongDate(
    departureDate
  )} · ${adults} adult${adults > 1 ? "s" : ""}${
    children ? `, ${children} child${children > 1 ? "ren" : ""}` : ""
  } · ${rooms} room${rooms > 1 ? "s" : ""}`;

  const initialMessages = useMemo<Message[]>(
    () => [
      {
        id: "m-1",
        role: "assistant",
        text: `I already have your trip details: ${contextLine}. Tell me the kind of trip you want, or tap Surprise Me.`,
      },
    ],
    [contextLine]
  );

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [currentStep, setCurrentStep] = useState<StepKey>("idle");
  const [input, setInput] = useState("");
  const [showPromptIdeas, setShowPromptIdeas] = useState(false);
  const [state, setState] = useState<SurpriseState>({
    mood: "",
    budget: "",
    duration: "",
    flights: "",
  });

  function pushAssistant(text: string) {
    setMessages((prev) => [
      ...prev,
      {
        id: `a-${Date.now()}-${Math.random()}`,
        role: "assistant",
        text,
      },
    ]);
  }

  function pushUser(text: string) {
    setMessages((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}-${Math.random()}`,
        role: "user",
        text,
      },
    ]);
  }

  function startSurpriseFlow() {
    pushUser("Surprise me");
    pushAssistant("Great. Let us do it step by step. First, what is the mood of this trip?");
    setCurrentStep("mood");
  }

  function handleChoice(value: string) {
    pushUser(value);

    if (currentStep === "mood") {
      setState((prev) => ({ ...prev, mood: value }));
      setCurrentStep("budget");
      pushAssistant("Got it. What budget band should I plan around?");
      return;
    }

    if (currentStep === "budget") {
      setState((prev) => ({ ...prev, budget: value }));
      setCurrentStep("duration");
      pushAssistant("Understood. What should be the maximum duration of stay?");
      return;
    }

    if (currentStep === "duration") {
      setState((prev) => ({ ...prev, duration: value }));
      setCurrentStep("flights");
      pushAssistant("Final question. Should I consider flights in the package or keep them separate?");
      return;
    }

    if (currentStep === "flights") {
      const nextState = { ...state, flights: value };
      setState(nextState);
      setCurrentStep("done");

      pushAssistant(buildPackageSummary(nextState, destinationCity));
      pushAssistant(
        "Choose what you want next: Continue to Review with the recommended package, or Show Itinerary to see the day flow here in chat."
      );
    }
  }

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;

    pushUser(trimmed);
    setInput("");

    if (trimmed.toLowerCase() === "surprise me") {
      pushAssistant("Great. Let us do it step by step. First, what is the mood of this trip?");
      setCurrentStep("mood");
      return;
    }

    if (currentStep === "idle") {
      pushAssistant(
        "Got it. I can shape this in chat. Tap Surprise Me for a guided flow, or continue typing your preference."
      );
      return;
    }

    pushAssistant("Use the next answer options below so I can keep this planning flow clean and sequential.");
  }

  function handleContinueToReview() {
    if (currentStep !== "done") {
      pushAssistant("Complete the Surprise Me steps first, then I will take you to review.");
      return;
    }

    const recommended = chooseRecommendedPackage(state);

    if (!recommended) {
      pushAssistant("I could not find a package match yet. Try the guided steps again.");
      return;
    }

    const includedFlights = state.flights === "With Flights";
    const departureAirportCode =
      departureCityLabel.split("·")[1]?.trim() || "BLR";

    const priced = calculatePackagePrice({
      pkg: recommended,
      adults,
      children,
      rooms,
      departureAirportCode,
      includedFlights,
    });

    const pricing = buildStorePricingBreakdown(
      priced.totalPrice,
      priced.serviceFee,
      priced.flightTotal
    );

    const segments = buildSegments(recommended.citySplit, departureDate);
    const endDate = segments.at(-1)?.checkOut ?? departureDate;

    const travellingWith =
      adults >= 2 && children === 0 ? "Couple" : children > 0 ? "Family" : "Group";

    const derivedTravelStyle =
      state.budget === "Luxury"
        ? "Luxury"
        : state.budget === "Premium"
        ? "Easy & Comfortable"
        : "Balanced";

    setSelectedMode("ai");
    setBudget(state.budget);
    setMood(state.mood);
    setTravelStyle(derivedTravelStyle);
    setTravellingWith(travellingWith);
    setPriority(
      state.mood === "Romantic"
        ? "Better hotel"
        : state.mood === "Family Fun"
        ? "Family comfort"
        : "Balanced trip"
    );

    setTripDetails({
      selectedMode: "ai",
      destination: destinationCity,
      destinationId: "dest-bangkok",
      segments,
      travelDates: `${formatLongDate(departureDate)} - ${formatLongDate(endDate)}`,
      nights: `${recommended.durationNights} Nights`,
      budget: state.budget,
      travelStyle: derivedTravelStyle,
      travellingWith,
      priority:
        state.mood === "Romantic"
          ? "Better hotel"
          : state.mood === "Family Fun"
          ? "Family comfort"
          : "Balanced trip",
      serviceFee: priced.serviceFee,
    });

    setTravelers({ adults, children, rooms });
    setDayPlans(recommended.dayPlan);

    selectPackage({
      selectedPackageId: recommended.id,
      selectedPackageTitle: recommended.title,
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

    pushAssistant("Perfect. I have saved the recommended package and I am opening Review.");
    router.push("/review");
  }

  function handleShowItinerary() {
    if (currentStep !== "done") {
      pushAssistant("Complete the Surprise Me steps first, then I will show the itinerary in chat.");
      return;
    }

    pushAssistant(`Here is the itinerary in text format:\n\n${buildItineraryText(state, destinationCity)}`);
  }

  const activeOptions =
    currentStep === "mood"
      ? moodOptions
      : currentStep === "budget"
      ? budgetOptions
      : currentStep === "duration"
      ? durationOptions
      : currentStep === "flights"
      ? flightOptions
      : [];

  return (
    <div className="space-y-3">
      <div className="rounded-[30px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
        <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                AI trip planner
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {contextLine}
              </p>
            </div>

            <button
              type="button"
              onClick={startSurpriseFlow}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
            >
              <Shuffle className="h-4 w-4" />
              Surprise Me
            </button>
          </div>
        </div>

        <div className="flex h-[560px] flex-col sm:h-[620px]">
          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[88%] rounded-[24px] px-4 py-3 text-[15px] leading-7 whitespace-pre-line ${
                    message.role === "assistant"
                      ? "border border-slate-200 bg-slate-50 text-slate-800"
                      : "ml-auto bg-slate-950 text-white"
                  }`}
                >
                  {message.text}
                </div>
              ))}

              {currentStep === "done" ? (
                <div className="max-w-[88%] rounded-[24px] border border-slate-200 bg-white px-4 py-4">
                  <p className="text-sm font-semibold text-slate-950">Next actions</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleShowItinerary}
                      className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Show Itinerary
                    </button>
                    <button
                      type="button"
                      onClick={handleContinueToReview}
                      className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Continue to Review
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {activeOptions.length > 0 ? (
            <div className="border-t border-slate-200 px-4 py-3 sm:px-6">
              <div className="mx-auto max-w-3xl">
                <div className="flex flex-wrap gap-2">
                  {activeOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleChoice(option)}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          <div className="border-t border-slate-200 px-4 py-4 sm:px-6">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask for a better hotel, lower budget, different area, or premium plan"
                  className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm text-slate-950 outline-none transition focus:border-slate-300 focus:bg-white"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-white transition hover:bg-slate-800"
                >
                  <SendHorizonal className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowPromptIdeas((prev) => !prev)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
                >
                  {showPromptIdeas ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  Prompt ideas
                </button>

                {showPromptIdeas ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {promptIdeas.map((idea) => (
                      <button
                        key={idea}
                        type="button"
                        onClick={() => {
                          setInput(idea);
                          setShowPromptIdeas(false);
                        }}
                        className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        {idea}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}