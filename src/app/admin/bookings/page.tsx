"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  RefreshCcw,
  Search,
} from "lucide-react";
import { PortalShell } from "@/components/shared/portal-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";
import { FilterBar } from "@/components/shared/filter-bar";
import { createClient } from "@/lib/supabase/client";

type BookingStatus = "confirmed" | "pending" | "cancelled";
type FlightFilter = "with-flight" | "without-flight";
type PaymentStatus = "paid" | "partial" | "refund" | "unpaid";
type SortValue =
  | "newest"
  | "oldest"
  | "price-high"
  | "price-low";
type RangeValue = "all" | "7d" | "30d" | "90d";

type AdminBookingRow = {
  id: string;
  booking_ref: string;
  created_at: string;
  status: string | null;
  payment_status: string | null;

  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;

  trip_title: string | null;
  destination: string | null;
  duration_label: string | null;
  departure_date: string | null;
  flight_label: string | null;

  pricing:
    | {
        totalAmount?: number;
      }
    | null;

  total_amount: number | null;
};

function formatINR(value: number) {
  return `₹${Math.max(0, Math.round(value)).toLocaleString("en-IN")}`;
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function normalizeStatus(value?: string | null): BookingStatus {
  const status = (value || "pending").toLowerCase();

  if (
    status === "confirmed" ||
    status === "cancelled" ||
    status === "pending"
  ) {
    return status;
  }

  return "pending";
}

function normalizePaymentStatus(
  value?: string | null,
): PaymentStatus {
  const paymentStatus = (value || "unpaid").toLowerCase();

  if (
    paymentStatus === "paid" ||
    paymentStatus === "partial" ||
    paymentStatus === "refund" ||
    paymentStatus === "unpaid"
  ) {
    return paymentStatus;
  }

  return "unpaid";
}

function getStatusBadgeClasses(status?: string | null) {
  const normalized = normalizeStatus(status);

  if (normalized === "confirmed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalized === "cancelled") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function getStatusCardClasses(status?: string | null) {
  const normalized = normalizeStatus(status);

  if (normalized === "confirmed") {
    return "border-emerald-200 bg-white";
  }

  if (normalized === "cancelled") {
    return "border-rose-200 bg-white";
  }

  return "border-amber-200 bg-white";
}

function getPaymentBadgeClasses(value?: string | null) {
  const paymentStatus = normalizePaymentStatus(value);

  if (paymentStatus === "paid") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (paymentStatus === "partial") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (paymentStatus === "refund") {
    return "border-violet-200 bg-violet-50 text-violet-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-700";
}

function getFlightType(value?: string | null): FlightFilter {
  const flight = (value || "").toLowerCase();

  if (flight.includes("with")) return "with-flight";
  return "without-flight";
}

function getFlightPillClasses(value?: string | null) {
  const flightType = getFlightType(value);

  if (flightType === "with-flight") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  return "border-violet-200 bg-violet-50 text-violet-700";
}

function getAmount(booking: AdminBookingRow) {
  const pricingTotal =
    booking.pricing &&
    typeof booking.pricing === "object" &&
    typeof booking.pricing.totalAmount === "number"
      ? booking.pricing.totalAmount
      : 0;

  return (
    pricingTotal ||
    (typeof booking.total_amount === "number"
      ? booking.total_amount
      : 0)
  );
}

function isWithinDays(dateString: string, days: number) {
  const created = new Date(dateString).getTime();

  if (Number.isNaN(created)) return false;

  const now = Date.now();
  const diff = now - created;
  const max = days * 24 * 60 * 60 * 1000;

  return diff <= max;
}

function matchesSearch(
  booking: AdminBookingRow,
  search: string,
) {
  if (!search.trim()) return true;

  const haystack = [
    booking.booking_ref,
    booking.trip_title,
    booking.destination,
    booking.customer_name,
    booking.customer_email,
    booking.customer_phone,
    booking.duration_label,
    booking.departure_date,
    booking.flight_label,
    normalizeStatus(booking.status),
    normalizePaymentStatus(booking.payment_status),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(search.trim().toLowerCase());
}

export default function AdminBookingsPage() {
  const supabase = createClient();

  const [bookings, setBookings] = useState<AdminBookingRow[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] =
    useState<SortValue>("newest");
  const [range, setRange] = useState<RangeValue>("all");

  const [selectedStatuses, setSelectedStatuses] =
    useState<BookingStatus[]>([]);
  const [selectedFlightTypes, setSelectedFlightTypes] =
    useState<FlightFilter[]>([]);
  const [selectedPaymentStatuses, setSelectedPaymentStatuses] =
    useState<PaymentStatus[]>([]);

  async function loadBookings() {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
          id,
          booking_ref,
          created_at,
          status,
          payment_status,
          customer_name,
          customer_email,
          customer_phone,
          trip_title,
          destination,
          duration_label,
          departure_date,
          flight_label,
          pricing,
          total_amount
        `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      setBookings([]);
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setBookings((data ?? []) as AdminBookingRow[]);
    setLoading(false);
  }

  useEffect(() => {
    loadBookings();
  }, []);

  function toggleStatus(status: BookingStatus) {
    setSelectedStatuses((current) =>
      current.includes(status)
        ? current.filter((item) => item !== status)
        : [...current, status],
    );
  }

  function toggleFlightType(type: FlightFilter) {
    setSelectedFlightTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type],
    );
  }

  function togglePaymentStatus(status: PaymentStatus) {
    setSelectedPaymentStatuses((current) =>
      current.includes(status)
        ? current.filter((item) => item !== status)
        : [...current, status],
    );
  }

  function handleMetricCardClick(
    key:
      | "all"
      | "pending"
      | "confirmed"
      | "cancelled",
  ) {
    if (key === "all") {
      setSelectedStatuses([]);
      return;
    }

    setSelectedStatuses((current) =>
      current.length === 1 && current[0] === key ? [] : [key],
    );
  }

  function clearAllFilters() {
    setSearch("");
    setSortBy("newest");
    setRange("all");
    setSelectedStatuses([]);
    setSelectedFlightTypes([]);
    setSelectedPaymentStatuses([]);
  }

  const filteredBookings = useMemo(() => {
    let rows = [...bookings];

    if (range !== "all") {
      const days =
        range === "7d" ? 7 : range === "30d" ? 30 : 90;
      rows = rows.filter((booking) =>
        isWithinDays(booking.created_at, days),
      );
    }

    rows = rows.filter((booking) =>
      matchesSearch(booking, search),
    );

    if (selectedStatuses.length > 0) {
      rows = rows.filter((booking) =>
        selectedStatuses.includes(
          normalizeStatus(booking.status),
        ),
      );
    }

    if (selectedFlightTypes.length > 0) {
      rows = rows.filter((booking) =>
        selectedFlightTypes.includes(
          getFlightType(booking.flight_label),
        ),
      );
    }

    if (selectedPaymentStatuses.length > 0) {
      rows = rows.filter((booking) =>
        selectedPaymentStatuses.includes(
          normalizePaymentStatus(
            booking.payment_status,
          ),
        ),
      );
    }

    rows.sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
        );
      }

      if (sortBy === "oldest") {
        return (
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
        );
      }

      if (sortBy === "price-high") {
        return getAmount(b) - getAmount(a);
      }

      return getAmount(a) - getAmount(b);
    });

    return rows;
  }, [
    bookings,
    range,
    search,
    selectedStatuses,
    selectedFlightTypes,
    selectedPaymentStatuses,
    sortBy,
  ]);

  const metrics = useMemo(() => {
    const totalBookings = filteredBookings.length;
    const pendingCount = filteredBookings.filter(
      (booking) =>
        normalizeStatus(booking.status) === "pending",
    ).length;
    const confirmedCount = filteredBookings.filter(
      (booking) =>
        normalizeStatus(booking.status) === "confirmed",
    ).length;
    const cancelledCount = filteredBookings.filter(
      (booking) =>
        normalizeStatus(booking.status) === "cancelled",
    ).length;
    const totalValue = filteredBookings.reduce(
      (sum, booking) => sum + getAmount(booking),
      0,
    );

    return {
      totalBookings,
      pendingCount,
      confirmedCount,
      cancelledCount,
      totalValue,
    };
  }, [filteredBookings]);

  return (
    <PortalShell
      title="Admin Bookings"
      subtitle="All live bookings from Supabase with search, sorting, filters, and direct access to customer and trip details."
      sidebar={<AdminSidebar />}
    >
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            label="Total Bookings"
            value={String(metrics.totalBookings)}
            active={selectedStatuses.length === 0}
            onClick={() => handleMetricCardClick("all")}
          />
          <MetricCard
            label="Pending"
            value={String(metrics.pendingCount)}
            accent="amber"
            active={
              selectedStatuses.length === 1 &&
              selectedStatuses[0] === "pending"
            }
            onClick={() => handleMetricCardClick("pending")}
          />
          <MetricCard
            label="Confirmed"
            value={String(metrics.confirmedCount)}
            accent="emerald"
            active={
              selectedStatuses.length === 1 &&
              selectedStatuses[0] === "confirmed"
            }
            onClick={() => handleMetricCardClick("confirmed")}
          />
          <MetricCard
            label="Cancelled"
            value={String(metrics.cancelledCount)}
            accent="rose"
            active={
              selectedStatuses.length === 1 &&
              selectedStatuses[0] === "cancelled"
            }
            onClick={() => handleMetricCardClick("cancelled")}
          />
          <MetricCard
            label="Total Value"
            value={formatINR(metrics.totalValue)}
            onClick={() => {}}
          />
        </section>

        <FilterBar className="gap-3">
          <div className="flex min-w-[260px] flex-1 items-center gap-3 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search booking ref, customer, trip, destination..."
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="inline-flex items-center gap-2 rounded-[18px] border border-slate-200 bg-slate-50 px-3 py-2">
            <ArrowUpDown className="h-4 w-4 text-slate-500" />
            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target.value as SortValue,
                )
              }
              className="bg-transparent text-sm font-medium text-slate-800 outline-none"
            >
              <option value="newest">
                Date: Newest first
              </option>
              <option value="oldest">
                Date: Oldest first
              </option>
              <option value="price-high">
                Price: High to low
              </option>
              <option value="price-low">
                Price: Low to high
              </option>
            </select>
          </div>

          <CompactPill
            active={range === "all"}
            onClick={() => setRange("all")}
          >
            All
          </CompactPill>
          <CompactPill
            active={range === "7d"}
            onClick={() => setRange("7d")}
          >
            7D
          </CompactPill>
          <CompactPill
            active={range === "30d"}
            onClick={() => setRange("30d")}
          >
            30D
          </CompactPill>
          <CompactPill
            active={range === "90d"}
            onClick={() => setRange("90d")}
          >
            90D
          </CompactPill>

          <TogglePill
            active={selectedFlightTypes.includes(
              "with-flight",
            )}
            activeClasses="border-sky-200 bg-sky-50 text-sky-700"
            onClick={() =>
              toggleFlightType("with-flight")
            }
          >
            With Flight
          </TogglePill>
          <TogglePill
            active={selectedFlightTypes.includes(
              "without-flight",
            )}
            activeClasses="border-violet-200 bg-violet-50 text-violet-700"
            onClick={() =>
              toggleFlightType("without-flight")
            }
          >
            Without Flight
          </TogglePill>

          <TogglePill
            active={selectedPaymentStatuses.includes("paid")}
            activeClasses="border-emerald-200 bg-emerald-50 text-emerald-700"
            onClick={() =>
              togglePaymentStatus("paid")
            }
          >
            Paid
          </TogglePill>
          <TogglePill
            active={selectedPaymentStatuses.includes(
              "partial",
            )}
            activeClasses="border-amber-200 bg-amber-50 text-amber-700"
            onClick={() =>
              togglePaymentStatus("partial")
            }
          >
            Partial
          </TogglePill>
          <TogglePill
            active={selectedPaymentStatuses.includes(
              "refund",
            )}
            activeClasses="border-violet-200 bg-violet-50 text-violet-700"
            onClick={() =>
              togglePaymentStatus("refund")
            }
          >
            Refund
          </TogglePill>
          <TogglePill
            active={selectedPaymentStatuses.includes(
              "unpaid",
            )}
            activeClasses="border-slate-300 bg-slate-100 text-slate-700"
            onClick={() =>
              togglePaymentStatus("unpaid")
            }
          >
            Unpaid
          </TogglePill>

          <button
            type="button"
            onClick={loadBookings}
            className="inline-flex items-center gap-2 rounded-[18px] border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>

          <button
            type="button"
            onClick={clearAllFilters}
            className="inline-flex items-center gap-2 rounded-[18px] border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Clear
          </button>
        </FilterBar>

        <InfoPanel title="Bookings Master List">
          {loading ? (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
              <p className="text-lg font-semibold text-slate-950">
                Loading bookings...
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Fetching live data from Supabase.
              </p>
            </div>
          ) : errorMessage ? (
            <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-6">
              <p className="text-lg font-semibold text-rose-900">
                Could not load bookings
              </p>
              <p className="mt-2 text-sm text-rose-700">
                {errorMessage}
              </p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-6">
              <p className="text-lg font-semibold text-slate-950">
                No bookings found
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Try clearing filters or changing the selected filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const status = normalizeStatus(
                  booking.status,
                );
                const amount = getAmount(booking);
                const paymentStatus =
                  normalizePaymentStatus(
                    booking.payment_status,
                  );
                const flightLabel =
                  getFlightType(booking.flight_label) ===
                  "with-flight"
                    ? booking.flight_label ||
                      "With Flight"
                    : booking.flight_label ||
                      "Without Flight";

                return (
                  <div
                    key={booking.id}
                    className={`rounded-[24px] border p-5 transition ${getStatusCardClasses(
                      status,
                    )}`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold text-slate-950">
                            {booking.trip_title ||
                              "Untitled Trip"}
                          </p>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${getStatusBadgeClasses(
                              status,
                            )}`}
                          >
                            {status}
                          </span>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${getPaymentBadgeClasses(
                              paymentStatus,
                            )}`}
                          >
                            {paymentStatus}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-600">
                          {booking.booking_ref}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {booking.customer_name || "Guest"} •{" "}
                          {booking.customer_email ||
                            "No email"}{" "}
                          •{" "}
                          {booking.customer_phone ||
                            "No phone"}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {booking.destination ||
                            "Destination pending"}{" "}
                          •{" "}
                          {booking.duration_label ||
                            "Duration pending"}{" "}
                          •{" "}
                          {booking.departure_date ||
                            "Dates pending"}
                        </p>
                      </div>

                      <div className="text-left lg:text-right">
                        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getFlightPillClasses(
                              booking.flight_label,
                            )}`}
                          >
                            {flightLabel}
                          </span>
                        </div>

                        <p className="mt-3 text-sm text-slate-500">
                          Booking Value
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-950">
                          {formatINR(amount)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(booking.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link
                        href={`/admin/bookings/${booking.booking_ref}`}
                        className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        Open Booking
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </InfoPanel>
      </div>
    </PortalShell>
  );
}

function MetricCard({
  label,
  value,
  accent = "default",
  active = false,
  onClick,
}: {
  label: string;
  value: string;
  accent?: "default" | "amber" | "emerald" | "rose";
  active?: boolean;
  onClick: () => void;
}) {
  const accentClasses =
    accent === "emerald"
      ? active
        ? "border-emerald-300 bg-emerald-100"
        : "border-emerald-200 bg-emerald-50/60"
      : accent === "amber"
        ? active
          ? "border-amber-300 bg-amber-100"
          : "border-amber-200 bg-amber-50/60"
        : accent === "rose"
          ? active
            ? "border-rose-300 bg-rose-100"
            : "border-rose-200 bg-rose-50/60"
          : active
            ? "border-slate-300 bg-slate-100"
            : "border-slate-200 bg-white";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[24px] border p-5 text-left transition hover:shadow-sm ${accentClasses}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-[18px] font-semibold text-slate-950 sm:text-[20px]">
        {value}
      </p>
    </button>
  );
}

function CompactPill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
        active
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function TogglePill({
  active,
  children,
  onClick,
  activeClasses,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  activeClasses: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
        active
          ? activeClasses
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}