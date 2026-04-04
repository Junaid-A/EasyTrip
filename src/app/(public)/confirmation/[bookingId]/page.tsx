"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import {
  getBookingByRefFromDb,
  type BookingRecord,
} from "@/lib/bookings/booking-client";

function formatINR(value: number) {
  return `₹${Math.max(0, Math.round(value)).toLocaleString("en-IN")}`;
}

export default function ConfirmationPage() {
  const params = useParams();
  const bookingRef = String(params.bookingId ?? "");

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        const result = await getBookingByRefFromDb(bookingRef);
        if (!ignore) {
          setBooking(result);
        }
      } catch (error) {
        console.error(error);
        if (!ignore) {
          setBooking(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    if (bookingRef) {
      load();
    } else {
      setLoading(false);
    }

    return () => {
      ignore = true;
    };
  }, [bookingRef]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f8fafc_35%,#ffffff_100%)]">
        <PublicHeader />
        <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="rounded-[40px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-10 lg:p-12">
            Loading booking...
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f8fafc_35%,#ffffff_100%)]">
        <PublicHeader />

        <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="rounded-[40px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-10 lg:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-3xl ring-1 ring-rose-200">
              !
            </div>

            <span className="mt-6 inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-700">
              Booking not found
            </span>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              We could not find this booking
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              This booking reference does not exist or is not accessible in your account.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/review"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Back to Review
              </Link>

              <Link
                href="/trip-builder"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Start Again
              </Link>
            </div>
          </div>
        </main>

        <PublicFooter />
      </div>
    );
  }

  const travellerSummary = `${booking.trip.adults ?? 0} Adult${
    (booking.trip.adults ?? 0) > 1 ? "s" : ""
  }${
    booking.trip.children
      ? `, ${booking.trip.children} Child${
          booking.trip.children > 1 ? "ren" : ""
        }`
      : ""
  }`;

  const allSelectedExtras = [
    ...(booking.meta?.selectedExtras ?? []),
    ...(booking.meta?.selectedAddOns ?? []),
    ...booking.addons.map((addon) => addon.title),
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f8fafc_35%,#ffffff_100%)]">
      <PublicHeader />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
          <div className="relative min-h-[240px] overflow-hidden sm:min-h-[320px]">
            <img
              src={
                booking.trip.image ||
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop"
              }
              alt={booking.trip.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.18)_0%,rgba(15,23,42,0.72)_100%)]" />

            <div className="absolute left-4 top-4 z-10">
              <span className="rounded-full border border-white/20 bg-white/12 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                {booking.bookingRef}
              </span>
            </div>

            <div className="absolute right-4 top-4 z-10">
              <span className="rounded-full border border-white/20 bg-white/12 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                {booking.status}
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-3xl text-slate-950 ring-1 ring-white/50">
                ✓
              </div>

              <span className="mt-5 inline-flex rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur">
                Booking Confirmed
              </span>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Your booking has been received
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
                We’ve saved your selected trip, travellers, pricing, and preferences under this booking reference.
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-5">
              <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 sm:p-6">
                <h2 className="text-xl font-semibold text-slate-950">
                  Trip Summary
                </h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <InfoCard label="Trip" value={booking.trip.title} />
                  <InfoCard
                    label="Destination"
                    value={booking.trip.destination}
                  />
                  <InfoCard
                    label="Duration"
                    value={booking.trip.durationLabel}
                  />
                  <InfoCard
                    label="Departure"
                    value={booking.trip.departureDate || "Pending"}
                  />
                  <InfoCard
                    label="Flights"
                    value={booking.trip.flightLabel || "Without Flight"}
                  />
                  <InfoCard
                    label="Rooms"
                    value={`${booking.trip.rooms ?? 1} Room${
                      (booking.trip.rooms ?? 1) > 1 ? "s" : ""
                    }`}
                  />
                  <InfoCard label="Travellers" value={travellerSummary} />
                  <InfoCard
                    label="Booked On"
                    value={new Date(booking.createdAt).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  />
                </div>
              </section>

              <section className="rounded-[28px] border border-slate-200 bg-white p-5 sm:p-6">
                <h2 className="text-xl font-semibold text-slate-950">
                  Traveller Details
                </h2>

                <div className="mt-4 grid gap-3">
                  {booking.travellers.map((traveller, index) => (
                    <div
                      key={traveller.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        Traveller {index + 1}
                      </p>
                      <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                            Name
                          </p>
                          <p className="mt-1 font-medium text-slate-900">
                            {traveller.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                            Age
                          </p>
                          <p className="mt-1 font-medium text-slate-900">
                            {traveller.age}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                            Gender
                          </p>
                          <p className="mt-1 font-medium text-slate-900">
                            {traveller.gender}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[28px] border border-slate-200 bg-white p-5 sm:p-6">
                <h2 className="text-xl font-semibold text-slate-950">
                  Contact & Preferences
                </h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <InfoCard
                    label="Customer Name"
                    value={booking.customer.name || "Guest User"}
                  />
                  <InfoCard label="Email" value={booking.customer.email} />
                  <InfoCard label="Phone" value={booking.customer.phone} />
                  <InfoCard
                    label="GST State"
                    value={booking.meta?.gstState || "Not provided"}
                  />
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Special Request</p>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-900">
                    {booking.meta?.specialRequest?.trim() || "No special requests"}
                  </p>
                </div>
              </section>

              <section className="rounded-[28px] border border-slate-200 bg-white p-5 sm:p-6">
                <h2 className="text-xl font-semibold text-slate-950">
                  Selected Add-ons
                </h2>

                <div className="mt-4 flex flex-wrap gap-2">
                  {allSelectedExtras.length > 0 ? (
                    allSelectedExtras.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No add-ons or extras selected.
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-[28px] border border-slate-200 bg-white p-5 sm:p-6">
                <h2 className="text-xl font-semibold text-slate-950">
                  Itinerary Snapshot
                </h2>

                <div className="mt-4 space-y-3">
                  {booking.itinerary.map((day) => (
                    <div
                      key={day.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                          {day.dayLabel}
                        </span>
                        <span className="text-sm text-slate-500">
                          {day.dateText || day.city}
                        </span>
                      </div>

                      <h3 className="mt-3 text-base font-semibold text-slate-950">
                        {day.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {day.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Booking Value
                </p>
                <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
                  {formatINR(booking.pricing.totalAmount)}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Final amount captured at confirmation stage.
                </p>

                <div className="mt-5 space-y-3 border-t border-slate-200 pt-4">
                  <PriceRow
                    label="Package Base"
                    value={formatINR(booking.pricing.packageBase)}
                  />
                  <PriceRow
                    label="Flight"
                    value={formatINR(booking.pricing.flightTotal)}
                  />
                  <PriceRow
                    label="Hotel"
                    value={formatINR(booking.pricing.hotelTotal)}
                  />
                  <PriceRow
                    label="Transfer"
                    value={formatINR(booking.pricing.transferTotal)}
                  />
                  <PriceRow
                    label="Sightseeing"
                    value={formatINR(booking.pricing.sightseeingTotal)}
                  />
                  <PriceRow
                    label="Meals / Extras"
                    value={formatINR(booking.pricing.mealsAndExtrasTotal)}
                  />
                  <PriceRow
                    label="Review Add-ons"
                    value={formatINR(booking.pricing.reviewAddonsTotal)}
                  />
                  <PriceRow
                    label="Service Fee"
                    value={formatINR(booking.pricing.serviceFee)}
                  />

                  <div className="border-t border-slate-200 pt-3">
                    <PriceRow
                      label="Final Total"
                      value={formatINR(booking.pricing.totalAmount)}
                      strong
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
                <div className="space-y-3">
                  <Link
                    href="/customer/bookings"
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Go to My Bookings
                  </Link>

                  <Link
                    href="/trip-builder"
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    Start Another Trip
                  </Link>

                  <Link
                    href="/"
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] bg-white p-5 ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function PriceRow({
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
            ? "text-sm font-semibold text-slate-950"
            : "text-sm font-medium text-slate-950"
        }
      >
        {value}
      </span>
    </div>
  );
}