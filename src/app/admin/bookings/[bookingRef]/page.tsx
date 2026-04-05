import Link from "next/link";
import { notFound } from "next/navigation";
import { PortalShell } from "@/components/shared/portal-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";
import { createClient } from "@/lib/supabase/server";

function formatINR(value: number) {
  return `₹${Math.max(0, Math.round(value)).toLocaleString("en-IN")}`;
}

function formatDate(value?: string) {
  if (!value) return "Pending";

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

type BookingTraveller = {
  id: string;
  name: string;
  age: string;
  gender: string;
};

type BookingAddon = {
  id: string;
  title: string;
  description?: string;
  price: number;
  type?: string;
};

type BookingDay = {
  id: string;
  dayLabel: string;
  dateText?: string;
  city: string;
  title: string;
  description: string;
  transfer?: string;
  hotel?: string;
  activities: string[];
  meals: string[];
  extras: string[];
};

type BookingDetailRow = {
  id: string;
  booking_ref: string;
  created_at: string;
  status: string | null;
  user_id: string | null;

  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;

  trip_title: string | null;
  destination: string | null;
  nights: string | null;
  duration_label: string | null;
  departure_date: string | null;
  package_type: string | null;
  image: string | null;
  flight_label: string | null;
  rooms: number | null;
  adults: number | null;
  children: number | null;

  gst_state: string | null;
  special_request: string | null;

  travellers: BookingTraveller[] | null;
  addons: BookingAddon[] | null;
  itinerary: BookingDay[] | null;

  pricing:
    | {
        packageBase?: number;
        flightTotal?: number;
        hotelTotal?: number;
        transferTotal?: number;
        sightseeingTotal?: number;
        mealsAndExtrasTotal?: number;
        reviewAddonsTotal?: number;
        serviceFee?: number;
        totalAmount?: number;
      }
    | null;

  meta: {
    gstState?: string;
    specialRequest?: string;
    selectedExtras?: string[];
    selectedAddOns?: string[];
    selectedAddonIds?: string[];
    bookingSource?: string;
  } | null;

  total_amount: number | null;
};

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ bookingRef: string }>;
}) {
  const { bookingRef } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("booking_ref", bookingRef)
    .single();

  if (error || !data) {
    notFound();
  }

  const booking = data as BookingDetailRow;

  const pricingTotal =
    booking.pricing &&
    typeof booking.pricing === "object" &&
    typeof booking.pricing.totalAmount === "number"
      ? booking.pricing.totalAmount
      : 0;

  const totalAmount =
    pricingTotal ||
    (typeof booking.total_amount === "number" ? booking.total_amount : 0);

  const allSelectedExtras = [
    ...((booking.meta?.selectedExtras ?? []) as string[]),
    ...((booking.meta?.selectedAddOns ?? []) as string[]),
    ...((booking.addons ?? []).map((addon) => addon.title)),
  ];

  return (
    <PortalShell
      title={`Booking ${booking.booking_ref}`}
      subtitle="Admin detail view for customer, trip, pricing, and itinerary review."
      sidebar={<AdminSidebar />}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <InfoPanel title="Booking Summary">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard label="Booking Ref" value={booking.booking_ref} />
              <InfoCard label="Status" value={booking.status || "pending"} />
              <InfoCard
                label="Created On"
                value={formatDate(booking.created_at)}
              />
              <InfoCard label="User ID" value={booking.user_id || "N/A"} />
              <InfoCard
                label="Trip"
                value={booking.trip_title || "Untitled Trip"}
              />
              <InfoCard
                label="Destination"
                value={booking.destination || "Pending"}
              />
              <InfoCard
                label="Duration"
                value={booking.duration_label || booking.nights || "Pending"}
              />
              <InfoCard
                label="Departure"
                value={booking.departure_date || "Pending"}
              />
              <InfoCard
                label="Package Type"
                value={booking.package_type || "Pending"}
              />
              <InfoCard
                label="Flights"
                value={booking.flight_label || "Without Flight"}
              />
              <InfoCard
                label="Rooms"
                value={`${booking.rooms ?? 1} Room${(booking.rooms ?? 1) > 1 ? "s" : ""}`}
              />
              <InfoCard
                label="Travellers"
                value={`${booking.adults ?? 0} Adult${(booking.adults ?? 0) > 1 ? "s" : ""}${booking.children ? `, ${booking.children} Child${booking.children > 1 ? "ren" : ""}` : ""}`}
              />
            </div>
          </InfoPanel>

          <InfoPanel title="Customer Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard
                label="Customer Name"
                value={booking.customer_name || "Guest"}
              />
              <InfoCard
                label="Customer Email"
                value={booking.customer_email || "No email"}
              />
              <InfoCard
                label="Customer Phone"
                value={booking.customer_phone || "No phone"}
              />
              <InfoCard
                label="GST State"
                value={booking.gst_state || booking.meta?.gstState || "Not provided"}
              />
            </div>

            <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Special Request</p>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-900">
                {booking.special_request ||
                  booking.meta?.specialRequest ||
                  "No special requests"}
              </p>
            </div>
          </InfoPanel>

          <InfoPanel title="Traveller Details">
            {booking.travellers && booking.travellers.length > 0 ? (
              <div className="space-y-3">
                {booking.travellers.map((traveller, index) => (
                  <div
                    key={traveller.id || `${traveller.name}-${index}`}
                    className="rounded-[20px] border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      Traveller {index + 1}
                    </p>
                    <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                      <InfoMini label="Name" value={traveller.name} />
                      <InfoMini label="Age" value={traveller.age} />
                      <InfoMini label="Gender" value={traveller.gender} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600">No traveller records found.</p>
            )}
          </InfoPanel>

          <InfoPanel title="Add-ons and Extras">
            {allSelectedExtras.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {allSelectedExtras.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600">No add-ons or extras selected.</p>
            )}
          </InfoPanel>

          <InfoPanel title="Itinerary">
            {booking.itinerary && booking.itinerary.length > 0 ? (
              <div className="space-y-4">
                {booking.itinerary.map((day) => (
                  <div
                    key={day.id}
                    className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-700">
                          {day.dayLabel}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-slate-950">
                          {day.title}
                        </h3>
                      </div>
                      <div className="text-sm text-slate-500">
                        {day.city}
                        {day.dateText ? ` • ${day.dateText}` : ""}
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {day.description}
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <InfoMini label="Hotel" value={day.hotel || "—"} />
                      <InfoMini label="Transfer" value={day.transfer || "—"} />
                      <InfoMini
                        label="Activities"
                        value={day.activities?.length ? day.activities.join(", ") : "—"}
                      />
                      <InfoMini
                        label="Meals"
                        value={day.meals?.length ? day.meals.join(", ") : "—"}
                      />
                      <InfoMini
                        label="Extras"
                        value={day.extras?.length ? day.extras.join(", ") : "—"}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600">No itinerary data found.</p>
            )}
          </InfoPanel>
        </div>

        <div className="space-y-6">
          <InfoPanel title="Pricing">
            <div className="space-y-3 text-sm">
              <PriceRow
                label="Package Base"
                value={booking.pricing?.packageBase ?? 0}
              />
              <PriceRow
                label="Flights"
                value={booking.pricing?.flightTotal ?? 0}
              />
              <PriceRow
                label="Hotels"
                value={booking.pricing?.hotelTotal ?? 0}
              />
              <PriceRow
                label="Transfers"
                value={booking.pricing?.transferTotal ?? 0}
              />
              <PriceRow
                label="Sightseeing"
                value={booking.pricing?.sightseeingTotal ?? 0}
              />
              <PriceRow
                label="Meals & Extras"
                value={booking.pricing?.mealsAndExtrasTotal ?? 0}
              />
              <PriceRow
                label="Review Add-ons"
                value={booking.pricing?.reviewAddonsTotal ?? 0}
              />
              <PriceRow
                label="Service Fee"
                value={booking.pricing?.serviceFee ?? 0}
              />

              <div className="my-3 border-t border-slate-200" />

              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-slate-950">
                  Total Amount
                </span>
                <span className="text-lg font-semibold text-slate-950">
                  {formatINR(totalAmount)}
                </span>
              </div>
            </div>
          </InfoPanel>

          <InfoPanel title="Actions">
            <div className="flex flex-col gap-3">
              <Link
                href="/admin/bookings"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Back to Bookings
              </Link>

              <Link
                href={`/confirmation/${booking.booking_ref}`}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Open Customer Confirmation
              </Link>
            </div>
          </InfoPanel>
        </div>
      </div>
    </PortalShell>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function InfoMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-slate-200 bg-white p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function PriceRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-600">{label}</span>
      <span className="font-medium text-slate-950">{formatINR(value)}</span>
    </div>
  );
}