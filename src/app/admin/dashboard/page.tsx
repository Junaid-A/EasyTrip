"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PortalShell } from "@/components/shared/portal-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
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
import { CalendarDays, Search } from "lucide-react";

type BookingRow = {
  id?: string;
  booking_ref?: string | null;
  created_at?: string | null;
  status?: string | null;
  approval_status?: string | null;
  payment_status?: string | null;
  customer_name?: string | null;
  full_name?: string | null;
  customer_email?: string | null;
  destination?: string | null;
  destination_city?: string | null;
  package_name?: string | null;
  total_amount?: number | string | null;
  grand_total?: number | string | null;
  payable_amount?: number | string | null;
  total?: number | string | null;
  amount?: number | string | null;
  paid_amount?: number | string | null;
  received_amount?: number | string | null;
};

type QuoteRow = {
  id?: string;
  quote_ref?: string | null;
  created_at?: string | null;
  status?: string | null;
  customer_name?: string | null;
  destination?: string | null;
  total_amount?: number | string | null;
  amount?: number | string | null;
};

type AgentRow = {
  id?: string;
  created_at?: string | null;
  full_name?: string | null;
  email?: string | null;
  approved?: boolean | null;
  is_approved?: boolean | null;
  status?: string | null;
};

type TicketRow = {
  id?: string;
  created_at?: string | null;
  subject?: string | null;
  status?: string | null;
  customer_name?: string | null;
};

type DateFilter = "7d" | "30d" | "90d" | "all";
type BookingFilter =
  | "all"
  | "pending"
  | "confirmed"
  | "cancelled"
  | "approval_required";
type RevenueFilter = "all" | "received" | "pending";
type SourceFilter = "all" | "customer" | "agent";
type QuoteFilter = "all" | "approved" | "awaiting" | "cancelled";
type AgentFilter = "all" | "pending" | "active" | "new";

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

function getBookingAmount(row: BookingRow) {
  return (
    toNumber(row.total_amount) ||
    toNumber(row.grand_total) ||
    toNumber(row.payable_amount) ||
    toNumber(row.total) ||
    toNumber(row.amount)
  );
}

function getPaidAmount(row: BookingRow) {
  const explicit = toNumber(row.paid_amount) || toNumber(row.received_amount);
  if (explicit > 0) return explicit;

  const paymentStatus = (row.payment_status || "").toLowerCase();
  if (paymentStatus.includes("paid")) return getBookingAmount(row);

  return 0;
}

function getBookingStatus(row: BookingRow): BookingFilter {
  const raw = `${row.status || ""} ${row.approval_status || ""}`.toLowerCase();

  if (raw.includes("cancel") || raw.includes("reject")) return "cancelled";
  if (
    raw.includes("approval") ||
    raw.includes("awaiting approval") ||
    raw.includes("needs approval")
  ) {
    return "approval_required";
  }
  if (raw.includes("confirm") || raw.includes("approved") || raw.includes("booked")) {
    return "confirmed";
  }

  return "pending";
}

function getSourceType(row: BookingRow): SourceFilter {
  const raw = `${row.status || ""} ${row.approval_status || ""}`.toLowerCase();
  if (raw.includes("agent")) return "agent";
  return "customer";
}

function getAgentApproved(row: AgentRow) {
  if (typeof row.approved === "boolean") return row.approved;
  if (typeof row.is_approved === "boolean") return row.is_approved;

  const status = (row.status || "").toLowerCase();
  return status === "approved" || status === "active";
}

function getQuoteFilter(row: QuoteRow): QuoteFilter {
  const raw = (row.status || "").toLowerCase();
  if (raw.includes("cancel")) return "cancelled";
  if (raw.includes("approved")) return "approved";
  if (raw.includes("await") || raw.includes("payment") || raw.includes("pending")) {
    return "awaiting";
  }
  return "all";
}

function getAgentFilter(row: AgentRow): AgentFilter {
  if (getAgentApproved(row)) return "active";
  return "pending";
}

