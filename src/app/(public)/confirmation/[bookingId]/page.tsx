"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import {
  getMyBookingsFromDb,
  type BookingRecord,
} from "@/lib/bookings/booking-client";

function formatINR(value?: number) {
  return `₹${Math.max(0, Math.round(value ?? 0)).toLocaleString("en-IN")}`;
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

export default function ConfirmationPage() {
  const params = useParams<{ bookingId: string }>();
  const router = useRouter();

  const bookingId =
    typeof params?.bookingId === "string" ? params.bookingId : "";

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let ignore = false;

    async function loadBooking() {
      try {
        setLoading(true);
        setNotFound(false);

        const bookings = await getMyBookingsFromDb();
        const matched =
          bookings.find((item) => item.bookingRef === bookingId) ?? null;

        if (!ignore) {
          setBooking(matched);
          setNotFound(!matched);
        }
      } catch (error) {
        console.error(error);
        if (!ignore) {
          setBooking(null);
          setNotFound(true);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    if (bookingId) {
      loadBooking();
    } else {
      setLoading(false);
      setNotFound(true);
    }

    return () => {
      ignore = true;
    };
  }, [bookingId]);

  useEffect(() => {
    if (loading || !booking) return;

    setCountdown(3);

    const tickInterval = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(tickInterval);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    const redirectTimer = window.setTimeout(() => {
      router.push("/customer/dashboard");
      router.refresh();
    }, 3000);

    return () => {
      window.clearInterval(tickInterval);
      window.clearTimeout(redirectTimer);
    };
  }, [loading, booking, router]);

  const travellerSummary = useMemo(() => {
    if (!booking) return "Traveller details unavailable";

    const adults = booking.trip.adults ?? 0;
    const children = booking.trip.children ?? 0;
    const rooms = booking.trip.rooms ?? 1;

    return `${rooms} Room${rooms > 1 ? "s" : ""} • ${adults} Adult${
      adults > 1 ? "s" : ""
    }${children ? ` • ${children} Child${children > 1 ? "ren" : ""}` : ""}`;
  }, [booking]);

  return (
    <div className="min-h-screen bg-[#f3f3f3] text-slate-950">
      <PublicHeader />

      <main className="pb-16 pt-24 sm:pt-28 lg:pt-32">
        <section className="mx-auto max-w-5xl px-3 sm:px-6 lg:px-8">
          {loading ? (
            <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
              <p className="text-lg font-semibold text-slate-950">
                Loading confirmation...
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Please wait while we fetch your booking details.
              </p>
            </div>
          ) : notFound || !booking ? (
            <div className="rounded-[28px] border border-rose-200 bg-white p-8 shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
              <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                Booking not found
              </div>

              <h1 className="mt-5 text-3xl font-semibold text-slate-950">
                We could not find this confirmation
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                The booking may not exist, may not belong to the currently logged-in
                customer, or may not have been saved correctly.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/customer/dashboard"
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/customer/bookings"
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  View My Bookings
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
                <div className="bg-[#0d3558] px-5 py-8 text-white sm:px-8">
                  <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
                    Booking Confirmed
                  </div>

                  <h1 className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl">
                    Your trip is confirmed
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
                    Confirmation has been generated successfully. You will be redirected
                    to your customer dashboard in {countdown} second
                    {countdown === 1 ? "" : "s"}.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/85">
                    <span>{booking.bookingRef}</span>
                    <span>•</span>
                    <span>{booking.trip.destination}</span>
                    <span>•</span>
                    <span>{booking.trip.durationLabel}</span>
                    <span>•</span>
                    <span>{booking.trip.flightLabel || "Without Flight"}</span>
                  </div>
                </div>

                <div className="grid gap-5 px-5 py-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="space-y-5">
                    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
                      <img
                        src={
                          booking.trip.image ||
                          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop"
                        }
                        alt={booking.trip.title}
                        className="h-[240px] w-full object-cover"
                      />
                      <div className="p-5">
                        <p className="text-2xl font-semibold text-slate-950">
                          {booking.trip.title}
                        </p>

                        <p className="mt-2 text-sm text-slate-600">
                          {booking.trip.destination} • {booking.trip.durationLabel} •{" "}
                          {booking.trip.departureDate || "Dates pending"}
                        </p>

                        <p className="mt-2 text-sm text-slate-600">
                          {travellerSummary}
                        </p>

                        <p className="mt-2 text-sm text-slate-500">
                          Booking created on {formatDate(booking.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                      <p className="text-lg font-semibold text-slate-950">
                        Traveller details
                      </p>

                      <div className="mt-4 grid gap-3">
                        {booking.travellers?.length ? (
                          booking.travellers.map((traveller) => (
                            <div
                              key={traveller.id}
                              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                            >
                              <p className="font-semibold text-slate-900">
                                {traveller.name}
                              </p>
                              <p className="mt-1 text-sm text-slate-600">
                                Age: {traveller.age} • Gender: {traveller.gender}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            No traveller data available.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                      <p className="text-lg font-semibold text-slate-950">
                        Itinerary snapshot
                      </p>

                      <div className="mt-4 space-y-3">
                        {booking.itinerary?.length ? (
                          booking.itinerary.map((day) => (
                            <div
                              key={day.id}
                              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                                  {day.dayLabel}
                                </span>
                                <span className="text-sm text-slate-500">
                                  {day.dateText || day.city}
                                </span>
                              </div>

                              <p className="mt-3 font-semibold text-slate-900">
                                {day.title}
                              </p>

                              <p className="mt-1 text-sm leading-6 text-slate-600">
                                {day.description}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            No itinerary data available.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <aside className="space-y-4">
                    <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Booking summary
                      </p>

                      <div className="mt-4 space-y-3">
                        <SummaryRow label="Booking Ref" value={booking.bookingRef} />
                        <SummaryRow
                          label="Status"
                          value={booking.status || "confirmed"}
                        />
                        <SummaryRow
                          label="Departure"
                          value={booking.trip.departureDate || "Pending"}
                        />
                        <SummaryRow
                          label="Flights"
                          value={booking.trip.flightLabel || "Without Flight"}
                        />
                        <SummaryRow
                          label="Total"
                          value={formatINR(booking.pricing?.totalAmount)}
                          strong
                        />
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        What happens next
                      </p>

                      <div className="mt-4 space-y-3 text-sm text-slate-600">
                        <p>• Your booking is saved successfully.</p>
                        <p>• It is visible in your customer dashboard.</p>
                        <p>• It is also visible in admin booking views.</p>
                        <p>• Redirecting automatically in {countdown} second{countdown === 1 ? "" : "s"}.</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Link
                        href="/customer/dashboard"
                        className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        Go to Dashboard Now
                      </Link>

                      <Link
                        href="/customer/bookings"
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                      >
                        View All Bookings
                      </Link>
                    </div>
                  </aside>
                </div>
              </section>
            </div>
          )}
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span
        className={
          strong
            ? "text-sm font-semibold text-slate-800"
            : "text-sm text-slate-500"
        }
      >
        {label}
      </span>
      <span
        className={
          strong
            ? "text-sm font-semibold text-slate-950 text-right"
            : "text-sm font-medium text-slate-950 text-right"
        }
      >
        {value}
      </span>
    </div>
  );
}