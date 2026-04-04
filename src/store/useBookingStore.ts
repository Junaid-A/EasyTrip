"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type BookingStatus = "confirmed" | "pending" | "cancelled";

export type BookingTraveller = {
  id: string;
  name: string;
  age: string;
  gender: string;
};

export type BookingAddon = {
  id: string;
  title: string;
  description?: string;
  price: number;
  type?: string;
};

export type BookingDay = {
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

export type BookingRecord = {
  id: string;
  createdAt: string;
  status: BookingStatus;

  customer: {
    name: string;
    email: string;
    phone: string;
  };

  trip: {
    title: string;
    destination: string;
    nights: string;
    durationLabel: string;
    departureDate?: string;
    packageType?: string;
    image?: string;
    flightLabel?: string;
    rooms?: number;
    adults?: number;
    children?: number;
  };

  travellers: BookingTraveller[];
  addons: BookingAddon[];
  itinerary: BookingDay[];

  pricing: {
    packageBase: number;
    flightTotal: number;
    hotelTotal: number;
    transferTotal: number;
    sightseeingTotal: number;
    mealsAndExtrasTotal: number;
    reviewAddonsTotal: number;
    serviceFee: number;
    totalAmount: number;
  };

  meta?: {
    gstState?: string;
    specialRequest?: string;
    selectedExtras?: string[];
    selectedAddOns?: string[];
    selectedAddonIds?: string[];
    bookingSource?: string;
  };
};

type CreateBookingInput = Omit<BookingRecord, "id" | "createdAt" | "status"> & {
  id?: string;
  status?: BookingStatus;
};

type BookingStore = {
  bookings: BookingRecord[];
  latestBookingId: string | null;

  createBooking: (input: CreateBookingInput) => BookingRecord;
  getBookingById: (id: string) => BookingRecord | undefined;
  removeBooking: (id: string) => void;
  clearBookings: () => void;
};

function generateBookingId() {
  const stamp = Date.now().toString().slice(-8);
  return `ET365-${stamp}`;
}

export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      bookings: [],
      latestBookingId: null,

      createBooking: (input) => {
        const booking: BookingRecord = {
          id: input.id || generateBookingId(),
          createdAt: new Date().toISOString(),
          status: input.status || "confirmed",
          customer: input.customer,
          trip: input.trip,
          travellers: input.travellers,
          addons: input.addons,
          itinerary: input.itinerary,
          pricing: input.pricing,
          meta: input.meta,
        };

        set((state) => ({
          bookings: [booking, ...state.bookings],
          latestBookingId: booking.id,
        }));

        return booking;
      },

      getBookingById: (id) => {
        return get().bookings.find((booking) => booking.id === id);
      },

      removeBooking: (id) => {
        set((state) => ({
          bookings: state.bookings.filter((booking) => booking.id !== id),
          latestBookingId:
            state.latestBookingId === id ? null : state.latestBookingId,
        }));
      },

      clearBookings: () => {
        set({
          bookings: [],
          latestBookingId: null,
        });
      },
    }),
    {
      name: "easytrip365-bookings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);