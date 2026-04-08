"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeIndianRupee,
  Building2,
  CheckCircle2,
  Eye,
  FileText,
  PauseCircle,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Users,
  XCircle,
  Pencil,
  Save,
} from "lucide-react";
import { PortalShell } from "@/components/shared/portal-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";
import { createClient } from "@/lib/supabase/client";

type AgentStatus = "pending" | "approved" | "paused" | "rejected";
type QuoteStatus = "approved" | "pending" | "cancelled";

type AgentRow = {
  id: string;
  auth_user_id: string | null;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  logo_url: string | null;
  status: AgentStatus;
  onboarding_stage: string | null;
  gst_number: string | null;
  pan_number: string | null;
  company_address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  website: string | null;
  support_email: string | null;
  support_phone: string | null;
  white_label_brand_name: string | null;
  notes: string | null;
  joined_at: string | null;
  last_activity_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type QuoteRow = {
  id: string;
  agent_id: string | null;
  quote_ref: string | null;
  customer_name: string | null;
  destination: string | null;
  amount: number | null;
  status: QuoteStatus;
  created_at: string | null;
};

type BookingRow = {
  id: string;
  booking_ref?: string | null;
  agent_id?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  total_amount?: number | null;
  status?: string | null;
  created_at?: string | null;
  user_id?: string | null;
  customer_details?: any;
  traveller_details?: any;
  pricing?: any;
};

type ActivityLogRow = {
  id: string;
  agent_id: string;
  action: string;
  actor_name: string | null;
  actor_email: string | null;
  meta: Record<string, any> | null;
  created_at: string | null;
};

type AgentCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  bookings: number;
  lifetimeValue: number;
};

type AgentAggregate = {
  totalCustomers: number;
  activeCustomers: number;
  quotesGenerated: number;
  approvedQuotes: number;
  pendingQuotes: number;
  cancelledQuotes: number;
  projectedRevenue: number;
  approvedRevenue: number;
  pendingRevenue: number;
  cancelledRevenue: number;
  totalBookings: number;
  customers: AgentCustomer[];
  quotes: QuoteRow[];
  logs: ActivityLogRow[];
};

