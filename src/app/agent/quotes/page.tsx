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
  RefreshCw,
  Search,
  RotateCcw,
  ArchiveX,
  Link as LinkIcon,
} from "lucide-react";

type DateFilter = "7d" | "30d" | "90d" | "all";
type SegmentFilter = "active" | "draft" | "discarded";
type StatusFilter =
  | "all"
  | "draft"
  | "saved"
  | "pdf_generated"
  | "shared"
  | "approved"
  | "rejected"
  | "converted"
  | "discarded";

type QuoteRow = {
  id?: string;
  agent_id?: string | null;
  quote_ref?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  destination?: string | null;
  amount?: number | string | null;
  total_amount?: number | string | null;
  base_total?: number | string | null;
  sell_total?: number | string | null;
  markup_total?: number | string | null;
  status?: string | null;
  valid_till?: string | null;
  pdf_url?: string | null;
  pdf_generated_at?: string | null;
  shared_at?: string | null;
  discarded_at?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

type QuoteActivityRow = {
  id?: string;
  quote_id?: string | null;
  action?: string | null;
  activity_type?: string | null;
  activity_label?: string | null;
  actor_name?: string | null;
  actor_email?: string | null;
  meta?: Record<string, unknown> | null;
  created_at?: string | null;
};

const DATE_FILTERS: { key: DateFilter; label: string }[] = [
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "90d", label: "90D" },
  { key: "all", label: "All" },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "saved", label: "Saved" },
  { value: "pdf_generated", label: "PDF Generated" },
  { value: "shared", label: "Shared" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "converted", label: "Converted" },
  { value: "discarded", label: "Discarded" },
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

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
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

function getQuoteStatus(row: QuoteRow) {
  const raw = (row.status || "").trim().toLowerCase();
  return raw || "draft";
}

function isDiscarded(row: QuoteRow) {
  return getQuoteStatus(row) === "discarded";
}

function isDraft(row: QuoteRow) {
  return getQuoteStatus(row) === "draft";
}

function hasPdf(row: QuoteRow) {
  const status = getQuoteStatus(row);
  return (
    status === "pdf_generated" ||
    Boolean(row.pdf_generated_at) ||
    Boolean(row.pdf_url)
  );
}

function isActiveQuote(row: QuoteRow) {
  const status = getQuoteStatus(row);
  return ["saved", "pdf_generated", "shared", "approved", "converted"].includes(status);
}

function getSellTotal(row: QuoteRow) {
  return (
    toNumber(row.sell_total) ||
    toNumber(row.amount) ||
    toNumber(row.total_amount)
  );
}

function getBaseTotal(row: QuoteRow) {
  return (
    toNumber(row.base_total) ||
    Math.max(getSellTotal(row) - getMarkupTotal(row), 0)
  );
}

function getMarkupTotal(row: QuoteRow) {
  const direct = toNumber(row.markup_total);
  if (direct > 0) return direct;
  return Math.max(getSellTotal(row) - toNumber(row.base_total), 0);
}

