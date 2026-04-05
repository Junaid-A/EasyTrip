"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type BookingRow = {
  id?: string;
  booking_ref?: string | null;
  created_at?: string | null;
  status?: string | null;
  approval_status?: string | null;
  payment_status?: string | null;
  destination?: string | null;
  destination_city?: string | null;
  package_name?: string | null;
  customer_name?: string | null;
  full_name?: string | null;
  user_id?: string | null;
  customer_id?: string | null;
  profile_id?: string | null;
  amount?: number | string | null;
  total?: number | string | null;
  total_amount?: number | string | null;
  grand_total?: number | string | null;
  payable_amount?: number | string | null;
  paid_amount?: number | string | null;
  received_amount?: number | string | null;
};

type ProfileRow = {
  id?: string;
  created_at?: string | null;
  full_name?: string | null;
  email?: string | null;
  role?: string | null;
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

type RangeKey = "7d" | "30d" | "90d";

const SIDEBAR_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", short: "DB" },
  { label: "Bookings", href: "/admin/bookings", short: "BK" },
  { label: "Products", href: "/admin/products", short: "PR" },
  { label: "Rates", href: "/admin/rates", short: "RT" },
  { label: "Packages", href: "/admin/packages", short: "PK" },
  { label: "Recommendations", href: "/admin/recommendations", short: "RC" },
  { label: "Agents", href: "/admin/agents", short: "AG" },
  { label: "Customers", href: "/admin/customers", short: "CU" },
  { label: "Settings", href: "/admin/settings", short: "ST" },
  { label: "CRM Customers", href: "/admin/crm/customers", short: "CC" },
  { label: "CRM Agents", href: "/admin/crm/agents", short: "CA" },
  { label: "Payments", href: "/admin/payments", short: "PY" },
  { label: "Receivables", href: "/admin/receivables", short: "RE" },
];

const QUOTE_MOCK_ROWS = [
  {
    id: "QT-2401",
    customer: "Aarav Sharma",
    destination: "Bangkok",
    status: "Sent",
    amount: 48500,
  },
  {
    id: "QT-2402",
    customer: "Neha Patel",
    destination: "Phuket + Krabi",
    status: "Draft",
    amount: 62900,
  },
  {
    id: "QT-2403",
    customer: "Rahul Mehta",
    destination: "Dubai",
    status: "Approved",
    amount: 71200,
  },
  {
    id: "QT-2404",
    customer: "Simran Kaur",
    destination: "Singapore",
    status: "Payment Pending",
    amount: 55400,
  },
];

const PAYMENT_PLACEHOLDER = {
  collected: 1120000,
  receivables: 470000,
};

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
  const abs = Math.abs(value);
  if (abs >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (abs >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
  return formatCurrency(value);
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-IN").format(Math.max(0, value));
}

function getBookingAmount(booking: BookingRow) {
  return (
    toNumber(booking.total_amount) ||
    toNumber(booking.grand_total) ||
    toNumber(booking.payable_amount) ||
    toNumber(booking.total) ||
    toNumber(booking.amount)
  );
}

function getPaidAmount(booking: BookingRow) {
  const explicit =
    toNumber(booking.paid_amount) || toNumber(booking.received_amount);

  if (explicit > 0) return explicit;

  const paymentStatus = (booking.payment_status || "").toLowerCase();
  if (paymentStatus.includes("paid")) return getBookingAmount(booking);

  return 0;
}

function getBookingCustomerKey(booking: BookingRow) {
  return (
    booking.user_id ||
    booking.customer_id ||
    booking.profile_id ||
    booking.customer_name ||
    booking.full_name ||
    booking.booking_ref ||
    booking.id ||
    ""
  );
}

function getBookingCustomerName(booking: BookingRow) {
  return booking.customer_name || booking.full_name || "Customer";
}

function getBookingDestination(booking: BookingRow) {
  return (
    booking.destination ||
    booking.destination_city ||
    booking.package_name ||
    "Destination pending"
  );
}

function normalizeBookingStatus(booking: BookingRow) {
  const raw =
    `${booking.status || ""} ${booking.approval_status || ""}`.toLowerCase();

  if (raw.includes("cancel") || raw.includes("reject")) return "cancelled";
  if (
    raw.includes("approval required") ||
    raw.includes("approval_required") ||
    raw.includes("awaiting approval") ||
    raw.includes("needs approval")
  ) {
    return "approval_required";
  }
  if (
    raw.includes("confirm") ||
    raw.includes("approved") ||
    raw.includes("booked")
  ) {
    return "confirmed";
  }
  return "pending";
}

function getAgentApproval(agent: AgentRow) {
  if (typeof agent.approved === "boolean") return agent.approved;
  if (typeof agent.is_approved === "boolean") return agent.is_approved;

  const status = (agent.status || "").toLowerCase();
  if (status === "approved" || status === "active") return true;

  return false;
}

function dayDiff(now: Date, dateString?: string | null) {
  if (!dateString) return null;
  const diff = now.getTime() - new Date(dateString).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function buildTrendData(bookings: BookingRow[], range: RangeKey) {
  const now = new Date();
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const bucketCount = range === "90d" ? 13 : days;

  const rows = Array.from({ length: bucketCount }, (_, i) => ({
    label:
      range === "90d"
        ? `W${i + 1}`
        : (() => {
            const date = new Date();
            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() - (days - 1 - i));
            return date.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            });
          })(),
    bookings: 0,
    received: 0,
    pending: 0,
  }));

  bookings.forEach((booking) => {
    if (!booking.created_at) return;
    const created = new Date(booking.created_at);
    const diffDays = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays < 0 || diffDays >= days) return;

    const total = getBookingAmount(booking);
    const paid = getPaidAmount(booking);

    const index =
      range === "90d"
        ? Math.max(0, bucketCount - 1 - Math.floor(diffDays / 7))
        : days - 1 - diffDays;

    rows[index].bookings += 1;
    rows[index].received += paid;
    rows[index].pending += Math.max(0, total - paid);
  });

  return rows;
}

