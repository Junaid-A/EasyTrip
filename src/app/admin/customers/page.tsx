"use client";

import Link from "next/link";
import { PortalShell } from "@/components/shared/portal-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
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

export default function AdminCustomersPage() {
  const bookings = useBookingStore((state) => state.bookings);

  return (
    <PortalShell
      title="Customers"
      subtitle="All customers, lead stage, booking stage, payment status, and expected value."
      sidebar={<AdminSidebar />}
    >
      <InfoPanel title="Customer Lead Table">
        {bookings.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-6">
            <p className="text-lg font-semibold text-slate-950">
              No customer records yet
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Customer entries will appear here once bookings are created from
              the review page.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-950">
                      {booking.customer.name}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      {booking.customer.email}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {booking.customer.phone}
                    </p>

                    <p className="mt-3 text-sm text-slate-500">
                      Booking: {booking.id}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Trip: {booking.trip.title}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Route: {booking.trip.destination} • {booking.trip.durationLabel}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Departure: {booking.trip.departureDate || "Pending"}
                    </p>
                  </div>

                  <div className="text-left lg:text-right">
                    <p className="text-sm text-slate-500">Expected Value</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">
                      {formatINR(booking.pricing.totalAmount)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Created on {formatDate(booking.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  <span className="rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-700">
                    {booking.status}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                    {booking.trip.flightLabel || "Without Flight"}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                    {booking.travellers.length} Traveller
                    {booking.travellers.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/confirmation/${booking.id}`}
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    View Booking
                  </Link>

                  <Link
                    href="/admin/dashboard"
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    Back to Dashboard
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