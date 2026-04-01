export const planningModes = [
  {
    id: "standard",
    title: "Ready Packages",
    shortTitle: "Standard",
    description:
      "Pick from our ready-made holiday packages. Best when you want something quick and easy.",
    ctaLabel: "See Packages",
  },
  {
    id: "ai",
    title: "AI Planner",
    shortTitle: "AI",
    description:
      "Answer a few simple questions and get smart trip suggestions with a guided planning feel.",
    ctaLabel: "Plan with AI",
  },
  {
    id: "custom",
    title: "Build My Trip",
    shortTitle: "Custom",
    description:
      "Choose your hotel, transfers, sightseeing, meals, and extras step by step.",
    ctaLabel: "Start Custom Trip",
  },
] as const;

export const budgets = [
  { id: "budget", label: "Budget Friendly", min: 15000, max: 35000 },
  { id: "comfort", label: "Comfort", min: 35000, max: 65000 },
  { id: "premium", label: "Premium", min: 65000, max: 120000 },
  { id: "luxury", label: "Luxury", min: 120000, max: 250000 },
] as const;

export const moods = [
  "Romantic",
  "Family Fun",
  "Relaxed",
  "Adventure",
  "Shopping",
  "Nightlife",
  "Culture",
  "Luxury Escape",
] as const;

export const travelStyles = [
  "Easy & Comfortable",
  "Balanced",
  "Premium Stay",
  "Luxury",
  "Fast-Paced",
  "Family Friendly",
  "Couple Friendly",
] as const;

export const specialPreferences = [
  "Private transfers",
  "Indian meals",
  "Near city center",
  "Kid friendly",
  "Nightlife access",
  "Beach access",
  "Shopping area stay",
  "Late check-in support",
] as const;

export const quickAiPrompts = [
  "I want a smooth couple trip with shopping and nightlife.",
  "Plan something easy for a family with one child.",
  "Show me a premium trip with better hotels and private transfers.",
  "I want a relaxed holiday with less rushing around.",
] as const;

export const standardPackageShowcase = [
  {
    id: "pkg-1",
    title: "Bangkok Easy Escape",
    subtitle: "Quick, simple, and best value",
    price: 28900,
    nights: "4 Nights",
    badge: "Best Value",
    highlights: ["4-star stay", "Airport pickup", "City tour"],
  },
  {
    id: "pkg-2",
    title: "Bangkok Premium Getaway",
    subtitle: "Most loved for couples",
    price: 39500,
    nights: "5 Nights",
    badge: "Most Popular",
    highlights: ["Better area hotel", "Private transfer", "Flexible sightseeing"],
  },
  {
    id: "pkg-3",
    title: "Bangkok Family Fun",
    subtitle: "Easy for families",
    price: 42200,
    nights: "5 Nights",
    badge: "Family Pick",
    highlights: ["Family stay", "Kid-friendly picks", "Smooth transfers"],
  },
] as const;