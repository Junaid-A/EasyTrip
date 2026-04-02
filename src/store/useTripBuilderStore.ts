"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { DayPlanItem, TripSegment } from "@/lib/mock/bangkok-builder-data";

export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

export type DayMoment = "morning" | "afternoon" | "evening" | "night";
export type DayType = "arrival" | "explore" | "transfer" | "departure";

export type CustomTripDay = {
  id: string;
  dayNumber: number;
  city: string;
  dateLabel: string;
  dayType: DayType;
  hotelCategory: "3 Star" | "4 Star" | "5 Star";
  selectedHotelId: string;
  selectedTransferIds: string[];
  selectedSightseeingIds: string[];
  selectedMealIds: string[];
  selectedExtraIds: string[];
  activeSlotFilter: DayMoment | "all";
  notes: string;
};

export type CustomExtraOption = {
  id: string;
  label: string;
  price: number;
  description: string;
};

type PackageSelection = {
  selectedPackageId: string;
  selectedPackageTitle: string;
  selectedPackagePrice: number;
  selectedFlightMode?: 0 | 1;
  selectedFlightLabel?: string;
};

type TotalsPayload = {
  estimatedFlightTotal?: number;
  estimatedHotelTotal?: number;
  estimatedTransferTotal?: number;
  estimatedSightseeingTotal?: number;
  estimatedMealsTotal?: number;
  estimatedGrandTotal?: number;
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
  customTripDays: CustomTripDay[];

  estimatedFlightTotal: number;
  estimatedHotelTotal: number;
  estimatedTransferTotal: number;
  estimatedSightseeingTotal: number;
  estimatedMealsTotal: number;
  estimatedGrandTotal: number;

  hydrated: boolean;
  setHydrated: (value: boolean) => void;

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
        | "mood"
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
  setTravelers: (payload: { adults?: number; children?: number; rooms?: number }) => void;

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

  initializeCustomTripDays: (plans?: DayPlanItem[]) => void;
  setCustomTripDays: (days: CustomTripDay[]) => void;
  updateCustomTripDay: (dayId: string, payload: Partial<CustomTripDay>) => void;
  toggleCustomTripDayItem: (
    dayId: string,
    field:
      | "selectedTransferIds"
      | "selectedSightseeingIds"
      | "selectedMealIds"
      | "selectedExtraIds",
    value: string
  ) => void;

  setTotals: (payload: TotalsPayload) => void;

  recalculateCustomTripTotals: (pricing: {
    hotelTotal: number;
    transferTotal: number;
    sightseeingTotal: number;
    mealsTotal: number;
    extrasTotal: number;
  }) => void;

  setBookingId: (value: string) => void;
  generateBookingId: () => void;
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

function buildDefaultCustomDays(): CustomTripDay[] {
  return [
    {
      id: "custom-day-1",
      dayNumber: 1,
      city: "Bangkok",
      dateLabel: "Day 1",
      dayType: "arrival",
      hotelCategory: "4 Star",
      selectedHotelId: "",
      selectedTransferIds: [],
      selectedSightseeingIds: [],
      selectedMealIds: [],
      selectedExtraIds: [],
      activeSlotFilter: "all",
      notes: "",
    },
    {
      id: "custom-day-2",
      dayNumber: 2,
      city: "Bangkok",
      dateLabel: "Day 2",
      dayType: "explore",
      hotelCategory: "4 Star",
      selectedHotelId: "",
      selectedTransferIds: [],
      selectedSightseeingIds: [],
      selectedMealIds: [],
      selectedExtraIds: [],
      activeSlotFilter: "all",
      notes: "",
    },
    {
      id: "custom-day-3",
      dayNumber: 3,
      city: "Bangkok",
      dateLabel: "Day 3",
      dayType: "departure",
      hotelCategory: "4 Star",
      selectedHotelId: "",
      selectedTransferIds: [],
      selectedSightseeingIds: [],
      selectedMealIds: [],
      selectedExtraIds: [],
      activeSlotFilter: "all",
      notes: "",
    },
  ];
}

function createBookingId() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(100 + Math.random() * 900);
  return `ET-TH-${yy}${mm}${dd}-${rand}`;
}