function inQuickDateRange(dateString?: string | null, filter: DateFilter = "30d") {
  if (!dateString) return false;
  if (filter === "all") return true;

  const date = new Date(dateString);
  const now = new Date();
  const days = filter === "7d" ? 7 : filter === "30d" ? 30 : 90;
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return date >= start;
}

function inDateRange(
  dateString?: string | null,
  quick: DateFilter = "30d",
  from?: string,
  to?: string,
) {
  if (!dateString) return false;

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;

  if (from || to) {
    const start = from ? new Date(`${from}T00:00:00`) : null;
    const end = to ? new Date(`${to}T23:59:59`) : null;

    if (start && date < start) return false;
    if (end && date > end) return false;
    return true;
  }

  return inQuickDateRange(dateString, quick);
}

function matchesSearch(values: Array<string | null | undefined>, search: string) {
  if (!search.trim()) return true;
  const haystack = values.filter(Boolean).join(" ").toLowerCase();
  return haystack.includes(search.trim().toLowerCase());
}

function buildBookingChart(rows: BookingRow[], filter: DateFilter) {
  const count =
    filter === "7d" ? 7 : filter === "30d" ? 30 : filter === "90d" ? 12 : 12;
  const now = new Date();

  const chart = Array.from({ length: count }, (_, index) => {
    const d = new Date();

    if (filter === "90d" || filter === "all") {
      d.setMonth(now.getMonth() - (count - 1 - index));
      return {
        label: d.toLocaleDateString("en-IN", { month: "short" }),
        bookings: 0,
      };
    }

    d.setDate(now.getDate() - (count - 1 - index));
    return {
      label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      bookings: 0,
    };
  });

  rows.forEach((row) => {
    if (!row.created_at) return;
    const created = new Date(row.created_at);

    if (filter === "90d" || filter === "all") {
      const diffMonths =
        (now.getFullYear() - created.getFullYear()) * 12 +
        (now.getMonth() - created.getMonth());

      if (diffMonths < 0 || diffMonths >= count) return;

      const idx = count - 1 - diffMonths;
      if (chart[idx]) chart[idx].bookings += 1;
      return;
    }

    const diffDays = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 0 || diffDays >= count) return;

    const idx = count - 1 - diffDays;
    if (chart[idx]) chart[idx].bookings += 1;
  });

  return chart;
}

function buildRevenueChart(rows: BookingRow[], filter: DateFilter) {
  const count =
    filter === "7d" ? 7 : filter === "30d" ? 30 : filter === "90d" ? 12 : 12;
  const now = new Date();

  const chart = Array.from({ length: count }, (_, index) => {
    const d = new Date();

    if (filter === "90d" || filter === "all") {
      d.setMonth(now.getMonth() - (count - 1 - index));
      return {
        label: d.toLocaleDateString("en-IN", { month: "short" }),
        received: 0,
        pending: 0,
      };
    }

    d.setDate(now.getDate() - (count - 1 - index));
    return {
      label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      received: 0,
      pending: 0,
    };
  });

  rows.forEach((row) => {
    if (!row.created_at) return;

    const created = new Date(row.created_at);
    const total = getBookingAmount(row);
    const received = getPaidAmount(row);
    const pending = Math.max(0, total - received);

    if (filter === "90d" || filter === "all") {
      const diffMonths =
        (now.getFullYear() - created.getFullYear()) * 12 +
        (now.getMonth() - created.getMonth());

      if (diffMonths < 0 || diffMonths >= count) return;

      const idx = count - 1 - diffMonths;
      if (chart[idx]) {
        chart[idx].received += received;
        chart[idx].pending += pending;
      }
      return;
    }

    const diffDays = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 0 || diffDays >= count) return;

    const idx = count - 1 - diffDays;
    if (chart[idx]) {
      chart[idx].received += received;
      chart[idx].pending += pending;
    }
  });

  return chart;
}

