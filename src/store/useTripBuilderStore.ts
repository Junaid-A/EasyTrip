import { create } from "zustand";
import type { TripDayType } from "@/lib/helpers/recommendation";

export type TripBuilderMode = "standard" | "ai" | "custom";

export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

export type TripSegment = {
  id: string;
  city: string;
  destinationId: string;
  checkIn: string;
  checkOut: string;
};

export type DayPlan = {
  dayNumber: number;
  label: string;
  dayType: TripDayType;
  allowedTimeSlots: Array<"morning" | "afternoon" | "evening" | "night">;
  notes: string[];
};

type PackageSelection = {
  selectedPackageId: string;
  selectedPackageTitle: string;
  selectedPackagePrice: number;
};

type TripBuilderState = {
  selectedMode: TripBuilderMode;

  destination: string;
  destinationId: string;
  segments: TripSegment[];
  arrivalTimeSlot: "early-morning" | "morning" | "afternoon" | "evening" | "night";
  departureTimeSlot: "morning" | "afternoon" | "evening" | "night";

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

  dayPlans: DayPlan[];

  estimatedHotelTotal: number;
  estimatedTransferTotal: number;
  estimatedSightseeingTotal: number;
  estimatedMealsTotal: number;
  estimatedGrandTotal: number;

  setTripDetails: (payload: Partial<TripBuilderState>) => void;
  setSelectedMode: (mode: TripBuilderMode) => void;
  setBudget: (value: string) => void;
  setMood: (value: string) => void;
  setTravelStyle: (value: string) => void;
  setTravellingWith: (value: string) => void;
  setPriority: (value: string) => void;
  setSpecialRequest: (value: string) => void;
  setSegments: (segments: TripSegment[]) => void;
  addSegment: () => void;
  updateSegment: (id: string, values: Partial<TripSegment>) => void;
  removeSegment: (id: string) => void;
  setArrivalTimeSlot: (
    value: "early-morning" | "morning" | "afternoon" | "evening" | "night"
  ) => void;
  setDepartureTimeSlot: (
    value: "morning" | "afternoon" | "evening" | "night"
  ) => void;

  setTravelers: (payload: { adults?: number; children?: number; rooms?: number }) => void;

  togglePreference: (value: string) => void;
  setAiPrompt: (value: string) => void;
  addAiChatMessage: (message: ChatMessage) => void;
  resetAiChat: () => void;

  selectPackage: (payload: PackageSelection) => void;
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
  setDayPlans: (plans: DayPlan[]) => void;
  setTotals: (payload: {
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
    text: "You can mention things like family trip, nightlife, shopping, comfort, luxury, or a relaxed pace.",
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

  selectedPackageId: "pkg-2",
  selectedPackageTitle: "Bangkok Premium Getaway",
  selectedPackagePrice: 39500,

  selectedHotelId: "",
  hotelCategory: "4 Star",

  selectedArrivalTransferId: "",
  selectedDepartureTransferId: "",
  selectedLocalTransferId: "",
  transferType: "Private Transfer",

  selectedSightseeingIds: [],
  selectedMealIds: [],
  selectedExtras: ["Breakfast included"],
  selectedAddOns: ["Private airport pickup", "Safari World"],

  roomPreference: "Deluxe Room",

  serviceFee: 3000,
  bookingId: "ET365-DEMO-001",

  dayPlans: [],

  estimatedHotelTotal: 0,
  estimatedTransferTotal: 0,
  estimatedSightseeingTotal: 0,
  estimatedMealsTotal: 0,
  estimatedGrandTotal: 0,
};

export const useTripBuilderStore = create<TripBuilderState>((set) => ({
  ...initialState,

  setTripDetails: (payload) =>
    set((state) => ({
      ...state,
      ...payload,
    })),

  setSelectedMode: (mode) =>
    set(() => ({
      selectedMode: mode,
    })),

  setBudget: (value) =>
    set(() => ({
      budget: value,
    })),

  setMood: (value) =>
    set(() => ({
      mood: value,
    })),

  setTravelStyle: (value) =>
    set(() => ({
      travelStyle: value,
    })),

  setTravellingWith: (value) =>
    set(() => ({
      travellingWith: value,
    })),

  setPriority: (value) =>
    set(() => ({
      priority: value,
    })),

  setSpecialRequest: (value) =>
    set(() => ({
      specialRequest: value,
    })),

  setSegments: (segments) =>
    set(() => ({
      segments,
    })),

  addSegment: () =>
    set((state) => ({
      segments: [
        ...state.segments,
        {
          id: `segment-${Date.now()}`,
          city: "",
          destinationId: "",
          checkIn: "",
          checkOut: "",
        },
      ],
    })),

  updateSegment: (id, values) =>
    set((state) => ({
      segments: state.segments.map((segment) => {
        if (segment.id !== id) return segment;

        const next = { ...segment, ...values };

        if (
          next.checkIn &&
          next.checkOut &&
          new Date(next.checkOut).getTime() <= new Date(next.checkIn).getTime()
        ) {
          next.checkOut = "";
        }

        return next;
      }),
    })),

  removeSegment: (id) =>
    set((state) => ({
      segments:
        state.segments.length <= 1
          ? state.segments
          : state.segments.filter((segment) => segment.id !== id),
    })),

  setArrivalTimeSlot: (value) =>
    set(() => ({
      arrivalTimeSlot: value,
    })),

  setDepartureTimeSlot: (value) =>
    set(() => ({
      departureTimeSlot: value,
    })),

  setTravelers: ({ adults, children, rooms }) =>
    set((state) => ({
      adults: adults ?? state.adults,
      children: children ?? state.children,
      rooms: rooms ?? state.rooms,
    })),

  togglePreference: (value) =>
    set((state) => ({
      specialPreferences: state.specialPreferences.includes(value)
        ? state.specialPreferences.filter((item) => item !== value)
        : [...state.specialPreferences, value],
    })),

  setAiPrompt: (value) =>
    set(() => ({
      aiPrompt: value,
    })),

  addAiChatMessage: (message) =>
    set((state) => ({
      aiChatMessages: [...state.aiChatMessages, message],
    })),

  resetAiChat: () =>
    set(() => ({
      aiChatMessages: initialAiMessages,
    })),

  selectPackage: ({ selectedPackageId, selectedPackageTitle, selectedPackagePrice }) =>
    set(() => ({
      selectedPackageId,
      selectedPackageTitle,
      selectedPackagePrice,
    })),

  setSelectedHotelId: (value) =>
    set(() => ({
      selectedHotelId: value,
    })),

  setHotelCategory: (value) =>
    set(() => ({
      hotelCategory: value,
    })),

  setSelectedArrivalTransferId: (value) =>
    set(() => ({
      selectedArrivalTransferId: value,
    })),

  setSelectedDepartureTransferId: (value) =>
    set(() => ({
      selectedDepartureTransferId: value,
    })),

  setSelectedLocalTransferId: (value) =>
    set(() => ({
      selectedLocalTransferId: value,
    })),

  setTransferType: (value) =>
    set(() => ({
      transferType: value,
    })),

  toggleSightseeing: (value) =>
    set((state) => ({
      selectedSightseeingIds: state.selectedSightseeingIds.includes(value)
        ? state.selectedSightseeingIds.filter((item) => item !== value)
        : [...state.selectedSightseeingIds, value],
    })),

  toggleMeal: (value) =>
    set((state) => ({
      selectedMealIds: state.selectedMealIds.includes(value)
        ? state.selectedMealIds.filter((item) => item !== value)
        : [...state.selectedMealIds, value],
    })),

  toggleExtra: (value) =>
    set((state) => ({
      selectedExtras: state.selectedExtras.includes(value)
        ? state.selectedExtras.filter((item) => item !== value)
        : [...state.selectedExtras, value],
    })),

  toggleAddOn: (value) =>
    set((state) => ({
      selectedAddOns: state.selectedAddOns.includes(value)
        ? state.selectedAddOns.filter((item) => item !== value)
        : [...state.selectedAddOns, value],
    })),

  setRoomPreference: (value) =>
    set(() => ({
      roomPreference: value,
    })),

  setDayPlans: (plans) =>
    set(() => ({
      dayPlans: plans,
    })),

  setTotals: (payload) =>
    set((state) => ({
      estimatedHotelTotal: payload.estimatedHotelTotal ?? state.estimatedHotelTotal,
      estimatedTransferTotal: payload.estimatedTransferTotal ?? state.estimatedTransferTotal,
      estimatedSightseeingTotal:
        payload.estimatedSightseeingTotal ?? state.estimatedSightseeingTotal,
      estimatedMealsTotal: payload.estimatedMealsTotal ?? state.estimatedMealsTotal,
      estimatedGrandTotal: payload.estimatedGrandTotal ?? state.estimatedGrandTotal,
    })),

  setBookingId: (value) =>
    set(() => ({
      bookingId: value,
    })),

  resetTrip: () =>
    set(() => ({
      ...initialState,
      aiChatMessages: initialAiMessages,
    })),
}));