function SidebarItem({
  item,
  collapsed,
}: {
  item: (typeof SIDEBAR_ITEMS)[number];
  collapsed: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition",
        item.href === "/admin/dashboard"
          ? "bg-slate-950 text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      )}
    >
      <span
        className={cn(
          "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xs font-bold",
          item.href === "/admin/dashboard"
            ? "border-white/10 bg-white/10 text-white"
            : "border-slate-200 bg-white text-slate-700",
        )}
      >
        {item.short}
      </span>
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
    </Link>
  );
}

function StatusPill({ status }: { status: string }) {
  const v = status.toLowerCase();

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
        v.includes("confirm") || v.includes("approved")
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : v.includes("cancel")
            ? "bg-rose-50 text-rose-700 ring-rose-200"
            : v.includes("payment")
              ? "bg-violet-50 text-violet-700 ring-violet-200"
              : v.includes("draft")
                ? "bg-slate-100 text-slate-700 ring-slate-200"
                : v.includes("sent")
                  ? "bg-sky-50 text-sky-700 ring-sky-200"
                  : "bg-amber-50 text-amber-700 ring-amber-200",
      )}
    >
      {status}
    </span>
  );
}

function KpiCard({
  label,
  value,
  sublabel,
  href,
  tone = "default",
}: {
  label: string;
  value: string;
  sublabel?: string;
  href?: string;
  tone?: "default" | "blue" | "green" | "orange" | "violet" | "rose";
}) {
  const toneClass =
    tone === "blue"
      ? "border-sky-100 bg-sky-50/60"
      : tone === "green"
        ? "border-emerald-100 bg-emerald-50/60"
        : tone === "orange"
          ? "border-amber-100 bg-amber-50/60"
          : tone === "violet"
            ? "border-violet-100 bg-violet-50/60"
            : tone === "rose"
              ? "border-rose-100 bg-rose-50/60"
              : "border-slate-200 bg-slate-50/70";

  const inner = (
    <div className={cn("rounded-[22px] border p-4", toneClass)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
        {value}
      </p>
      {sublabel ? (
        <p className="mt-1 text-xs leading-5 text-slate-500">{sublabel}</p>
      ) : null}
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

function Ribbon({
  title,
  dotClass,
  children,
}: {
  title: string;
  dotClass: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className={cn("h-3 w-3 rounded-full", dotClass)} />
        <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function AdminDashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const [range, setRange] = useState<RangeKey>("30d");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [agentProfiles, setAgentProfiles] = useState<AgentRow[]>([]);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      const [bookingsRes, profilesRes, agentProfilesRes] = await Promise.all([
        supabase
          .from("bookings")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("agent_profiles")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (!active) return;

      const bookingRows =
        !bookingsRes.error && bookingsRes.data
          ? (bookingsRes.data as BookingRow[])
          : [];

      const profileRows =
        !profilesRes.error && profilesRes.data
          ? (profilesRes.data as ProfileRow[])
          : [];

      let agents: AgentRow[] = [];
      if (!agentProfilesRes.error && agentProfilesRes.data) {
        agents = agentProfilesRes.data as AgentRow[];
      } else {
        agents = profileRows
          .filter((profile) => (profile.role || "").toLowerCase() === "agent")
          .map((profile) => ({
            id: profile.id,
            created_at: profile.created_at,
            full_name: profile.full_name,
            email: profile.email,
            approved: false,
          }));
      }

      setBookings(bookingRows);
      setProfiles(profileRows);
      setAgentProfiles(agents);
      setLoading(false);
    }

    load();

    return () => {
      active = false;
    };
  }, [supabase]);

  const metrics = useMemo(() => {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last90d = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const bookings24h = bookings.filter(
      (booking) => booking.created_at && new Date(booking.created_at) >= last24h,
    );

    const bookings7d = bookings.filter(
      (booking) => booking.created_at && new Date(booking.created_at) >= last7d,
    );

    const latestBookingDate = bookings[0]?.created_at || null;
    const noBookingGap = dayDiff(now, latestBookingDate);

    const statusCounts = bookings.reduce(
      (acc, booking) => {
        const status = normalizeBookingStatus(booking);
        acc[status] += 1;
        return acc;
      },
      {
        pending: 0,
        approval_required: 0,
        confirmed: 0,
        cancelled: 0,
      },
    );

    const totalBookingRevenue = bookings.reduce(
      (sum, booking) => sum + getBookingAmount(booking),
      0,
    );

    const bookingReceived = bookings.reduce(
      (sum, booking) => sum + getPaidAmount(booking),
      0,
    );

    const bookingPending = Math.max(0, totalBookingRevenue - bookingReceived);

    const repeatCustomers90 = bookings
      .filter((booking) => booking.created_at && new Date(booking.created_at) >= last90d)
      .reduce<Record<string, number>>((acc, booking) => {
        const key = getBookingCustomerKey(booking);
        if (!key) return acc;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

    const activeCustomers = Object.values(repeatCustomers90).filter(
      (count) => count >= 2,
    ).length;

    const newCustomers7d = profiles.filter(
      (profile) => profile.created_at && new Date(profile.created_at) >= last7d,
    ).length;

    const dormantCustomers = Math.max(0, profiles.length - activeCustomers);

    const totalAgents = agentProfiles.length;
    const newAgents7d = agentProfiles.filter(
      (agent) => agent.created_at && new Date(agent.created_at) >= last7d,
    ).length;
    const pendingAgentApprovals = agentProfiles.filter(
      (agent) => !getAgentApproval(agent),
    ).length;
    const approvedActiveAgents = agentProfiles.filter((agent) =>
      getAgentApproval(agent),
    ).length;

    const quotesGenerated = QUOTE_MOCK_ROWS.length;
    const generatedQuoteAmount = QUOTE_MOCK_ROWS.reduce(
      (sum, quote) => sum + quote.amount,
      0,
    );
    const approvedQuoteAmount = QUOTE_MOCK_ROWS
      .filter((quote) =>
        ["approved", "payment pending"].includes(quote.status.toLowerCase()),
      )
      .reduce((sum, quote) => sum + quote.amount, 0);
    const approvedButUnpaid = QUOTE_MOCK_ROWS
      .filter((quote) => quote.status.toLowerCase() === "payment pending")
      .reduce((sum, quote) => sum + quote.amount, 0);
    const paidFromApprovedQuotes = Math.max(
      0,
      approvedQuoteAmount - approvedButUnpaid,
    );
    const quoteToBookingConversion =
      quotesGenerated > 0
        ? (QUOTE_MOCK_ROWS.filter((quote) =>
            ["approved", "payment pending"].includes(quote.status.toLowerCase()),
          ).length /
            quotesGenerated) *
          100
        : 0;

    const totalRevenue = totalBookingRevenue + approvedQuoteAmount;
    const amountReceived = Math.max(bookingReceived, PAYMENT_PLACEHOLDER.collected);
    const pendingAmount = Math.max(
      bookingPending + approvedButUnpaid,
      PAYMENT_PLACEHOLDER.receivables,
    );

    const trendData = buildTrendData(bookings, range);

    const statusPie = [
      { name: "Pending", value: statusCounts.pending, color: "#f59e0b" },
      {
        name: "Approval",
        value: statusCounts.approval_required,
        color: "#0ea5e9",
      },
      { name: "Confirmed", value: statusCounts.confirmed, color: "#10b981" },
      { name: "Cancelled", value: statusCounts.cancelled, color: "#f43f5e" },
    ];

    const revenuePie = [
      { name: "Received", value: amountReceived, color: "#2563eb" },
      { name: "Pending", value: pendingAmount, color: "#a78bfa" },
    ];

    return {
      bookings24h,
      bookings7d,
      latestBookingDate,
      noBookingGap,
      statusCounts,
      activeCustomers,
      newCustomers7d,
      dormantCustomers,
      totalAgents,
      newAgents7d,
      pendingAgentApprovals,
      approvedActiveAgents,
      totalRevenue,
      amountReceived,
      pendingAmount,
      quotesGenerated,
      generatedQuoteAmount,
      approvedQuoteAmount,
      approvedButUnpaid,
      paidFromApprovedQuotes,
      quoteToBookingConversion,
      trendData,
      statusPie,
      revenuePie,
    };
  }, [bookings, profiles, agentProfiles, range]);

  const latestBookings = useMemo(() => bookings.slice(0, 10), [bookings]);

  const noBookingText =
    metrics.bookings24h.length > 0
      ? `${formatCount(metrics.bookings24h.length)} in last 24h`
      : metrics.noBookingGap === null
        ? "No data"
        : `No bookings in ${metrics.noBookingGap} days`;

  return (
    <main className="h-[100dvh] overflow-hidden bg-slate-100">
      <div className="flex h-full gap-4 p-4">
        <aside
          className={cn(
            "shrink-0 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm transition-all duration-300",
            sidebarCollapsed ? "w-[92px]" : "w-[280px]",
          )}
        >
          <div className="flex h-full min-h-0 flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
                  AD
                </div>
                {!sidebarCollapsed ? (
                  <div className="min-w-0">
                    <p className="truncate text-lg font-bold text-slate-950">
                      Admin Panel
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      Operations cockpit
                    </p>
                  </div>
                ) : null}
              </div>

              <button
                onClick={() => setSidebarCollapsed((prev) => !prev)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
              >
                {sidebarCollapsed ? "›" : "‹"}
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <div className="space-y-2">
                {SIDEBAR_ITEMS.map((item) => (
                  <SidebarItem
                    key={item.href}
                    item={item}
                    collapsed={sidebarCollapsed}
                  />
                ))}
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
          <div className="flex h-full min-h-0 flex-col">
            <header className="border-b border-slate-100 px-6 py-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
                    Admin cockpit
                  </p>
                  <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                    Dashboard overview
                  </h1>
                  <p className="mt-2 text-sm text-slate-600">
                    Straightforward, visible-first admin dashboard.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/admin/bookings"
                    className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                  >
                    View bookings
                  </Link>
                  <Link
                    href="/admin/agents"
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    Review agents
                  </Link>
                  <Link
                    href="/admin/payments"
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    Payments
                  </Link>
                </div>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-4">
                  <Ribbon title="Bookings" dotClass="bg-sky-500">
                    <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                      <KpiCard
                        label="Bookings in 24h"
                        value={formatCount(metrics.bookings24h.length)}
                        sublabel={noBookingText}
                        tone="blue"
                      />
                      <KpiCard
                        label="Total bookings"
                        value={formatCount(bookings.length)}
                        href="/admin/bookings"
                      />
                      <KpiCard
                        label="New bookings"
                        value={formatCount(metrics.bookings7d.length)}
                      />
                      <KpiCard
                        label="Pending"
                        value={formatCount(metrics.statusCounts.pending)}
                        tone="orange"
                      />
                      <KpiCard
                        label="Approval required"
                        value={formatCount(metrics.statusCounts.approval_required)}
                        tone="blue"
                      />
                      <KpiCard
                        label="Cancelled"
                        value={formatCount(metrics.statusCounts.cancelled)}
                        tone="rose"
                      />
                    </div>
                  </Ribbon>

                  <Ribbon title="Customers" dotClass="bg-emerald-500">
                    <div className="grid gap-3 md:grid-cols-3">
                      <KpiCard
                        label="Active customers"
                        value={formatCount(metrics.activeCustomers)}
                        tone="green"
                        href="/admin/customers"
                      />
                      <KpiCard
                        label="New in 7 days"
                        value={formatCount(metrics.newCustomers7d)}
                      />
                      <KpiCard
                        label="Dormant signal"
                        value={formatCount(metrics.dormantCustomers)}
                        tone="orange"
                      />
                    </div>
                  </Ribbon>

                  <Ribbon title="Agents" dotClass="bg-amber-500">
                    <div className="grid gap-3 md:grid-cols-4">
                      <KpiCard
                        label="Total agents"
                        value={formatCount(metrics.totalAgents)}
                        href="/admin/agents"
                      />
                      <KpiCard
                        label="New in 7 days"
                        value={formatCount(metrics.newAgents7d)}
                      />
                      <KpiCard
                        label="Pending approvals"
                        value={formatCount(metrics.pendingAgentApprovals)}
                        tone="orange"
                      />
                      <KpiCard
                        label="Approved active"
                        value={formatCount(metrics.approvedActiveAgents)}
                        tone="green"
                      />
                    </div>
                  </Ribbon>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <Ribbon title="Revenue" dotClass="bg-violet-500">
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        <KpiCard
                          label="Total revenue"
                          value={formatCompactCurrency(metrics.totalRevenue)}
                          tone="violet"
                          href="/admin/payments"
                        />
                        <KpiCard
                          label="Amount received"
                          value={formatCompactCurrency(metrics.amountReceived)}
                          tone="blue"
                        />
                        <KpiCard
                          label="Pending amount"
                          value={formatCompactCurrency(metrics.pendingAmount)}
                          tone="orange"
                        />
                      </div>
                    </Ribbon>

                    <Ribbon title="Quotes" dotClass="bg-rose-500">
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        <KpiCard
                          label="Quotes generated"
                          value={formatCount(metrics.quotesGenerated)}
                        />
                        <KpiCard
                          label="Approved unpaid"
                          value={formatCompactCurrency(metrics.approvedButUnpaid)}
                          tone="rose"
                        />
                        <KpiCard
                          label="Conversion"
                          value={`${metrics.quoteToBookingConversion.toFixed(0)}%`}
                          tone="violet"
                        />
                      </div>
                    </Ribbon>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                    <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-950">
                            Bookings trend
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            Bookings, received, and pending.
                          </p>
                        </div>

                        <div className="flex gap-2">
                          {(["7d", "30d", "90d"] as RangeKey[]).map((key) => (
                            <button
                              key={key}
                              onClick={() => setRange(key)}
                              className={cn(
                                "rounded-full px-3 py-1.5 text-xs font-semibold",
                                range === key
                                  ? "bg-slate-950 text-white"
                                  : "border border-slate-200 text-slate-600",
                              )}
                            >
                              {key.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="h-[320px] rounded-[22px] border border-slate-100 bg-slate-50 p-3">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={metrics.trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} />
                            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                            <Tooltip
                              contentStyle={{
                                borderRadius: 16,
                                border: "1px solid #e2e8f0",
                                background: "#ffffff",
                              }}
                            />
                            <Bar
                              dataKey="bookings"
                              fill="#2563eb"
                              radius={[6, 6, 0, 0]}
                              maxBarSize={26}
                            />
                            <Area
                              type="monotone"
                              dataKey="received"
                              stroke="#10b981"
                              fill="#d1fae5"
                              fillOpacity={0.55}
                              strokeWidth={2}
                            />
                            <Area
                              type="monotone"
                              dataKey="pending"
                              stroke="#a78bfa"
                              fill="#ede9fe"
                              fillOpacity={0.8}
                              strokeWidth={2}
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </section>

                    <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-slate-950">
                          Booking status mix
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Pending vs approval vs confirmed vs cancelled.
                        </p>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                        <div className="mx-auto h-[220px] w-full max-w-[220px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={metrics.statusPie}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={50}
                                outerRadius={82}
                                paddingAngle={4}
                              >
                                {metrics.statusPie.map((entry) => (
                                  <Cell key={entry.name} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  borderRadius: 16,
                                  border: "1px solid #e2e8f0",
                                  background: "#ffffff",
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="grid content-start gap-3">
                          {metrics.statusPie.map((item) => (
                            <div
                              key={item.name}
                              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className="h-3 w-3 rounded-full"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm font-medium text-slate-700">
                                  {item.name}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-slate-950">
                                {formatCount(item.value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  </div>

                  <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-950">
                          Latest bookings
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Recent booking activity with quick access.
                        </p>
                      </div>

                      <Link
                        href="/admin/bookings"
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                      >
                        View all
                      </Link>
                    </div>

                    <div className="rounded-[22px] border border-slate-100 bg-slate-50 p-2">
                      <div className="grid grid-cols-[1.05fr_1fr_120px_130px_90px] gap-3 rounded-[16px] bg-white px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        <div>Booking</div>
                        <div>Customer / Destination</div>
                        <div>Status</div>
                        <div>Amount</div>
                        <div>Action</div>
                      </div>

                      <div className="mt-2 max-h-[360px] overflow-y-auto pr-1">
                        <div className="space-y-2">
                          {latestBookings.length === 0 ? (
                            <div className="rounded-[16px] bg-white px-4 py-10 text-center text-sm text-slate-500">
                              {loading ? "Loading bookings..." : "No bookings found."}
                            </div>
                          ) : (
                            latestBookings.map((booking) => {
                              const normalized = normalizeBookingStatus(booking);
                              const label =
                                normalized === "approval_required"
                                  ? "Approval Required"
                                  : normalized.charAt(0).toUpperCase() +
                                    normalized.slice(1);

                              return (
                                <div
                                  key={booking.id || booking.booking_ref}
                                  className="grid grid-cols-[1.05fr_1fr_120px_130px_90px] items-center gap-3 rounded-[16px] bg-white px-4 py-3"
                                >
                                  <div>
                                    <p className="text-sm font-semibold text-slate-950">
                                      {booking.booking_ref || booking.id || "Booking"}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      {booking.created_at
                                        ? new Date(booking.created_at).toLocaleString(
                                            "en-IN",
                                            {
                                              day: "2-digit",
                                              month: "short",
                                              year: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            },
                                          )
                                        : "Time unavailable"}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                      {getBookingCustomerName(booking)}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      {getBookingDestination(booking)}
                                    </p>
                                  </div>

                                  <div>
                                    <StatusPill status={label} />
                                  </div>

                                  <div className="text-sm font-bold text-slate-950">
                                    {formatCurrency(getBookingAmount(booking))}
                                  </div>

                                  <div>
                                    <Link
                                      href="/admin/bookings"
                                      className="inline-flex rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white"
                                    >
                                      Open
                                    </Link>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                <aside className="space-y-4">
                  <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-slate-950">
                        Operations rail
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Immediate queue visibility.
                      </p>
                    </div>

                    <div className="grid gap-3">
                      <KpiCard
                        label="Pending booking approvals"
                        value={formatCount(metrics.statusCounts.approval_required)}
                        tone="blue"
                        href="/admin/bookings"
                      />
                      <KpiCard
                        label="Pending agent approvals"
                        value={formatCount(metrics.pendingAgentApprovals)}
                        tone="orange"
                        href="/admin/agents"
                      />
                      <KpiCard
                        label="Approved quotes awaiting payment"
                        value={formatCompactCurrency(metrics.approvedButUnpaid)}
                        tone="violet"
                        href="/admin/receivables"
                      />
                      <KpiCard
                        label="No-booking alert"
                        value={noBookingText}
                        tone="rose"
                        href="/admin/bookings"
                      />
                    </div>
                  </section>

                  <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-slate-950">
                        Revenue split
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Received vs pending.
                      </p>
                    </div>

                    <div className="h-[220px] rounded-[22px] border border-slate-100 bg-slate-50 p-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={metrics.revenuePie}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={4}
                          >
                            {metrics.revenuePie.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{
                              borderRadius: 16,
                              border: "1px solid #e2e8f0",
                              background: "#ffffff",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-3 space-y-2">
                      {metrics.revenuePie.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm font-medium text-slate-700">
                              {item.name}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-slate-950">
                            {formatCompactCurrency(item.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-950">
                          Quote watch
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Current static quote source.
                        </p>
                      </div>
                      <Link
                        href="/agent/quotes"
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                      >
                        Open
                      </Link>
                    </div>

                    <div className="space-y-3">
                      {QUOTE_MOCK_ROWS.map((quote) => (
                        <div
                          key={quote.id}
                          className="rounded-[20px] border border-slate-100 bg-slate-50 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-950">
                                {quote.id}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {quote.customer} · {quote.destination}
                              </p>
                            </div>
                            <StatusPill status={quote.status} />
                          </div>
                          <p className="mt-3 text-sm font-bold text-slate-950">
                            {formatCurrency(quote.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                </aside>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}