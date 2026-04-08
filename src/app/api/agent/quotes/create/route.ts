import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type DayItem = {
  id?: string | number;
  type?: string;
  title?: string;
  name?: string;
  label?: string;
  time?: string;
  notes?: string;
  description?: string;
  location?: string;
  city?: string;
};

type TripDay = {
  id?: string | number;
  day?: number;
  dayNumber?: number;
  title?: string;
  city?: string;
  location?: string;
  notes?: string;
  summary?: string;
  description?: string;
  hotelName?: string;
  transferName?: string;
  selectedHotelId?: string;
  selectedTransferIds?: string[];
  selectedSightseeingIds?: string[];
  selectedMealIds?: string[];
  selectedExtraIds?: string[];
  meals?: DayItem[];
  sightseeing?: DayItem[];
  activities?: DayItem[];
  transfers?: DayItem[];
  items?: DayItem[];
};

type PricingPayload = {
  total?: number;
  grandTotal?: number;
  finalTotal?: number;
  hotelTotal?: number;
  transferTotal?: number;
  sightseeingTotal?: number;
  mealsTotal?: number;
  extrasTotal?: number;
  serviceFee?: number;
  markupTotal?: number;
  [key: string]: unknown;
};

type CreateQuotePayload = {
  destination?: string;
  departureCity?: string;
  travelDates?: string;
  nights?: string;
  adults?: number;
  children?: number;
  selectedFlightLabel?: string;
  customTripDays?: TripDay[];
  pricing?: PricingPayload;
  selectedPackagePrice?: number;
  hotelTotal?: number;
  transferTotal?: number;
  sightseeingTotal?: number;
  mealsTotal?: number;
  extrasTotal?: number;
  notes?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  validTill?: string;
};

function normalizeEmail(email?: string | null) {
  return (email || "").trim().toLowerCase();
}

function safeNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function normalizeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function generateQuoteRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";

  for (let i = 0; i < 8; i += 1) {
    randomPart += chars[Math.floor(Math.random() * chars.length)];
  }

  return `QT-${randomPart}`;
}

function resolveGrandTotal(payload: CreateQuotePayload) {
  const pricing = payload.pricing || {};

  const hotelTotal = safeNumber(pricing.hotelTotal ?? payload.hotelTotal);
  const transferTotal = safeNumber(pricing.transferTotal ?? payload.transferTotal);
  const sightseeingTotal = safeNumber(pricing.sightseeingTotal ?? payload.sightseeingTotal);
  const mealsTotal = safeNumber(pricing.mealsTotal ?? payload.mealsTotal);
  const extrasTotal = safeNumber(pricing.extrasTotal ?? payload.extrasTotal);
  const serviceFee = safeNumber(pricing.serviceFee);
  const markupTotal = safeNumber(pricing.markupTotal);

  const explicitTotal = safeNumber(
    pricing.grandTotal ?? pricing.finalTotal ?? pricing.total ?? payload.selectedPackagePrice,
  );

  if (explicitTotal > 0) {
    return explicitTotal;
  }

  return hotelTotal + transferTotal + sightseeingTotal + mealsTotal + extrasTotal + serviceFee + markupTotal;
}

function buildPricingSnapshot(payload: CreateQuotePayload) {
  const pricing = payload.pricing || {};

  const hotelTotal = safeNumber(pricing.hotelTotal ?? payload.hotelTotal);
  const transferTotal = safeNumber(pricing.transferTotal ?? payload.transferTotal);
  const sightseeingTotal = safeNumber(pricing.sightseeingTotal ?? payload.sightseeingTotal);
  const mealsTotal = safeNumber(pricing.mealsTotal ?? payload.mealsTotal);
  const extrasTotal = safeNumber(pricing.extrasTotal ?? payload.extrasTotal);
  const serviceFee = safeNumber(pricing.serviceFee);
  const markupTotal = safeNumber(pricing.markupTotal);
  const grandTotal = resolveGrandTotal(payload);

  return {
    hotelTotal,
    transferTotal,
    sightseeingTotal,
    mealsTotal,
    extrasTotal,
    serviceFee,
    markupTotal,
    grandTotal,
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (user.app_metadata?.role !== "agent") {
      return NextResponse.json({ error: "Only agents can create quotes." }, { status: 403 });
    }

    if (user.app_metadata?.approved === false) {
      return NextResponse.json({ error: "Agent account is not approved." }, { status: 403 });
    }

    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("id, contact_name, contact_person, company_name, email")
      .eq("auth_user_id", user.id)
      .single();

    if (agentError || !agent?.id) {
      return NextResponse.json(
        {
          error: "Agent record not found.",
          details: agentError?.message || "No linked agent row found for this user.",
        },
        { status: 400 },
      );
    }

    const body = (await request.json()) as CreateQuotePayload;

    const customTripDays = normalizeArray<TripDay>(body.customTripDays);
    const pricingSnapshot = buildPricingSnapshot(body);
    const grandTotal = safeNumber(pricingSnapshot.grandTotal);

    if (!body.destination?.trim()) {
      return NextResponse.json({ error: "Destination is required." }, { status: 400 });
    }

    if (customTripDays.length === 0) {
      return NextResponse.json(
        { error: "Itinerary is missing. customTripDays is required." },
        { status: 400 },
      );
    }

    if (grandTotal <= 0) {
      return NextResponse.json({ error: "Grand total must be greater than 0." }, { status: 400 });
    }

    const quoteRef = generateQuoteRef();

    const quoteInsert = {
      quote_ref: quoteRef,
      agent_id: agent.id,
      status: "draft",
      destination: body.destination?.trim() || null,
      departure_city: body.departureCity?.trim() || null,
      travel_dates: body.travelDates?.trim() || null,
      nights: body.nights?.trim() || null,
      adults: safeNumber(body.adults),
      children: safeNumber(body.children),
      flight_label: body.selectedFlightLabel?.trim() || null,
      customer_name: body.customerName?.trim() || null,
      customer_email: normalizeEmail(body.customerEmail) || null,
      customer_phone: body.customerPhone?.trim() || null,
      notes: body.notes?.trim() || null,
      valid_till: body.validTill?.trim() || null,
      itinerary_json: customTripDays,
      pricing_snapshot: pricingSnapshot,
      total_amount: grandTotal,
    };

    const { data: insertedQuote, error: insertError } = await supabase
      .from("quotes")
      .insert(quoteInsert)
      .select("*")
      .single();

    if (insertError) {
      return NextResponse.json(
        {
          error: "Failed to create quote.",
          details: insertError.message,
        },
        { status: 500 },
      );
    }

    const actorName =
      agent.contact_name || agent.contact_person || agent.company_name || agent.email || user.email || "Agent";

    const logPayload = {
      quote_id: insertedQuote.id,
      agent_id: agent.id,
      actor_name: actorName,
      actor_email: user.email || null,
      action: "quote_created",
      activity_type: "created",
      activity_label: "Quote created",
      meta: {
        quote_ref: quoteRef,
        status: "draft",
        total_amount: grandTotal,
        destination: quoteInsert.destination,
      },
    };

    const { error: logError } = await supabase.from("quote_activity_logs").insert(logPayload);

    return NextResponse.json(
      {
        success: true,
        quote: insertedQuote,
        quote_ref: quoteRef,
        log_saved: !logError,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";

    return NextResponse.json(
      {
        error: "Unexpected server error.",
        details: message,
      },
      { status: 500 },
    );
  }
}