import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BadgeCheck,
  CircleDashed,
  Clock3,
  FileText,
  IndianRupee,
  Plus,
  ReceiptText,
  Search,
  Trash2,
} from "lucide-react";

import { PortalShell } from "@/components/shared/portal-shell";
import { AgentSidebar } from "@/components/agent/agent-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";
import { StatCard } from "@/components/shared/stat-card";
import { createClient } from "@/lib/supabase/server";

type QuoteBuilderPayload = {
  departureCity?: string;
  travelDates?: string;
  nights?: string;
  adults?: number;
  children?: number;
};

type QuoteRow = {
  id: string;
  quote_ref: string | null;
  destination: string | null;
  amount: number | null;
  amount_received: number | null;
  balance_due: number | null;
  payment_status: string | null;
  status: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  builder_payload: QuoteBuilderPayload | null;
  created_at: string | null;
  updated_at: string | null;
};

type AgentQuotesPageProps = {
  searchParams?: Promise<{
    created?: string;
    q?: string;
  }>;
};

function formatCurrency(value: number | null | undefined) {
  const num = Number(value ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(num) ? num : 0);
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
  if (value === "sent") return "Sent";
  if (value === "paid") return "Paid";
  if (value === "partially_paid") return "Partially Paid";
  if (value === "cancelled") return "Cancelled";
  if (value === "expired") return "Expired";
  if (value === "rejected") return "Rejected";
  if (value === "discarded") return "Discarded";
  if (value === "pending") return "Pending";

  return "Draft";
}

