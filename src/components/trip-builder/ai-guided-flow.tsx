"use client";

type AIGuidedFlowProps = {
  tripStyle?: string;
  travellingWith?: string;
  budget?: string;
  priority?: string;
  specialRequest?: string;
};

function normalize(value: string | undefined, fallback: string) {
  return (value ?? fallback).toLowerCase();
}

function getRecommendation(params: {
  tripStyle?: string;
  travellingWith?: string;
  budget?: string;
  priority?: string;
  specialRequest?: string;
}) {
  const style = normalize(params.tripStyle, "mixed");
  const group = normalize(params.travellingWith, "couple");
  const budget = normalize(params.budget, "comfort");
  const priority = normalize(params.priority, "value");
  const specialRequest = params.specialRequest?.trim() ?? "";

  let title = "Balanced Thailand Plan";
  let summary =
    "A well-paced Thailand itinerary with a practical mix of comfort, sightseeing, and free time.";
  let hotelTier = "4★ hotel";
  let route = "Bangkok + Pattaya";
  let nights = "5N / 6D";

  if (style.includes("luxury")) {
    title = "Luxury Thailand Escape";
    summary =
      "Premium stay selection with smoother transfers, elevated hotel comfort, and slower pacing.";
    hotelTier = "4★ premium stay";
    route = "Bangkok + Pattaya";
    nights = "5N / 6D";
  } else if (style.includes("shopping")) {
    title = "Bangkok Shopping Break";
    summary =
      "Built around city convenience, shopping zones, easy transfers, and flexible evenings.";
    hotelTier = "4★ city hotel";
    route = "Bangkok";
    nights = "4N / 5D";
  } else if (style.includes("nightlife")) {
    title = "Bangkok After Dark";
    summary =
      "A city-led plan with late evenings, central stays, and flexible daytime recovery windows.";
    hotelTier = "4★ central stay";
    route = "Bangkok + Pattaya";
    nights = "4N / 5D";
  } else if (style.includes("family")) {
    title = "Family Fun Thailand";
    summary =
      "A smoother itinerary with practical transfers, family-friendly pacing, and lighter day loads.";
    hotelTier = "4★ family-friendly hotel";
    route = "Bangkok + Pattaya";
    nights = "5N / 6D";
  } else if (style.includes("adventure")) {
    title = "Adventure Thailand Route";
    summary =
      "An active trip structure with day outings, efficient transfers, and tighter routing.";
    hotelTier = "4★ hotel";
    route = "Bangkok + Pattaya";
    nights = "5N / 6D";
  }

  if (budget.includes("economy")) {
    hotelTier = "3★ hotel";
  } else if (budget.includes("premium") || budget.includes("luxury")) {
    hotelTier = hotelTier.includes("premium") ? hotelTier : "4★ premium stay";
  }

  const notes: string[] = [];

  if (group.includes("family")) {
    notes.push("family-friendly pacing");
  }
  if (group.includes("friends")) {
    notes.push("group-friendly rooming and transfers");
  }
  if (group.includes("solo")) {
    notes.push("safer central routing");
  }
  if (priority.includes("value")) {
    notes.push("better value balance");
  }
  if (priority.includes("comfort")) {
    notes.push("higher comfort focus");
  }
  if (priority.includes("fast")) {
    notes.push("faster decision-making");
  }
  if (specialRequest) {
    notes.push(`special request noted: ${specialRequest}`);
  }

  return {
    title,
    summary,
    hotelTier,
    route,
    nights,
    notes,
  };
}

export function AIGuidedFlow({
  tripStyle = "mixed",
  travellingWith = "couple",
  budget = "comfort",
  priority = "value",
  specialRequest = "",
}: AIGuidedFlowProps) {
  const recommendation = getRecommendation({
    tripStyle,
    travellingWith,
    budget,
    priority,
    specialRequest,
  });

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">
          AI recommendation
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-950">
          {recommendation.title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {recommendation.summary}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Route
          </p>
          <p className="mt-2 text-base font-semibold text-slate-950">
            {recommendation.route}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Stay style
          </p>
          <p className="mt-2 text-base font-semibold text-slate-950">
            {recommendation.hotelTier}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Suggested duration
          </p>
          <p className="mt-2 text-base font-semibold text-slate-950">
            {recommendation.nights}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-950">Why AI picked this</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {recommendation.notes.length > 0 ? (
            recommendation.notes.map((note) => (
              <span
                key={note}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              >
                {note}
              </span>
            ))
          ) : (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              balanced recommendation
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIGuidedFlow;