/* src/app/api/agent/quotes/[id]/pdf/route.ts */

import { chromium } from "playwright";
import { createClient } from "@/lib/supabase/server";
import {
  generateQuoteHtml,
  type QuotePdfData,
  type QuotePdfDay,
  type QuotePdfCategorySelection,
  type QuotePdfPriceLine,
} from "@/lib/pdf/quote-template";

export const dynamic = "force-dynamic";

type LooseRecord = Record<string, any>;

function pick<T = any>(obj: any, paths: string[], fallback?: T): T {
  for (const path of paths) {
    const parts = path.split(".");
    let current = obj;

    let found = true;
    for (const part of parts) {
      if (current == null || typeof current !== "object" || !(part in current)) {
        found = false;
        break;
      }
      current = current[part];
    }

    if (found && current !== undefined && current !== null && current !== "") {
      return current as T;
    }
  }

  return fallback as T;
}

function formatDate(input: string | null | undefined): string {
  if (!input) return "—";

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateRange(start?: string | null, end?: string | null): string {
  if (!start && !end) return "Dates on request";
  if (start && !end) return formatDate(start);
  if (!start && end) return formatDate(end);
  return `${formatDate(start)} - ${formatDate(end)}`;
}

function toTravellerSummary(payload: LooseRecord): string {
  const adults = Number(
    pick(payload, [
      "travellers.adults",
      "travelers.adults",
      "summary.adults",
      "adults",
    ], 0),
  );

  const children = Number(
    pick(payload, [
      "travellers.children",
      "travelers.children",
      "summary.children",
      "children",
    ], 0),
  );

  const rooms = Number(
    pick(payload, [
      "travellers.rooms",
      "travelers.rooms",
      "summary.rooms",
      "rooms",
    ], 0),
  );

  const parts: string[] = [];
  if (adults > 0) parts.push(`${adults} Adult${adults > 1 ? "s" : ""}`);
  if (children > 0) parts.push(`${children} Child${children > 1 ? "ren" : ""}`);
  if (rooms > 0) parts.push(`${rooms} Room${rooms > 1 ? "s" : ""}`);

  return parts.length ? parts.join(" • ") : "Traveller details on request";
}

function normalizeSelections(payload: LooseRecord): QuotePdfCategorySelection[] {
  const rawSelections =
    pick<any[]>(payload, [
      "selections",
      "selectedCategories",
      "quote.selections",
      "summary.selections",
    ], []) || [];

  if (Array.isArray(rawSelections) && rawSelections.length > 0) {
    return rawSelections.map((item, index) => ({
      category: String(item.category || item.label || `Category ${index + 1}`),
      selection: String(item.selection || item.value || item.title || "Selected"),
      details: item.details ? String(item.details) : undefined,
    }));
  }

  const fallback: QuotePdfCategorySelection[] = [];

  const hotelTitle = pick<string>(payload, [
    "selectedHotel.name",
    "hotel.name",
    "summary.hotel.name",
    "pricing.hotel.label",
  ]);
  if (hotelTitle) {
    fallback.push({
      category: "Hotel",
      selection: hotelTitle,
      details: pick(payload, ["selectedHotel.category", "hotel.category", "summary.hotel.category"]),
    });
  }

  const transferTitle = pick<string>(payload, [
    "selectedTransfer.name",
    "transfer.name",
    "summary.transfer.name",
  ]);
  if (transferTitle) {
    fallback.push({
      category: "Transfers",
      selection: transferTitle,
      details: pick(payload, ["selectedTransfer.type", "transfer.type"]),
    });
  }

  const sightseeingTitle = pick<string>(payload, [
    "selectedSightseeing.name",
    "sightseeing.name",
    "summary.sightseeing.name",
  ]);
  if (sightseeingTitle) {
    fallback.push({
      category: "Sightseeing",
      selection: sightseeingTitle,
      details: pick(payload, ["selectedSightseeing.details", "sightseeing.details"]),
    });
  }

  const mealPlan = pick<string>(payload, [
    "selectedMeals.name",
    "mealPlan.name",
    "summary.meals.name",
  ]);
  if (mealPlan) {
    fallback.push({
      category: "Meals",
      selection: mealPlan,
    });
  }

  return fallback;
}

function normalizeItinerary(payload: LooseRecord): QuotePdfDay[] {
  const rawDays =
    pick<any[]>(payload, [
      "itinerary",
      "dayWise",
      "dayPlan",
      "trip.dayPlan",
      "quote.itinerary",
    ], []) || [];

  if (!Array.isArray(rawDays) || rawDays.length === 0) {
    return [
      {
        day: 1,
        title: "Trip overview",
        city: pick(payload, ["destination", "summary.destination", "customer.destination"], "Destination"),
        description:
          pick(payload, ["description", "summary.description", "trip.description"], "Detailed day-wise itinerary will be shared in the finalized version.") ||
          "Detailed day-wise itinerary will be shared in the finalized version.",
      },
    ];
  }

  return rawDays.map((day, index) => ({
    day: Number(day.day || day.dayNumber || index + 1),
    title: String(day.title || day.heading || day.name || `Day ${index + 1}`),
    city: day.city ? String(day.city) : undefined,
    description: String(
      day.description ||
        day.summary ||
        day.plan ||
        day.details ||
        "Day plan as selected.",
    ),
    hotel: day.hotel ? String(day.hotel) : undefined,
    meals: Array.isArray(day.meals) ? day.meals.map(String) : undefined,
    transfers: day.transfers ? String(day.transfers) : undefined,
    activities: Array.isArray(day.activities) ? day.activities.map(String) : undefined,
  }));
}

function normalizePricing(payload: LooseRecord): {
  lines: QuotePdfPriceLine[];
  total: number;
  currencySymbol: string;
} {
  const candidates: QuotePdfPriceLine[] = [
    {
      label: "Hotels",
      amount: Number(
        pick(payload, [
          "pricing.estimatedHotelTotal",
          "pricing.hotelTotal",
          "pricing.hotels",
          "quote.pricing.hotels",
          "estimatedHotelTotal",
        ], 0),
      ),
    },
    {
      label: "Flights",
      amount: Number(
        pick(payload, [
          "pricing.estimatedFlightTotal",
          "pricing.flightTotal",
          "pricing.flights",
          "quote.pricing.flights",
          "estimatedFlightTotal",
        ], 0),
      ),
    },
    {
      label: "Transfers",
      amount: Number(
        pick(payload, [
          "pricing.estimatedTransferTotal",
          "pricing.transferTotal",
          "pricing.transfers",
          "quote.pricing.transfers",
          "estimatedTransferTotal",
        ], 0),
      ),
    },
    {
      label: "Sightseeing",
      amount: Number(
        pick(payload, [
          "pricing.estimatedSightseeingTotal",
          "pricing.sightseeingTotal",
          "pricing.sightseeing",
          "quote.pricing.sightseeing",
          "estimatedSightseeingTotal",
        ], 0),
      ),
    },
    {
      label: "Meals",
      amount: Number(
        pick(payload, [
          "pricing.estimatedMealsTotal",
          "pricing.mealsTotal",
          "pricing.meals",
          "quote.pricing.meals",
          "estimatedMealsTotal",
        ], 0),
      ),
    },
    {
      label: "Extras",
      amount: Number(
        pick(payload, [
          "pricing.extras",
          "pricing.extraTotal",
          "quote.pricing.extras",
        ], 0),
      ),
    },
    {
      label: "Service Fee",
      amount: Number(
        pick(payload, [
          "pricing.serviceFee",
          "quote.pricing.serviceFee",
          "serviceFee",
        ], 0),
      ),
    },
  ];

  const lines = candidates.filter((item) => Number(item.amount) > 0);

  const explicitTotal = Number(
    pick(payload, [
      "pricing.total",
      "pricing.grandTotal",
      "quote.pricing.total",
      "totalAmount",
      "finalAmount",
      "total",
    ], 0),
  );

  const total =
    explicitTotal > 0
      ? explicitTotal
      : lines.reduce((sum, line) => sum + Number(line.amount || 0), 0);

  return {
    lines,
    total,
    currencySymbol: "₹",
  };
}

function normalizeImages(payload: LooseRecord) {
  const hero = pick<string>(payload, [
    "media.heroImage",
    "heroImage",
    "images.hero",
    "destinationImage",
    "selectedPackage.image",
    "summary.image",
  ]);

  const gallery = pick<any[]>(payload, [
    "media.gallery",
    "gallery",
    "images.gallery",
    "destinationGallery",
  ], []);

  return {
    hero: hero ? { url: hero, alt: "Destination hero image" } : undefined,
    gallery: Array.isArray(gallery)
      ? gallery
          .map((item) =>
            typeof item === "string"
              ? { url: item, alt: "Destination image" }
              : { url: String(item.url || item.src || ""), alt: String(item.alt || "Destination image") },
          )
          .filter((img) => Boolean(img.url))
      : [],
  };
}

function normalizeList(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return [];
}

async function fetchQuoteOrThrow(supabase: Awaited<ReturnType<typeof createClient>>, quoteId: string) {
  const quoteQuery = await supabase
    .from("quotes")
    .select("*")
    .eq("id", quoteId)
    .single();

  if (quoteQuery.error || !quoteQuery.data) {
    throw new Error("Quote not found.");
  }

  return quoteQuery.data as LooseRecord;
}

async function fetchAgentBranding(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  quote: LooseRecord,
) {
  const directBranding = quote.agent_branding;
  if (directBranding && typeof directBranding === "object") {
    return directBranding as LooseRecord;
  }

  const agentId =
    quote.agent_id ||
    pick(quote, ["payload.agentId", "payload.agent.id"]) ||
    userId;

  const { data } = await supabase
    .from("agents")
    .select("*")
    .eq("id", agentId)
    .maybeSingle();

  return (data || {}) as LooseRecord;
}

function mapToPdfData(quote: LooseRecord, branding: LooseRecord): QuotePdfData {
  const payload = (quote.payload || quote.quote_payload || quote.data || {}) as LooseRecord;
  const pricing = normalizePricing(payload);
  const images = normalizeImages(payload);

  const startDate = pick<string>(payload, [
    "travelDates.start",
    "travel_dates.start",
    "departureDate",
    "checkIn",
    "summary.startDate",
  ]);

  const endDate = pick<string>(payload, [
    "travelDates.end",
    "travel_dates.end",
    "returnDate",
    "checkOut",
    "summary.endDate",
  ]);

  return {
    quoteRef: String(quote.quote_ref || quote.reference || quote.id),
    generatedAt: formatDate(quote.created_at || new Date().toISOString()),
    validUntil: quote.valid_until ? formatDate(quote.valid_until) : undefined,

    agent: {
      companyName:
        String(
          branding.company_name ||
            branding.name ||
            pick(payload, ["agent.companyName", "agent.name"], "Travel Company"),
        ),
      logoUrl:
        branding.brand_logo_url ||
        branding.logo_url ||
        pick(payload, ["agent.logoUrl", "agent.logo"]),
      primaryColor:
        branding.brand_primary_color ||
        branding.primary_color ||
        "#f97316",
      secondaryColor:
        branding.brand_secondary_color ||
        branding.secondary_color ||
        "#111827",
      contactPerson:
        branding.contact_person ||
        pick(payload, ["agent.contactPerson", "agent.contact"]),
      email:
        branding.contact_email ||
        branding.email ||
        pick(payload, ["agent.email"]),
      phone:
        branding.contact_phone ||
        branding.phone ||
        pick(payload, ["agent.phone"]),
      website:
        branding.website ||
        pick(payload, ["agent.website"]),
      address:
        branding.address ||
        pick(payload, ["agent.address"]),
    },

    customer: {
      name: String(
        quote.customer_name ||
          pick(payload, [
            "customer.name",
            "traveller.name",
            "leadTraveller.name",
            "contact.name",
          ], "Customer"),
      ),
      destination: String(
        quote.destination ||
          pick(payload, [
            "destination",
            "summary.destination",
            "selectedPackage.destination",
          ], "Destination"),
      ),
      travelDates: formatDateRange(startDate, endDate),
      travellers: toTravellerSummary(payload),
    },

    trip: {
      title: String(
        quote.title ||
          pick(payload, [
            "selectedPackage.title",
            "package.title",
            "summary.title",
            "trip.title",
          ], "Travel Proposal"),
      ),
      subtitle: pick(payload, [
        "summary.subtitle",
        "trip.subtitle",
        "description",
      ]),
      duration: String(
        quote.duration ||
          pick(payload, [
            "nights",
            "summary.duration",
            "trip.duration",
          ], "Custom duration"),
      ),
      hotelCategory: pick(payload, [
        "hotelCategory",
        "selectedHotel.category",
        "summary.hotelCategory",
      ]),
      flightIncluded: Boolean(
        pick(payload, [
          "flightIncluded",
          "withFlight",
          "summary.flightIncluded",
          "selectedPackage.includedFlights",
        ], false),
      ),
    },

    images,
    selections: normalizeSelections(payload),
    itinerary: normalizeItinerary(payload),

    pricing,

    notes:
      quote.notes ||
      pick(payload, [
        "notes",
        "summary.notes",
      ]),
    inclusions: normalizeList(
      pick(payload, ["inclusions", "summary.inclusions"]),
    ),
    exclusions: normalizeList(
      pick(payload, ["exclusions", "summary.exclusions"]),
    ),
    terms: normalizeList(
      branding.terms_and_conditions ||
        quote.terms ||
        pick(payload, ["terms", "summary.terms"]),
    ),
  };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;

  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const auth = await supabase.auth.getUser();
    const user = auth.data.user;

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const role = user.app_metadata?.role;
    if (role !== "agent" && role !== "admin") {
      return new Response("Forbidden", { status: 403 });
    }

    const quote = await fetchQuoteOrThrow(supabase, id);

    if (role === "agent") {
      const quoteOwner =
        quote.agent_id ||
        pick(quote, ["payload.agentId", "payload.agent.id"]);

      if (quoteOwner && quoteOwner !== user.id) {
        return new Response("Forbidden", { status: 403 });
      }
    }

    const branding = await fetchAgentBranding(supabase, user.id, quote);
    const pdfData = mapToPdfData(quote, branding);
    const html = generateQuoteHtml(pdfData);

    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage({
      viewport: { width: 1440, height: 2200 },
      deviceScaleFactor: 1,
    });

    await page.setContent(html, {
      waitUntil: "networkidle",
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "12px",
        right: "12px",
        bottom: "12px",
        left: "12px",
      },
    });

    const safeRef = String(pdfData.quoteRef).replace(/[^a-zA-Z0-9-_]/g, "_");

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Quote-${safeRef}.pdf"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("[QUOTE_PDF_GET]", error);

    return Response.json(
      {
        error: "Failed to generate PDF.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}