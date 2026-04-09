import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  FileText,
  IndianRupee,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";

import { PortalShell } from "@/components/shared/portal-shell";
import { AgentSidebar } from "@/components/agent/agent-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";
import { QuoteDetailActions } from "@/components/agent/quote-detail-actions";
import { createClient } from "@/lib/supabase/server";

type AgentQuoteDetailPageProps = {
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
  pricing_snapshot: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
};

type QuoteActivityRow = {
  id: string;
  quote_id: string | null;
  agent_id: string | null;
  action: string | null;
  activity_type: string | null;
  activity_label: string | null;
  actor_name: string | null;
  actor_email: string | null;
  meta: Record<string, unknown> | null;
  created_at: string | null;
};

type QuotePaymentRow = {
  id: string;
  amount: number | null;
  payment_mode: string | null;
  payment_date: string | null;
  note: string | null;
  entered_by: string | null;
  created_at: string | null;
};

type QuoteExpenseRow = {
  id: string;
  label: string | null;
  amount: number | null;
  note: string | null;
  created_at: string | null;
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

function safeNumber(value: unknown) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

function formatCurrency(value: unknown) {
  const num = safeNumber(value);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
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

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function normalizeStatus(status: string | null | undefined) {
  const value = (status || "draft").trim().toLowerCase();

  if (value === "approved") return "Approved";
  if (value === "saved") return "Saved";
  if (value === "pdf_generated") return "PDF Generated";
  if (value === "shared") return "Shared";
  if (value === "converted") return "Converted";
  if (value === "rejected") return "Rejected";
  if (value === "discarded") return "Discarded";
  if (value === "expired") return "Expired";
  if (value === "sent") return "Sent";
  if (value === "paid") return "Paid";
  if (value === "pending") return "Pending";
  if (value === "partially_paid") return "Partially Paid";
  if (value === "draft") return "Draft";

  return "Draft";
}

function getStatusClasses(status: string | null | undefined) {
  const value = (status || "draft").trim().toLowerCase();

  if (value === "approved") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (value === "saved" || value === "draft") return "border-amber-200 bg-amber-50 text-amber-700";
  if (value === "pdf_generated") return "border-orange-200 bg-orange-50 text-orange-700";
  if (value === "shared") return "border-indigo-200 bg-indigo-50 text-indigo-700";
  if (value === "converted") return "border-teal-200 bg-teal-50 text-teal-700";
  if (value === "sent") return "border-sky-200 bg-sky-50 text-sky-700";
  if (value === "paid") return "border-violet-200 bg-violet-50 text-violet-700";
  if (value === "partially_paid") return "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700";
  if (value === "pending") return "border-amber-200 bg-amber-50 text-amber-700";
  if (value === "rejected" || value === "discarded" || value === "expired") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
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

export default async function AgentQuoteDetailPage({
  params,
}: AgentQuoteDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/agent/login");
  }

  if (user.app_metadata?.role !== "agent") {
    redirect("/agent/login");
  }

  const { data: agent, error: agentError } = await supabase
    .from("agents")
    .select("id, contact_name, contact_person, company_name, email")
    .eq("auth_user_id", user.id)
    .single();

  if (agentError || !agent?.id) {
    redirect("/agent/login");
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
    notFound();
  }

  if (quote.agent_id !== agent.id) {
    notFound();
  }

  const [{ data: activityRows }, { data: paymentRows }, { data: expenseRows }] = await Promise.all([
    supabase
      .from("quote_activity_logs")
      .select(
        `
          id,
          quote_id,
          agent_id,
          action,
          activity_type,
          activity_label,
          actor_name,
          actor_email,
          meta,
          created_at
        `,
      )
      .eq("quote_id", quote.id)
      .order("created_at", { ascending: false })
      .limit(20),

    supabase
      .from("quote_payments")
      .select(
        `
          id,
          amount,
          payment_mode,
          payment_date,
          note,
          entered_by,
          created_at
        `,
      )
      .eq("quote_id", quote.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("quote_expenses")
      .select(
        `
          id,
          label,
          amount,
          note,
          created_at
        `,
      )
      .eq("quote_id", quote.id)
      .order("created_at", { ascending: false }),
  ]);

  const builderPayload = (quote.builder_payload || {}) as BuilderPayload;
  const pricing = ((quote.pricing_snapshot || {}) as PricingShape) || {};
  const activities = ((activityRows || []) as QuoteActivityRow[]) || [];
  const payments = ((paymentRows || []) as QuotePaymentRow[]) || [];
  const expenses = ((expenseRows || []) as QuoteExpenseRow[]) || [];
  const itinerary = asArray<BuilderTripDay>(builderPayload.customTripDays);

  const destination = quote.destination || builderPayload.destination || "—";
  const departureCity = builderPayload.departureCity || "—";
  const travelDates = builderPayload.travelDates || "—";
  const nights = builderPayload.nights || "—";
  const flightLabel = builderPayload.selectedFlightLabel || "—";
  const adults = safeNumber(builderPayload.adults);
  const children = safeNumber(builderPayload.children);

  const hotelTotal = safeNumber(pricing.hotelTotal ?? builderPayload.hotelTotal);
  const transferTotal = safeNumber(pricing.transferTotal ?? builderPayload.transferTotal);
  const sightseeingTotal = safeNumber(pricing.sightseeingTotal ?? builderPayload.sightseeingTotal);
  const mealsTotal = safeNumber(pricing.mealsTotal ?? builderPayload.mealsTotal);
  const extrasTotal = safeNumber(pricing.extrasTotal ?? builderPayload.extrasTotal);
  const serviceFee = safeNumber(pricing.serviceFee);
  const markupTotal = safeNumber(pricing.markupTotal);
  const quoteBaseAmount = safeNumber(quote.amount);
  const additionalExpenseTotal = safeNumber(quote.additional_expense_total);
  const amountReceived = safeNumber(quote.amount_received);
  const balanceDue = safeNumber(quote.balance_due);
  const finalQuoteTotal = quoteBaseAmount + additionalExpenseTotal;
  const grandTotal = safeNumber(
    pricing.grandTotal ?? pricing.finalTotal ?? pricing.total ?? finalQuoteTotal,
  );

  const travellerText = `${adults} Adult${adults === 1 ? "" : "s"}${
    children > 0 ? ` · ${children} Child${children === 1 ? "" : "ren"}` : ""
  }`;

  return (
    <PortalShell
      title="Quote Detail"
      subtitle={`Full quote view for ${quote.quote_ref || "Quote"}.`}
      sidebar={<AgentSidebar />}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/agent/quotes"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Quotes
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
                getStatusClasses(quote.status),
              ].join(" ")}
            >
              {normalizeStatus(quote.status)}
            </span>

            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
              {quote.payment_status || "unpaid"}
            </span>

            {quote.pdf_url ? (
              <a
                href={quote.pdf_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <FileText className="h-4 w-4" />
                Open PDF
              </a>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="space-y-6">
            <InfoPanel title="Quote Summary">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Quote Ref
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-950">
                    {quote.quote_ref || "—"}
                  </p>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Quote Name
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-950">
                    {quote.quote_name || destination}
                  </p>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Destination
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-base font-semibold text-slate-950">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    {destination}
                  </p>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Travel Dates
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-base font-semibold text-slate-950">
                    <CalendarDays className="h-4 w-4 text-slate-500" />
                    {travelDates}
                  </p>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Duration
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-base font-semibold text-slate-950">
                    <Clock3 className="h-4 w-4 text-slate-500" />
                    {nights}
                  </p>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Travellers
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-950">
                    {travellerText}
                  </p>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Flight / Origin
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-950">
                    {[flightLabel, departureCity].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Valid Till
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-950">
                    {formatDate(quote.valid_till)}
                  </p>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Created
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-950">
                    {formatDateTime(quote.created_at)}
                  </p>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Updated
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-950">
                    {formatDateTime(quote.updated_at)}
                  </p>
                </div>
              </div>

              {quote.internal_note ? (
                <div className="mt-5 rounded-[24px] border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Internal Notes
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{quote.internal_note}</p>
                </div>
              ) : null}

              {quote.customer_note ? (
                <div className="mt-5 rounded-[24px] border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Customer Note
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{quote.customer_note}</p>
                </div>
              ) : null}
            </InfoPanel>

            <InfoPanel title="Customer">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <User className="h-4 w-4" />
                    Name
                  </div>
                  <p className="mt-3 text-base font-semibold text-slate-950">
                    {quote.customer_name || builderPayload.customerName || "—"}
                  </p>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <p className="mt-3 text-base font-semibold text-slate-950">
                    {quote.customer_email || builderPayload.customerEmail || "—"}
                  </p>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <Phone className="h-4 w-4" />
                    Phone
                  </div>
                  <p className="mt-3 text-base font-semibold text-slate-950">
                    {quote.customer_phone || builderPayload.customerPhone || "—"}
                  </p>
                </div>
              </div>
            </InfoPanel>

            <InfoPanel title="Payment Ledger">
              {payments.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                  <p className="text-base font-semibold text-slate-900">No payments recorded.</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Payments added from the detail action panel will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-[24px] border border-slate-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Mode
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Note
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {payments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="px-4 py-4 text-sm text-slate-700">
                              {formatDate(payment.payment_date || payment.created_at)}
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-700">
                              {payment.payment_mode || "—"}
                            </td>
                            <td className="px-4 py-4 text-right text-sm font-semibold text-slate-950">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-700">
                              {payment.note || payment.entered_by || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </InfoPanel>

            <InfoPanel title="Additional Expenses">
              {expenses.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                  <p className="text-base font-semibold text-slate-900">No additional expenses.</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Any customer-requested extras added later will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-[24px] border border-slate-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Label
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Note
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {expenses.map((expense) => (
                          <tr key={expense.id}>
                            <td className="px-4 py-4 text-sm text-slate-700">
                              {formatDate(expense.created_at)}
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-700">
                              {expense.label || "—"}
                            </td>
                            <td className="px-4 py-4 text-right text-sm font-semibold text-slate-950">
                              {formatCurrency(expense.amount)}
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-700">
                              {expense.note || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </InfoPanel>

            <InfoPanel title="Itinerary">
              {itinerary.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                  <p className="text-base font-semibold text-slate-900">
                    No itinerary data saved.
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    `builder_payload.customTripDays` is empty for this quote.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {itinerary.map((day, index) => {
                    const items = normalizeDayItems(day);

                    return (
                      <div
                        key={String(day.id ?? index + 1)}
                        className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
                      >
                        <div className="border-b border-slate-200 bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)] px-5 py-4">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                              <div className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
                                Day {safeNumber(day.day ?? day.dayNumber ?? index + 1)}
                              </div>
                              <h3 className="mt-3 text-lg font-semibold text-slate-950">
                                {day.title || `Day ${index + 1}`}
                              </h3>
                              {(day.city || day.location) ? (
                                <p className="mt-1 text-sm text-slate-600">
                                  {day.city || day.location}
                                </p>
                              ) : null}
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {day.hotelName ? (
                                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                                  Hotel: {day.hotelName}
                                </span>
                              ) : null}
                              {day.transferName ? (
                                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                                  Transfer: {day.transferName}
                                </span>
                              ) : null}
                            </div>
                          </div>

                          {(day.notes || day.summary || day.description) ? (
                            <p className="mt-4 text-sm leading-6 text-slate-600">
                              {day.notes || day.summary || day.description}
                            </p>
                          ) : null}
                        </div>

                        <div className="px-5 py-5">
                          {items.length === 0 ? (
                            <div className="rounded-[22px] bg-slate-50 px-4 py-4 text-sm text-slate-500">
                              No structured line items stored for this day.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {items.map((item) => (
                                <div
                                  key={item.id}
                                  className="rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-4"
                                >
                                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                    <div>
                                      <div className="inline-flex rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                                        {item.type}
                                      </div>
                                      <p className="mt-2 text-sm font-semibold text-slate-950">
                                        {item.title}
                                      </p>
                                      {item.location ? (
                                        <p className="mt-1 text-xs text-slate-500">
                                          {item.location}
                                        </p>
                                      ) : null}
                                    </div>

                                    {item.time ? (
                                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                                        {item.time}
                                      </span>
                                    ) : null}
                                  </div>

                                  {item.notes ? (
                                    <p className="mt-3 text-sm leading-6 text-slate-600">
                                      {item.notes}
                                    </p>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </InfoPanel>

            <InfoPanel title="Activity Log">
              {activities.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                  <p className="text-base font-semibold text-slate-900">
                    No activity found.
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    No rows found in `quote_activity_logs` for this quote.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[22px] border border-slate-200 bg-white px-4 py-4"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">
                            {item.activity_label || item.action || "Quote activity"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.actor_name || item.actor_email || "Agent"}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500">
                          {formatDateTime(item.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </InfoPanel>
          </div>

          <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <InfoPanel title="Quote Actions">
              <QuoteDetailActions
                quoteId={quote.id}
                quoteRef={quote.quote_ref}
                currentStatus={quote.status}
                paymentStatus={quote.payment_status}
                amount={quoteBaseAmount}
                amountReceived={amountReceived}
                additionalExpenseTotal={additionalExpenseTotal}
                balanceDue={balanceDue}
              />
            </InfoPanel>

            <InfoPanel title="Financial Snapshot">
              <div className="space-y-4">
                <div className="rounded-[26px] border border-orange-200 bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)] p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-orange-700">
                    <IndianRupee className="h-4 w-4" />
                    Final Quote Total
                  </div>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                    {formatCurrency(finalQuoteTotal)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Base amount plus all additional recorded expenses.
                  </p>
                </div>

                <div className="rounded-[26px] border border-slate-200 bg-white p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-slate-700">
                      <span>Base Quote Amount</span>
                      <span className="font-semibold text-slate-950">
                        {formatCurrency(quoteBaseAmount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-700">
                      <span>Additional Expenses</span>
                      <span className="font-semibold text-slate-950">
                        {formatCurrency(additionalExpenseTotal)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-700">
                      <span>Total Received</span>
                      <span className="font-semibold text-slate-950">
                        {formatCurrency(amountReceived)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-700">
                      <span>Balance Due</span>
                      <span className="font-semibold text-slate-950">
                        {formatCurrency(balanceDue)}
                      </span>
                    </div>

                    <div className="my-1 border-t border-dashed border-slate-200" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">Pricing Snapshot</span>
                      <span className="text-lg font-semibold text-slate-950">
                        {formatCurrency(grandTotal)}
                      </span>
                    </div>

                    <div className="mt-3 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      <div className="flex items-center justify-between">
                        <span>Hotels</span>
                        <span className="font-semibold text-slate-950">{formatCurrency(hotelTotal)}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span>Transfers</span>
                        <span className="font-semibold text-slate-950">{formatCurrency(transferTotal)}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span>Sightseeing</span>
                        <span className="font-semibold text-slate-950">{formatCurrency(sightseeingTotal)}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span>Meals</span>
                        <span className="font-semibold text-slate-950">{formatCurrency(mealsTotal)}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span>Extras</span>
                        <span className="font-semibold text-slate-950">{formatCurrency(extrasTotal)}</span>
                      </div>

                      {serviceFee > 0 ? (
                        <div className="mt-2 flex items-center justify-between">
                          <span>Service Fee</span>
                          <span className="font-semibold text-slate-950">{formatCurrency(serviceFee)}</span>
                        </div>
                      ) : null}

                      {markupTotal > 0 ? (
                        <div className="mt-2 flex items-center justify-between">
                          <span>Markup</span>
                          <span className="font-semibold text-slate-950">{formatCurrency(markupTotal)}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </InfoPanel>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}