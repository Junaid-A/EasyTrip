"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PortalShell } from "@/components/shared/portal-shell";
import { AgentSidebar } from "@/components/agent/agent-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  FileText,
  IndianRupee,
  RefreshCw,
  Wallet,
} from "lucide-react";

type DateFilter = "7d" | "30d" | "90d" | "all";

type QuoteRow = {
  id?: string;
  agent_id?: string | null;
  quote_ref?: string | null;
  created_at?: string | null;
  customer_name?: string | null;
  destination?: string | null;
  amount?: number | string | null;
  total_amount?: number | string | null;
  status?: string | null;
};

type BookingRow = {
  id?: string;
  agent_id?: string | null;
  booking_ref?: string | null;
  created_at?: string | null;
  customer_name?: string | null;
  destination?: string | null;
  status?: string | null;
  approval_status?: string | null;
  payment_status?: string | null;
  total_amount?: number | string | null;
  grand_total?: number | string | null;
  payable_amount?: number | string | null;
  total?: number | string | null;
  amount?: number | string | null;
};

type PaymentRow = {
  id: string;
  booking_id: string;
  booking_ref?: string | null;
  amount?: number | string | null;
  payment_mode?: string | null;
  payment_date?: string | null;
  note?: string | null;
  created_at?: string | null;
};

type SettlementRow = {
  id: string;
  agent_id: string;
  amount?: number | string | null;
  payment_date?: string | null;
  created_at?: string | null;
  note?: string | null;
};

const DATE_FILTERS: { key: DateFilter; label: string }[] = [
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "90d", label: "90D" },
  { key: "all", label: "All" },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function toNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, value));
}

