"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PortalShell } from "@/components/shared/portal-shell";
import { CustomerSidebar } from "@/components/customer/customer-sidebar";
import { StatCard } from "@/components/shared/stat-card";
import { InfoPanel } from "@/components/shared/info-panel";
import {
  getMyBookingsFromDb,
  type BookingRecord,
} from "@/lib/bookings/booking-client";

function formatINR(value: number) {
  return `₹${Math.max(0, Math.round(value)).toLocaleString("en-IN")}`;
}

function formatDate(value?: string) {
  if (!value) return "Dates pending";

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

export default function CustomerDashboardPage() {
  const [latestBooking, setLatestBooking] = useState<BookingRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        const result = await getMyBookingsFromDb();
        if (!ignore) {
          setLatestBooking(result[0] ?? null);
        }
      } catch (error) {
        console.error(error);
        if (!ignore) {
          setLatestBooking(null);
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
      title="Customer Dashboard"
      subtitle="This makes the post-booking flow feel complete, exactly as required in the prototype plan."
      sidebar={<CustomerSidebar />}
    >
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          label="Upcoming Trip"
          value={
            loading
              ? "Loading..."
              : latestBooking?.trip.destination || "No trip yet"
          }
          hint={
            latestBooking?.trip.departureDate
              ? `Departure: ${latestBooking.trip.departureDate}`
              : "Departure: Pending"
          }
        />
        <StatCard
          label="Booking Status"
          value={loading ? "Loading..." : latestBooking?.status || "No booking"}
          hint={latestBooking ? latestBooking.bookingRef : "Prototype state"}
        />
        <StatCard
          label="Payment Summary"
          value={
            latestBooking
              ? formatINR(latestBooking.pricing.totalAmount)
              : loading
              ? "Loading..."
              : "₹0"
          }
          hint={latestBooking ? "Final confirmed value" : "No payment data available"}
        />
      </div>

      <InfoPanel title="Upcoming Trip">
        {loading ? (
          <div className="rounded-[24px] bg-slate-50 p-5">Loading trip...</div>
        ) : latestBooking ? (
          <div className="rounded-[24px] bg-slate-50 p-5">
            <p className="text-lg font-semibold text-slate-950">
              {latestBooking.trip.title}
            </p>

            <p className="mt-2 text-sm text-slate-600">
              {latestBooking.trip.durationLabel} • {latestBooking.trip.destination} •{" "}
              {latestBooking.trip.flightLabel || "Without Flight"}
            </p>

            <p className="mt-2 text-sm text-slate-600">
              {latestBooking.trip.rooms ?? 1} Room
              {(latestBooking.trip.rooms ?? 1) > 1 ? "s" : ""} •{" "}
              {latestBooking.trip.adults ?? 0} Adult
              {(latestBooking.trip.adults ?? 0) > 1 ? "s" : ""}
              {latestBooking.trip.children
                ? ` • ${latestBooking.trip.children} Child${
                    latestBooking.trip.children > 1 ? "ren" : ""
                  }`
                : ""}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Booking Date: {formatDate(latestBooking.createdAt)}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/confirmation/${latestBooking.bookingRef}`}
                className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
              >
                View Booking
              </Link>

              <Link
                href="/customer/bookings"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800"
              >
                All Bookings
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-[24px] bg-slate-50 p-5">
            <p className="text-lg font-semibold text-slate-950">No booking yet</p>
            <p className="mt-2 text-sm text-slate-600">
              Once a booking is completed from the review page, the latest trip will show up here automatically.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/trip-builder"
                className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
              >
                Start Planning
              </Link>
            </div>
          </div>
        )}
      </InfoPanel>
    </PortalShell>
  );
}