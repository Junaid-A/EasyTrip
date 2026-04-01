"use client";

import { create } from "zustand";
import type { DayPlanItem, TripSegment } from "@/lib/mock/bangkok-builder-data";

export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

type PackageSelection = {
  selectedPackageId: string;
  selectedPackageTitle: string;
  selectedPackagePrice: number;
  selectedFlightMode?: 0 | 1;
  selectedFlightLabel?: string;
};

type TripBuilderState = {
  selectedMode: "standard" | "ai" | "custom";

  destination: string;
  destinationId: string;
  segments: TripSegment[];
  arrivalTimeSlot: string;
  departureTimeSlot: string;

  travelDates: string;
  nights: string;
  adults: number;
  children: number;
  rooms: number;

  budget: string;
  mood: string;
  travelStyle: string;
  travellingWith: string;
  priority: string;
  specialPreferences: string[];
  specialRequest: string;

  aiPrompt: string;
  aiChatMessages: ChatMessage[];

  selectedPackageId: string;
  selectedPackageTitle: string;
  selectedPackagePrice: number;

  selectedFlightMode: 0 | 1;
  selectedFlightLabel: string;

  selectedHotelId: string;
  hotelCategory: "3 Star" | "4 Star" | "5 Star";

  selectedArrivalTransferId: string;
  selectedDepartureTransferId: string;
  selectedLocalTransferId: string;
  transferType: string;

  selectedSightseeingIds: string[];
  selectedMealIds: string[];
  selectedExtras: string[];
  selectedAddOns: string[];

  roomPreference: string;
  serviceFee: number;
  bookingId: string;

  dayPlans: DayPlanItem[];

  estimatedFlightTotal: number;
  estimatedHotelTotal: number;
  estimatedTransferTotal: number;
  estimatedSightseeingTotal: number;
  estimatedMealsTotal: number;
  estimatedGrandTotal: number;

  setTripDetails: (
    payload: Partial<
      Pick<
        TripBuilderState,
        | "selectedMode"
        | "destination"
        | "destinationId"
        | "segments"
        | "travelDates"
        | "nights"
        | "budget"
        | "travelStyle"
        | "travellingWith"
        | "priority"
        | "serviceFee"
      >
    >
  ) => void;

  setSelectedMode: (value: "standard" | "ai" | "custom") => void;
  setBudget: (value: string) => void;
  setMood: (value: string) => void;
  setTravelStyle: (value: string) => void;
  setTravellingWith: (value: string) => void;
  setPriority: (value: string) => void;
  setSpecialRequest: (value: string) => void;

  setSegments: (segments: TripSegment[]) => void;
  addSegment: (segment: TripSegment) => void;
  updateSegment: (segmentId: string, payload: Partial<TripSegment>) => void;
  removeSegment: (segmentId: string) => void;

  setArrivalTimeSlot: (value: string) => void;
  setDepartureTimeSlot: (value: string) => void;
  setTravelers: (payload: {
    adults?: number;
    children?: number;
    rooms?: number;
  }) => void;

  togglePreference: (value: string) => void;
  setAiPrompt: (value: string) => void;
  addAiChatMessage: (message: ChatMessage) => void;
  resetAiChat: () => void;

  selectPackage: (payload: PackageSelection) => void;
  setFlightChoice: (value: 0 | 1, label?: string) => void;

  setSelectedHotelId: (value: string) => void;
  setHotelCategory: (value: "3 Star" | "4 Star" | "5 Star") => void;

  setSelectedArrivalTransferId: (value: string) => void;
  setSelectedDepartureTransferId: (value: string) => void;
  setSelectedLocalTransferId: (value: string) => void;
  setTransferType: (value: string) => void;

  toggleSightseeing: (value: string) => void;
  toggleMeal: (value: string) => void;
  toggleExtra: (value: string) => void;
  toggleAddOn: (value: string) => void;

  setRoomPreference: (value: string) => void;
  setDayPlans: (plans: DayPlanItem[]) => void;

  setTotals: (payload: {
    estimatedFlightTotal?: number;
    estimatedHotelTotal?: number;
    estimatedTransferTotal?: number;
    estimatedSightseeingTotal?: number;
    estimatedMealsTotal?: number;
    estimatedGrandTotal?: number;
  }) => void;

  setBookingId: (value: string) => void;
  resetTrip: () => void;
};