function SectionCard({
  title,
  children,
  className,
  action,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[var(--hero-ink)]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function FilterChips<T extends string>({
  items,
  value,
  onChange,
}: {
  items: { key: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => onChange(item.key)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
            value === item.key
              ? "border-[var(--brand)] bg-[var(--brand)] text-white"
              : "border-[var(--line)] bg-white text-[var(--muted)] hover:text-[var(--foreground)]",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function StatBox({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "brand" | "green" | "red";
}) {
  return (
    <div
      className={cn(
        "rounded-[22px] border p-4",
        tone === "brand" && "border-orange-200 bg-orange-50",
        tone === "green" && "border-emerald-200 bg-emerald-50",
        tone === "red" && "border-rose-200 bg-rose-50",
        tone === "default" && "border-[var(--line)] bg-white",
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-[var(--hero-ink)]">{value}</p>
    </div>
  );
}

function PillSelect<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={cn(
        "rounded-full border border-[var(--line)] bg-white px-3 py-2 text-xs font-semibold text-[var(--hero-ink)] outline-none transition focus:border-[var(--brand)]",
        className,
      )}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function DatePill({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 py-2 text-xs font-semibold text-[var(--hero-ink)]">
      <CalendarDays className="h-3.5 w-3.5 text-[var(--muted)]" />
      <span>{label}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-[118px] bg-transparent text-xs font-semibold text-[var(--hero-ink)] outline-none"
      />
    </label>
  );
}

function Toolbar({
  search,
  setSearch,
  children,
}: {
  search: string;
  setSearch: (value: string) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-[360px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="h-11 w-full rounded-full border border-[var(--line)] bg-white pl-10 pr-4 text-sm text-[var(--hero-ink)] outline-none transition focus:border-[var(--brand)]"
          />
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);

  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [tickets, setTickets] = useState<TicketRow[]>([]);

  const [dashboardSearch, setDashboardSearch] = useState("");
  const [bookingListSearch, setBookingListSearch] = useState("");

  const [bookingDate, setBookingDate] = useState<DateFilter>("30d");
  const [bookingFrom, setBookingFrom] = useState("");
  const [bookingTo, setBookingTo] = useState("");
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>("all");
  const [bookingSource, setBookingSource] = useState<SourceFilter>("all");

  const [revenueDate, setRevenueDate] = useState<DateFilter>("30d");
  const [revenueFrom, setRevenueFrom] = useState("");
  const [revenueTo, setRevenueTo] = useState("");
  const [revenueFilter, setRevenueFilter] = useState<RevenueFilter>("all");
  const [revenueSource, setRevenueSource] = useState<SourceFilter>("all");

  const [quoteDate, setQuoteDate] = useState<DateFilter>("30d");
  const [quoteFrom, setQuoteFrom] = useState("");
  const [quoteTo, setQuoteTo] = useState("");
  const [quoteFilter, setQuoteFilter] = useState<QuoteFilter>("all");

  const [agentDate, setAgentDate] = useState<DateFilter>("30d");
  const [agentFrom, setAgentFrom] = useState("");
  const [agentTo, setAgentTo] = useState("");
  const [agentFilter, setAgentFilter] = useState<AgentFilter>("all");

  const [bookingListSource, setBookingListSource] = useState<"all" | "customer">("all");

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);

      const [bookingsRes, quotesRes, agentsRes, ticketsRes] = await Promise.all([
        supabase.from("bookings").select("*").order("created_at", { ascending: false }),
        supabase.from("quotes").select("*").order("created_at", { ascending: false }),
        supabase
          .from("agent_profiles")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("support_tickets")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (!active) return;

      setBookings((bookingsRes.data as BookingRow[]) || []);
      setQuotes((quotesRes.data as QuoteRow[]) || []);
      setAgents((agentsRes.data as AgentRow[]) || []);
      setTickets((ticketsRes.data as TicketRow[]) || []);
      setLoading(false);
    }

    loadData();

    return () => {
      active = false;
    };
  }, [supabase]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((row) => {
      const statusOk =
        bookingFilter === "all" ? true : getBookingStatus(row) === bookingFilter;
      const dateOk = inDateRange(row.created_at, bookingDate, bookingFrom, bookingTo);
      const sourceOk =
        bookingSource === "all" ? true : getSourceType(row) === bookingSource;
      const searchOk = matchesSearch(
        [
          row.booking_ref,
          row.customer_name,
          row.full_name,
          row.customer_email,
          row.destination,
          row.destination_city,
          row.package_name,
          row.status,
          row.approval_status,
        ],
        dashboardSearch,
      );

      return statusOk && dateOk && sourceOk && searchOk;
    });
  }, [
    bookings,
    bookingDate,
    bookingFilter,
    bookingFrom,
    bookingSource,
    bookingTo,
    dashboardSearch,
  ]);

  const filteredRevenueBookings = useMemo(() => {
    return bookings.filter((row) => {
      const dateOk = inDateRange(row.created_at, revenueDate, revenueFrom, revenueTo);
      const sourceOk =
        revenueSource === "all" ? true : getSourceType(row) === revenueSource;

      const revenueOk =
        revenueFilter === "all"
          ? true
          : revenueFilter === "received"
            ? getPaidAmount(row) > 0
            : getBookingAmount(row) - getPaidAmount(row) > 0;

      const searchOk = matchesSearch(
        [
          row.booking_ref,
          row.customer_name,
          row.full_name,
          row.destination,
          row.destination_city,
          row.package_name,
          row.payment_status,
        ],
        dashboardSearch,
      );

      return dateOk && sourceOk && revenueOk && searchOk;
    });
  }, [
    bookings,
    revenueDate,
    revenueFilter,
    revenueFrom,
    revenueSource,
    revenueTo,
    dashboardSearch,
  ]);

  const filteredQuotes = useMemo(() => {
    return quotes.filter((row) => {
      const dateOk = inDateRange(row.created_at, quoteDate, quoteFrom, quoteTo);
      const status = getQuoteFilter(row);
      const filterOk = quoteFilter === "all" ? true : status === quoteFilter;
      const searchOk = matchesSearch(
        [row.quote_ref, row.customer_name, row.destination, row.status],
        dashboardSearch,
      );

      return dateOk && filterOk && searchOk;
    });
  }, [quotes, quoteDate, quoteFilter, quoteFrom, quoteTo, dashboardSearch]);

  const filteredAgents = useMemo(() => {
    return agents.filter((row) => {
      const dateOk = inDateRange(row.created_at, agentDate, agentFrom, agentTo);
      const state = getAgentFilter(row);
      const filterOk =
        agentFilter === "all"
          ? true
          : agentFilter === "new"
            ? inDateRange(row.created_at, "30d", agentFrom, agentTo)
            : state === agentFilter;

      const searchOk = matchesSearch(
        [row.full_name, row.email, row.status],
        dashboardSearch,
      );

      return dateOk && filterOk && searchOk;
    });
  }, [agents, agentDate, agentFilter, agentFrom, agentTo, dashboardSearch]);

  const bookingStats = useMemo(() => {
    const total = filteredBookings.length;
    const pending = filteredBookings.filter(
      (row) => getBookingStatus(row) === "pending",
    ).length;
    const confirmed = filteredBookings.filter(
      (row) => getBookingStatus(row) === "confirmed",
    ).length;
    const cancelled = filteredBookings.filter(
      (row) => getBookingStatus(row) === "cancelled",
    ).length;
    const approval = filteredBookings.filter(
      (row) => getBookingStatus(row) === "approval_required",
    ).length;

    return { total, pending, confirmed, cancelled, approval };
  }, [filteredBookings]);

  const bookingChart = useMemo(
    () => buildBookingChart(filteredBookings, bookingDate),
    [filteredBookings, bookingDate],
  );

  const bookingPie = useMemo(
    () => [
      { name: "Pending", value: bookingStats.pending, color: "#f59e0b" },
      { name: "Confirmed", value: bookingStats.confirmed, color: "#10b981" },
      { name: "Cancelled", value: bookingStats.cancelled, color: "#ef4444" },
      { name: "Approval", value: bookingStats.approval, color: "#f97316" },
    ],
    [bookingStats],
  );

  const revenueStats = useMemo(() => {
    const total = filteredRevenueBookings.reduce(
      (sum, row) => sum + getBookingAmount(row),
      0,
    );
    const received = filteredRevenueBookings.reduce(
      (sum, row) => sum + getPaidAmount(row),
      0,
    );
    const pending = Math.max(0, total - received);

    return { total, received, pending };
  }, [filteredRevenueBookings]);

  const revenueChart = useMemo(
    () => buildRevenueChart(filteredRevenueBookings, revenueDate),
    [filteredRevenueBookings, revenueDate],
  );

  const quoteStats = useMemo(() => {
    const generated = filteredQuotes.length;
    const approved = filteredQuotes.filter((q) => getQuoteFilter(q) === "approved");
    const awaiting = filteredQuotes.filter((q) => getQuoteFilter(q) === "awaiting");
    const cancelled = filteredQuotes.filter((q) => getQuoteFilter(q) === "cancelled");

    const expectedRevenue = awaiting.reduce(
      (sum, row) => sum + (toNumber(row.total_amount) || toNumber(row.amount)),
      0,
    );
    const lostRevenue = cancelled.reduce(
      (sum, row) => sum + (toNumber(row.total_amount) || toNumber(row.amount)),
      0,
    );
    const conversion = generated > 0 ? (approved.length / generated) * 100 : 0;

    return {
      generated,
      approved: approved.length,
      awaiting: awaiting.length,
      expectedRevenue,
      lostRevenue,
      conversion,
    };
  }, [filteredQuotes]);

  const quoteChart = useMemo(
    () => [
      { name: "Generated", value: quoteStats.generated, color: "#f97316" },
      { name: "Approved", value: quoteStats.approved, color: "#10b981" },
      { name: "Awaiting", value: quoteStats.awaiting, color: "#3b82f6" },
    ],
    [quoteStats],
  );

  const agentStats = useMemo(() => {
    const pending = filteredAgents.filter((a) => !getAgentApproved(a)).length;
    const active = filteredAgents.filter((a) => getAgentApproved(a)).length;
    const fresh = filteredAgents.filter((a) => inQuickDateRange(a.created_at, "30d")).length;

    return { pending, active, fresh };
  }, [filteredAgents]);

  const agentChart = useMemo(
    () => [
      { name: "Pending", value: agentStats.pending, color: "#f59e0b" },
      { name: "New", value: agentStats.fresh, color: "#f97316" },
      { name: "Active", value: agentStats.active, color: "#10b981" },
    ],
    [agentStats],
  );

  const bookingsList = useMemo(() => {
    return bookings.filter((row) => {
      const sourceOk =
        bookingListSource === "all" ? true : getSourceType(row) === bookingListSource;

      const searchOk = matchesSearch(
        [
          row.booking_ref,
          row.customer_name,
          row.full_name,
          row.customer_email,
          row.destination,
          row.destination_city,
          row.package_name,
          row.status,
          row.approval_status,
        ],
        bookingListSearch || dashboardSearch,
      );

      return sourceOk && searchOk;
    });
  }, [bookings, bookingListSearch, bookingListSource, dashboardSearch]);

  const latestQuotes = filteredQuotes.slice(0, 6);
  const latestTickets = tickets
    .filter((row) =>
      matchesSearch([row.subject, row.customer_name, row.status], dashboardSearch),
    )
    .slice(0, 6);

  return (
    <PortalShell
      compactHeader
      sidebar={<AdminSidebar />}
    >
      <div className="space-y-4">
        <Toolbar search={dashboardSearch} setSearch={setDashboardSearch}>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/bookings"
              className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs font-semibold text-[var(--hero-ink)] transition hover:border-[var(--brand)]"
            >
              View bookings
            </Link>
            <Link
              href="/admin/agents"
              className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs font-semibold text-[var(--hero-ink)] transition hover:border-[var(--brand)]"
            >
              View agents
            </Link>
          </div>
        </Toolbar>

        <div className="grid gap-4 xl:grid-cols-12">
          <SectionCard title="Bookings" className="xl:col-span-7">
            <div className="mb-4 space-y-3">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <FilterChips
                  items={DATE_FILTERS}
                  value={bookingDate}
                  onChange={setBookingDate}
                />
                <div className="flex flex-wrap gap-2">
                  <PillSelect
                    value={bookingSource}
                    onChange={setBookingSource}
                    options={[
                      { value: "all", label: "All sources" },
                      { value: "customer", label: "Customer" },
                      { value: "agent", label: "Agent" },
                    ]}
                  />
                  <PillSelect
                    value={bookingFilter}
                    onChange={setBookingFilter}
                    options={[
                      { value: "all", label: "All status" },
                      { value: "pending", label: "Pending" },
                      { value: "confirmed", label: "Confirmed" },
                      { value: "cancelled", label: "Cancelled" },
                      { value: "approval_required", label: "Approval" },
                    ]}
                  />
                  <DatePill label="From" value={bookingFrom} onChange={setBookingFrom} />
                  <DatePill label="To" value={bookingTo} onChange={setBookingTo} />
                </div>
              </div>
            </div>

            <div className="mb-4 grid gap-3 md:grid-cols-5">
              <StatBox label="Total" value={formatCount(bookingStats.total)} tone="brand" />
              <StatBox label="Pending" value={formatCount(bookingStats.pending)} />
              <StatBox
                label="Confirmed"
                value={formatCount(bookingStats.confirmed)}
                tone="green"
              />
              <StatBox
                label="Cancelled"
                value={formatCount(bookingStats.cancelled)}
                tone="red"
              />
              <StatBox label="Approval" value={formatCount(bookingStats.approval)} />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
              <div className="h-[300px] rounded-[22px] border border-[var(--line)] bg-white p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e1d8" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                    <Tooltip />
                    <Bar dataKey="bookings" radius={[8, 8, 0, 0]} fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="h-[300px] rounded-[22px] border border-[var(--line)] bg-white p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bookingPie}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={4}
                    >
                      {bookingPie.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Revenue" className="xl:col-span-5">
            <div className="mb-4 space-y-3">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <FilterChips
                  items={DATE_FILTERS}
                  value={revenueDate}
                  onChange={setRevenueDate}
                />
                <div className="flex flex-wrap gap-2">
                  <PillSelect
                    value={revenueSource}
                    onChange={setRevenueSource}
                    options={[
                      { value: "all", label: "All sources" },
                      { value: "customer", label: "Customer" },
                      { value: "agent", label: "Agent" },
                    ]}
                  />
                  <PillSelect
                    value={revenueFilter}
                    onChange={setRevenueFilter}
                    options={[
                      { value: "all", label: "All revenue" },
                      { value: "received", label: "Received" },
                      { value: "pending", label: "Pending" },
                    ]}
                  />
                  <DatePill label="From" value={revenueFrom} onChange={setRevenueFrom} />
                  <DatePill label="To" value={revenueTo} onChange={setRevenueTo} />
                </div>
              </div>
            </div>

            <div className="mb-4 grid gap-3 md:grid-cols-3">
              <StatBox label="Total" value={formatCurrency(revenueStats.total)} tone="brand" />
              <StatBox
                label="Received"
                value={formatCurrency(revenueStats.received)}
                tone="green"
              />
              <StatBox
                label="Pending"
                value={formatCurrency(revenueStats.pending)}
                tone="red"
              />
            </div>

            <div className="h-[320px] rounded-[22px] border border-[var(--line)] bg-white p-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e1d8" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  {(revenueFilter === "all" || revenueFilter === "received") && (
                    <Bar dataKey="received" stackId="a" fill="#10b981" radius={[6, 6, 0, 0]} />
                  )}
                  {(revenueFilter === "all" || revenueFilter === "pending") && (
                    <Bar dataKey="pending" stackId="a" fill="#f97316" radius={[6, 6, 0, 0]} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard title="Quotes" className="xl:col-span-7">
            <div className="mb-4 space-y-3">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <FilterChips
                  items={DATE_FILTERS}
                  value={quoteDate}
                  onChange={setQuoteDate}
                />
                <div className="flex flex-wrap gap-2">
                  <PillSelect
                    value={quoteFilter}
                    onChange={setQuoteFilter}
                    options={[
                      { value: "all", label: "All status" },
                      { value: "approved", label: "Approved" },
                      { value: "awaiting", label: "Awaiting" },
                      { value: "cancelled", label: "Cancelled" },
                    ]}
                  />
                  <DatePill label="From" value={quoteFrom} onChange={setQuoteFrom} />
                  <DatePill label="To" value={quoteTo} onChange={setQuoteTo} />
                </div>
              </div>
            </div>

            <div className="mb-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
              <StatBox label="Generated" value={formatCount(quoteStats.generated)} tone="brand" />
              <StatBox label="Approved" value={formatCount(quoteStats.approved)} tone="green" />
              <StatBox label="Awaiting" value={formatCount(quoteStats.awaiting)} />
              <StatBox label="Conversion" value={`${quoteStats.conversion.toFixed(0)}%`} />
              <StatBox
                label="Expected Revenue"
                value={formatCurrency(quoteStats.expectedRevenue)}
              />
              <StatBox
                label="Lost Revenue"
                value={formatCurrency(quoteStats.lostRevenue)}
                tone="red"
              />
            </div>

            <div className="h-[300px] rounded-[22px] border border-[var(--line)] bg-white p-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quoteChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e1d8" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {quoteChart.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard title="Agents" className="xl:col-span-5">
            <div className="mb-4 space-y-3">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <FilterChips
                  items={DATE_FILTERS}
                  value={agentDate}
                  onChange={setAgentDate}
                />
                <div className="flex flex-wrap gap-2">
                  <PillSelect
                    value={agentFilter}
                    onChange={setAgentFilter}
                    options={[
                      { value: "all", label: "All agents" },
                      { value: "pending", label: "Pending" },
                      { value: "active", label: "Active" },
                      { value: "new", label: "New" },
                    ]}
                  />
                  <DatePill label="From" value={agentFrom} onChange={setAgentFrom} />
                  <DatePill label="To" value={agentTo} onChange={setAgentTo} />
                </div>
              </div>
            </div>

            <div className="mb-4 grid gap-3 md:grid-cols-3">
              <StatBox label="Pending" value={formatCount(agentStats.pending)} />
              <StatBox label="New" value={formatCount(agentStats.fresh)} tone="brand" />
              <StatBox label="Active" value={formatCount(agentStats.active)} tone="green" />
            </div>

            <div className="h-[300px] rounded-[22px] border border-[var(--line)] bg-white p-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e1d8" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {agentChart.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard
            title="Bookings"
            className="xl:col-span-12"
            action={
              <div className="flex items-center gap-2">
                <PillSelect
                  value={bookingListSource}
                  onChange={setBookingListSource}
                  options={[
                    { value: "all", label: "All" },
                    { value: "customer", label: "Customer only" },
                  ]}
                />
                <Link
                  href="/admin/bookings"
                  className="rounded-full border border-[var(--line)] bg-white px-3 py-2 text-xs font-semibold text-[var(--hero-ink)] transition hover:border-[var(--brand)]"
                >
                  View all
                </Link>
              </div>
            }
          >
            <div className="mb-4">
              <Toolbar search={bookingListSearch} setSearch={setBookingListSearch} />
            </div>

            <div className="max-h-[420px] overflow-y-auto rounded-[22px] border border-[var(--line)] bg-white">
              {loading ? (
                <div className="p-4 text-sm text-[var(--muted)]">Loading...</div>
              ) : bookingsList.length === 0 ? (
                <div className="p-4 text-sm text-[var(--muted)]">No bookings found.</div>
              ) : (
                <div className="divide-y divide-[var(--line)]">
                  {bookingsList.map((row) => {
                    const bookingStatus = getBookingStatus(row);
                    return (
                      <div
                        key={row.id || row.booking_ref}
                        className="grid gap-3 px-4 py-4 lg:grid-cols-[1.2fr_1fr_0.8fr_0.6fr_0.7fr_0.8fr]"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[var(--hero-ink)]">
                            {row.booking_ref || row.id || "Booking"}
                          </p>
                          <p className="mt-1 truncate text-sm text-[var(--muted)]">
                            {row.customer_name || row.full_name || "Customer"}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[var(--hero-ink)]">
                            {row.destination || row.destination_city || row.package_name || "Destination"}
                          </p>
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            {getSourceType(row) === "agent" ? "Agent" : "Customer"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-[var(--hero-ink)]">
                            {formatCurrency(getBookingAmount(row))}
                          </p>
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            {formatDateLabel(row.created_at)}
                          </p>
                        </div>

                        <div>
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
                              bookingStatus === "confirmed" &&
                                "bg-emerald-50 text-emerald-700",
                              bookingStatus === "pending" &&
                                "bg-amber-50 text-amber-700",
                              bookingStatus === "cancelled" &&
                                "bg-rose-50 text-rose-700",
                              bookingStatus === "approval_required" &&
                                "bg-orange-50 text-orange-700",
                            )}
                          >
                            {bookingStatus.replace("_", " ")}
                          </span>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                            Paid
                          </p>
                          <p className="mt-1 text-sm font-semibold text-[var(--hero-ink)]">
                            {formatCurrency(getPaidAmount(row))}
                          </p>
                        </div>

                        <div className="flex items-center lg:justify-end">
                          <Link
                            href={
                              row.booking_ref
                                ? `/admin/bookings/${row.booking_ref}`
                                : "/admin/bookings"
                            }
                            className="rounded-full border border-[var(--line)] bg-white px-3 py-2 text-xs font-semibold text-[var(--hero-ink)] transition hover:border-[var(--brand)]"
                          >
                            Open
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Quotes" className="xl:col-span-6">
            <div className="max-h-[420px] overflow-y-auto space-y-3">
              {loading ? (
                <div className="rounded-[18px] border border-[var(--line)] bg-white p-4 text-sm text-[var(--muted)]">
                  Loading...
                </div>
              ) : latestQuotes.length === 0 ? (
                <div className="rounded-[18px] border border-[var(--line)] bg-white p-4 text-sm text-[var(--muted)]">
                  No quotes found.
                </div>
              ) : (
                latestQuotes.map((row) => (
                  <div
                    key={row.id || row.quote_ref}
                    className="rounded-[18px] border border-[var(--line)] bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[var(--hero-ink)]">
                          {row.quote_ref || row.id || "Quote"}
                        </p>
                        <p className="mt-1 truncate text-sm text-[var(--muted)]">
                          {row.customer_name || "Customer"} · {row.destination || "Destination"}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                        {row.status || "Open"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-[var(--brand)]">
                      {formatCurrency(toNumber(row.total_amount) || toNumber(row.amount))}
                    </p>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard title="Support Tickets" className="xl:col-span-6">
            <div className="max-h-[420px] overflow-y-auto space-y-3">
              {loading ? (
                <div className="rounded-[18px] border border-[var(--line)] bg-white p-4 text-sm text-[var(--muted)]">
                  Loading...
                </div>
              ) : latestTickets.length === 0 ? (
                <div className="rounded-[18px] border border-[var(--line)] bg-white p-4 text-sm text-[var(--muted)]">
                  No tickets found.
                </div>
              ) : (
                latestTickets.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-[18px] border border-[var(--line)] bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[var(--hero-ink)]">
                          {row.subject || "Support ticket"}
                        </p>
                        <p className="mt-1 truncate text-sm text-[var(--muted)]">
                          {row.customer_name || "Customer"}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                        {row.status || "Open"}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-[var(--muted)]">
                      {formatDateLabel(row.created_at)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </PortalShell>
  );
}