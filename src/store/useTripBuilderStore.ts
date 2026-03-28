import { create } from "zustand";

type TripBuilderState = {
  destination: string;
  travelDates: string;
  nights: string;
  adults: number;
  children: number;
  travelStyle: string;
  specialPreferences: string[];
  aiPrompt: string;

  selectedPackageId: string;
  selectedPackageTitle: string;
  selectedPackagePrice: number;

  selectedAddOns: string[];
  roomPreference: string;

  serviceFee: number;
  bookingId: string;

  setTripDetails: (payload: Partial<TripBuilderState>) => void;
  togglePreference: (value: string) => void;
  selectPackage: (payload: {
    selectedPackageId: string;
    selectedPackageTitle: string;
    selectedPackagePrice: number;
  }) => void;
  toggleAddOn: (value: string) => void;
  setRoomPreference: (value: string) => void;
  setBookingId: (value: string) => void;
  resetTrip: () => void;
};

const initialState = {
  destination: "Bangkok",
  travelDates: "12 Apr 2026 - 17 Apr 2026",
  nights: "5 Nights",
  adults: 2,
  children: 0,
  travelStyle: "Luxury",
  specialPreferences: ["Private transfers"],
  aiPrompt:
    "I want a premium Bangkok trip with a clean hotel, private transfers, and a balanced mix of shopping, nightlife, and sightseeing.",

  selectedPackageId: "pkg-2",
  selectedPackageTitle: "Bangkok Luxury Discovery",
  selectedPackagePrice: 39500,

  selectedAddOns: ["Private airport pickup", "Safari World"],
  roomPreference: "Deluxe Room",

  serviceFee: 3000,
  bookingId: "ET365-DEMO-001",
};

export const useTripBuilderStore = create<TripBuilderState>((set) => ({
  ...initialState,

  setTripDetails: (payload) =>
    set((state) => ({
      ...state,
      ...payload,
    })),

  togglePreference: (value) =>
    set((state) => ({
      specialPreferences: state.specialPreferences.includes(value)
        ? state.specialPreferences.filter((item) => item !== value)
        : [...state.specialPreferences, value],
    })),

  selectPackage: ({ selectedPackageId, selectedPackageTitle, selectedPackagePrice }) =>
    set(() => ({
      selectedPackageId,
      selectedPackageTitle,
      selectedPackagePrice,
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

  setBookingId: (value) =>
    set(() => ({
      bookingId: value,
    })),

  resetTrip: () =>
    set(() => ({
      ...initialState,
    })),
}));