function matchesSearch(row: QuoteRow, search: string) {
  if (!search.trim()) return true;
  const haystack = [
    row.quote_ref,
    row.customer_name,
    row.customer_email,
    row.customer_phone,
    row.destination,
    row.status,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(search.trim().toLowerCase());
}

function getStatusBadgeClasses(status: string) {
  switch (status) {
    case "draft":
      return "border-slate-200 bg-slate-50 text-slate-700";
    case "saved":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "pdf_generated":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "shared":
      return "border-indigo-200 bg-indigo-50 text-indigo-700";
    case "approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "rejected":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "converted":
      return "border-teal-200 bg-teal-50 text-teal-700";
    case "discarded":
      return "border-zinc-300 bg-zinc-100 text-zinc-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function buildQuoteValueChart(rows: QuoteRow[], filter: DateFilter) {
  const count = filter === "7d" ? 7 : filter === "30d" ? 30 : 12;
  const now = new Date();

  const chart = Array.from({ length: count }, (_, index) => {
    const d = new Date();

    if (filter === "90d" || filter === "all") {
      d.setMonth(now.getMonth() - (count - 1 - index));
      return {
        label: d.toLocaleDateString("en-IN", { month: "short" }),
        value: 0,
      };
    }

    d.setDate(now.getDate() - (count - 1 - index));
    return {
      label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      value: 0,
    };
  });

  rows.forEach((row) => {
    if (!row.created_at) return;
    const created = new Date(row.created_at);
    if (Number.isNaN(created.getTime())) return;
    const value = getSellTotal(row);

    if (filter === "90d" || filter === "all") {
      const diffMonths =
        (now.getFullYear() - created.getFullYear()) * 12 +
        (now.getMonth() - created.getMonth());

      if (diffMonths < 0 || diffMonths >= count) return;
      const idx = count - 1 - diffMonths;
      if (chart[idx]) chart[idx].value += value;
      return;
    }

    const diffDays = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 0 || diffDays >= count) return;
    const idx = count - 1 - diffDays;
    if (chart[idx]) chart[idx].value += value;
  });

  return chart;
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

export default function AgentQuotesPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [agentName, setAgentName] = useState("Agent");
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [activities, setActivities] = useState<QuoteActivityRow[]>([]);

  const [dateFilter, setDateFilter] = useState<DateFilter>("30d");
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>("active");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("all");

  useEffect(() => {
    void loadQuotesPage();
  }, []);

  async function loadQuotesPage() {
    try {
      setActionError(null);
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

      const [{ data: quoteRows, error: quoteError }, activityResult] = await Promise.all([
        supabase
          .from("quotes")
          .select("*")
          .eq("agent_id", agent.id)
          .order("updated_at", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false }),
        supabase
          .from("quote_activity_logs")
          .select("*")
          .eq("agent_id", agent.id)
          .order("created_at", { ascending: false })
          .limit(8),
      ]);

      if (quoteError) throw quoteError;

      setQuotes(Array.isArray(quoteRows) ? (quoteRows as QuoteRow[]) : []);
      setActivities(
        activityResult.error || !Array.isArray(activityResult.data)
          ? []
          : (activityResult.data as QuoteActivityRow[]),
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to load quotes.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function updateQuoteStatus(row: QuoteRow, nextStatus: "discarded" | "draft") {
    if (!row.id) return;

    try {
      setActionError(null);
      setActionLoadingId(row.id);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: agent } = await supabase
        .from("agents")
        .select("id")
        .eq("auth_user_id", user?.id ?? "")
        .single();

      const payload: Record<string, unknown> = {
        status: nextStatus,
        updated_at: new Date().toISOString(),
      };

      if (nextStatus === "discarded") {
        payload.discarded_at = new Date().toISOString();
      }

      if (nextStatus === "draft") {
        payload.recovered_at = new Date().toISOString();
      }

      const { error } = await supabase.from("quotes").update(payload).eq("id", row.id);

      if (error) throw error;

      setQuotes((prev) =>
        prev.map((item) =>
          item.id === row.id
            ? {
                ...item,
                status: nextStatus,
                updated_at: String(payload.updated_at),
                discarded_at:
                  nextStatus === "discarded"
                    ? String(payload.discarded_at)
                    : item.discarded_at,
              }
            : item,
        ),
      );

      if (agent?.id) {
        await supabase.from("quote_activity_logs").insert({
          quote_id: row.id,
          agent_id: agent.id,
          action: nextStatus === "discarded" ? "quote_discarded" : "quote_recovered",
          activity_type: nextStatus === "discarded" ? "discarded" : "recovered",
          activity_label:
            nextStatus === "discarded" ? "Quote discarded" : "Quote recovered",
          actor_name: agentName,
          actor_email: user?.email ?? null,
          meta: {
            previous_status: row.status ?? null,
            next_status: nextStatus,
            quote_ref: row.quote_ref ?? null,
          },
        });
      }

      setActivities((prev) => [
        {
          id: `local-${Date.now()}`,
          quote_id: row.id,
          action: nextStatus === "discarded" ? "quote_discarded" : "quote_recovered",
          activity_type: nextStatus === "discarded" ? "discarded" : "recovered",
          activity_label:
            nextStatus === "discarded" ? "Quote discarded" : "Quote recovered",
          actor_name: agentName,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 8));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update quote.");
    } finally {
      setActionLoadingId(null);
    }
  }

  const destinations = useMemo(() => {
    const set = new Set<string>();
    quotes.forEach((row) => {
      const destination = row.destination?.trim();
      if (destination) set.add(destination);
    });
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [quotes]);

  const filteredQuotes = useMemo(() => {
    return quotes.filter((row) => {
      const inDate = inQuickDateRange(row.created_at || row.updated_at, dateFilter);
      if (!inDate) return false;

      if (!matchesSearch(row, search)) return false;

      if (destinationFilter !== "all" && (row.destination || "") !== destinationFilter) {
        return false;
      }

      if (statusFilter !== "all" && getQuoteStatus(row) !== statusFilter) {
        return false;
      }

      if (segmentFilter === "draft" && !isDraft(row)) return false;
      if (segmentFilter === "discarded" && !isDiscarded(row)) return false;
      if (segmentFilter === "active" && !isActiveQuote(row)) return false;

      return true;
    });
  }, [quotes, dateFilter, search, destinationFilter, statusFilter, segmentFilter]);

  const summary = useMemo(() => {
    const inRange = quotes.filter((row) =>
      inQuickDateRange(row.created_at || row.updated_at, dateFilter),
    );

    const totalQuotes = inRange.length;
    const draftQuotes = inRange.filter(isDraft).length;
    const activeQuotes = inRange.filter(isActiveQuote).length;
    const discardedQuotes = inRange.filter(isDiscarded).length;
    const pdfGenerated = inRange.filter(hasPdf).length;
    const projectedRevenue = inRange
      .filter(isActiveQuote)
      .reduce((sum, row) => sum + getSellTotal(row), 0);

    return {
      totalQuotes,
      draftQuotes,
      activeQuotes,
      discardedQuotes,
      pdfGenerated,
      projectedRevenue,
    };
  }, [quotes, dateFilter]);

  const statusMixData = useMemo(
    () => [
      { name: "Draft", value: summary.draftQuotes },
      { name: "Active", value: summary.activeQuotes },
      { name: "Discarded", value: summary.discardedQuotes },
    ],
    [summary],
  );

  const projectedValueChart = useMemo(
    () =>
      buildQuoteValueChart(
        quotes.filter(
          (row) =>
            inQuickDateRange(row.created_at || row.updated_at, dateFilter) &&
            isActiveQuote(row),
        ),
        dateFilter,
      ),
    [quotes, dateFilter],
  );

  const expiringSoonQuotes = useMemo(() => {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return quotes
      .filter((row) => {
        if (!row.valid_till) return false;
        const dt = new Date(row.valid_till);
        if (Number.isNaN(dt.getTime())) return false;
        if (isDiscarded(row)) return false;
        if (["rejected", "converted"].includes(getQuoteStatus(row))) return false;
        return dt >= now && dt <= sevenDaysLater;
      })
      .sort((a, b) => {
        const ad = new Date(a.valid_till || "").getTime();
        const bd = new Date(b.valid_till || "").getTime();
        return ad - bd;
      })
      .slice(0, 6);
  }, [quotes]);

  return (
    <PortalShell
      title="Quotes"
      subtitle={`Statistics, lifecycle visibility, and quote operations for ${agentName}.`}
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

            <button
              type="button"
              onClick={() => void loadQuotesPage()}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--hero-ink)] disabled:opacity-60"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {actionError ? (
          <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {actionError}
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-6">
          <KpiCard label="Total Quotes" value={formatCount(summary.totalQuotes)} tone="default" />
          <KpiCard label="Draft Quotes" value={formatCount(summary.draftQuotes)} tone="ink" />
          <KpiCard label="Active Quotes" value={formatCount(summary.activeQuotes)} tone="success" />
          <KpiCard
            label="Discarded Quotes"
            value={formatCount(summary.discardedQuotes)}
            tone="danger"
          />
          <KpiCard
            label="PDF Generated"
            value={formatCount(summary.pdfGenerated)}
            tone="brand"
          />
          <KpiCard
            label="Projected Revenue"
            value={formatCompactCurrency(summary.projectedRevenue)}
            tone="default"
          />
        </div>

        <div className="grid gap-6 2xl:grid-cols-[1.45fr_1fr]">
          <SectionCard title="Quote Analytics">
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="h-[320px] rounded-[24px] border border-[var(--line)] bg-white p-4">
                <p className="mb-4 text-sm font-semibold text-[var(--hero-ink)]">
                  Status mix
                </p>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusMixData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={72}
                      outerRadius={105}
                      paddingAngle={3}
                    >
                      {statusMixData.map((_, index) => {
                        const colors = ["#64748b", "#10b981", "#f43f5e"];
                        return <Cell key={index} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="h-[320px] rounded-[24px] border border-[var(--line)] bg-white p-4">
                <p className="mb-4 text-sm font-semibold text-[var(--hero-ink)]">
                  Projected revenue trend
                </p>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectedValueChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value || 0))} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#0f172a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Operational Summary">
            <div className="space-y-3">
              {statusMixData.map((item, index) => {
                const colors = ["#64748b", "#10b981", "#f43f5e"];
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
                Active quotes are counted from{" "}
                <span className="font-semibold">
                  saved, pdf_generated, shared, approved, and converted
                </span>
                .
              </div>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Quote Workspace">
          <div className="flex flex-col gap-4">
            <div className="grid gap-3 lg:grid-cols-[1.15fr_220px_220px]">
              <label className="flex items-center gap-3 rounded-[22px] border border-[var(--line)] bg-white px-4 py-3">
                <Search size={18} className="text-[var(--muted)]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by quote ref, customer, destination, email, or phone"
                  className="w-full border-0 bg-transparent text-sm text-[var(--hero-ink)] outline-none placeholder:text-[var(--muted)]"
                />
              </label>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm font-medium text-[var(--hero-ink)] outline-none"
              >
                {STATUS_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <select
                value={destinationFilter}
                onChange={(e) => setDestinationFilter(e.target.value)}
                className="rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm font-medium text-[var(--hero-ink)] outline-none"
              >
                {destinations.map((item) => (
                  <option key={item} value={item}>
                    {item === "all" ? "All destinations" : item}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { key: "active", label: "Active" },
                { key: "draft", label: "Draft" },
                { key: "discarded", label: "Discarded" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSegmentFilter(item.key as SegmentFilter)}
                  className={cn(
                    "rounded-2xl border px-4 py-2 text-sm font-semibold transition",
                    segmentFilter === item.key
                      ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                      : "border-[var(--line)] bg-white text-[var(--hero-ink)] hover:bg-slate-50",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-[24px] border border-[var(--line)] bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[var(--muted)]">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Quote Ref</th>
                      <th className="px-5 py-4 font-semibold">Customer</th>
                      <th className="px-5 py-4 font-semibold">Destination</th>
                      <th className="px-5 py-4 font-semibold">Sell Total</th>
                      <th className="px-5 py-4 font-semibold">Markup</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 font-semibold">Valid Till</th>
                      <th className="px-5 py-4 font-semibold">Updated</th>
                      <th className="px-5 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="px-5 py-10 text-center text-[var(--muted)]">
                          Loading quotes...
                        </td>
                      </tr>
                    ) : filteredQuotes.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-5 py-10 text-center text-[var(--muted)]">
                          {segmentFilter === "active"
                            ? "No active quotes found for the selected filters."
                            : segmentFilter === "draft"
                              ? "No draft quotes found for the selected filters."
                              : "No discarded quotes found for the selected filters."}
                        </td>
                      </tr>
                    ) : (
                      filteredQuotes.map((row) => {
                        const status = getQuoteStatus(row);
                        const isBusy = actionLoadingId === row.id;
                        const hasPdfUrl = Boolean(row.pdf_url?.trim());

                        return (
                          <tr
                            key={row.id || row.quote_ref}
                            className="border-t border-slate-100 align-top"
                          >
                            <td className="px-5 py-4 font-semibold text-[var(--hero-ink)]">
                              {row.quote_ref || "—"}
                              <div className="mt-1 text-xs font-normal text-[var(--muted)]">
                                {formatDateLabel(row.created_at)}
                              </div>
                            </td>

                            <td className="px-5 py-4 text-[var(--hero-ink)]">
                              <div className="font-medium">{row.customer_name || "—"}</div>
                              <div className="mt-1 text-xs text-[var(--muted)]">
                                {row.customer_email || row.customer_phone || "—"}
                              </div>
                            </td>

                            <td className="px-5 py-4 text-[var(--hero-ink)]">
                              {row.destination || "—"}
                            </td>

                            <td className="px-5 py-4 font-semibold text-[var(--hero-ink)]">
                              {formatCurrency(getSellTotal(row))}
                              <div className="mt-1 text-xs font-normal text-[var(--muted)]">
                                Base: {formatCurrency(getBaseTotal(row))}
                              </div>
                            </td>

                            <td className="px-5 py-4 font-semibold text-[var(--hero-ink)]">
                              {formatCurrency(getMarkupTotal(row))}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={cn(
                                  "rounded-full border px-3 py-1 text-xs font-semibold capitalize",
                                  getStatusBadgeClasses(status),
                                )}
                              >
                                {status.replace(/_/g, " ")}
                              </span>
                              {hasPdf(row) ? (
                                <div className="mt-2 text-xs text-[var(--muted)]">
                                  PDF ready
                                </div>
                              ) : null}
                            </td>

                            <td className="px-5 py-4 text-[var(--hero-ink)]">
                              {formatDateLabel(row.valid_till)}
                            </td>

                            <td className="px-5 py-4 text-[var(--hero-ink)]">
                              {formatDateLabel(row.updated_at || row.created_at)}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex flex-wrap gap-2">
                                <Link
                                  href={`/agent/quotes/new?quoteId=${encodeURIComponent(
                                    String(row.id || ""),
                                  )}`}
                                  className="inline-flex items-center gap-1 rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-xs font-semibold text-[var(--hero-ink)]"
                                >
                                  Open
                                  <ArrowUpRight size={14} />
                                </Link>

                                {status !== "discarded" ? (
                                  <button
                                    type="button"
                                    onClick={() => void updateQuoteStatus(row, "discarded")}
                                    disabled={isBusy}
                                    className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 disabled:opacity-60"
                                  >
                                    <ArchiveX size={14} />
                                    Discard
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => void updateQuoteStatus(row, "draft")}
                                    disabled={isBusy}
                                    className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 disabled:opacity-60"
                                  >
                                    <RotateCcw size={14} />
                                    Recover
                                  </button>
                                )}

                                {hasPdfUrl ? (
                                  <a
                                    href={row.pdf_url || "#"}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700"
                                  >
                                    <LinkIcon size={14} />
                                    PDF
                                  </a>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </SectionCard>

        <div className="grid gap-6 xl:grid-cols-2">
          <InfoPanel title="Recent Activity">
            <div className="rounded-[24px] border border-[var(--line)] bg-white p-4">
              {activities.length === 0 ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-6 text-center text-sm text-[var(--muted)]">
                  No quote activity found yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((item) => (
                    <div
                      key={item.id || `${item.quote_id}-${item.created_at}`}
                      className="rounded-2xl border border-slate-100 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[var(--hero-ink)]">
                            {item.activity_label || item.action || "Quote activity"}
                          </p>
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            {item.actor_name || item.actor_email || "Agent"}
                          </p>
                        </div>
                        <p className="text-xs text-[var(--muted)]">
                          {formatDateTime(item.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </InfoPanel>

          <InfoPanel title="Expiring Soon">
            <div className="rounded-[24px] border border-[var(--line)] bg-white p-4">
              {expiringSoonQuotes.length === 0 ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-6 text-center text-sm text-[var(--muted)]">
                  No quotes expiring in the next 7 days.
                </div>
              ) : (
                <div className="space-y-3">
                  {expiringSoonQuotes.map((row) => (
                    <div
                      key={row.id || row.quote_ref}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[var(--hero-ink)]">
                          {row.quote_ref || "Quote"}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {row.customer_name || "—"} · {row.destination || "—"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[var(--hero-ink)]">
                          {formatCurrency(getSellTotal(row))}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          Valid till {formatDateLabel(row.valid_till)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </InfoPanel>
        </div>
      </div>
    </PortalShell>
  );
}