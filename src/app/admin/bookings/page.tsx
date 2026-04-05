import Link from "next/link";
import { PortalShell } from "@/components/shared/portal-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";
import { createClient } from "@/lib/supabase/server";

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

type AdminBookingRow = {
  id: string;
  booking_ref: string;
  created_at: string;
  status: string | null;

  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;

  trip_title: string | null;
  destination: string | null;
  duration_label: string | null;
  departure_date: string | null;
  flight_label: string | null;

  pricing: {
    totalAmount?: number;
  } | null;

  total_amount: number | null;
};

export default async function AdminBookingsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
        id,
        booking_ref,
        created_at,
        status,
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
      `
    )
    .order("created_at", { ascending: false });

  const bookings: AdminBookingRow[] = error ? [] : (data ?? []);

  return (
    <PortalShell
      title="Admin Bookings"
      subtitle="All live bookings from Supabase with direct access to customer and trip details."
      sidebar={<AdminSidebar />}
    >
      <InfoPanel title="Bookings Master List">
        {error ? (
          <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-6">
            <p className="text-lg font-semibold text-rose-900">
              Could not load bookings
            </p>
            <p className="mt-2 text-sm text-rose-700">{error.message}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-6">
            <p className="text-lg font-semibold text-slate-950">
              No bookings found
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Bookings created from the review flow will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const pricingTotal =
                booking.pricing &&
                typeof booking.pricing === "object" &&
                typeof booking.pricing.totalAmount === "number"
                  ? booking.pricing.totalAmount
                  : 0;

              const amount =
                pricingTotal ||
                (typeof booking.total_amount === "number"
                  ? booking.total_amount
                  : 0);

              return (
                <div
                  key={booking.id}
                  className="rounded-[24px] border border-slate-200 bg-white p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-lg font-semibold text-slate-950">
                        {booking.trip_title || "Untitled Trip"}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        {booking.booking_ref}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {booking.customer_name || "Guest"} •{" "}
                        {booking.customer_email || "No email"} •{" "}
                        {booking.customer_phone || "No phone"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {booking.destination || "Destination pending"} •{" "}
                        {booking.duration_label || "Duration pending"} •{" "}
                        {booking.departure_date || "Dates pending"}
                      </p>
                    </div>

                    <div className="text-left lg:text-right">
                      <p className="text-sm text-slate-500">Booking Value</p>
                      <p className="mt-1 text-lg font-semibold text-slate-950">
                        {formatINR(amount)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(booking.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
                      {booking.status || "pending"}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                      {booking.flight_label || "Without Flight"}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={`/admin/bookings/${booking.booking_ref}`}
                      className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Open Booking
                    </Link>

                    <Link
                      href={`/confirmation/${booking.booking_ref}`}
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                    >
                      Customer Confirmation
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </InfoPanel>
    </PortalShell>
  );
}