import type { Hotel, HotelTag } from "@/data/hotels";
import { hotels } from "@/data/hotels";
import {
  getRecommendedTransfer as getRecommendedTransferFromPricing,
} from "@/lib/helpers/pricing";
import type { Transfer, TransferPurpose } from "@/data/transfers";

export type PackageLike = {
  id: string;
  title: string;
  basePrice: number;
  popularityScore?: number;
  marginScore?: number;
  budgetFitScore?: number;
  tripMoodFitScore?: number;
  recommendedLabel?: string;
};

export type TripDayType =
  | "arrival"
  | "full-day"
  | "relaxed"
  | "departure";

export type DayPlan = {
  dayNumber: number;
  label: string;
  dayType: TripDayType;
  allowedTimeSlots: Array<"morning" | "afternoon" | "evening" | "night">;
  notes: string[];
};

type BuildTripDayParams = {
  nights: number;
  arrivalTimeSlot?: "early-morning" | "morning" | "afternoon" | "evening" | "night";
  departureTimeSlot?: "morning" | "afternoon" | "evening" | "night";
};

export function getRecommendedPackages(packages: PackageLike[]): PackageLike[] {
  return [...packages]
    .sort((a, b) => {
      const scoreA =
        (a.popularityScore || 0) +
        (a.marginScore || 0) +
        (a.budgetFitScore || 0) +
        (a.tripMoodFitScore || 0);

      const scoreB =
        (b.popularityScore || 0) +
        (b.marginScore || 0) +
        (b.budgetFitScore || 0) +
        (b.tripMoodFitScore || 0);

      return scoreB - scoreA;
    })
    .slice(0, 6);
}

export function getPackageBadge(pkg: PackageLike): string {
  if (pkg.recommendedLabel) return pkg.recommendedLabel;
  if ((pkg.popularityScore || 0) >= 9) return "Most Booked";
  if ((pkg.budgetFitScore || 0) >= 9) return "Best Value";
  if ((pkg.tripMoodFitScore || 0) >= 9) return "Great Match for You";
  if ((pkg.marginScore || 0) >= 9) return "Top Pick";
  return "Popular Choice";
}

export function getRecommendationReason(pkg: PackageLike): string {
  if ((pkg.tripMoodFitScore || 0) >= 9) {
    return "This package strongly matches your selected trip mood.";
  }

  if ((pkg.budgetFitScore || 0) >= 9) {
    return "This package gives a strong balance of experience and value.";
  }

  if ((pkg.popularityScore || 0) >= 9) {
    return "Travelers choose this package often for its overall convenience.";
  }

  if ((pkg.marginScore || 0) >= 9) {
    return "This option includes premium value additions and smoother experience.";
  }

  return "This is a solid all-round option for your travel plan.";
}

export function buildTripDayPlans(params: BuildTripDayParams): DayPlan[] {
  const totalDays = Math.max(1, params.nights + 1);
  const plans: DayPlan[] = [];

  for (let day = 1; day <= totalDays; day += 1) {
    if (day === 1) {
      const notes = ["Arrival day should stay light and practical."];

      if (
        params.arrivalTimeSlot === "early-morning" ||
        params.arrivalTimeSlot === "morning"
      ) {
        notes.push("Avoid strict early-entry sightseeing after overnight flights.");
        plans.push({
          dayNumber: day,
          label: "Arrival Day",
          dayType: "arrival",
          allowedTimeSlots: ["afternoon", "evening", "night"],
          notes,
        });
      } else {
        notes.push("Keep the plan flexible around check-in and rest.");
        plans.push({
          dayNumber: day,
          label: "Arrival Day",
          dayType: "arrival",
          allowedTimeSlots: ["evening", "night"],
          notes,
        });
      }

      continue;
    }

    if (day === totalDays) {
      const notes = ["Departure day should stay operationally safe and buffer-friendly."];

      if (params.departureTimeSlot === "morning") {
        notes.push("Do not recommend major sightseeing.");
        plans.push({
          dayNumber: day,
          label: "Departure Day",
          dayType: "departure",
          allowedTimeSlots: [],
          notes,
        });
      } else if (params.departureTimeSlot === "afternoon") {
        notes.push("Only short and nearby activities should be shown.");
        plans.push({
          dayNumber: day,
          label: "Departure Day",
          dayType: "departure",
          allowedTimeSlots: ["morning"],
          notes,
        });
      } else {
        notes.push("A light half-day plan may be possible before airport transfer.");
        plans.push({
          dayNumber: day,
          label: "Departure Day",
          dayType: "departure",
          allowedTimeSlots: ["morning", "afternoon"],
          notes,
        });
      }

      continue;
    }

    plans.push({
      dayNumber: day,
      label: `Day ${day}`,
      dayType: "full-day",
      allowedTimeSlots: ["morning", "afternoon", "evening"],
      notes: ["Best suited for primary sightseeing and main city experiences."],
    });
  }

  return plans;
}