const initialAiMessages: ChatMessage[] = [
  {
    id: "ai-1",
    role: "assistant",
    text: "Tell me the kind of holiday you want and I will guide you toward the best trip style.",
  },
  {
    id: "ai-2",
    role: "assistant",
    text: "You can mention family trip, nightlife, shopping, comfort, luxury, or a relaxed pace.",
  },
];

const initialState: Omit<
  TripBuilderState,
  | "setTripDetails"
  | "setSelectedMode"
  | "setBudget"
  | "setMood"
  | "setTravelStyle"
  | "setTravellingWith"
  | "setPriority"
  | "setSpecialRequest"
  | "setSegments"
  | "addSegment"
  | "updateSegment"
  | "removeSegment"
  | "setArrivalTimeSlot"
  | "setDepartureTimeSlot"
  | "setTravelers"
  | "togglePreference"
  | "setAiPrompt"
  | "addAiChatMessage"
  | "resetAiChat"
  | "selectPackage"
  | "setFlightChoice"
  | "setSelectedHotelId"
  | "setHotelCategory"
  | "setSelectedArrivalTransferId"
  | "setSelectedDepartureTransferId"
  | "setSelectedLocalTransferId"
  | "setTransferType"
  | "toggleSightseeing"
  | "toggleMeal"
  | "toggleExtra"
  | "toggleAddOn"
  | "setRoomPreference"
  | "setDayPlans"
  | "setTotals"
  | "setBookingId"
  | "resetTrip"
> = {
  selectedMode: "standard",

  destination: "Bangkok",
  destinationId: "dest-bangkok",
  segments: [
    {
      id: "segment-1",
      city: "Bangkok",
      destinationId: "dest-bangkok",
      checkIn: "",
      checkOut: "",
    },
  ],
  arrivalTimeSlot: "morning",
  departureTimeSlot: "evening",

  travelDates: "12 Apr 2026 - 17 Apr 2026",
  nights: "5 Nights",
  adults: 2,
  children: 0,
  rooms: 1,

  budget: "Premium",
  mood: "Shopping",
  travelStyle: "Luxury",
  travellingWith: "Couple",
  priority: "Better hotel",
  specialPreferences: ["Private transfers"],
  specialRequest: "",

  aiPrompt:
    "I want a premium Bangkok trip with a clean hotel, private transfers, and a balanced mix of shopping, nightlife, and sightseeing.",
  aiChatMessages: initialAiMessages,

  selectedPackageId: "",
  selectedPackageTitle: "",
  selectedPackagePrice: 0,

  selectedFlightMode: 0,
  selectedFlightLabel: "Without Flight",

  selectedHotelId: "",
  hotelCategory: "4 Star",

  selectedArrivalTransferId: "",
  selectedDepartureTransferId: "",
  selectedLocalTransferId: "",
  transferType: "Private Transfer",

  selectedSightseeingIds: [],
  selectedMealIds: [],
  selectedExtras: ["Breakfast included"],
  selectedAddOns: [],

  roomPreference: "Deluxe Room",
  serviceFee: 3000,
  bookingId: "ET365-DEMO-001",

  dayPlans: [],

  estimatedFlightTotal: 0,
  estimatedHotelTotal: 0,
  estimatedTransferTotal: 0,
  estimatedSightseeingTotal: 0,
  estimatedMealsTotal: 0,
  estimatedGrandTotal: 0,
};