function formatCompactCurrency(value: number) {
  const num = Math.max(0, value);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${Math.round(num)}`;
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-IN").format(Math.max(0, value));
}

function formatDateLabel(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function inQuickDateRange(dateString?: string | null, filter: DateFilter = "30d") {
  if (!dateString) return false;
  if (filter === "all") return true;

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  const days = filter === "7d" ? 7 : filter === "30d" ? 30 : 90;
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return date >= start;
}

function getQuoteAmount(row: QuoteRow) {
  return toNumber(row.amount) || toNumber(row.total_amount);
}

function getBookingAmount(row: BookingRow) {
  return (
    toNumber(row.total_amount) ||
    toNumber(row.grand_total) ||
    toNumber(row.payable_amount) ||
    toNumber(row.total) ||
    toNumber(row.amount)
  );
}

function getQuoteStatus(row: QuoteRow) {
  return (row.status || "").trim().toLowerCase();
}

function getBookingStatus(row: BookingRow) {
  return `${row.status || ""} ${row.approval_status || ""}`.trim().toLowerCase();
}

function isPdfGeneratedQuote(row: QuoteRow) {
  const raw = getQuoteStatus(row);
  return (
    raw.includes("pdf") ||
    raw.includes("sent") ||
    raw.includes("shared") ||
    raw.includes("share") ||
    raw.includes("download") ||
    raw.includes("generated") ||
    raw.includes("export")
  );
}

function isApprovedQuote(row: QuoteRow) {
  const raw = getQuoteStatus(row);
  return raw.includes("approved") || raw.includes("accepted");
}

function isCancelledQuote(row: QuoteRow) {
  const raw = getQuoteStatus(row);
  return raw.includes("cancel") || raw.includes("reject");
}

function isApprovedBooking(row: BookingRow) {
  const raw = getBookingStatus(row);
  return raw.includes("confirm") || raw.includes("approved") || raw.includes("booked");
}

function isCancelledBooking(row: BookingRow) {
  const raw = getBookingStatus(row);
  return raw.includes("cancel") || raw.includes("reject");
}

function buildTripsChart(rows: BookingRow[], filter: DateFilter) {
  const count = filter === "7d" ? 7 : filter === "30d" ? 30 : 12;
  const now = new Date();

  const chart = Array.from({ length: count }, (_, index) => {
    const d = new Date();

    if (filter === "90d" || filter === "all") {
      d.setMonth(now.getMonth() - (count - 1 - index));
      return {
        label: d.toLocaleDateString("en-IN", { month: "short" }),
        approved: 0,
        cancelled: 0,
      };
    }

    d.setDate(now.getDate() - (count - 1 - index));
    return {
      label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      approved: 0,
      cancelled: 0,
    };
  });

  rows.forEach((row) => {
    if (!row.created_at) return;
    const created = new Date(row.created_at);
    if (Number.isNaN(created.getTime())) return;

    if (filter === "90d" || filter === "all") {
      const diffMonths =
        (now.getFullYear() - created.getFullYear()) * 12 +
        (now.getMonth() - created.getMonth());

      if (diffMonths < 0 || diffMonths >= count) return;
      const idx = count - 1 - diffMonths;

      if (!chart[idx]) return;
      if (isApprovedBooking(row)) chart[idx].approved += 1;
      if (isCancelledBooking(row)) chart[idx].cancelled += 1;
      return;
    }

    const diffDays = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 0 || diffDays >= count) return;
    const idx = count - 1 - diffDays;

    if (!chart[idx]) return;
    if (isApprovedBooking(row)) chart[idx].approved += 1;
    if (isCancelledBooking(row)) chart[idx].cancelled += 1;
  });

  return chart;
}

function buildRevenueChart(bookings: BookingRow[], payments: PaymentRow[], filter: DateFilter) {
  const count = filter === "7d" ? 7 : filter === "30d" ? 30 : 12;
  const now = new Date();

  const chart = Array.from({ length: count }, (_, index) => {
    const d = new Date();

    if (filter === "90d" || filter === "all") {
      d.setMonth(now.getMonth() - (count - 1 - index));
      return {
        label: d.toLocaleDateString("en-IN", { month: "short" }),
        projected: 0,
        paid: 0,
      };
    }

    d.setDate(now.getDate() - (count - 1 - index));
    return {
      label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      projected: 0,
      paid: 0,
    };
  });

  bookings.forEach((row) => {
    if (!row.created_at) return;
    const created = new Date(row.created_at);
    if (Number.isNaN(created.getTime())) return;
    const amount = getBookingAmount(row);

    if (filter === "90d" || filter === "all") {
      const diffMonths =
        (now.getFullYear() - created.getFullYear()) * 12 +
        (now.getMonth() - created.getMonth());

      if (diffMonths < 0 || diffMonths >= count) return;
      const idx = count - 1 - diffMonths;
      if (chart[idx]) chart[idx].projected += amount;
      return;
    }

    const diffDays = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 0 || diffDays >= count) return;
    const idx = count - 1 - diffDays;
    if (chart[idx]) chart[idx].projected += amount;
  });

  payments.forEach((row) => {
    const dt = row.payment_date || row.created_at;
    if (!dt) return;
    const created = new Date(dt);
    if (Number.isNaN(created.getTime())) return;
    const amount = toNumber(row.amount);

    if (filter === "90d" || filter === "all") {
      const diffMonths =
        (now.getFullYear() - created.getFullYear()) * 12 +
        (now.getMonth() - created.getMonth());

      if (diffMonths < 0 || diffMonths >= count) return;
      const idx = count - 1 - diffMonths;
      if (chart[idx]) chart[idx].paid += amount;
      return;
    }

    const diffDays = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 0 || diffDays >= count) return;
    const idx = count - 1 - diffDays;
    if (chart[idx]) chart[idx].paid += amount;
  });

  return chart;
}

function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[30px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_16px_50px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-[-0.02em] text-[var(--hero-ink)]">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function KpiCard({
  label,
  value,
  tone = "default",
  helper,
}: {
  label: string;
  value: string;
  tone?: "default" | "brand" | "success" | "danger" | "ink";
  helper?: string;
}) {
  const toneClasses =
    tone === "brand"
      ? "border-orange-200 bg-orange-50"
      : tone === "success"
        ? "border-emerald-200 bg-emerald-50"
        : tone === "danger"
          ? "border-rose-200 bg-rose-50"
          : tone === "ink"
            ? "border-slate-200 bg-slate-100"
            : "border-[var(--line)] bg-white";

  return (
    <div className={cn("rounded-[24px] border p-4 sm:p-5", toneClasses)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--hero-ink)]">
        {value}
      </p>
      {helper ? <p className="mt-2 text-xs text-[var(--muted)]">{helper}</p> : null}
    </div>
  );
}

export default function AgentDashboardPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dateFilter, setDateFilter] = useState<DateFilter>("30d");

  const [agentName, setAgentName] = useState<string>("Agent");
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [settlements, setSettlements] = useState<SettlementRow[]>([]);
  const [settlementTableAvailable, setSettlementTableAvailable] = useState(true);

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setError(null);
      setRefreshing(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("Unauthorized.");

      const { data: agent, error: agentError } = await supabase
        .from("agents")
        .select("id, contact_name, contact_person, company_name, email")
        .eq("auth_user_id", user.id)
        .single();

      if (agentError) throw agentError;
      if (!agent?.id) throw new Error("Agent record not found.");

      setAgentName(
        agent.contact_name ||
          agent.contact_person ||
          agent.company_name ||
          agent.email ||
          "Agent",
      );

      const quotePromise = supabase
        .from("quotes")
        .select("*")
        .eq("agent_id", agent.id)
        .order("created_at", { ascending: false });

      const bookingPromise = supabase
        .from("bookings")
        .select("*")
        .eq("agent_id", agent.id)
        .order("created_at", { ascending: false });

      const settlementPromise = supabase
        .from("agent_settlements")
        .select("*")
        .eq("agent_id", agent.id)
        .order("payment_date", { ascending: false });

      const [{ data: quoteRows, error: quoteError }, { data: bookingRows, error: bookingError }, settlementResult] =
        await Promise.all([quotePromise, bookingPromise, settlementPromise]);

      if (quoteError) throw quoteError;
      if (bookingError) throw bookingError;

      const safeQuotes = Array.isArray(quoteRows) ? (quoteRows as QuoteRow[]) : [];
      const safeBookings = Array.isArray(bookingRows) ? (bookingRows as BookingRow[]) : [];

      setQuotes(safeQuotes);
      setBookings(safeBookings);

      if (settlementResult.error) {
        setSettlementTableAvailable(false);
        setSettlements([]);
      } else {
        setSettlementTableAvailable(true);
        setSettlements(
          Array.isArray(settlementResult.data)
            ? (settlementResult.data as SettlementRow[])
            : [],
        );
      }

      const bookingIds = safeBookings
        .map((row) => String(row.id || ""))
        .filter(Boolean);

      if (bookingIds.length === 0) {
        setPayments([]);
      } else {
        const { data: paymentRows, error: paymentError } = await supabase
          .from("booking_payments")
          .select("*")
          .in("booking_id", bookingIds)
          .order("payment_date", { ascending: false });

        if (paymentError) throw paymentError;

        setPayments(Array.isArray(paymentRows) ? (paymentRows as PaymentRow[]) : []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const filteredQuotes = useMemo(
    () => quotes.filter((row) => inQuickDateRange(row.created_at, dateFilter)),
    [quotes, dateFilter],
  );

  const filteredBookings = useMemo(
    () => bookings.filter((row) => inQuickDateRange(row.created_at, dateFilter)),
    [bookings, dateFilter],
  );

  const filteredPayments = useMemo(
    () =>
      payments.filter((row) =>
        inQuickDateRange(row.payment_date || row.created_at, dateFilter),
      ),
    [payments, dateFilter],
  );

  const filteredSettlements = useMemo(
    () =>
      settlements.filter((row) =>
        inQuickDateRange(row.payment_date || row.created_at, dateFilter),
      ),
    [settlements, dateFilter],
  );

  const salesKpis = useMemo(() => {
    const totalQuotes = filteredQuotes.length;

    const pdfGeneratedRevenue = filteredQuotes
      .filter(isPdfGeneratedQuote)
      .reduce((sum, row) => sum + getQuoteAmount(row), 0);

    const projectedRevenue = filteredQuotes
      .filter((row) => !isCancelledQuote(row))
      .reduce((sum, row) => sum + getQuoteAmount(row), 0);

    const approvedTrips = filteredBookings.filter(isApprovedBooking).length;

    const cancelledTrips = filteredBookings.filter(isCancelledBooking).length;

    const approvedRevenue = filteredBookings
      .filter(isApprovedBooking)
      .reduce((sum, row) => sum + getBookingAmount(row), 0);

    return {
      totalQuotes,
      pdfGeneratedRevenue,
      projectedRevenue,
      approvedTrips,
      cancelledTrips,
      approvedRevenue,
    };
  }, [filteredQuotes, filteredBookings]);

  const clientPaymentKpis = useMemo(() => {
    const total = filteredBookings.reduce((sum, row) => sum + getBookingAmount(row), 0);
    const paid = filteredPayments.reduce((sum, row) => sum + toNumber(row.amount), 0);
    const balance = Math.max(total - Math.max(paid, 0), 0);

    return { total, paid, balance };
  }, [filteredBookings, filteredPayments]);

  const adminPaymentKpis = useMemo(() => {
    const total = 0;
    const paid = filteredSettlements.reduce((sum, row) => sum + toNumber(row.amount), 0);
    const balance = Math.max(total - Math.max(paid, 0), 0);

    return { total, paid, balance };
  }, [filteredSettlements]);

  const tripChart = useMemo(
    () => buildTripsChart(filteredBookings, dateFilter),
    [filteredBookings, dateFilter],
  );

  const revenueChart = useMemo(
    () => buildRevenueChart(filteredBookings, filteredPayments, dateFilter),
    [filteredBookings, filteredPayments, dateFilter],
  );

  const tripStatusData = useMemo(
    () => [
      { name: "Approved", value: salesKpis.approvedTrips },
      { name: "Cancelled", value: salesKpis.cancelledTrips },
      {
        name: "Other",
        value: Math.max(
          filteredBookings.length - salesKpis.approvedTrips - salesKpis.cancelledTrips,
          0,
        ),
      },
    ],
    [
      filteredBookings.length,
      salesKpis.approvedTrips,
      salesKpis.cancelledTrips,
    ],
  );

  const recentQuotes = useMemo(() => filteredQuotes.slice(0, 6), [filteredQuotes]);
  const recentBookings = useMemo(() => filteredBookings.slice(0, 6), [filteredBookings]);
  const recentPayments = useMemo(() => filteredPayments.slice(0, 8), [filteredPayments]);

  return (
    <PortalShell
      title="Dashboard"
      subtitle={`Statistics, revenue view, and payment visibility for ${agentName}.`}
      sidebar={<AgentSidebar />}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[0_16px_50px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {DATE_FILTERS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setDateFilter(item.key)}
                className={cn(
                  "rounded-2xl border px-4 py-2 text-sm font-semibold transition",
                  dateFilter === item.key
                    ? "border-[var(--brand)] bg-[var(--brand)] text-white shadow-[0_10px_24px_rgba(249,115,22,0.20)]"
                    : "border-[var(--line)] bg-white text-[var(--hero-ink)] hover:bg-slate-50",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/agent/quotes/new"
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--hero-ink)] bg-[var(--hero-ink)] px-4 py-2 text-sm font-semibold text-white"
            >
              <FileText size={16} />
              Create custom trip
            </Link>

            <Link
              href="/agent/quotes"
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--hero-ink)]"
            >
              View quotes
              <ArrowUpRight size={16} />
            </Link>

            <button
              type="button"
              onClick={() => void loadDashboard()}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--hero-ink)] disabled:opacity-60"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {!settlementTableAvailable ? (
          <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Payments to admin are showing as zero because the <span className="font-semibold">agent_settlements</span> table is not set up yet.
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-5">
          <KpiCard
            label="PDF Generated Revenue"
            value={formatCompactCurrency(salesKpis.pdfGeneratedRevenue)}
            tone="brand"
            helper="Derived from quote statuses like pdf / sent / shared."
          />
          <KpiCard
            label="Trips Approved"
            value={formatCount(salesKpis.approvedTrips)}
            tone="success"
          />
          <KpiCard
            label="Trips Cancelled"
            value={formatCount(salesKpis.cancelledTrips)}
            tone="danger"
          />
          <KpiCard
            label="Total Projected Revenue"
            value={formatCompactCurrency(salesKpis.projectedRevenue)}
            tone="default"
            helper="From active quote pipeline."
          />
          <KpiCard
            label="Total Approved Revenue"
            value={formatCompactCurrency(salesKpis.approvedRevenue)}
            tone="ink"
            helper="From approved / confirmed bookings."
          />
        </div>

        <div className="grid gap-6 2xl:grid-cols-[1.4fr_1fr]">
          <SectionCard title="Bookings & Revenue Trend">
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="h-[320px] rounded-[24px] border border-[var(--line)] bg-white p-4">
                <p className="mb-4 text-sm font-semibold text-[var(--hero-ink)]">
                  Approved vs cancelled trips
                </p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={tripChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="approved" radius={[8, 8, 0, 0]} fill="#10b981" />
                    <Bar dataKey="cancelled" radius={[8, 8, 0, 0]} fill="#f43f5e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="h-[320px] rounded-[24px] border border-[var(--line)] bg-white p-4">
                <p className="mb-4 text-sm font-semibold text-[var(--hero-ink)]">
                  Projected vs collected revenue
                </p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={revenueChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value || 0))} />
                    <Bar dataKey="projected" radius={[8, 8, 0, 0]} fill="#f59e0b" />
                    <Bar dataKey="paid" radius={[8, 8, 0, 0]} fill="#0f172a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Booking Mix">
            <div className="grid gap-4 md:grid-cols-3 2xl:grid-cols-1">
              <div className="h-[320px] rounded-[24px] border border-[var(--line)] bg-white p-4">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={tripStatusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={72}
                      outerRadius={105}
                      paddingAngle={3}
                    >
                      {tripStatusData.map((_, index) => {
                        const colors = ["#10b981", "#f43f5e", "#f59e0b"];
                        return <Cell key={index} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-[24px] border border-[var(--line)] bg-white p-4 md:col-span-2 2xl:col-span-1">
                <div className="space-y-3">
                  {tripStatusData.map((item, index) => {
                    const colors = ["#10b981", "#f43f5e", "#f59e0b"];
                    return (
                      <div
                        key={item.name}
                        className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: colors[index % colors.length] }}
                          />
                          <span className="text-sm font-medium text-[var(--hero-ink)]">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-[var(--hero-ink)]">
                          {formatCount(item.value)}
                        </span>
                      </div>
                    );
                  })}

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-[var(--muted)]">
                    Quote workflow currently only has <span className="font-semibold">draft</span> by default.
                    Add more quote statuses later for better pipeline analytics.
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Payments From Client"
            action={
              <div className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
                <Wallet size={16} />
                Booking ledger based
              </div>
            }
          >
            <div className="grid gap-4 md:grid-cols-3">
              <KpiCard
                label="Total"
                value={formatCompactCurrency(clientPaymentKpis.total)}
                tone="default"
              />
              <KpiCard
                label="Paid"
                value={formatCompactCurrency(clientPaymentKpis.paid)}
                tone="success"
              />
              <KpiCard
                label="Balance"
                value={formatCompactCurrency(clientPaymentKpis.balance)}
                tone="danger"
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Payments To Admin"
            action={
              <div className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
                <IndianRupee size={16} />
                Settlement ledger
              </div>
            }
          >
            <div className="grid gap-4 md:grid-cols-3">
              <KpiCard
                label="Total Payments"
                value={formatCompactCurrency(adminPaymentKpis.total)}
                tone="default"
                helper="Needs settlement due logic."
              />
              <KpiCard
                label="Paid"
                value={formatCompactCurrency(adminPaymentKpis.paid)}
                tone="success"
                helper="From agent_settlements."
              />
              <KpiCard
                label="Balance"
                value={formatCompactCurrency(adminPaymentKpis.balance)}
                tone="danger"
                helper="Will work after settlement due logic exists."
              />
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <InfoPanel title="Recent Quotes">
            <div className="overflow-hidden rounded-[24px] border border-[var(--line)] bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[var(--muted)]">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Quote</th>
                      <th className="px-5 py-4 font-semibold">Customer</th>
                      <th className="px-5 py-4 font-semibold">Destination</th>
                      <th className="px-5 py-4 font-semibold">Amount</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-[var(--muted)]">
                          Loading quotes...
                        </td>
                      </tr>
                    ) : recentQuotes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-[var(--muted)]">
                          No quotes found for the selected range.
                        </td>
                      </tr>
                    ) : (
                      recentQuotes.map((row) => (
                        <tr key={row.id || row.quote_ref} className="border-t border-slate-100">
                          <td className="px-5 py-4 font-semibold text-[var(--hero-ink)]">
                            {row.quote_ref || "—"}
                            <div className="mt-1 text-xs font-normal text-[var(--muted)]">
                              {formatDateLabel(row.created_at)}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-[var(--hero-ink)]">
                            {row.customer_name || "—"}
                          </td>
                          <td className="px-5 py-4 text-[var(--hero-ink)]">
                            {row.destination || "—"}
                          </td>
                          <td className="px-5 py-4 font-semibold text-[var(--hero-ink)]">
                            {formatCurrency(getQuoteAmount(row))}
                          </td>
                          <td className="px-5 py-4">
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                              {row.status || "draft"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </InfoPanel>

          <InfoPanel title="Recent Bookings">
            <div className="overflow-hidden rounded-[24px] border border-[var(--line)] bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[var(--muted)]">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Booking</th>
                      <th className="px-5 py-4 font-semibold">Customer</th>
                      <th className="px-5 py-4 font-semibold">Destination</th>
                      <th className="px-5 py-4 font-semibold">Amount</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-[var(--muted)]">
                          Loading bookings...
                        </td>
                      </tr>
                    ) : recentBookings.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-[var(--muted)]">
                          No bookings found for the selected range.
                        </td>
                      </tr>
                    ) : (
                      recentBookings.map((row) => {
                        const approved = isApprovedBooking(row);
                        const cancelled = isCancelledBooking(row);

                        return (
                          <tr
                            key={row.id || row.booking_ref}
                            className="border-t border-slate-100"
                          >
                            <td className="px-5 py-4 font-semibold text-[var(--hero-ink)]">
                              {row.booking_ref || "—"}
                              <div className="mt-1 text-xs font-normal text-[var(--muted)]">
                                {formatDateLabel(row.created_at)}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-[var(--hero-ink)]">
                              {row.customer_name || "—"}
                            </td>
                            <td className="px-5 py-4 text-[var(--hero-ink)]">
                              {row.destination || "—"}
                            </td>
                            <td className="px-5 py-4 font-semibold text-[var(--hero-ink)]">
                              {formatCurrency(getBookingAmount(row))}
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={cn(
                                  "rounded-full border px-3 py-1 text-xs font-semibold capitalize",
                                  approved
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : cancelled
                                      ? "border-rose-200 bg-rose-50 text-rose-700"
                                      : "border-amber-200 bg-amber-50 text-amber-700",
                                )}
                              >
                                {row.status || row.approval_status || "pending"}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </InfoPanel>
        </div>

        <InfoPanel title="Recent Client Payments">
          <div className="overflow-hidden rounded-[24px] border border-[var(--line)] bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-[var(--muted)]">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Booking Ref</th>
                    <th className="px-5 py-4 font-semibold">Amount</th>
                    <th className="px-5 py-4 font-semibold">Mode</th>
                    <th className="px-5 py-4 font-semibold">Date</th>
                    <th className="px-5 py-4 font-semibold">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-[var(--muted)]">
                        Loading payments...
                      </td>
                    </tr>
                  ) : recentPayments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-[var(--muted)]">
                        No payment entries found for the selected range.
                      </td>
                    </tr>
                  ) : (
                    recentPayments.map((row) => (
                      <tr key={row.id} className="border-t border-slate-100">
                        <td className="px-5 py-4 font-semibold text-[var(--hero-ink)]">
                          {row.booking_ref || "—"}
                        </td>
                        <td className="px-5 py-4 font-semibold text-[var(--hero-ink)]">
                          {formatCurrency(toNumber(row.amount))}
                        </td>
                        <td className="px-5 py-4 capitalize text-[var(--hero-ink)]">
                          {(row.payment_mode || "—").replace(/_/g, " ")}
                        </td>
                        <td className="px-5 py-4 text-[var(--hero-ink)]">
                          {formatDateLabel(row.payment_date || row.created_at)}
                        </td>
                        <td className="px-5 py-4 text-[var(--muted)]">
                          {row.note?.trim() || "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </InfoPanel>
      </div>
    </PortalShell>
  );
}