function getStatusClasses(status: string | null | undefined) {
  const value = (status || "draft").trim().toLowerCase();

  if (value === "approved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (value === "sent") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  if (value === "paid") {
    return "border-violet-200 bg-violet-50 text-violet-700";
  }

  if (value === "partially_paid") {
    return "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700";
  }

  if (value === "cancelled" || value === "rejected" || value === "expired" || value === "discarded") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function safeNumber(value: number | null | undefined) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

function matchesSearch(quote: QuoteRow, query: string) {
  if (!query) return true;

  const payload = quote.builder_payload || {};
  const haystack = [
    quote.quote_ref,
    quote.destination,
    quote.customer_name,
    quote.customer_email,
    quote.customer_phone,
    payload.departureCity,
    payload.travelDates,
    payload.nights,
    quote.status,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function QuoteTable({ quotes }: { quotes: QuoteRow[] }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Quote
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Travel
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Amount
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Received
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Due
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Created
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 bg-white">
            {quotes.map((quote) => {
              const payload = quote.builder_payload || {};
              const departureCity = payload.departureCity || "—";
              const travelDates = payload.travelDates || "—";
              const nights = payload.nights || "—";
              const adults = safeNumber(payload.adults);
              const children = safeNumber(payload.children);
              const travellerText = `${adults}A${children > 0 ? ` · ${children}C` : ""}`;

              return (
                <tr key={quote.id} className="align-top">
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {quote.destination || "Custom Trip Quote"}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">{quote.quote_ref || "—"}</p>
                      <p className="mt-2 text-sm text-slate-600">
                        {[quote.destination, departureCity].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{quote.customer_name || "—"}</p>
                      <p className="mt-1 text-xs text-slate-500">{quote.customer_email || "—"}</p>
                      <p className="mt-1 text-xs text-slate-500">{quote.customer_phone || "—"}</p>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{travelDates}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {[nights, travellerText].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-2">
                      <span
                        className={[
                          "inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold",
                          getStatusClasses(quote.status),
                        ].join(" ")}
                      >
                        {normalizeStatus(quote.status)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {quote.payment_status || "unpaid"}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <p className="text-sm font-semibold text-slate-950">
                      {formatCurrency(quote.amount)}
                    </p>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <p className="text-sm font-semibold text-slate-950">
                      {formatCurrency(quote.amount_received)}
                    </p>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <p className="text-sm font-semibold text-slate-950">
                      {formatCurrency(quote.balance_due)}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm text-slate-900">{formatDate(quote.created_at)}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDateTime(quote.created_at)}</p>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/agent/quotes/${quote.id}`}
                      className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function AgentQuotesPage({ searchParams }: AgentQuotesPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const createdQuoteRef = resolvedSearchParams?.created || "";
  const query = (resolvedSearchParams?.q || "").trim().toLowerCase();

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
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (agentError || !agent?.id) {
    redirect("/agent/login");
  }

  const { data: quotesData, error: quotesError } = await supabase
    .from("quotes")
    .select(`
      id,
      quote_ref,
      destination,
      amount,
      amount_received,
      balance_due,
      payment_status,
      status,
      customer_name,
      customer_email,
      customer_phone,
      builder_payload,
      created_at,
      updated_at
    `)
    .eq("agent_id", agent.id)
    .order("created_at", { ascending: false });

  const rawQuotes = ((quotesData as QuoteRow[] | null) || []) as QuoteRow[];
  const filteredQuotes = rawQuotes.filter((quote) => matchesSearch(quote, query));

  const activeQuotes = filteredQuotes.filter((quote) => (quote.status || "").toLowerCase() !== "discarded");
  const discardedQuotes = filteredQuotes.filter((quote) => (quote.status || "").toLowerCase() === "discarded");

  const totalQuotes = rawQuotes.length;
  const draftQuotes = rawQuotes.filter((quote) => {
    const value = (quote.status || "").toLowerCase();
    return value === "draft" || value === "pending";
  }).length;
  const approvedQuotes = rawQuotes.filter((quote) => {
    const value = (quote.status || "").toLowerCase();
    return value === "approved" || value === "partially_paid" || value === "paid";
  }).length;
  const totalQuoteValue = rawQuotes.reduce((sum, quote) => sum + safeNumber(quote.amount), 0);

  return (
    <PortalShell
      title="Quotes"
      subtitle="Create, review, and track all quotes generated by your agent account."
      sidebar={<AgentSidebar />}
    >
      <div className="space-y-6">
        {createdQuoteRef ? (
          <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 px-5 py-4">
            <div className="flex items-start gap-3">
              <BadgeCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">Quote created successfully</p>
                <p className="mt-1 text-sm text-emerald-700">
                  Quote reference <span className="font-semibold">{createdQuoteRef}</span> has been saved.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {quotesError ? (
          <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4">
            <p className="text-sm font-semibold text-rose-800">Failed to load quotes</p>
            <p className="mt-1 text-sm text-rose-700">{quotesError.message}</p>
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Quotes" value={String(totalQuotes)} icon={FileText} />
          <StatCard label="Draft Quotes" value={String(draftQuotes)} icon={CircleDashed} />
          <StatCard label="Approved Income Quotes" value={String(approvedQuotes)} icon={BadgeCheck} />
          <StatCard label="Total Quote Value" value={formatCurrency(totalQuoteValue)} icon={IndianRupee} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <InfoPanel
            title="Quotes"
            action={
              <div className="flex flex-wrap items-center gap-3">
                <form action="/agent/quotes" className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name="q"
                      defaultValue={resolvedSearchParams?.q || ""}
                      placeholder="Search quotes"
                      className="w-[220px] rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    />
                  </div>
                </form>

                <Link
                  href="/agent/quotes/new"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4" />
                  New Quote
                </Link>
              </div>
            }
          >
            {filteredQuotes.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                <p className="text-base font-semibold text-slate-900">No quotes found.</p>
                <p className="mt-2 text-sm text-slate-600">
                  {query
                    ? "No quotes matched your search. Try another keyword."
                    : "Your quote list is empty. Create the first quote from the custom trip flow."}
                </p>

                <div className="mt-5">
                  <Link
                    href="/trip-builder"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                  >
                    <ReceiptText className="h-4 w-4" />
                    Go to Trip Builder
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {activeQuotes.length > 0 ? (
                  <div>
                    <p className="mb-3 text-sm font-semibold text-slate-900">Active Quotes</p>
                    <QuoteTable quotes={activeQuotes} />
                  </div>
                ) : null}

                <details className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50" open={discardedQuotes.length > 0}>
                  <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold text-slate-900">
                    <span className="inline-flex items-center gap-2">
                      <Trash2 className="h-4 w-4 text-slate-500" />
                      Discarded Quotes
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700">
                      {discardedQuotes.length}
                    </span>
                  </summary>

                  <div className="border-t border-slate-200 px-5 pb-5 pt-4">
                    {discardedQuotes.length === 0 ? (
                      <div className="rounded-[22px] border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-600">
                        No discarded quotes found.
                      </div>
                    ) : (
                      <QuoteTable quotes={discardedQuotes} />
                    )}
                  </div>
                </details>
              </div>
            )}
          </InfoPanel>

          <div className="space-y-6">
            <InfoPanel title="Quote Pipeline">
              <div className="space-y-4">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <Clock3 className="mt-0.5 h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Draft / Pending</p>
                      <p className="mt-1 text-2xl font-semibold text-slate-950">{draftQuotes}</p>
                      <p className="mt-1 text-sm text-slate-600">Quotes created but not yet completed.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <BadgeCheck className="mt-0.5 h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Approved Income</p>
                      <p className="mt-1 text-2xl font-semibold text-slate-950">{approvedQuotes}</p>
                      <p className="mt-1 text-sm text-slate-600">Approved, partially paid, and paid quotes.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <IndianRupee className="mt-0.5 h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Total Value</p>
                      <p className="mt-1 text-2xl font-semibold text-slate-950">
                        {formatCurrency(totalQuoteValue)}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">Total value across all quotes for this agent.</p>
                    </div>
                  </div>
                </div>
              </div>
            </InfoPanel>

            <InfoPanel title="Quick Actions">
              <div className="space-y-3">
                <Link
                  href="/trip-builder"
                  className="flex items-center justify-between rounded-[22px] border border-slate-200 bg-white px-4 py-4 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Create New Quote</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Start a fresh custom trip and convert it into a quote.
                    </p>
                  </div>
                  <Plus className="h-4 w-4 text-slate-500" />
                </Link>

                <Link
                  href="/agent/dashboard"
                  className="flex items-center justify-between rounded-[22px] border border-slate-200 bg-white px-4 py-4 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Back to Dashboard</p>
                    <p className="mt-1 text-sm text-slate-600">Return to your main agent control panel.</p>
                  </div>
                  <FileText className="h-4 w-4 text-slate-500" />
                </Link>
              </div>
            </InfoPanel>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}