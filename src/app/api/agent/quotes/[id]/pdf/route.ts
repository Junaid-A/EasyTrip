import { chromium } from "playwright";
import { createClient } from "@/lib/supabase/server";
import { generateQuoteHtml, type QuotePdfData } from "@/lib/pdf/quote-template";

export const dynamic = "force-dynamic";

const PDF_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_QUOTE_PDF_BUCKET || "quote-pdfs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type BuilderDayItem = {
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

type BuilderTripDay = {
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
  meals?: BuilderDayItem[];
  sightseeing?: BuilderDayItem[];
  activities?: BuilderDayItem[];
  transfers?: BuilderDayItem[];
  items?: BuilderDayItem[];
};

type BuilderPayload = {
  destination?: string;
  departureCity?: string;
  travelDates?: string;
  nights?: string;
  adults?: number;
  children?: number;
  selectedFlightLabel?: string;
  customTripDays?: BuilderTripDay[];
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
};

type PricingShape = {
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

type QuoteRow = {
  id: string;
  agent_id: string | null;
  quote_ref: string | null;
  quote_name: string | null;
  destination: string | null;
  amount: number | null;
  amount_received: number | null;
  additional_expense_total: number | null;
  balance_due: number | null;
  payment_status: string | null;
  status: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_note: string | null;
  internal_note: string | null;
  valid_till: string | null;
  pdf_url: string | null;
  builder_payload: BuilderPayload | null;
  pricing_snapshot: PricingShape | null;
  created_at: string | null;
  updated_at: string | null;
};

type AgentRow = {
  id: string;
  contact_name: string | null;
  contact_person: string | null;
  company_name: string | null;
  email: string | null;
};

function safeNumber(value: unknown) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function normalizeDayItems(day: BuilderTripDay) {
  const merged = [
    ...asArray<BuilderDayItem>(day.sightseeing),
    ...asArray<BuilderDayItem>(day.activities),
    ...asArray<BuilderDayItem>(day.transfers),
    ...asArray<BuilderDayItem>(day.meals),
    ...asArray<BuilderDayItem>(day.items),
  ];

  return merged.map((item, index) => ({
    id: `${item.type || "item"}-${index}`,
    type: item.type || "Included",
    title: item.title || item.name || item.label || "Planned item",
    time: item.time || "",
    notes: item.notes || item.description || "",
    location: item.location || item.city || "",
  }));
}

function buildTravellerText(adults: number, children: number) {
  if (adults <= 0 && children <= 0) return "Traveller details on request";

  return `${adults} Adult${adults === 1 ? "" : "s"}${
    children > 0 ? ` · ${children} Child${children === 1 ? "" : "ren"}` : ""
  }`;
}

function guessHeroImage(destination: string) {
  const value = destination.trim().toLowerCase();

  if (value.includes("bangkok")) {
    return "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1600&q=80";
  }

  if (value.includes("phuket")) {
    return "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1600&q=80";
  }

  if (value.includes("krabi")) {
    return "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1600&q=80";
  }

  if (value.includes("pattaya")) {
    return "https://images.unsplash.com/photo-1526481280695-3c4691f8d3ef?auto=format&fit=crop&w=1600&q=80";
  }

  return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80";
}

function sanitizeFilePart(value: string) {
  return value.replace(/[^a-zA-Z0-9-_]/g, "_");
}

function mapQuoteToPdfData(quote: QuoteRow, agent: AgentRow): QuotePdfData {
  const builderPayload = (quote.builder_payload || {}) as BuilderPayload;
  const pricing = (quote.pricing_snapshot || {}) as PricingShape;
  const itinerary = asArray<BuilderTripDay>(builderPayload.customTripDays);

  const destination = quote.destination || builderPayload.destination || "Destination";
  const adults = safeNumber(builderPayload.adults);
  const children = safeNumber(builderPayload.children);

  const hotelTotal = safeNumber(pricing.hotelTotal ?? builderPayload.hotelTotal);
  const transferTotal = safeNumber(pricing.transferTotal ?? builderPayload.transferTotal);
  const sightseeingTotal = safeNumber(
    pricing.sightseeingTotal ?? builderPayload.sightseeingTotal,
  );
  const mealsTotal = safeNumber(pricing.mealsTotal ?? builderPayload.mealsTotal);
  const extrasTotal = safeNumber(pricing.extrasTotal ?? builderPayload.extrasTotal);
  const serviceFee = safeNumber(pricing.serviceFee);
  const markupTotal = safeNumber(pricing.markupTotal);

  const quoteBaseAmount = safeNumber(quote.amount);
  const additionalExpenseTotal = safeNumber(quote.additional_expense_total);
  const finalQuoteTotal = quoteBaseAmount + additionalExpenseTotal;

  const grandTotal = safeNumber(
    pricing.grandTotal ?? pricing.finalTotal ?? pricing.total ?? finalQuoteTotal,
  );

  const pricingLines = [
    { label: "Hotels", amount: hotelTotal },
    { label: "Transfers", amount: transferTotal },
    { label: "Sightseeing", amount: sightseeingTotal },
    { label: "Meals", amount: mealsTotal },
    { label: "Extras", amount: extrasTotal },
    ...(serviceFee > 0 ? [{ label: "Service Fee", amount: serviceFee }] : []),
    ...(markupTotal > 0 ? [{ label: "Markup", amount: markupTotal }] : []),
    ...(additionalExpenseTotal > 0
      ? [{ label: "Additional Expenses", amount: additionalExpenseTotal }]
      : []),
  ].filter((item) => item.amount > 0);

  const selections = [
    builderPayload.selectedFlightLabel
      ? {
          category: "Flights",
          selection: builderPayload.selectedFlightLabel,
          details: builderPayload.departureCity
            ? `Origin: ${builderPayload.departureCity}`
            : undefined,
        }
      : null,
    hotelTotal > 0
      ? {
          category: "Hotels",
          selection: "Selected hotel configuration",
          details: `Commercial value ${new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          }).format(hotelTotal)}`,
        }
      : null,
    transferTotal > 0
      ? {
          category: "Transfers",
          selection: "Selected transfer configuration",
          details: `Commercial value ${new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          }).format(transferTotal)}`,
        }
      : null,
    sightseeingTotal > 0
      ? {
          category: "Sightseeing",
          selection: "Selected sightseeing configuration",
          details: `Commercial value ${new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          }).format(sightseeingTotal)}`,
        }
      : null,
    mealsTotal > 0
      ? {
          category: "Meals",
          selection: "Selected meal configuration",
          details: `Commercial value ${new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          }).format(mealsTotal)}`,
        }
      : null,
  ].filter(Boolean) as QuotePdfData["selections"];

  const itineraryDays =
    itinerary.length > 0
      ? itinerary.map((day, index) => {
          const lineItems = normalizeDayItems(day);
          const mealNames = asArray<BuilderDayItem>(day.meals)
            .map((item) => item.title || item.name || item.label)
            .filter(Boolean) as string[];

          return {
            day: safeNumber(day.day ?? day.dayNumber ?? index + 1),
            title: day.title || `Day ${index + 1}`,
            city: day.city || day.location || undefined,
            description:
              day.notes ||
              day.summary ||
              day.description ||
              "Day plan as selected for this trip.",
            hotel: day.hotelName || undefined,
            meals: mealNames.length ? mealNames : undefined,
            transfers: day.transferName || undefined,
            activities: lineItems.map((item) => {
              const parts = [
                item.title,
                item.location ? `• ${item.location}` : "",
                item.time ? `• ${item.time}` : "",
                item.notes ? `• ${item.notes}` : "",
              ].filter(Boolean);

              return parts.join(" ");
            }),
          };
        })
      : [
          {
            day: 1,
            title: quote.quote_name || destination,
            city: destination,
            description:
              builderPayload.notes ||
              quote.customer_note ||
              "Detailed itinerary will be provided based on the final saved trip plan.",
          },
        ];

  const customerName =
    quote.customer_name || builderPayload.customerName || "Customer";

  return {
    quoteRef: quote.quote_ref || quote.id,
    generatedAt: formatDate(new Date().toISOString()),
    validUntil: formatDate(quote.valid_till),

    agent: {
      companyName: agent.company_name || "Travel Company",
      contactPerson: agent.contact_person || agent.contact_name || undefined,
      email: agent.email || undefined,
      primaryColor: "#f97316",
      secondaryColor: "#111827",
    },

    customer: {
      name: customerName,
      destination,
      travelDates: builderPayload.travelDates || "Travel dates on request",
      travellers: buildTravellerText(adults, children),
    },

    trip: {
      title: quote.quote_name || `${destination} Travel Proposal`,
      subtitle:
        builderPayload.notes ||
        `A clean and customer-ready proposal for ${destination}.`,
      duration: builderPayload.nights || "Custom duration",
      hotelCategory: hotelTotal > 0 ? "As selected" : undefined,
      flightIncluded: Boolean(builderPayload.selectedFlightLabel),
    },

    images: {
      hero: {
        url: guessHeroImage(destination),
        alt: destination,
      },
      gallery: [],
    },

    selections,
    itinerary: itineraryDays,

    pricing: {
      lines: pricingLines,
      total: grandTotal > 0 ? grandTotal : finalQuoteTotal,
      currencySymbol: "₹",
    },

    notes: quote.customer_note || builderPayload.notes || undefined,

    inclusions: [
      hotelTotal > 0 ? "Hotel accommodation as selected" : null,
      transferTotal > 0 ? "Transfers as selected" : null,
      sightseeingTotal > 0 ? "Sightseeing as selected" : null,
      mealsTotal > 0 ? "Meals as selected" : null,
      builderPayload.selectedFlightLabel ? "Flight option as selected" : null,
    ].filter(Boolean) as string[],

    exclusions: [
      "Any item not explicitly mentioned in this proposal",
      "Personal expenses and incidental charges",
      "Government taxes or surcharges if additionally applicable",
    ],

    terms: [
      "Rates are subject to final availability at the time of confirmation.",
      "Any revision in selections may change the final price.",
      "Booking is confirmed only after payment and written confirmation.",
    ],
  };
}

async function uploadPdfAndGetUrl(args: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  agentId: string;
  quoteId: string;
  quoteRef: string;
  pdfBuffer: Buffer;
}) {
  const { supabase, agentId, quoteId, quoteRef, pdfBuffer } = args;

  const safeQuoteRef = sanitizeFilePart(quoteRef || quoteId);
  const filePath = `agents/${sanitizeFilePart(agentId)}/quotes/${sanitizeFilePart(
    quoteId,
  )}/Quote-${safeQuoteRef}.pdf`;

  const uploadResult = await supabase.storage
    .from(PDF_BUCKET)
    .upload(filePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
      cacheControl: "3600",
    });

  if (uploadResult.error) {
    throw new Error(
      `Storage upload failed. Check that bucket "${PDF_BUCKET}" exists and is writable. ${uploadResult.error.message}`,
    );
  }

  const { data: publicUrlData } = supabase.storage
    .from(PDF_BUCKET)
    .getPublicUrl(filePath);

  if (!publicUrlData?.publicUrl) {
    throw new Error("Failed to generate public URL for uploaded PDF.");
  }

  return {
    filePath,
    publicUrl: publicUrlData.publicUrl,
  };
}

