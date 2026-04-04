"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PortalShell } from "@/components/shared/portal-shell";
import { CustomerSidebar } from "@/components/customer/customer-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";
import {
  getMyBookingsFromDb,
  type BookingRecord,
} from "@/lib/bookings/booking-client";

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

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        const result = await getMyBookingsFromDb();
        if (!ignore) {
          setBookings(result);
        }
      } catch (error) {
        console.error(error);
        if (!ignore) {
          setBookings([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <PortalShell
      title="Bookings"
      subtitle="Booking list, status visibility, and pending actions."
      sidebar={<CustomerSidebar />}
    >
      <InfoPanel title="Booking List">
        {loading ? (
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
            Loading bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-6">
            <p className="text-lg font-semibold text-slate-950">No bookings yet</p>
            <p className="mt-2 text-sm text-slate-600">
              Once you complete a booking from the review page, it will appear here automatically.
            </p>
            <Link
              href="/trip-builder"
              className="mt-4 inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Start a Trip
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-[24px] border border-slate-200 p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-slate-950">
                      {booking.trip.title}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {booking.bookingRef}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {booking.trip.destination} • {booking.trip.durationLabel} • {booking.trip.departureDate || "Dates pending"}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-sm text-slate-500">Final Amount</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">
                      {formatINR(booking.pricing.totalAmount)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Booked on {formatDate(booking.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  <span className="rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-700">
                    {booking.status}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                    {booking.customer.email}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                    {booking.trip.flightLabel || "Without Flight"}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/confirmation/${booking.bookingRef}`}
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    View Booking
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