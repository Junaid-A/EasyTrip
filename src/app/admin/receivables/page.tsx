import Link from "next/link";
import { PortalShell } from "@/components/shared/portal-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { StatCard } from "@/components/shared/stat-card";
import { InfoPanel } from "@/components/shared/info-panel";
import { createClient } from "@/lib/supabase/server";

type SearchParams = Promise<{
  q?: string;
  status?: string;
  priority?: string;
}>;

type BookingRow = {
  id: string;
  booking_ref: string | null;
  customer_name: string | null;
  total_amount: number | null;
  amount_received: number | null;
  payment_status: string | null;
  created_at: string | null;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactINR(value: number) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return formatCurrency(value);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getBalanceDue(total: number | null, received: number | null) {
  const totalAmount = Number(total ?? 0);
  const amountReceived = Number(received ?? 0);
  return Math.max(totalAmount - amountReceived, 0);
}

function getAgeInDays(createdAt: string | null) {
  if (!createdAt) return 0;

  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return 0;

  const today = new Date();
  created.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diff = today.getTime() - created.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return Math.max(days, 0);
}

function deriveReceivableStatus(row: BookingRow) {
  const rawStatus = (row.payment_status ?? "").toLowerCase().trim();
  const balanceDue = getBalanceDue(row.total_amount, row.amount_received);

  if (rawStatus === "refunded") return "refunded";
  if (balanceDue <= 0) return "paid";
  if (rawStatus === "partial") return "partial";
  if (rawStatus === "paid") return "paid";
  return "unpaid";
}

function isHighPriority(row: BookingRow) {
  const balanceDue = getBalanceDue(row.total_amount, row.amount_received);
  const ageDays = getAgeInDays(row.created_at);

  if (balanceDue <= 0) return false;
  if (balanceDue >= 50000) return true;
  if (ageDays >= 7) return true;
  return false;
}

function getStatusClasses(status: string) {
  switch (status) {
    case "paid":
      return "border border-emerald-200 bg-emerald-50 text-emerald-700";
    case "partial":
      return "border border-amber-200 bg-amber-50 text-amber-700";
    case "refunded":
      return "border border-slate-200 bg-slate-100 text-slate-700";
    default:
      return "border border-blue-200 bg-blue-50 text-blue-700";
  }
}

export default async function AdminReceivablesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("bookings")
    .select(
      `
        id,
        booking_ref,
        customer_name,
        total_amount,
        amount_received,
        payment_status,
        created_at
      `
    )
    .order("created_at", { ascending: false });

  if (params.q?.trim()) {
    const q = params.q.trim();
    query = query.or(`booking_ref.ilike.%${q}%,customer_name.ilike.%${q}%`);
  }

  const { data, error } = await query;

  if (error) {
    return (
      <PortalShell
        title="Receivables"
        subtitle="Total receivables, customer receivables, agent receivables, and collection priorities."
        sidebar={<AdminSidebar />}
      >
        <InfoPanel title="Receivables Ledger">
          <p className="text-sm leading-7 text-rose-600">
            Failed to load receivables data: {error.message}
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            This page currently expects these booking fields:
            <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs">
              booking_ref
            </code>
            ,
            <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs">
              customer_name
            </code>
            ,
            <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs">
              total_amount
            </code>
            ,
            <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs">
              amount_received
            </code>
            ,
            <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs">
              payment_status
            </code>
            , and
            <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs">
              created_at
            </code>
            .
          </p>
        </InfoPanel>
      </PortalShell>
    );
  }

  const sourceRows = (data ?? []) as BookingRow[];

  const rows = sourceRows
    .map((row) => {
      const totalAmount = Number(row.total_amount ?? 0);
      const amountReceived = Number(row.amount_received ?? 0);
      const balanceDue = getBalanceDue(totalAmount, amountReceived);
      const ageDays = getAgeInDays(row.created_at);
      const derivedStatus = deriveReceivableStatus(row);
      const priority = isHighPriority(row);

      return {
        ...row,
        totalAmount,
        amountReceived,
        balanceDue,
        ageDays,
        derivedStatus,
        priority,
      };
    })
    .filter((row) => row.balanceDue > 0);

  const filteredRows = rows.filter((row) => {
    if (params.status && params.status !== "all" && row.derivedStatus !== params.status) {
      return false;
    }
    if (params.priority === "high" && !row.priority) {
      return false;
    }
    return true;
  });

  const totalReceivables = filteredRows.reduce((sum, row) => sum + row.balanceDue, 0);
  const customerReceivables = totalReceivables;
  const agentReceivables = 0;
  const priorityCases = filteredRows.filter((row) => row.priority).length;

  const aging0to3 = filteredRows
    .filter((row) => row.ageDays >= 0 && row.ageDays <= 3)
    .reduce((sum, row) => sum + row.balanceDue, 0);

  const aging4to7 = filteredRows
    .filter((row) => row.ageDays >= 4 && row.ageDays <= 7)
    .reduce((sum, row) => sum + row.balanceDue, 0);

  const aging8to15 = filteredRows
    .filter((row) => row.ageDays >= 8 && row.ageDays <= 15)
    .reduce((sum, row) => sum + row.balanceDue, 0);

  const aging15Plus = filteredRows
    .filter((row) => row.ageDays > 15)
    .reduce((sum, row) => sum + row.balanceDue, 0);

  return (
    <PortalShell
      title="Receivables"
      subtitle="Total receivables, customer receivables, agent receivables, and collection priorities."
      sidebar={<AdminSidebar />}
    >
      <div className="grid gap-6 md:grid-cols-4">
        <StatCard label="Total Receivables" value={formatCompactINR(totalReceivables)} />
        <StatCard label="Customer Receivables" value={formatCompactINR(customerReceivables)} />
        <StatCard label="Agent Receivables" value={formatCompactINR(agentReceivables)} />
        <StatCard label="Priority Cases" value={String(priorityCases)} />
      </div>

      <InfoPanel title="Receivables Ledger">
        <div className="space-y-5">
          <form className="grid gap-3 md:grid-cols-4">
            <input
              type="text"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Search booking ref or customer"
              className="h-11 rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            />

            <select
              name="status"
              defaultValue={params.status ?? "all"}
              className="h-11 rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            >
              <option value="all">All statuses</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="refunded">Refunded</option>
            </select>

            <select
              name="priority"
              defaultValue={params.priority ?? "all"}
              className="h-11 rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            >
              <option value="all">All priorities</option>
              <option value="high">High priority only</option>
            </select>

            <button
              type="submit"
              className="h-11 rounded-[18px] bg-[#ff7a18] px-4 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Apply Filters
            </button>
          </form>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                0–3 Days
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {formatCompactINR(aging0to3)}
              </p>
            </div>

            <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                4–7 Days
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {formatCompactINR(aging4to7)}
              </p>
            </div>

            <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                8–15 Days
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {formatCompactINR(aging8to15)}
              </p>
            </div>

            <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                15+ Days
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {formatCompactINR(aging15Plus)}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <th className="px-4 py-3">Booking</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Received</th>
                    <th className="px-4 py-3">Balance</th>
                    <th className="px-4 py-3">Age</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-500">
                        No receivables found.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => (
                      <tr key={row.id} className="align-top">
                        <td className="px-4 py-4">
                          <div className="font-semibold text-slate-950">
                            {row.booking_ref ?? "—"}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            Created {formatDate(row.created_at)}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm text-slate-700">
                          {row.customer_name ?? "—"}
                        </td>

                        <td className="px-4 py-4 text-sm text-slate-700">
                          {formatCurrency(row.totalAmount)}
                        </td>

                        <td className="px-4 py-4 text-sm text-slate-700">
                          {formatCurrency(row.amountReceived)}
                        </td>

                        <td className="px-4 py-4 text-sm font-semibold text-slate-950">
                          {formatCurrency(row.balanceDue)}
                        </td>

                        <td className="px-4 py-4 text-sm text-slate-700">
                          {row.ageDays} days
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                              row.derivedStatus
                            )}`}
                          >
                            {row.derivedStatus}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          {row.priority ? (
                            <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                              High
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">—</span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <Link
                            href={`/admin/payments?bookingRef=${encodeURIComponent(
                              row.booking_ref ?? ""
                            )}`}
                            className="inline-flex rounded-[14px] border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Record Payment
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-sm leading-7 text-slate-600">
            This version uses booking age from <span className="font-semibold">created_at</span>{" "}
            because your current schema does not yet have a dedicated due date field.
          </p>
        </div>
      </InfoPanel>
    </PortalShell>
  );
}