async function logPdfGeneration(args: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  quoteId: string;
  agentId: string;
  actorName?: string | null;
  actorEmail?: string | null;
  pdfUrl: string;
  storagePath: string;
}) {
  const { supabase, quoteId, agentId, actorName, actorEmail, pdfUrl, storagePath } = args;

  await supabase.from("quote_activity_logs").insert({
    quote_id: quoteId,
    agent_id: agentId,
    action: "pdf_generated",
    activity_type: "status",
    activity_label: "Quote PDF generated",
    actor_name: actorName || null,
    actor_email: actorEmail || null,
    meta: {
      pdfUrl,
      storagePath,
    },
  });
}

export async function GET(_request: Request, context: RouteContext) {
  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;

  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (user.app_metadata?.role !== "agent") {
      return new Response("Forbidden", { status: 403 });
    }

    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("id, contact_name, contact_person, company_name, email")
      .eq("auth_user_id", user.id)
      .single();

    if (agentError || !agent?.id) {
      return new Response("Forbidden", { status: 403 });
    }

    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select(
        `
          id,
          agent_id,
          quote_ref,
          quote_name,
          destination,
          amount,
          amount_received,
          additional_expense_total,
          balance_due,
          payment_status,
          status,
          customer_name,
          customer_email,
          customer_phone,
          customer_note,
          internal_note,
          valid_till,
          pdf_url,
          builder_payload,
          pricing_snapshot,
          created_at,
          updated_at
        `,
      )
      .eq("id", id)
      .maybeSingle();

    if (quoteError || !quote) {
      return new Response("Quote not found", { status: 404 });
    }

    if (quote.agent_id !== agent.id) {
      return new Response("Forbidden", { status: 403 });
    }

    const pdfData = mapQuoteToPdfData(quote as QuoteRow, agent as AgentRow);
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

    const pdfBuffer = Buffer.from(
      await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "12px",
          right: "12px",
          bottom: "12px",
          left: "12px",
        },
      }),
    );

    const upload = await uploadPdfAndGetUrl({
      supabase,
      agentId: agent.id,
      quoteId: quote.id,
      quoteRef: pdfData.quoteRef,
      pdfBuffer,
    });

    const { error: updateError } = await supabase
      .from("quotes")
      .update({
        pdf_url: upload.publicUrl,
        status: "pdf_generated",
        updated_at: new Date().toISOString(),
      })
      .eq("id", quote.id)
      .eq("agent_id", agent.id);

    if (updateError) {
      throw new Error(`Quote update failed. ${updateError.message}`);
    }

    await logPdfGeneration({
      supabase,
      quoteId: quote.id,
      agentId: agent.id,
      actorName: agent.contact_person || agent.contact_name || null,
      actorEmail: agent.email || user.email || null,
      pdfUrl: upload.publicUrl,
      storagePath: upload.filePath,
    });

    const safeQuoteRef = sanitizeFilePart(pdfData.quoteRef || quote.id);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Quote-${safeQuoteRef}.pdf"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("[AGENT_QUOTE_PDF_GET]", error);

    return Response.json(
      {
        error: "Failed to generate quote PDF.",
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