function toggleInArray(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export const useTripBuilderStore = create<TripBuilderState>((set) => ({
  ...initialState,

  setTripDetails: (payload) => set((state) => ({ ...state, ...payload })),

  setSelectedMode: (value) => set({ selectedMode: value }),
  setBudget: (value) => set({ budget: value }),
  setMood: (value) => set({ mood: value }),
  setTravelStyle: (value) => set({ travelStyle: value }),
  setTravellingWith: (value) => set({ travellingWith: value }),
  setPriority: (value) => set({ priority: value }),
  setSpecialRequest: (value) => set({ specialRequest: value }),

  setSegments: (segments) => set({ segments }),
  addSegment: (segment) =>
    set((state) => ({
      segments: [...state.segments, segment],
    })),
  updateSegment: (segmentId, payload) =>
    set((state) => ({
      segments: state.segments.map((segment) =>
        segment.id === segmentId ? { ...segment, ...payload } : segment
      ),
    })),
  removeSegment: (segmentId) =>
    set((state) => ({
      segments: state.segments.filter((segment) => segment.id !== segmentId),
    })),

  setArrivalTimeSlot: (value) => set({ arrivalTimeSlot: value }),
  setDepartureTimeSlot: (value) => set({ departureTimeSlot: value }),
  setTravelers: (payload) =>
    set((state) => ({
      adults: payload.adults ?? state.adults,
      children: payload.children ?? state.children,
      rooms: payload.rooms ?? state.rooms,
    })),

  togglePreference: (value) =>
    set((state) => ({
      specialPreferences: toggleInArray(state.specialPreferences, value),
    })),
  setAiPrompt: (value) => set({ aiPrompt: value }),
  addAiChatMessage: (message) =>
    set((state) => ({
      aiChatMessages: [...state.aiChatMessages, message],
    })),
  resetAiChat: () => set({ aiChatMessages: initialAiMessages }),

  selectPackage: (payload) =>
    set({
      selectedPackageId: payload.selectedPackageId,
      selectedPackageTitle: payload.selectedPackageTitle,
      selectedPackagePrice: payload.selectedPackagePrice,
      selectedFlightMode: payload.selectedFlightMode ?? 0,
      selectedFlightLabel:
        payload.selectedFlightLabel ??
        (payload.selectedFlightMode === 1 ? "With Flight" : "Without Flight"),
    }),

  setFlightChoice: (value, label) =>
    set({
      selectedFlightMode: value,
      selectedFlightLabel: label ?? (value === 1 ? "With Flight" : "Without Flight"),
    }),

  setSelectedHotelId: (value) => set({ selectedHotelId: value }),
  setHotelCategory: (value) => set({ hotelCategory: value }),

  setSelectedArrivalTransferId: (value) => set({ selectedArrivalTransferId: value }),
  setSelectedDepartureTransferId: (value) => set({ selectedDepartureTransferId: value }),
  setSelectedLocalTransferId: (value) => set({ selectedLocalTransferId: value }),
  setTransferType: (value) => set({ transferType: value }),

  toggleSightseeing: (value) =>
    set((state) => ({
      selectedSightseeingIds: toggleInArray(state.selectedSightseeingIds, value),
    })),
  toggleMeal: (value) =>
    set((state) => ({
      selectedMealIds: toggleInArray(state.selectedMealIds, value),
    })),
  toggleExtra: (value) =>
    set((state) => ({
      selectedExtras: toggleInArray(state.selectedExtras, value),
    })),
  toggleAddOn: (value) =>
    set((state) => ({
      selectedAddOns: toggleInArray(state.selectedAddOns, value),
    })),

  setRoomPreference: (value) => set({ roomPreference: value }),
  setDayPlans: (plans) => set({ dayPlans: plans }),

  setTotals: (payload) =>
    set((state) => ({
      estimatedFlightTotal: payload.estimatedFlightTotal ?? state.estimatedFlightTotal,
      estimatedHotelTotal: payload.estimatedHotelTotal ?? state.estimatedHotelTotal,
      estimatedTransferTotal:
        payload.estimatedTransferTotal ?? state.estimatedTransferTotal,
      estimatedSightseeingTotal:
        payload.estimatedSightseeingTotal ?? state.estimatedSightseeingTotal,
      estimatedMealsTotal: payload.estimatedMealsTotal ?? state.estimatedMealsTotal,
      estimatedGrandTotal: payload.estimatedGrandTotal ?? state.estimatedGrandTotal,
    })),

  setBookingId: (value) => set({ bookingId: value }),

  resetTrip: () => ({
    ...initialState,
    bookingId: `ET365-DEMO-${Math.floor(100 + Math.random() * 900)}`,
  }),
}));