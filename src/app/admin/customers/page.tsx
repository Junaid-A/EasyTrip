"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Ban,
  Eye,
  Loader2,
  Pencil,
  RefreshCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { PortalShell } from "@/components/shared/portal-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";
import { createClient } from "@/lib/supabase/client";

type RawBookingRow = {
  id: string;
  user_id: string | null;
  booking_ref: string | null;
  created_at: string | null;
  status: string | null;
  payment_status: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  departure_date: string | null;
  total_amount: number | null;
};

type CustomerBooking = {
  id: string;
  userId: string | null;
  bookingRef: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  departureDate: string;
  totalAmount: number;
};

type CustomerRow = {
  key: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  totalValue: number;
  paidBookings: number;
  pendingAmount: number;
  cancelledBookings: number;
  lostRevenue: number;
  completedTrips: number;
  pendingTrips: number;
  approvalPending: number;
  lastBookingAt: string;
  bookings: CustomerBooking[];
};

type ProfilePatch = {
  full_name?: string;
  phone?: string;
};

function formatINR(value: number) {
  return `₹${Math.max(0, Math.round(value)).toLocaleString("en-IN")}`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeStatus(value?: string | null) {
  const status = String(value ?? "pending").trim().toLowerCase();

  if (status === "confirmed") return "confirmed";
  if (status === "cancelled") return "cancelled";
  return "pending";
}

function normalizePaymentStatus(value?: string | null) {
  const status = String(value ?? "unpaid").trim().toLowerCase();

  if (status === "paid") return "paid";
  if (status === "partial") return "partial";
  if (status === "refund" || status === "refunded") return "refunded";
  return "unpaid";
}

function getAmount(row: RawBookingRow) {
  return typeof row.total_amount === "number" ? row.total_amount : 0;
}

function getTripState(status: string, departureDate?: string | null) {
  const normalizedStatus = normalizeStatus(status);

  if (normalizedStatus === "cancelled") {
    return "cancelled";
  }

  if (normalizedStatus !== "confirmed") {
    return "approval-pending";
  }

  if (!departureDate) {
    return "pending";
  }

  const tripDate = new Date(departureDate);
  if (Number.isNaN(tripDate.getTime())) {
    return "pending";
  }

  const now = new Date();
  if (tripDate.getTime() < now.getTime()) {
    return "completed";
  }

  return "pending";
}

function buildCustomers(rows: RawBookingRow[]): CustomerRow[] {
  const byCustomer = new Map<string, CustomerRow>();

  for (const row of rows) {
    const email = String(row.customer_email ?? "").trim().toLowerCase();
    const phone = String(row.customer_phone ?? "").trim();
    const name = String(row.customer_name ?? "").trim();
    const fallbackKey = email || phone || String(row.user_id ?? row.id);
    const key = fallbackKey || `customer-${row.id}`;

    if (!byCustomer.has(key)) {
      byCustomer.set(key, {
        key,
        userId: row.user_id ?? null,
        name: name || "Unknown customer",
        email: email || "No email",
        phone: phone || "No phone",
        totalBookings: 0,
        totalValue: 0,
        paidBookings: 0,
        pendingAmount: 0,
        cancelledBookings: 0,
        lostRevenue: 0,
        completedTrips: 0,
        pendingTrips: 0,
        approvalPending: 0,
        lastBookingAt: row.created_at ?? "",
        bookings: [],
      });
    }

    const customer = byCustomer.get(key)!;
    const amount = getAmount(row);
    const bookingStatus = normalizeStatus(row.status);
    const paymentStatus = normalizePaymentStatus(row.payment_status);
    const tripState = getTripState(bookingStatus, row.departure_date);

    customer.totalBookings += 1;
    customer.totalValue += amount;

    if (paymentStatus === "paid") {
      customer.paidBookings += 1;
    }

    if (paymentStatus === "partial" || paymentStatus === "unpaid") {
      customer.pendingAmount += amount;
    }

    if (bookingStatus === "cancelled") {
      customer.cancelledBookings += 1;
      customer.lostRevenue += amount;
    }

    if (tripState === "completed") {
      customer.completedTrips += 1;
    }

    if (tripState === "pending") {
      customer.pendingTrips += 1;
    }

    if (tripState === "approval-pending") {
      customer.approvalPending += 1;
    }

    if (
      row.created_at &&
      (!customer.lastBookingAt ||
        new Date(row.created_at).getTime() >
          new Date(customer.lastBookingAt).getTime())
    ) {
      customer.lastBookingAt = row.created_at;
    }

    customer.bookings.push({
      id: row.id,
      userId: row.user_id ?? null,
      bookingRef: String(row.booking_ref ?? row.id),
      createdAt: String(row.created_at ?? ""),
      status: bookingStatus,
      paymentStatus,
      departureDate: String(row.departure_date ?? ""),
      totalAmount: amount,
    });

    if (!customer.userId && row.user_id) {
      customer.userId = row.user_id;
    }

    if ((!customer.name || customer.name === "Unknown customer") && name) {
      customer.name = name;
    }

    if ((!customer.phone || customer.phone === "No phone") && phone) {
      customer.phone = phone;
    }

    if ((!customer.email || customer.email === "No email") && email) {
      customer.email = email;
    }
  }

  return Array.from(byCustomer.values()).sort((a, b) => {
    return (
      new Date(b.lastBookingAt).getTime() -
      new Date(a.lastBookingAt).getTime()
    );
  });
}

function KpiCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
      {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function ActionButton({
  title,
  onClick,
  children,
  variant = "neutral",
  disabled = false,
}: {
  title: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: "neutral" | "danger";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition",
        variant === "danger"
          ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        disabled ? "cursor-not-allowed opacity-50" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function AdminCustomersPage() {
  const supabase = createClient();

  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");

  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerRow | null>(null);

  const [editTarget, setEditTarget] = useState<CustomerRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  async function loadCustomers(options?: { silent?: boolean }) {
    if (options?.silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorMessage("");

    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
          id,
          user_id,
          booking_ref,
          created_at,
          status,
          payment_status,
          customer_name,
          customer_email,
          customer_phone,
          departure_date,
          total_amount
        `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      setRows([]);
      setErrorMessage(error.message);
      setLoading(false);
      setRefreshing(false);
      return null;
    }

    const builtRows = buildCustomers((data ?? []) as RawBookingRow[]);
    setRows(builtRows);
    setLoading(false);
    setRefreshing(false);
    return builtRows;
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return rows;

    return rows.filter((row) => {
      const haystack = [
        row.name,
        row.email,
        row.phone,
        String(row.totalBookings),
        String(row.totalValue),
        row.lastBookingAt,
        ...row.bookings.map((booking) => booking.bookingRef),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [rows, search]);

  const totals = useMemo(() => {
    return filteredRows.reduce(
      (acc, row) => {
        acc.customers += 1;
        acc.bookings += row.totalBookings;
        acc.value += row.totalValue;
        acc.pending += row.pendingAmount;
        return acc;
      },
      { customers: 0, bookings: 0, value: 0, pending: 0 },
    );
  }, [filteredRows]);

  function openEdit(customer: CustomerRow) {
    setEditTarget(customer);
    setEditName(customer.name === "Unknown customer" ? "" : customer.name);
    setEditPhone(customer.phone === "No phone" ? "" : customer.phone);
  }

  async function handleSaveEdit() {
  if (!editTarget?.userId) {
    setErrorMessage("This customer is not linked to a profile record yet.");
    return;
  }

  setSavingEdit(true);
  setErrorMessage("");

  const trimmedName = editName.trim();
  const trimmedPhone = editPhone.trim();

  const profilePatch: ProfilePatch = {};
  const bookingPatch: {
    customer_name?: string;
    customer_phone?: string;
  } = {};

  if (trimmedName) {
    profilePatch.full_name = trimmedName;
    bookingPatch.customer_name = trimmedName;
  }

  if (trimmedPhone) {
    profilePatch.phone = trimmedPhone;
    bookingPatch.customer_phone = trimmedPhone;
  }

  const hasProfileChanges = Object.keys(profilePatch).length > 0;
  const hasBookingChanges = Object.keys(bookingPatch).length > 0;

  if (!hasProfileChanges && !hasBookingChanges) {
    setSavingEdit(false);
    setEditTarget(null);
    return;
  }

  if (hasProfileChanges) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update(profilePatch)
      .eq("id", editTarget.userId);

    if (profileError) {
      setSavingEdit(false);
      setErrorMessage(profileError.message);
      return;
    }
  }

  if (hasBookingChanges) {
    const { error: bookingError } = await supabase
      .from("bookings")
      .update(bookingPatch)
      .eq("user_id", editTarget.userId);

    if (bookingError) {
      setSavingEdit(false);
      setErrorMessage(bookingError.message);
      return;
    }
  }

  const refreshed = await loadCustomers({ silent: true });
  setSavingEdit(false);
  setEditTarget(null);

  if (selectedCustomer?.key === editTarget.key && refreshed) {
    const updated = refreshed.find((row) => row.key === editTarget.key);
    setSelectedCustomer(updated ?? null);
  }
}

  async function handleBlockCustomer(customer: CustomerRow) {
    if (!customer.userId) {
      setErrorMessage("This customer is not linked to a profile record yet.");
      return;
    }

    const confirmed = window.confirm(
      `Block ${customer.name}? This requires an is_blocked column in profiles.`,
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("profiles")
      .update({ is_blocked: true } as never)
      .eq("id", customer.userId);

    if (error) {
      setErrorMessage(
        `Block failed. Add 'is_blocked boolean default false' to profiles. ${error.message}`,
      );
      return;
    }

    await loadCustomers({ silent: true });
  }

  async function handleDeleteCustomer(customer: CustomerRow) {
    if (!customer.userId) {
      setErrorMessage("This customer is not linked to a profile record yet.");
      return;
    }

    const confirmed = window.confirm(
      `Soft delete ${customer.name}? This requires a deleted_at column in profiles.`,
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("profiles")
      .update({ deleted_at: new Date().toISOString() } as never)
      .eq("id", customer.userId);

    if (error) {
      setErrorMessage(
        `Delete failed. Add 'deleted_at timestamp null' to profiles. ${error.message}`,
      );
      return;
    }

    await loadCustomers({ silent: true });

    if (selectedCustomer?.key === customer.key) {
      setSelectedCustomer(null);
    }
  }

  return (
    <PortalShell
      title="Customers"
      subtitle="Real customer records aggregated from bookings with CRM actions and performance visibility."
      sidebar={<AdminSidebar />}
    >
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Customers" value={totals.customers} />
          <KpiCard label="Bookings" value={totals.bookings} />
          <KpiCard label="Total Value" value={formatINR(totals.value)} />
          <KpiCard label="Pending Amount" value={formatINR(totals.pending)} />
        </div>

        <InfoPanel title="Customer Lead Table">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by customer, email, phone, or booking ref"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300"
              />
            </div>

            <button
              type="button"
              onClick={() => loadCustomers({ silent: true })}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Refresh
            </button>
          </div>

          {errorMessage ? (
            <div className="mb-4 rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-slate-50">
              <div className="flex items-center gap-3 text-slate-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading customers...
              </div>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-6">
              <p className="text-lg font-semibold text-slate-950">
                No customer records found
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Customer entries will appear here once bookings exist in the
                bookings table.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-slate-500">
                      <th className="px-5 py-4 font-semibold">Customer</th>
                      <th className="px-5 py-4 font-semibold">Email</th>
                      <th className="px-5 py-4 font-semibold">Phone</th>
                      <th className="px-5 py-4 font-semibold">Bookings</th>
                      <th className="px-5 py-4 font-semibold">Expected Value</th>
                      <th className="px-5 py-4 font-semibold">Last Booking</th>
                      <th className="px-5 py-4 font-semibold text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRows.map((customer) => (
                      <tr
                        key={customer.key}
                        className="border-t border-slate-100 align-top"
                      >
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-slate-950">
                              {customer.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Paid {customer.paidBookings} • Cancelled{" "}
                              {customer.cancelledBookings}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {customer.email}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {customer.phone}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {customer.totalBookings}
                        </td>

                        <td className="px-5 py-4 font-semibold text-slate-950">
                          {formatINR(customer.totalValue)}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {formatDate(customer.lastBookingAt)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <ActionButton
                              title="View"
                              onClick={() => setSelectedCustomer(customer)}
                            >
                              <Eye className="h-4 w-4" />
                            </ActionButton>

                            <ActionButton
                              title="Edit"
                              onClick={() => openEdit(customer)}
                            >
                              <Pencil className="h-4 w-4" />
                            </ActionButton>

                            <ActionButton
                              title="Block"
                              onClick={() => handleBlockCustomer(customer)}
                            >
                              <Ban className="h-4 w-4" />
                            </ActionButton>

                            <ActionButton
                              title="Delete"
                              variant="danger"
                              onClick={() => handleDeleteCustomer(customer)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </InfoPanel>
      </div>

      {selectedCustomer ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-2xl font-semibold text-slate-950">
                  {selectedCustomer.name}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {selectedCustomer.email} • {selectedCustomer.phone}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label="Total Bookings"
                value={selectedCustomer.totalBookings}
              />
              <KpiCard
                label="Paid Bookings"
                value={selectedCustomer.paidBookings}
              />
              <KpiCard
                label="Pending Amount"
                value={formatINR(selectedCustomer.pendingAmount)}
              />
              <KpiCard
                label="Cancelled"
                value={selectedCustomer.cancelledBookings}
              />
              <KpiCard
                label="Lost Revenue"
                value={formatINR(selectedCustomer.lostRevenue)}
              />
              <KpiCard
                label="Trips Completed"
                value={selectedCustomer.completedTrips}
              />
              <KpiCard
                label="Pending Trips"
                value={selectedCustomer.pendingTrips}
              />
              <KpiCard
                label="Approval Pending"
                value={selectedCustomer.approvalPending}
              />
              <KpiCard
                label="Total Value"
                value={formatINR(selectedCustomer.totalValue)}
              />
              <KpiCard
                label="Last Booking"
                value={formatDate(selectedCustomer.lastBookingAt)}
              />
            </div>

            <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">
                Booking History
              </p>

              <div className="mt-4 overflow-hidden rounded-[20px] border border-slate-200 bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Booking Ref</th>
                      <th className="px-4 py-3 font-semibold">Created</th>
                      <th className="px-4 py-3 font-semibold">Departure</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Payment</th>
                      <th className="px-4 py-3 font-semibold">Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedCustomer.bookings.map((booking) => (
                      <tr key={booking.id} className="border-t border-slate-100">
                        <td className="px-4 py-3 font-medium text-slate-950">
                          {booking.bookingRef}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {formatDateTime(booking.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {formatDate(booking.departureDate)}
                        </td>
                        <td className="px-4 py-3 capitalize text-slate-700">
                          {booking.status}
                        </td>
                        <td className="px-4 py-3 capitalize text-slate-700">
                          {booking.paymentStatus}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-950">
                          {formatINR(booking.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {editTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-2xl font-semibold text-slate-950">
                  Edit Customer
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Update the linked profile record.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Full name
                </label>
                <input
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-900 outline-none focus:border-slate-300"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Phone
                </label>
                <input
                  value={editPhone}
                  onChange={(event) => setEditPhone(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-900 outline-none focus:border-slate-300"
                  placeholder="Enter phone"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {savingEdit ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PortalShell>
  );
}