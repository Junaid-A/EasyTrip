import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import {
  BookingCrmWorkspace,
  type BookingActivityLog,
  type BookingCrmInitialData,
  type BookingCrmSaveInput,
  type PastBookingItem,
  type BookingStatus,
  type PaymentStatus,
} from "@/components/admin/bookings/booking-crm-workspace";

type PageProps = {
  params: Promise<{
    bookingRef: string;
  }>;
};

type UnknownRecord = Record<string, unknown>;

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asObject(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function toIso(value: unknown) {
  const raw = asString(value);
  if (!raw) return new Date().toISOString();
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function toDateInput(value: unknown) {
  const raw = asString(value);
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function titleCase(input: string) {
  return input.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeStatus(value?: string | null): BookingStatus {
  const status = (value || "pending").toLowerCase();

  if (status === "pending" || status === "confirmed" || status === "cancelled") {
    return status;
  }

  return "pending";
}

function normalizePaymentStatus(value?: string | null): PaymentStatus {
  const status = (value || "unpaid").toLowerCase();

  if (
    status === "unpaid" ||
    status === "partial" ||
    status === "paid" ||
    status === "refunded"
  ) {
    return status;
  }

  return "unpaid";
}

function normalizePricing(row: UnknownRecord) {
  const crmData = asObject(row.crm_data);
  const pricing = asObject(row.pricing);
  const crmPricing = asObject(crmData.pricing);

  const packageBase =
    asNumber(pricing.packageBase) ||
    asNumber(pricing.basePackage) ||
    asNumber(pricing.base_price) ||
    asNumber(crmPricing.packageBase);

  const flights =
    asNumber(pricing.flights) ||
    asNumber(pricing.estimatedFlightTotal) ||
    asNumber(crmPricing.flights);

  const hotels =
    asNumber(pricing.hotels) ||
    asNumber(pricing.estimatedHotelTotal) ||
    asNumber(crmPricing.hotels);

  const transfers =
    asNumber(pricing.transfers) ||
    asNumber(pricing.estimatedTransferTotal) ||
    asNumber(crmPricing.transfers);

  const sightseeing =
    asNumber(pricing.sightseeing) ||
    asNumber(pricing.estimatedSightseeingTotal) ||
    asNumber(crmPricing.sightseeing);

  const meals =
    asNumber(pricing.meals) ||
    asNumber(pricing.estimatedMealsTotal) ||
    asNumber(crmPricing.meals);

  const serviceFee =
    asNumber(pricing.serviceFee) ||
    asNumber(pricing.service_fee) ||
    asNumber(crmPricing.serviceFee);

  const extra =
    asNumber(pricing.extra) ||
    asNumber(pricing.extraChargesTotal) ||
    asNumber(crmPricing.extra);

  const discount =
    asNumber(pricing.discount) ||
    asNumber(pricing.discountValue) ||
    asNumber(crmPricing.discount);

  const computedTotal =
    packageBase +
    flights +
    hotels +
    transfers +
    sightseeing +
    meals +
    serviceFee +
    extra -
    discount;

  const totalAmount = asNumber(row.total_amount, computedTotal);

  return {
    packageBase,
    flights,
    hotels,
    transfers,
    sightseeing,
    meals,
    serviceFee,
    extra,
    discount,
    totalAmount,
  };
}

function mapTravellers(row: UnknownRecord) {
  const travellers = asArray<UnknownRecord>(row.travellers);

  return travellers.map((traveller, index) => ({
    id: asString(traveller.id) || `traveller-${index + 1}`,
    name:
      asString(traveller.name) ||
      asString(traveller.fullName) ||
      `Traveller ${index + 1}`,
    age:
      asString(traveller.age) ||
      (asNumber(traveller.age) ? String(asNumber(traveller.age)) : ""),
    gender: asString(traveller.gender) || "Adult",
  }));
}

function mapItinerary(row: UnknownRecord) {
  const itinerary = asArray<UnknownRecord>(row.itinerary);
  const destination = asString(row.destination);

  return itinerary.map((day, index) => ({
    id: asString(day.id) || `day-${index + 1}`,
    day: asNumber(day.day, index + 1) || index + 1,
    title: asString(day.title) || `Day ${index + 1}`,
    city: asString(day.city) || destination,
    description: asString(day.description) || asString(day.notes),
  }));
}

function mapPayments(row: UnknownRecord) {
  const crmData = asObject(row.crm_data);
  const payments = asArray<UnknownRecord>(crmData.payments);

  return payments.map((payment, index) => ({
    id: asString(payment.id) || `payment-${index + 1}`,
    amount: asNumber(payment.amount),
    mode: asString(payment.mode) || "UPI",
    date: toDateInput(payment.date) || new Date().toISOString().slice(0, 10),
    note: asString(payment.note),
  }));
}

function mapNotes(row: UnknownRecord) {
  const crmData = asObject(row.crm_data);
  const notes = asArray<UnknownRecord>(crmData.notes);

  return notes.map((note, index) => ({
    id: asString(note.id) || `note-${index + 1}`,
    text: asString(note.text) || asString(note.note),
    createdAt: toIso(note.createdAt || note.created_at),
  }));
}

function mapTags(row: UnknownRecord) {
  const crmData = asObject(row.crm_data);
  return asArray<string>(crmData.tags).filter(Boolean);
}

function normalizeInitialData(
  row: UnknownRecord,
  logs: BookingActivityLog[],
  pastBookings: PastBookingItem[],
): BookingCrmInitialData {
  const crmData = asObject(row.crm_data);
  const pricing = normalizePricing(row);
  const travellers = mapTravellers(row);
  const payments = mapPayments(row);
  const tripTitle =
    asString(row.trip_title) ||
    asString(crmData.tripTitle) ||
    asString(row.destination) ||
    "Trip";

  const amountPaid =
    payments.reduce((sum, item) => sum + Number(item.amount || 0), 0) ||
    asNumber(crmData.amountPaid) ||
    (normalizePaymentStatus(asString(row.payment_status)) === "paid"
      ? pricing.totalAmount
      : 0);

  return {
    bookingId: asString(row.id),
    bookingRef: asString(row.booking_ref),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at || row.created_at),

    tripTitle,
    customerName: asString(row.customer_name) || "Customer",
    customerEmail: asString(row.customer_email),
    customerPhone: asString(row.customer_phone),
    alternatePhone: asString(crmData.alternatePhone),
    whatsappNumber: asString(crmData.whatsappNumber) || asString(row.customer_phone),

    destination: asString(row.destination),
    departure: asString(crmData.departure) || asString(row.departure_date),
    startDate: toDateInput(crmData.startDate || row.departure_date),
    endDate: toDateInput(crmData.endDate),
    duration:
      asString(row.duration_label) ||
      asString(row.nights) ||
      asString(crmData.duration),
    rooms: String(asNumber(row.rooms, 1)),
    travellersCount:
      String(travellers.length || asNumber(row.adults) + asNumber(row.children) || 1),

    bookingStatus: normalizeStatus(asString(row.status)),
    paymentStatus: normalizePaymentStatus(asString(row.payment_status)),

    totalAmount: pricing.totalAmount,
    amountPaid,

    tags: mapTags(row),
    notes: mapNotes(row),
    payments,
    travellers,
    itinerary: mapItinerary(row),

    pricing: {
      packageBase: pricing.packageBase,
      flights: pricing.flights,
      hotels: pricing.hotels,
      transfers: pricing.transfers,
      sightseeing: pricing.sightseeing,
      meals: pricing.meals,
      serviceFee: pricing.serviceFee,
      extra: pricing.extra,
      discount: pricing.discount,
    },

    activityLogs: logs,
    pastBookings,
  };
}

function buildSummary(
  action: string,
  changes: Array<{
    field: string;
    before: string | null;
    after: string | null;
  }>,
) {
  if (action === "booking_saved") {
    if (!changes.length) return "Booking saved.";
    if (changes.length === 1) return `${titleCase(changes[0].field)} updated.`;
    return `${changes.length} fields updated.`;
  }

  if (action === "edit_enabled") return "Edit mode enabled.";
  if (action === "payment_added") return "Payment added.";
  if (action === "note_added") return "Internal note added.";
  if (action === "status_updated") return "Booking status updated.";
  if (action === "payment_status_updated") return "Payment status updated.";

  return titleCase(action);
}

async function getActivityLogs(
  supabase: Awaited<ReturnType<typeof createClient>>,
  bookingId: string,
): Promise<BookingActivityLog[]> {
  const { data, error } = await supabase
    .from("booking_activity_logs")
    .select("*")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return (data as UnknownRecord[]).map((row) => ({
    id: asString(row.id),
    createdAt: toIso(row.created_at),
    actorName: asString(row.actor_name) || "Admin",
    actorId: asString(row.actor_user_id),
    action: asString(row.action),
    entityType: asString(row.entity_type),
    summary: asString(row.summary),
    changes: asArray<UnknownRecord>(row.changes).map((change) => ({
      field: asString(change.field),
      before: change.before == null ? null : String(change.before),
      after: change.after == null ? null : String(change.after),
    })),
  }));
}

async function insertActivityLogs(
  supabase: Awaited<ReturnType<typeof createClient>>,
  input: {
    bookingId: string;
    bookingRef: string;
    actorId: string;
    actorName: string;
    logs: Array<{
      action: string;
      entityType: string;
      summary: string;
      changes: Array<{
        field: string;
        before: string | null;
        after: string | null;
      }>;
    }>;
  },
) {
  if (!input.logs.length) return;

  const rows = input.logs.map((log) => ({
    booking_id: input.bookingId,
    booking_ref: input.bookingRef,
    actor_user_id: input.actorId,
    actor_name: input.actorName,
    action: log.action,
    entity_type: log.entityType,
    summary: log.summary,
    changes: log.changes,
    created_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from("booking_activity_logs").insert(rows);

  if (error) {
    throw new Error(error.message || "Failed to write activity logs.");
  }
}

async function getPastBookings(
  supabase: Awaited<ReturnType<typeof createClient>>,
  row: UnknownRecord,
): Promise<PastBookingItem[]> {
  const bookingId = asString(row.id);
  const userId = asString(row.user_id);
  const customerEmail = asString(row.customer_email);

  let query = supabase
    .from("bookings")
    .select("id, booking_ref, destination, status, total_amount, created_at")
    .neq("id", bookingId)
    .order("created_at", { ascending: false })
    .limit(8);

  if (userId) {
    query = query.eq("user_id", userId);
  } else if (customerEmail) {
    query = query.eq("customer_email", customerEmail);
  } else {
    return [];
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return (data as UnknownRecord[]).map((item) => ({
    id: asString(item.id),
    bookingRef: asString(item.booking_ref),
    destination: asString(item.destination) || "Destination",
    status: normalizeStatus(asString(item.status)),
    totalAmount: asNumber(item.total_amount),
    createdAt: toIso(item.created_at),
  }));
}

export default async function AdminBookingCrmPage({ params }: PageProps) {
  const { bookingRef } = await params;
  const user = await getCurrentUser();

  if (!user) notFound();

  const supabase = await createClient();

  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("booking_ref", bookingRef)
    .maybeSingle();

  if (error || !booking) notFound();

  const currentBooking = booking as UnknownRecord;
  const bookingId = asString(currentBooking.id);
  const initialLogs = await getActivityLogs(supabase, bookingId);
  const pastBookings = await getPastBookings(supabase, currentBooking);
  const initialData = normalizeInitialData(currentBooking, initialLogs, pastBookings);

  async function onLog(input: {
    bookingId: string;
    bookingRef: string;
    action: string;
    entityType: string;
    summary: string;
    changes?: Array<{
      field: string;
      before: string | null;
      after: string | null;
    }>;
  }) {
    "use server";

    const currentUser = await getCurrentUser();
if (!currentUser?.user) {
  return { ok: false, message: "Not authorized." };
}

    const serverSupabase = await createClient();
    const actorName =
      currentUser.profile?.full_name ||
      currentUser.user?.email ||
      "Admin";

    const { data, error } = await serverSupabase
      .from("booking_activity_logs")
      .insert({
        booking_id: input.bookingId,
        booking_ref: input.bookingRef,
        actor_user_id: currentUser.user.id,
        actor_name: actorName,
        action: input.action,
        entity_type: input.entityType,
        summary: input.summary,
        changes: input.changes ?? [],
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error || !data) {
      return {
        ok: false,
        message: error?.message || "Failed to save activity log.",
      };
    }

    const row = data as UnknownRecord;

    return {
      ok: true,
      log: {
        id: asString(row.id),
        createdAt: toIso(row.created_at),
        actorName: asString(row.actor_name) || "Admin",
        actorId: asString(row.actor_user_id),
        action: asString(row.action),
        entityType: asString(row.entity_type),
        summary: asString(row.summary),
        changes: asArray<UnknownRecord>(row.changes).map((change) => ({
          field: asString(change.field),
          before: change.before == null ? null : String(change.before),
          after: change.after == null ? null : String(change.after),
        })),
      },
    };
  }

  async function onSave(payload: BookingCrmSaveInput) {
    "use server";

    const currentUser = await getCurrentUser();
if (!currentUser?.user) {
  return { ok: false, message: "Not authorized." };
}

    const serverSupabase = await createClient();

    const { data: existingBooking, error: existingError } = await serverSupabase
      .from("bookings")
      .select("*")
      .eq("id", payload.bookingId)
      .single();

    if (existingError || !existingBooking) {
      return {
        ok: false,
        message: existingError?.message || "Booking not found.",
      };
    }

    const existing = existingBooking as UnknownRecord;
    const existingCrmData = asObject(existing.crm_data);
    const existingMeta = asObject(existing.meta);
    const travellerCount = Math.max(1, payload.travellers.length || Number(payload.travellersCount || 1));

    const computedTotal =
      Number(payload.pricing.packageBase || 0) +
      Number(payload.pricing.flights || 0) +
      Number(payload.pricing.hotels || 0) +
      Number(payload.pricing.transfers || 0) +
      Number(payload.pricing.sightseeing || 0) +
      Number(payload.pricing.meals || 0) +
      Number(payload.pricing.serviceFee || 0) +
      Number(payload.pricing.extra || 0) -
      Number(payload.pricing.discount || 0);

    const paymentsTotal = payload.payments.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
    );

    const crmData = {
      ...existingCrmData,
      tripTitle: payload.tripTitle,
      alternatePhone: payload.alternatePhone,
      whatsappNumber: payload.whatsappNumber,
      departure: payload.departure,
      startDate: payload.startDate,
      endDate: payload.endDate,
      duration: payload.duration,
      tags: payload.tags,
      notes: payload.notes,
      payments: payload.payments,
      amountPaid: paymentsTotal,
    };

    const pricing = {
      ...asObject(existing.pricing),
      packageBase: Number(payload.pricing.packageBase || 0),
      flights: Number(payload.pricing.flights || 0),
      hotels: Number(payload.pricing.hotels || 0),
      transfers: Number(payload.pricing.transfers || 0),
      sightseeing: Number(payload.pricing.sightseeing || 0),
      meals: Number(payload.pricing.meals || 0),
      serviceFee: Number(payload.pricing.serviceFee || 0),
      extra: Number(payload.pricing.extra || 0),
      discount: Number(payload.pricing.discount || 0),
      totalAmount: Math.max(0, Math.round(computedTotal)),
    };

    const patch = {
      status: normalizeStatus(payload.bookingStatus),
      payment_status: normalizePaymentStatus(payload.paymentStatus),
      trip_title: payload.tripTitle || payload.destination || asString(existing.trip_title),
      destination: payload.destination || asString(existing.destination),
      duration_label: payload.duration || asString(existing.duration_label),
      nights: payload.duration || asString(existing.nights),
      departure_date: payload.startDate || asString(existing.departure_date),
      rooms: Math.max(1, Number(payload.rooms || existing.rooms || 1)),
      adults: Math.max(1, asNumber(existing.adults, travellerCount)),
      children: Math.max(0, asNumber(existing.children, 0)),
      customer_name: payload.customerName,
      customer_email: payload.customerEmail,
      customer_phone: payload.customerPhone,
      travellers: payload.travellers,
      itinerary: payload.itinerary,
      pricing,
      crm_data: crmData,
      meta: {
        ...existingMeta,
        lastEditedFrom: "admin-booking-workspace",
      },
      total_amount: Math.max(0, Math.round(computedTotal)),
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await serverSupabase
      .from("bookings")
      .update(patch)
      .eq("id", payload.bookingId);

    if (updateError) {
      return {
        ok: false,
        message: updateError.message || "Failed to save booking.",
      };
    }

    const actorName =
      currentUser.profile?.full_name ||
      currentUser.user?.email ||
      "Admin";

    const logsToInsert = [
      ...payload.pendingLogs,
      {
        action: "booking_saved",
        entityType: "booking",
        summary: buildSummary("booking_saved", payload.changes),
        changes: payload.changes,
      },
    ];

    try {
      await insertActivityLogs(serverSupabase, {
        bookingId: payload.bookingId,
        bookingRef: payload.bookingRef,
        actorId: currentUser.user.id,
        actorName,
        logs: logsToInsert,
      });
    } catch (error) {
      return {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Booking saved, but logs failed to persist.",
      };
    }

    revalidatePath(`/admin/bookings/${payload.bookingRef}`);
    revalidatePath("/admin/bookings");

    const { data: freshBooking, error: freshError } = await serverSupabase
      .from("bookings")
      .select("*")
      .eq("id", payload.bookingId)
      .single();

    if (freshError || !freshBooking) {
      return {
        ok: false,
        message: freshError?.message || "Saved, but failed to reload booking.",
      };
    }

    const freshLogs = await getActivityLogs(serverSupabase, payload.bookingId);
    const freshPastBookings = await getPastBookings(serverSupabase, freshBooking as UnknownRecord);
    const freshInitialData = normalizeInitialData(
      freshBooking as UnknownRecord,
      freshLogs,
      freshPastBookings,
    );

    return {
      ok: true,
      message: "Booking saved successfully.",
      logs: freshLogs,
      data: freshInitialData,
    };
  }

  return <BookingCrmWorkspace initialData={initialData} onSave={onSave} onLog={onLog} />;
}