export function isEarlyStartRestrictedOnArrival(
  arrivalTimeSlot?: "early-morning" | "morning" | "afternoon" | "evening" | "night"
): boolean {
  return arrivalTimeSlot === "early-morning" || arrivalTimeSlot === "morning";
}

export function getHotelTagMatches(tripStyle: string, travellingWith: string): HotelTag[] {
  const normalizedStyle = tripStyle.toLowerCase();
  const normalizedGroup = travellingWith.toLowerCase();

  const tags = new Set<HotelTag>();

  if (normalizedStyle.includes("lux")) tags.add("luxury");
  if (normalizedStyle.includes("shop")) tags.add("shopping");
  if (normalizedStyle.includes("night")) tags.add("nightlife");
  if (normalizedStyle.includes("mixed")) tags.add("first-timer");
  if (normalizedStyle.includes("comfort")) tags.add("premium-comfort");

  if (normalizedGroup.includes("couple")) tags.add("couple");
  if (normalizedGroup.includes("family")) tags.add("family");
  if (normalizedGroup.includes("friend")) tags.add("nightlife");

  if (tags.size === 0) {
    tags.add("first-timer");
    tags.add("value");
  }

  return [...tags];
}

export function getRecommendedHotels(params: {
  destinationId?: string;
  budget?: string;
  category?: "3 Star" | "4 Star" | "5 Star";
  tripStyle?: string;
  travellingWith?: string;
  limit?: number;
}): Hotel[] {
  const destinationId = params.destinationId ?? "dest-bangkok";
  const requestedTags = getHotelTagMatches(
    params.tripStyle ?? "Mixed",
    params.travellingWith ?? "Couple"
  );

  return hotels
    .filter(
      (hotel) =>
        hotel.isActive &&
        hotel.destinationId === destinationId &&
        (!params.category || hotel.category === params.category)
    )
    .map((hotel) => {
      const tagScore = hotel.tags.reduce(
        (sum, tag) => sum + (requestedTags.includes(tag) ? 2 : 0),
        0
      );

      const budgetScore =
        params.budget === "Economy" && hotel.category === "3 Star"
          ? 3
          : params.budget === "Comfort" && hotel.category === "4 Star"
          ? 3
          : (params.budget === "Premium" || params.budget === "Luxury") &&
            hotel.category === "5 Star"
          ? 3
          : 0;

      const score = tagScore + budgetScore + hotel.rating;

      return { hotel, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, params.limit ?? 6)
    .map((item) => item.hotel);
}

export function getRecommendedTransfer(params: {
  adults: number;
  children: number;
  purpose: TransferPurpose;
  destinationId?: string;
  budget?: string;
  travellingWith?: string;
}): Transfer | null {
  const preferPremium =
    params.budget === "Luxury" ||
    params.budget === "Premium" ||
    (params.travellingWith ?? "").toLowerCase().includes("couple");

  return getRecommendedTransferFromPricing({
    adults: params.adults,
    children: params.children,
    purpose: params.purpose,
    destinationId: params.destinationId ?? "dest-bangkok",
    preferPremium,
  });
}