type ManageFormState = {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  logo_url: string;
  website: string;
  gst_number: string;
  pan_number: string;
  company_address: string;
  city: string;
  state: string;
  pincode: string;
  support_email: string;
  support_phone: string;
  white_label_brand_name: string;
  notes: string;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatDate(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function getStatusClasses(status: AgentStatus) {
  switch (status) {
    case "approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "paused":
      return "border-slate-200 bg-slate-100 text-slate-700";
    case "rejected":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

function getQuoteStatusClasses(status: QuoteStatus) {
  switch (status) {
    case "approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "cancelled":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

function normalizeFormValue(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function buildManageForm(agent: AgentRow): ManageFormState {
  return {
    company_name: agent.company_name || "",
    contact_name: agent.contact_name || "",
    email: agent.email || "",
    phone: agent.phone || "",
    logo_url: agent.logo_url || "",
    website: agent.website || "",
    gst_number: agent.gst_number || "",
    pan_number: agent.pan_number || "",
    company_address: agent.company_address || "",
    city: agent.city || "",
    state: agent.state || "",
    pincode: agent.pincode || "",
    support_email: agent.support_email || "",
    support_phone: agent.support_phone || "",
    white_label_brand_name: agent.white_label_brand_name || "",
    notes: agent.notes || "",
  };
}

function getChangedFields(agent: AgentRow, form: ManageFormState) {
  const changed: Record<string, { from: string | null; to: string | null }> = {};

  const currentValues = {
    company_name: agent.company_name,
    contact_name: agent.contact_name,
    email: agent.email,
    phone: agent.phone,
    logo_url: agent.logo_url,
    website: agent.website,
    gst_number: agent.gst_number,
    pan_number: agent.pan_number,
    company_address: agent.company_address,
    city: agent.city,
    state: agent.state,
    pincode: agent.pincode,
    support_email: agent.support_email,
    support_phone: agent.support_phone,
    white_label_brand_name: agent.white_label_brand_name,
    notes: agent.notes,
  };

  (Object.keys(form) as Array<keyof ManageFormState>).forEach((key) => {
    const prev = currentValues[key] ?? null;
    const next = normalizeFormValue(form[key]);
    if ((prev ?? null) !== next) {
      changed[key] = { from: prev, to: next };
    }
  });

  return changed;
}

function getCustomerIdentityKey(booking: BookingRow) {
  const name =
    booking.customer_name ||
    booking.customer_details?.full_name ||
    booking.traveller_details?.fullName ||
    "Unknown";
  const email =
    booking.customer_email ||
    booking.customer_details?.email ||
    booking.traveller_details?.email ||
    "";
  const phone =
    booking.customer_phone ||
    booking.customer_details?.phone ||
    booking.traveller_details?.phone ||
    "";

  return `${name}__${email}__${phone}`.toLowerCase();
}

function getCustomerFromBooking(booking: BookingRow) {
  const name =
    booking.customer_name ||
    booking.customer_details?.full_name ||
    booking.traveller_details?.fullName ||
    "Unknown Customer";

  const email =
    booking.customer_email ||
    booking.customer_details?.email ||
    booking.traveller_details?.email ||
    "—";

  const phone =
    booking.customer_phone ||
    booking.customer_details?.phone ||
    booking.traveller_details?.phone ||
    "—";

  const lifetimeValue =
    Number(booking.total_amount ?? booking.pricing?.grandTotal ?? 0) || 0;

  return {
    name,
    email,
    phone,
    lifetimeValue,
  };
}

function deriveAggregates(
  agents: AgentRow[],
  quotes: QuoteRow[],
  bookings: BookingRow[],
  logs: ActivityLogRow[],
) {
  const aggregateMap = new Map<string, AgentAggregate>();

  for (const agent of agents) {
    aggregateMap.set(agent.id, {
      totalCustomers: 0,
      activeCustomers: 0,
      quotesGenerated: 0,
      approvedQuotes: 0,
      pendingQuotes: 0,
      cancelledQuotes: 0,
      projectedRevenue: 0,
      approvedRevenue: 0,
      pendingRevenue: 0,
      cancelledRevenue: 0,
      totalBookings: 0,
      customers: [],
      quotes: [],
      logs: [],
    });
  }

  for (const quote of quotes) {
    if (!quote.agent_id || !aggregateMap.has(quote.agent_id)) continue;
    const bucket = aggregateMap.get(quote.agent_id)!;
    const amount = Number(quote.amount ?? 0) || 0;

    bucket.quotes.push(quote);
    bucket.quotesGenerated += 1;
    bucket.projectedRevenue += amount;

    if (quote.status === "approved") {
      bucket.approvedQuotes += 1;
      bucket.approvedRevenue += amount;
    } else if (quote.status === "pending") {
      bucket.pendingQuotes += 1;
      bucket.pendingRevenue += amount;
    } else if (quote.status === "cancelled") {
      bucket.cancelledQuotes += 1;
      bucket.cancelledRevenue += amount;
    }
  }

  const customerBuckets = new Map<string, Map<string, AgentCustomer>>();

  for (const booking of bookings) {
    const agentId = booking.agent_id;
    if (!agentId || !aggregateMap.has(agentId)) continue;

    const bucket = aggregateMap.get(agentId)!;
    bucket.totalBookings += 1;

    if (!customerBuckets.has(agentId)) {
      customerBuckets.set(agentId, new Map<string, AgentCustomer>());
    }

    const customerMap = customerBuckets.get(agentId)!;
    const identity = getCustomerIdentityKey(booking);
    const customer = getCustomerFromBooking(booking);

    if (!customerMap.has(identity)) {
      customerMap.set(identity, {
        id: identity,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        bookings: 1,
        lifetimeValue: customer.lifetimeValue,
      });
    } else {
      const existing = customerMap.get(identity)!;
      existing.bookings += 1;
      existing.lifetimeValue += customer.lifetimeValue;
    }
  }

  for (const [agentId, customersMap] of customerBuckets.entries()) {
    const bucket = aggregateMap.get(agentId);
    if (!bucket) continue;

    const customers = Array.from(customersMap.values()).sort(
      (a, b) => b.lifetimeValue - a.lifetimeValue,
    );

    bucket.customers = customers;
    bucket.totalCustomers = customers.length;
    bucket.activeCustomers = customers.filter((item) => item.bookings > 0).length;
  }

  for (const log of logs) {
    if (!aggregateMap.has(log.agent_id)) continue;
    aggregateMap.get(log.agent_id)!.logs.push(log);
  }

  for (const aggregate of aggregateMap.values()) {
    aggregate.quotes.sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });

    aggregate.logs.sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });
  }

  return aggregateMap;
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-3 text-[2rem] font-semibold tracking-[-0.04em] text-slate-950">
        {value}
      </p>
    </div>
  );
}

export default function AdminAgentsPage() {
  const supabase = createClient();

  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [logs, setLogs] = useState<ActivityLogRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AgentStatus>("all");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "customers" | "quotes" | "revenue" | "manage" | "activity"
  >("overview");

  const [isEditingManage, setIsEditingManage] = useState(false);
  const [manageSaveLoading, setManageSaveLoading] = useState(false);
  const [manageForm, setManageForm] = useState<ManageFormState | null>(null);
  const [manageError, setManageError] = useState("");
  const [manageSuccess, setManageSuccess] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const [agentsResponse, quotesResponse, bookingsResponse, logsResponse] =
      await Promise.all([
        supabase.from("agents").select("*").order("created_at", { ascending: false }),
        supabase.from("quotes").select("*").order("created_at", { ascending: false }),
        supabase.from("bookings").select("*").order("created_at", { ascending: false }),
        supabase
          .from("agent_activity_logs")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

    if (agentsResponse.error) {
      setErrorMessage(agentsResponse.error.message || "Failed to load agents.");
      setAgents([]);
      setQuotes([]);
      setBookings([]);
      setLogs([]);
      setLoading(false);
      return;
    }

    if (quotesResponse.error) {
      setErrorMessage(quotesResponse.error.message || "Failed to load quotes.");
    }

    if (bookingsResponse.error) {
      setErrorMessage((prev) => prev || bookingsResponse.error?.message || "Failed to load bookings.");
    }

    if (logsResponse.error) {
      setErrorMessage((prev) => prev || logsResponse.error?.message || "Failed to load activity logs.");
    }

    setAgents((agentsResponse.data as AgentRow[]) || []);
    setQuotes((quotesResponse.data as QuoteRow[]) || []);
    setBookings((bookingsResponse.data as BookingRow[]) || []);
    setLogs((logsResponse.data as ActivityLogRow[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const aggregateMap = useMemo(
    () => deriveAggregates(agents, quotes, bookings, logs),
    [agents, quotes, bookings, logs],
  );

  const enrichedAgents = useMemo(() => {
    return agents.map((agent) => ({
      ...agent,
      aggregate:
        aggregateMap.get(agent.id) || {
          totalCustomers: 0,
          activeCustomers: 0,
          quotesGenerated: 0,
          approvedQuotes: 0,
          pendingQuotes: 0,
          cancelledQuotes: 0,
          projectedRevenue: 0,
          approvedRevenue: 0,
          pendingRevenue: 0,
          cancelledRevenue: 0,
          totalBookings: 0,
          customers: [],
          quotes: [],
          logs: [],
        },
    }));
  }, [agents, aggregateMap]);

  const filteredAgents = useMemo(() => {
    const term = search.trim().toLowerCase();

    return enrichedAgents.filter((agent) => {
      const matchesStatus = statusFilter === "all" || agent.status === statusFilter;

      const haystack = [
        agent.company_name,
        agent.contact_name,
        agent.email,
        agent.phone,
        agent.gst_number,
        agent.city,
        agent.state,
        agent.white_label_brand_name,
        agent.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = term.length === 0 || haystack.includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [enrichedAgents, search, statusFilter]);

  const selectedAgent = useMemo(() => {
    return enrichedAgents.find((agent) => agent.id === selectedAgentId) || null;
  }, [enrichedAgents, selectedAgentId]);

  const totals = useMemo(() => {
    return {
      totalAgents: agents.length,
      approvedAgents: agents.filter((agent) => agent.status === "approved").length,
      pendingAgents: agents.filter((agent) => agent.status === "pending").length,
      projectedRevenue: enrichedAgents.reduce(
        (sum, agent) => sum + agent.aggregate.projectedRevenue,
        0,
      ),
    };
  }, [agents, enrichedAgents]);

  useEffect(() => {
    if (selectedAgent && activeTab === "manage" && !isEditingManage) {
      setManageForm(buildManageForm(selectedAgent));
      setManageError("");
      setManageSuccess("");
    }
  }, [selectedAgent, activeTab, isEditingManage]);

  async function insertActivityLog(
    agentId: string,
    action: string,
    meta?: Record<string, any>,
  ) {
    const payload = {
      agent_id: agentId,
      action,
      actor_name: "Admin",
      actor_email: "admin@easytrip365.local",
      meta: meta || {},
    };

    const response = await supabase.from("agent_activity_logs").insert(payload);
    if (response.error) {
      throw new Error(response.error.message || "Failed to write activity log.");
    }
  }

  async function updateAgentStatus(agentId: string, nextStatus: AgentStatus) {
    try {
      setActionLoadingId(agentId);
      setErrorMessage("");

      const response = await supabase
        .from("agents")
        .update({
          status: nextStatus,
          onboarding_stage:
            nextStatus === "approved"
              ? "Live and operational"
              : nextStatus === "pending"
                ? "Awaiting review"
                : nextStatus === "paused"
                  ? "Temporarily paused by admin"
                  : "Rejected by admin",
          last_activity_at: new Date().toISOString(),
        })
        .eq("id", agentId);

      if (response.error) {
        throw new Error(response.error.message || "Failed to update agent status.");
      }

      await insertActivityLog(agentId, "agent_status_updated", {
        next_status: nextStatus,
      });

      await loadData();
    } catch (error: any) {
      setErrorMessage(error?.message || "Failed to update agent status.");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleResetPassword(agentId: string) {
    try {
      setActionLoadingId(agentId);
      setErrorMessage("");

      const notesPrefix = `Password reset requested on ${formatDate(
        new Date().toISOString(),
      )}.`;

      const currentAgent = agents.find((agent) => agent.id === agentId);

      const response = await supabase
        .from("agents")
        .update({
          notes: currentAgent?.notes
            ? `${notesPrefix} ${currentAgent.notes}`
            : notesPrefix,
          last_activity_at: new Date().toISOString(),
        })
        .eq("id", agentId);

      if (response.error) {
        throw new Error(response.error.message || "Failed to record password reset.");
      }

      await insertActivityLog(agentId, "password_reset_requested", {});

      await loadData();
    } catch (error: any) {
      setErrorMessage(error?.message || "Failed to record password reset.");
    } finally {
      setActionLoadingId(null);
    }
  }

  function startManageEdit() {
    if (!selectedAgent) return;
    setManageForm(buildManageForm(selectedAgent));
    setManageError("");
    setManageSuccess("");
    setIsEditingManage(true);
  }

  function cancelManageEdit() {
    if (!selectedAgent) return;
    setManageForm(buildManageForm(selectedAgent));
    setManageError("");
    setManageSuccess("");
    setIsEditingManage(false);
  }

  function updateManageField(key: keyof ManageFormState, value: string) {
    setManageForm((current) => {
      if (!current) return current;
      return { ...current, [key]: value };
    });
  }

  async function saveManageAgent() {
    if (!selectedAgent || !manageForm) return;

    const changedFields = getChangedFields(selectedAgent, manageForm);
    if (Object.keys(changedFields).length === 0) {
      setManageSuccess("No changes to save.");
      setManageError("");
      setIsEditingManage(false);
      return;
    }

    try {
      setManageSaveLoading(true);
      setManageError("");
      setManageSuccess("");

      const payload = {
        company_name: manageForm.company_name.trim(),
        contact_name: normalizeFormValue(manageForm.contact_name),
        email: normalizeFormValue(manageForm.email),
        phone: normalizeFormValue(manageForm.phone),
        logo_url: normalizeFormValue(manageForm.logo_url),
        website: normalizeFormValue(manageForm.website),
        gst_number: normalizeFormValue(manageForm.gst_number),
        pan_number: normalizeFormValue(manageForm.pan_number),
        company_address: normalizeFormValue(manageForm.company_address),
        city: normalizeFormValue(manageForm.city),
        state: normalizeFormValue(manageForm.state),
        pincode: normalizeFormValue(manageForm.pincode),
        support_email: normalizeFormValue(manageForm.support_email),
        support_phone: normalizeFormValue(manageForm.support_phone),
        white_label_brand_name: normalizeFormValue(manageForm.white_label_brand_name),
        notes: normalizeFormValue(manageForm.notes),
        last_activity_at: new Date().toISOString(),
      };

      if (!payload.company_name) {
        throw new Error("Company name is required.");
      }

      const response = await supabase.from("agents").update(payload).eq("id", selectedAgent.id);

      if (response.error) {
        throw new Error(response.error.message || "Failed to save agent profile.");
      }

      await insertActivityLog(selectedAgent.id, "agent_profile_updated", {
        changed_fields: changedFields,
      });

      await loadData();

      setManageSuccess("Agent details saved successfully.");
      setManageError("");
      setIsEditingManage(false);
    } catch (error: any) {
      setManageError(error?.message || "Failed to save agent details.");
      setManageSuccess("");
    } finally {
      setManageSaveLoading(false);
    }
  }

  return (
    <PortalShell
      title="Agents"
      subtitle="Pending approvals, approved agents, rejected agents, and activity visibility."
      sidebar={<AdminSidebar />}
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total agents" value={String(totals.totalAgents)} />
          <StatCard label="Approved" value={String(totals.approvedAgents)} />
          <StatCard label="Pending approvals" value={String(totals.pendingAgents)} />
          <StatCard
            label="Projected revenue"
            value={currency.format(totals.projectedRevenue)}
          />
        </div>

        <InfoPanel title="Agent Business Table">
          <div className="space-y-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative w-full max-w-[760px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by company, contact, email, phone, GST, city, state, or status"
                  className="h-14 w-full rounded-[20px] border border-slate-200 bg-white pl-12 pr-4 text-[15px] text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-300"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {(["all", "pending", "approved", "paused", "rejected"] as const).map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setStatusFilter(item)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-medium transition",
                        statusFilter === item
                          ? "border-orange-500 bg-orange-500 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                      )}
                    >
                      {item === "all"
                        ? "All"
                        : item.charAt(0).toUpperCase() + item.slice(1)}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    loadData();
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
            </div>

            {errorMessage ? (
              <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            <div className="overflow-hidden rounded-[24px] border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-[1520px] w-full">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-sm font-semibold text-slate-500">
                      <th className="px-5 py-4">Agent</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Business Details</th>
                      <th className="px-5 py-4">Customers</th>
                      <th className="px-5 py-4">Quotes</th>
                      <th className="px-5 py-4">Projected Revenue</th>
                      <th className="px-5 py-4">Approved Revenue</th>
                      <th className="px-5 py-4">Last Activity</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 bg-white">
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-12 text-center text-sm text-slate-500">
                          Loading agents...
                        </td>
                      </tr>
                    ) : filteredAgents.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-12 text-center text-sm text-slate-500">
                          No agents matched the current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredAgents.map((agent) => {
                        const isBusy = actionLoadingId === agent.id;

                        return (
                          <tr key={agent.id} className="align-top">
                            <td className="px-5 py-5">
                              <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 font-semibold text-slate-900">
                                  {(agent.company_name || "AG")
                                    .split(" ")
                                    .slice(0, 2)
                                    .map((part) => part[0])
                                    .join("")}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-950">
                                    {agent.company_name || "Unnamed Agent"}
                                  </p>
                                  <p className="mt-1 text-sm text-slate-600">
                                    {agent.contact_name || "—"}
                                  </p>
                                  <p className="mt-1 text-sm text-slate-500">
                                    {agent.city || "—"}, {agent.state || "—"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-5">
                              <span
                                className={cn(
                                  "inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize",
                                  getStatusClasses(agent.status),
                                )}
                              >
                                {agent.status}
                              </span>
                              <p className="mt-2 text-sm text-slate-600">
                                {agent.onboarding_stage || "—"}
                              </p>
                            </td>

                            <td className="px-5 py-5">
                              <div className="space-y-1 text-sm text-slate-700">
                                <p>{agent.email || "—"}</p>
                                <p>{agent.phone || "—"}</p>
                                <p className="text-slate-500">{agent.gst_number || "—"}</p>
                              </div>
                            </td>

                            <td className="px-5 py-5">
                              <p className="font-semibold text-slate-950">
                                {agent.aggregate.totalCustomers}
                              </p>
                              <p className="mt-1 text-sm text-slate-600">
                                {agent.aggregate.activeCustomers} active
                              </p>
                            </td>

                            <td className="px-5 py-5">
                              <p className="font-semibold text-slate-950">
                                {agent.aggregate.quotesGenerated}
                              </p>
                              <p className="mt-1 text-sm text-slate-600">
                                {agent.aggregate.approvedQuotes} approved ·{" "}
                                {agent.aggregate.pendingQuotes} pending
                              </p>
                            </td>

                            <td className="px-5 py-5">
                              <p className="font-semibold text-slate-950">
                                {currency.format(agent.aggregate.projectedRevenue)}
                              </p>
                            </td>

                            <td className="px-5 py-5">
                              <p className="font-semibold text-slate-950">
                                {currency.format(agent.aggregate.approvedRevenue)}
                              </p>
                            </td>

                            <td className="px-5 py-5">
                              <p className="text-sm font-medium text-slate-900">
                                {formatDate(
                                  agent.last_activity_at || agent.updated_at || agent.created_at,
                                )}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                Joined {formatDate(agent.joined_at || agent.created_at)}
                              </p>
                            </td>

                            <td className="px-5 py-5">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedAgentId(agent.id);
                                    setActiveTab("overview");
                                    setIsEditingManage(false);
                                    setManageForm(null);
                                    setManageError("");
                                    setManageSuccess("");
                                  }}
                                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:bg-slate-50"
                                  title="View"
                                >
                                  <Eye className="h-5 w-5" />
                                </button>

                                {agent.status !== "approved" ? (
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() => updateAgentStatus(agent.id, "approved")}
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-200 text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
                                    title="Approve"
                                  >
                                    <CheckCircle2 className="h-5 w-5" />
                                  </button>
                                ) : null}

                                {agent.status !== "paused" ? (
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() => updateAgentStatus(agent.id, "paused")}
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                                    title="Pause"
                                  >
                                    <PauseCircle className="h-5 w-5" />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() => updateAgentStatus(agent.id, "approved")}
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                                    title="Resume"
                                  >
                                    <RotateCcw className="h-5 w-5" />
                                  </button>
                                )}

                                {agent.status !== "rejected" ? (
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() => updateAgentStatus(agent.id, "rejected")}
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-200 text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
                                    title="Reject"
                                  >
                                    <XCircle className="h-5 w-5" />
                                  </button>
                                ) : null}

                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleResetPassword(agent.id)}
                                  className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                                  title="Reset Password"
                                >
                                  <ShieldCheck className="h-4 w-4" />
                                  Reset
                                </button>
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
        </InfoPanel>
      </div>

      {selectedAgent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-6">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                      {selectedAgent.company_name || "Unnamed Agent"}
                    </h2>
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize",
                        getStatusClasses(selectedAgent.status),
                      )}
                    >
                      {selectedAgent.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {selectedAgent.contact_name || "—"} · {selectedAgent.email || "—"} ·{" "}
                    {selectedAgent.phone || "—"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateAgentStatus(selectedAgent.id, "approved")}
                    className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => updateAgentStatus(selectedAgent.id, "paused")}
                    className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Pause
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResetPassword(selectedAgent.id)}
                    className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Reset Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAgentId(null);
                      setIsEditingManage(false);
                      setManageForm(null);
                      setManageError("");
                      setManageSuccess("");
                    }}
                    className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {(
                  [
                    ["overview", "Overview"],
                    ["customers", "Customers"],
                    ["quotes", "Quotes"],
                    ["revenue", "Revenue"],
                    ["manage", "Manage Agent"],
                    ["activity", "Activity"],
                  ] as const
                ).map(([tabKey, label]) => (
                  <button
                    key={tabKey}
                    type="button"
                    onClick={() => {
                      setActiveTab(tabKey);
                      if (tabKey !== "manage") {
                        setIsEditingManage(false);
                        setManageError("");
                        setManageSuccess("");
                      }
                    }}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition",
                      activeTab === tabKey
                        ? "border-orange-500 bg-orange-500 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[calc(90vh-150px)] overflow-y-auto p-6">
              {activeTab === "overview" ? (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                      label="Customers"
                      value={String(selectedAgent.aggregate.totalCustomers)}
                    />
                    <StatCard
                      label="Quotes generated"
                      value={String(selectedAgent.aggregate.quotesGenerated)}
                    />
                    <StatCard
                      label="Projected revenue"
                      value={currency.format(selectedAgent.aggregate.projectedRevenue)}
                    />
                    <StatCard
                      label="Approved revenue"
                      value={currency.format(selectedAgent.aggregate.approvedRevenue)}
                    />
                  </div>

                  <div className="grid gap-6 xl:grid-cols-2">
                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-slate-700" />
                        <h3 className="text-lg font-semibold text-slate-950">Business Profile</h3>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <DetailCard label="Company Name" value={selectedAgent.company_name || "—"} />
                        <DetailCard
                          label="White-label Brand"
                          value={selectedAgent.white_label_brand_name || "—"}
                        />
                        <DetailCard label="GST Number" value={selectedAgent.gst_number || "—"} />
                        <DetailCard label="PAN Number" value={selectedAgent.pan_number || "—"} />
                        <DetailCard label="Website" value={selectedAgent.website || "—"} />
                        <DetailCard label="Support Email" value={selectedAgent.support_email || "—"} />
                        <DetailCard label="Support Phone" value={selectedAgent.support_phone || "—"} />
                        <DetailCard
                          label="Business Address"
                          value={
                            [
                              selectedAgent.company_address,
                              selectedAgent.city,
                              selectedAgent.state,
                              selectedAgent.pincode,
                            ]
                              .filter(Boolean)
                              .join(", ") || "—"
                          }
                        />
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                      <h3 className="text-lg font-semibold text-slate-950">Operational Summary</h3>

                      <div className="mt-5 space-y-3">
                        <SummaryRow
                          icon={<Users className="h-4 w-4" />}
                          label="Active customers"
                          value={String(selectedAgent.aggregate.activeCustomers)}
                        />
                        <SummaryRow
                          icon={<FileText className="h-4 w-4" />}
                          label="Approved quotes"
                          value={String(selectedAgent.aggregate.approvedQuotes)}
                        />
                        <SummaryRow
                          icon={<FileText className="h-4 w-4" />}
                          label="Pending quotes"
                          value={String(selectedAgent.aggregate.pendingQuotes)}
                        />
                        <SummaryRow
                          icon={<BadgeIndianRupee className="h-4 w-4" />}
                          label="Pending revenue"
                          value={currency.format(selectedAgent.aggregate.pendingRevenue)}
                        />
                        <SummaryRow
                          icon={<BadgeIndianRupee className="h-4 w-4" />}
                          label="Cancelled revenue"
                          value={currency.format(selectedAgent.aggregate.cancelledRevenue)}
                        />
                      </div>

                      <div className="mt-5 rounded-[20px] border border-slate-200 bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          Notes
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {selectedAgent.notes || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeTab === "customers" ? (
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-lg font-semibold text-slate-950">Agent Customers</h3>

                  <div className="mt-5 overflow-hidden rounded-[20px] border border-slate-200">
                    <table className="w-full min-w-[760px] bg-white">
                      <thead className="bg-slate-50">
                        <tr className="text-left text-sm font-semibold text-slate-500">
                          <th className="px-5 py-4">Customer</th>
                          <th className="px-5 py-4">Email</th>
                          <th className="px-5 py-4">Phone</th>
                          <th className="px-5 py-4">Bookings</th>
                          <th className="px-5 py-4">Lifetime Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {selectedAgent.aggregate.customers.length ? (
                          selectedAgent.aggregate.customers.map((customer) => (
                            <tr key={customer.id}>
                              <td className="px-5 py-4 font-medium text-slate-950">
                                {customer.name}
                              </td>
                              <td className="px-5 py-4 text-slate-700">{customer.email}</td>
                              <td className="px-5 py-4 text-slate-700">{customer.phone}</td>
                              <td className="px-5 py-4 text-slate-700">{customer.bookings}</td>
                              <td className="px-5 py-4 font-medium text-slate-950">
                                {currency.format(customer.lifetimeValue)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">
                              No customer records available for this agent.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              {activeTab === "quotes" ? (
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-lg font-semibold text-slate-950">Agent Quotes</h3>

                  <div className="mt-5 overflow-hidden rounded-[20px] border border-slate-200">
                    <table className="w-full min-w-[760px] bg-white">
                      <thead className="bg-slate-50">
                        <tr className="text-left text-sm font-semibold text-slate-500">
                          <th className="px-5 py-4">Quote Ref</th>
                          <th className="px-5 py-4">Customer</th>
                          <th className="px-5 py-4">Destination</th>
                          <th className="px-5 py-4">Amount</th>
                          <th className="px-5 py-4">Status</th>
                          <th className="px-5 py-4">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {selectedAgent.aggregate.quotes.length ? (
                          selectedAgent.aggregate.quotes.map((quote) => (
                            <tr key={quote.id}>
                              <td className="px-5 py-4 font-medium text-slate-950">
                                {quote.quote_ref || "—"}
                              </td>
                              <td className="px-5 py-4 text-slate-700">
                                {quote.customer_name || "—"}
                              </td>
                              <td className="px-5 py-4 text-slate-700">
                                {quote.destination || "—"}
                              </td>
                              <td className="px-5 py-4 font-medium text-slate-950">
                                {currency.format(Number(quote.amount || 0))}
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className={cn(
                                    "inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize",
                                    getQuoteStatusClasses(quote.status),
                                  )}
                                >
                                  {quote.status}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-slate-700">
                                {formatDate(quote.created_at)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                              No quotes available for this agent.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              {activeTab === "revenue" ? (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                      label="Projected"
                      value={currency.format(selectedAgent.aggregate.projectedRevenue)}
                    />
                    <StatCard
                      label="Approved"
                      value={currency.format(selectedAgent.aggregate.approvedRevenue)}
                    />
                    <StatCard
                      label="Pending"
                      value={currency.format(selectedAgent.aggregate.pendingRevenue)}
                    />
                    <StatCard
                      label="Cancelled"
                      value={currency.format(selectedAgent.aggregate.cancelledRevenue)}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                      <h3 className="text-lg font-semibold text-slate-950">Quote Pipeline</h3>
                      <div className="mt-5 space-y-3">
                        <SummaryRow
                          icon={<FileText className="h-4 w-4" />}
                          label="Approved quotes"
                          value={String(selectedAgent.aggregate.approvedQuotes)}
                        />
                        <SummaryRow
                          icon={<FileText className="h-4 w-4" />}
                          label="Pending quotes"
                          value={String(selectedAgent.aggregate.pendingQuotes)}
                        />
                        <SummaryRow
                          icon={<FileText className="h-4 w-4" />}
                          label="Cancelled quotes"
                          value={String(selectedAgent.aggregate.cancelledQuotes)}
                        />
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                      <h3 className="text-lg font-semibold text-slate-950">Revenue Health</h3>
                      <div className="mt-5 space-y-3">
                        <SummaryRow
                          icon={<BadgeIndianRupee className="h-4 w-4" />}
                          label="Approved revenue"
                          value={currency.format(selectedAgent.aggregate.approvedRevenue)}
                        />
                        <SummaryRow
                          icon={<BadgeIndianRupee className="h-4 w-4" />}
                          label="Pending revenue"
                          value={currency.format(selectedAgent.aggregate.pendingRevenue)}
                        />
                        <SummaryRow
                          icon={<BadgeIndianRupee className="h-4 w-4" />}
                          label="Cancelled revenue"
                          value={currency.format(selectedAgent.aggregate.cancelledRevenue)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeTab === "manage" ? (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-slate-950">Manage Agent</h3>

                    {!isEditingManage ? (
                      <button
                        type="button"
                        onClick={startManageEdit}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit details
                      </button>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={cancelManageEdit}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={manageSaveLoading}
                          onClick={saveManageAgent}
                          className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                        >
                          <Save className="h-4 w-4" />
                          {manageSaveLoading ? "Saving..." : "Save changes"}
                        </button>
                      </div>
                    )}
                  </div>

                  {manageError ? (
                    <div className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {manageError}
                    </div>
                  ) : null}

                  {manageSuccess ? (
                    <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      {manageSuccess}
                    </div>
                  ) : null}

                  <div className="grid gap-6 xl:grid-cols-2">
                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                      <h3 className="text-base font-semibold text-slate-950">
                        Business and Identity
                      </h3>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <ManageInput
                          label="Company Name"
                          value={manageForm?.company_name || ""}
                          disabled={!isEditingManage}
                          onChange={(value) => updateManageField("company_name", value)}
                        />
                        <ManageInput
                          label="Contact Person"
                          value={manageForm?.contact_name || ""}
                          disabled={!isEditingManage}
                          onChange={(value) => updateManageField("contact_name", value)}
                        />
                        <ManageInput
                          label="Primary Email"
                          value={manageForm?.email || ""}
                          disabled={!isEditingManage}
                          onChange={(value) => updateManageField("email", value)}
                        />
                        <ManageInput
                          label="Primary Phone"
                          value={manageForm?.phone || ""}
                          disabled={!isEditingManage}
                          onChange={(value) => updateManageField("phone", value)}
                        />
                        <ManageInput
                          label="Website"
                          value={manageForm?.website || ""}
                          disabled={!isEditingManage}
                          onChange={(value) => updateManageField("website", value)}
                        />
                        <ManageInput
                          label="Logo URL"
                          value={manageForm?.logo_url || ""}
                          disabled={!isEditingManage}
                          onChange={(value) => updateManageField("logo_url", value)}
                        />
                        <ManageInput
                          label="GST Number"
                          value={manageForm?.gst_number || ""}
                          disabled={!isEditingManage}
                          onChange={(value) => updateManageField("gst_number", value)}
                        />
                        <ManageInput
                          label="PAN Number"
                          value={manageForm?.pan_number || ""}
                          disabled={!isEditingManage}
                          onChange={(value) => updateManageField("pan_number", value)}
                        />
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                      <h3 className="text-base font-semibold text-slate-950">
                        Support and White-label
                      </h3>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <ManageInput
                          label="Support Email"
                          value={manageForm?.support_email || ""}
                          disabled={!isEditingManage}
                          onChange={(value) => updateManageField("support_email", value)}
                        />
                        <ManageInput
                          label="Support Phone"
                          value={manageForm?.support_phone || ""}
                          disabled={!isEditingManage}
                          onChange={(value) => updateManageField("support_phone", value)}
                        />
                        <ManageInput
                          label="White-label Brand Name"
                          value={manageForm?.white_label_brand_name || ""}
                          disabled={!isEditingManage}
                          onChange={(value) =>
                            updateManageField("white_label_brand_name", value)
                          }
                        />
                        <ManageInput
                          label="City"
                          value={manageForm?.city || ""}
                          disabled={!isEditingManage}
                          onChange={(value) => updateManageField("city", value)}
                        />
                        <ManageInput
                          label="State"
                          value={manageForm?.state || ""}
                          disabled={!isEditingManage}
                          onChange={(value) => updateManageField("state", value)}
                        />
                        <ManageInput
                          label="Pincode"
                          value={manageForm?.pincode || ""}
                          disabled={!isEditingManage}
                          onChange={(value) => updateManageField("pincode", value)}
                        />
                      </div>

                      <div className="mt-4">
                        <ManageTextArea
                          label="Business Address"
                          value={manageForm?.company_address || ""}
                          disabled={!isEditingManage}
                          onChange={(value) => updateManageField("company_address", value)}
                        />
                      </div>

                      <div className="mt-4">
                        <ManageTextArea
                          label="Notes"
                          value={manageForm?.notes || ""}
                          disabled={!isEditingManage}
                          onChange={(value) => updateManageField("notes", value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-base font-semibold text-slate-950">
                      White-label PDF Readiness
                    </h3>

                    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      <ReadinessItem
                        label="Brand Name Available"
                        ready={Boolean(manageForm?.white_label_brand_name?.trim())}
                      />
                      <ReadinessItem
                        label="Support Email Available"
                        ready={Boolean(manageForm?.support_email?.trim())}
                      />
                      <ReadinessItem
                        label="Support Phone Available"
                        ready={Boolean(manageForm?.support_phone?.trim())}
                      />
                      <ReadinessItem
                        label="Business Address Available"
                        ready={Boolean(manageForm?.company_address?.trim())}
                      />
                      <ReadinessItem
                        label="GST Available"
                        ready={Boolean(manageForm?.gst_number?.trim())}
                      />
                      <ReadinessItem
                        label="Logo URL Available"
                        ready={Boolean(manageForm?.logo_url?.trim())}
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {activeTab === "activity" ? (
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-lg font-semibold text-slate-950">Agent Activity</h3>

                  <div className="mt-5 space-y-3">
                    {selectedAgent.aggregate.logs.length ? (
                      selectedAgent.aggregate.logs.map((log) => (
                        <div
                          key={log.id}
                          className="rounded-[18px] border border-slate-200 bg-white px-4 py-4"
                        >
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-950">
                                {log.action}
                              </p>
                              <p className="mt-1 text-sm text-slate-600">
                                {log.actor_name || "System"} · {log.actor_email || "—"}
                              </p>
                            </div>
                            <p className="text-sm text-slate-500">
                              {formatDate(log.created_at)}
                            </p>
                          </div>

                          {log.meta && Object.keys(log.meta).length > 0 ? (
                            <pre className="mt-3 overflow-x-auto rounded-[14px] bg-slate-50 p-3 text-xs text-slate-600">
                              {JSON.stringify(log.meta, null, 2)}
                            </pre>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
                        No activity logs available for this agent.
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </PortalShell>
  );
}

function DetailCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-900">{value}</p>
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-[18px] border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3 text-sm text-slate-700">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
          {icon}
        </div>
        <span>{label}</span>
      </div>
      <span className="text-sm font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function ReadinessItem({
  label,
  ready,
}: {
  label: string;
  ready: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-[18px] border px-4 py-3 text-sm font-medium",
        ready
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700",
      )}
    >
      <span>{label}</span>
      <span>{ready ? "Ready" : "Missing"}</span>
    </div>
  );
}

function ManageInput({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-12 w-full rounded-[16px] border px-4 text-sm outline-none transition",
          disabled
            ? "border-slate-200 bg-white text-slate-700"
            : "border-slate-300 bg-white text-slate-950 focus:border-slate-400",
        )}
      />
    </label>
  );
}

function ManageTextArea({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>
      <textarea
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className={cn(
          "w-full rounded-[16px] border px-4 py-3 text-sm outline-none transition",
          disabled
            ? "border-slate-200 bg-white text-slate-700"
            : "border-slate-300 bg-white text-slate-950 focus:border-slate-400",
        )}
      />
    </label>
  );
}