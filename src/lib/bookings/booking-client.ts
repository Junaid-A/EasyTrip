"use client";

import { createClient } from "@/lib/supabase/client";

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
  bookingRef: string;
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

export type CreateBookingInput = Omit<
  BookingRecord,
  "id" | "bookingRef" | "createdAt" | "status"
> & {
  status?: BookingStatus;
};

function generateBookingRef() {
  const stamp = Date.now().toString().slice(-8);
  return `ET365-${stamp}`;
}

function mapRowToBooking(row: any): BookingRecord {
  return {
    id: row.id,
    bookingRef: row.booking_ref,
    createdAt: row.created_at,
    status: row.status,
    customer: {
      name: row.customer_name ?? "",
      email: row.customer_email ?? "",
      phone: row.customer_phone ?? "",
    },
    trip: {
      title: row.trip_title ?? "",
      destination: row.destination ?? "",
      nights: row.nights ?? "",
      durationLabel: row.duration_label ?? "",
      departureDate: row.departure_date ?? "",
      packageType: row.package_type ?? "",
      image: row.image ?? "",
      flightLabel: row.flight_label ?? "",
      rooms: row.rooms ?? 1,
      adults: row.adults ?? 1,
      children: row.children ?? 0,
    },
    travellers: Array.isArray(row.travellers) ? row.travellers : [],
    addons: Array.isArray(row.addons) ? row.addons : [],
    itinerary: Array.isArray(row.itinerary) ? row.itinerary : [],
    pricing:
      row.pricing && typeof row.pricing === "object"
        ? {
            packageBase: Number(row.pricing.packageBase ?? 0),
            flightTotal: Number(row.pricing.flightTotal ?? 0),
            hotelTotal: Number(row.pricing.hotelTotal ?? 0),
            transferTotal: Number(row.pricing.transferTotal ?? 0),
            sightseeingTotal: Number(row.pricing.sightseeingTotal ?? 0),
            mealsAndExtrasTotal: Number(row.pricing.mealsAndExtrasTotal ?? 0),
            reviewAddonsTotal: Number(row.pricing.reviewAddonsTotal ?? 0),
            serviceFee: Number(row.pricing.serviceFee ?? 0),
            totalAmount: Number(
              row.pricing.totalAmount ?? row.total_amount ?? 0
            ),
          }
        : {
            packageBase: 0,
            flightTotal: 0,
            hotelTotal: 0,
            transferTotal: 0,
            sightseeingTotal: 0,
            mealsAndExtrasTotal: 0,
            reviewAddonsTotal: 0,
            serviceFee: 0,
            totalAmount: Number(row.total_amount ?? 0),
          },
    meta: row.meta && typeof row.meta === "object" ? row.meta : {},
  };
}

async function getAuthenticatedUserId() {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("User session not found.");
  }

  return user.id;
}

export async function createBookingInDb(input: CreateBookingInput) {
  const supabase = createClient();
  const userId = await getAuthenticatedUserId();
  const bookingRef = generateBookingRef();

  const payload = {
    booking_ref: bookingRef,
    user_id: userId,
    status: input.status ?? "confirmed",

    trip_title: input.trip.title,
    destination: input.trip.destination,
    nights: input.trip.nights,
    duration_label: input.trip.durationLabel,
    departure_date: input.trip.departureDate ?? "",
    package_type: input.trip.packageType ?? "",
    image: input.trip.image ?? "",
    flight_label: input.trip.flightLabel ?? "",

    rooms: input.trip.rooms ?? 1,
    adults: input.trip.adults ?? 1,
    children: input.trip.children ?? 0,

    customer_name: input.customer.name,
    customer_email: input.customer.email,
    customer_phone: input.customer.phone,

    gst_state: input.meta?.gstState ?? "",
    special_request: input.meta?.specialRequest ?? "",

    travellers: input.travellers,
    addons: input.addons,
    itinerary: input.itinerary,
    pricing: input.pricing,
    meta: input.meta ?? {},

    total_amount: input.pricing.totalAmount,
  };

  const { data, error } = await supabase
    .from("bookings")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRowToBooking(data);
}

export async function getMyBookingsFromDb() {
  const supabase = createClient();
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapRowToBooking);
}

export async function getBookingByRefFromDb(bookingRef: string) {
  const supabase = createClient();
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("booking_ref", bookingRef)
    .eq("user_id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRowToBooking(data);
}