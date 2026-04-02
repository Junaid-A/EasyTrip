"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  SendHorizonal,
  Shuffle,
} from "lucide-react";

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

export function AIGuidedFlow({
  departureCityLabel,
  destinationCity,
  departureDate,
  adults,
  children,
  rooms,
}: Props) {
  const router = useRouter();

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
        "Choose what you want next: View Packages to open results, or Show Itinerary to see the day flow here in chat."
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

  function handleViewPackages() {
    if (currentStep !== "done") {
      pushAssistant("Complete the Surprise Me steps first, then I will open the package results page.");
      return;
    }

    pushAssistant("Opening package results.");
    router.push("/results");
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
                      onClick={handleViewPackages}
                      className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Show Itinerary
                    </button>
                    <button
                      type="button"
                      onClick={handleShowItinerary}
className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      View Packages
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
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white">
        <button
          type="button"
          onClick={() => setShowPromptIdeas((prev) => !prev)}
          className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-6"
        >
          <div>
            <p className="text-sm font-semibold text-slate-950">Prompt ideas</p>
            <p className="mt-1 text-xs text-slate-500">
              Quick starters outside the chat input.
            </p>
          </div>

          <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700">
            {showPromptIdeas ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </button>

        {showPromptIdeas ? (
          <div className="border-t border-slate-200 px-4 py-4 sm:px-6">
            <div className="flex flex-wrap gap-2">
              {promptIdeas.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    if (prompt === "Surprise me") {
                      startSurpriseFlow();
                      return;
                    }
                    setInput(prompt);
                  }}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default AIGuidedFlow;