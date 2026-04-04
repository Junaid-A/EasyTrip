"use client";

import Link from "next/link";
import { PortalShell } from "@/components/shared/portal-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { StatCard } from "@/components/shared/stat-card";
import { InfoPanel } from "@/components/shared/info-panel";
import { useBookingStore } from "@/store/useBookingStore";

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

export default function AdminDashboardPage() {
  const bookings = useBookingStore((state) => state.bookings);

  const totalRevenue = bookings.reduce(
    (sum, booking) => sum + booking.pricing.totalAmount,
    0
  );

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "confirmed"
  ).length;

  const activeCustomers = new Set(
    bookings.map((booking) => booking.customer.email)
  ).size;

  const latestBooking = bookings[0];

  return (
    <PortalShell
      title="Admin Dashboard"
      subtitle="Top KPIs, revenue, receivables, funnel visibility, and operations summary."
      sidebar={<AdminSidebar />}
    >
      <div className="grid gap-6 md:grid-cols-4">
        <StatCard label="Expected Revenue" value={formatINR(totalRevenue)} />
        <StatCard label="Confirmed Bookings" value={String(confirmedBookings)} />
        <StatCard label="Active Customers" value={String(activeCustomers)} />
        <StatCard label="Active Agents" value="12" />
      </div>

      <InfoPanel title="Operations Snapshot">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] bg-slate-50 p-5">
            <p className="font-semibold text-slate-950">Customer Funnel</p>
            <p className="mt-2 text-sm text-slate-600">
              Leads → Proposal → Review → Paid → Confirmed
            </p>
          </div>

          <div className="rounded-[24px] bg-slate-50 p-5">
            <p className="font-semibold text-slate-950">Top Destination</p>
            <p className="mt-2 text-sm text-slate-600">
              {latestBooking?.trip.destination ||
                "Bangkok remains the strongest demo-performing route"}
            </p>
          </div>
        </div>
      </InfoPanel>

      <InfoPanel title="Latest Bookings">
        {bookings.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-6">
            <p className="text-lg font-semibold text-slate-950">
              No bookings recorded yet
            </p>
            <p className="mt-2 text-sm text-slate-600">
              New bookings created from the review page will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.slice(0, 5).map((booking) => (
              <div
                key={booking.id}
                className="rounded-[24px] border border-slate-200 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-slate-950">
                      {booking.trip.title}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {booking.id}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {booking.customer.name} • {booking.customer.email} •{" "}
                      {booking.customer.phone}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {booking.trip.destination} • {booking.trip.durationLabel}
                    </p>
                  </div>

                  <div className="text-left lg:text-right">
                    <p className="text-sm text-slate-500">Booking Value</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">
                      {formatINR(booking.pricing.totalAmount)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(booking.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
                    {booking.status}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                    {booking.trip.flightLabel || "Without Flight"}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                    {booking.trip.departureDate || "Dates pending"}
                  </span>
                </div>

                <div className="mt-5">
                  <Link
                    href={`/confirmation/${booking.id}`}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    View Confirmation
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </InfoPanel>
    </PortalShell>
  );
}