const initialState = {
  selectedMode: "standard" as const,

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

  selectedFlightMode: 0 as 0 | 1,
  selectedFlightLabel: "Without Flight",

  selectedHotelId: "",
  hotelCategory: "4 Star" as const,

  selectedArrivalTransferId: "",
  selectedDepartureTransferId: "",
  selectedLocalTransferId: "",
  transferType: "Private Transfer",

  selectedSightseeingIds: [] as string[],
  selectedMealIds: [] as string[],
  selectedExtras: ["Breakfast included"] as string[],
  selectedAddOns: [] as string[],

  roomPreference: "1 Room · Double / Twin",
  serviceFee: 3000,
  bookingId: "ET-TH-24026",

  dayPlans: [] as DayPlanItem[],
  customTripDays: buildDefaultCustomDays(),

  estimatedFlightTotal: 0,
  estimatedHotelTotal: 0,
  estimatedTransferTotal: 0,
  estimatedSightseeingTotal: 0,
  estimatedMealsTotal: 0,
  estimatedGrandTotal: 0,

  hydrated: false,
};

export const useTripBuilderStore = create<TripBuilderState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setHydrated: (value) => set({ hydrated: value }),

      setTripDetails: (payload) => set((state) => ({ ...state, ...payload })),
      setSelectedMode: (value) => set({ selectedMode: value }),
      setBudget: (value) => set({ budget: value }),
      setMood: (value) => set({ mood: value }),
      setTravelStyle: (value) => set({ travelStyle: value }),
      setTravellingWith: (value) => set({ travellingWith: value }),
      setPriority: (value) => set({ priority: value }),
      setSpecialRequest: (value) => set({ specialRequest: value }),

      setSegments: (segments) => set({ segments }),
      addSegment: (segment) => set((state) => ({ segments: [...state.segments, segment] })),
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
          specialPreferences: state.specialPreferences.includes(value)
            ? state.specialPreferences.filter((item) => item !== value)
            : [...state.specialPreferences, value],
        })),

      setAiPrompt: (value) => set({ aiPrompt: value }),
      addAiChatMessage: (message) =>
        set((state) => ({
          aiChatMessages: [...state.aiChatMessages, message],
        })),
      resetAiChat: () =>
        set({
          aiChatMessages: initialAiMessages,
          aiPrompt: initialState.aiPrompt,
        }),

      selectPackage: (payload) =>
        set({
          selectedPackageId: payload.selectedPackageId,
          selectedPackageTitle: payload.selectedPackageTitle,
          selectedPackagePrice: payload.selectedPackagePrice,
          selectedFlightMode: payload.selectedFlightMode ?? 0,
          selectedFlightLabel: payload.selectedFlightLabel ?? "Without Flight",
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

      setRoomPreference: (value) => set({ roomPreference: value }),
      setDayPlans: (plans) => set({ dayPlans: plans }),

      initializeCustomTripDays: (plans) => {
        if (!plans || plans.length === 0) {
          set({ customTripDays: buildDefaultCustomDays() });
          return;
        }

        const mapped: CustomTripDay[] = plans.map((plan, index) => ({
          id: `custom-day-${plan.day}`,
          dayNumber: plan.day,
          city: plan.city,
          dateLabel: `Day ${plan.day}`,
          dayType:
            index === 0
              ? "arrival"
              : index === plans.length - 1
                ? "departure"
                : plan.transfer?.toLowerCase().includes("transfer")
                  ? "transfer"
                  : "explore",
          hotelCategory: "4 Star",
          selectedHotelId: "",
          selectedTransferIds: [],
          selectedSightseeingIds: [],
          selectedMealIds: [],
          selectedExtraIds: [],
          activeSlotFilter: "all",
          notes: "",
        }));

        set({ customTripDays: mapped });
      },

      setCustomTripDays: (days) => set({ customTripDays: days }),

      updateCustomTripDay: (dayId, payload) =>
        set((state) => ({
          customTripDays: state.customTripDays.map((day) =>
            day.id === dayId ? { ...day, ...payload } : day
          ),
        })),

      toggleCustomTripDayItem: (dayId, field, value) =>
        set((state) => ({
          customTripDays: state.customTripDays.map((day) => {
            if (day.id !== dayId) return day;
            const current = day[field];
            const next = current.includes(value)
              ? current.filter((item) => item !== value)
              : [...current, value];
            return { ...day, [field]: next };
          }),
        })),

      setTotals: (payload) =>
        set((state) => ({
          estimatedFlightTotal: payload.estimatedFlightTotal ?? state.estimatedFlightTotal,
          estimatedHotelTotal: payload.estimatedHotelTotal ?? state.estimatedHotelTotal,
          estimatedTransferTotal: payload.estimatedTransferTotal ?? state.estimatedTransferTotal,
          estimatedSightseeingTotal:
            payload.estimatedSightseeingTotal ?? state.estimatedSightseeingTotal,
          estimatedMealsTotal: payload.estimatedMealsTotal ?? state.estimatedMealsTotal,
          estimatedGrandTotal: payload.estimatedGrandTotal ?? state.estimatedGrandTotal,
        })),

      recalculateCustomTripTotals: ({
        hotelTotal,
        transferTotal,
        sightseeingTotal,
        mealsTotal,
        extrasTotal,
      }) => {
        const state = get();
        const grandTotal =
          state.selectedPackagePrice +
          state.estimatedFlightTotal +
          hotelTotal +
          transferTotal +
          sightseeingTotal +
          mealsTotal +
          extrasTotal +
          state.serviceFee;

        set({
          estimatedHotelTotal: hotelTotal,
          estimatedTransferTotal: transferTotal,
          estimatedSightseeingTotal: sightseeingTotal,
          estimatedMealsTotal: mealsTotal + extrasTotal,
          estimatedGrandTotal: grandTotal,
        });
      },

      setBookingId: (value) => set({ bookingId: value }),
      generateBookingId: () => set({ bookingId: createBookingId() }),

      resetTrip: () =>
        set({
          ...initialState,
          bookingId: createBookingId(),
          hydrated: true,
        }),
    }),
    {
      name: "easytrip-trip-builder",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedMode: state.selectedMode,
        destination: state.destination,
        destinationId: state.destinationId,
        segments: state.segments,
        arrivalTimeSlot: state.arrivalTimeSlot,
        departureTimeSlot: state.departureTimeSlot,
        travelDates: state.travelDates,
        nights: state.nights,
        adults: state.adults,
        children: state.children,
        rooms: state.rooms,
        budget: state.budget,
        mood: state.mood,
        travelStyle: state.travelStyle,
        travellingWith: state.travellingWith,
        priority: state.priority,
        specialPreferences: state.specialPreferences,
        specialRequest: state.specialRequest,
        aiPrompt: state.aiPrompt,
        aiChatMessages: state.aiChatMessages,
        selectedPackageId: state.selectedPackageId,
        selectedPackageTitle: state.selectedPackageTitle,
        selectedPackagePrice: state.selectedPackagePrice,
        selectedFlightMode: state.selectedFlightMode,
        selectedFlightLabel: state.selectedFlightLabel,
        selectedHotelId: state.selectedHotelId,
        hotelCategory: state.hotelCategory,
        selectedArrivalTransferId: state.selectedArrivalTransferId,
        selectedDepartureTransferId: state.selectedDepartureTransferId,
        selectedLocalTransferId: state.selectedLocalTransferId,
        transferType: state.transferType,
        selectedSightseeingIds: state.selectedSightseeingIds,
        selectedMealIds: state.selectedMealIds,
        selectedExtras: state.selectedExtras,
        selectedAddOns: state.selectedAddOns,
        roomPreference: state.roomPreference,
        serviceFee: state.serviceFee,
        bookingId: state.bookingId,
        dayPlans: state.dayPlans,
        customTripDays: state.customTripDays,
        estimatedFlightTotal: state.estimatedFlightTotal,
        estimatedHotelTotal: state.estimatedHotelTotal,
        estimatedTransferTotal: state.estimatedTransferTotal,
        estimatedSightseeingTotal: state.estimatedSightseeingTotal,
        estimatedMealsTotal: state.estimatedMealsTotal,
        estimatedGrandTotal: state.estimatedGrandTotal,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);