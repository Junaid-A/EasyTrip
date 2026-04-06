"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type BookingStatus = "pending" | "confirmed" | "cancelled";
export type PaymentStatus = "paid" | "partial" | "refund" | "unpaid";

export type BookingCrmTraveller = {
  id: string;
  name: string;
  age: string;
  type: string;
};

export type BookingCrmPayment = {
  id: string;
  amount: number;
  mode: string;
  date: string;
  note?: string | null;
};

export type BookingCrmNote = {
  id: string;
  text: string;
  createdAt: string;
};

export type BookingCrmTripDay = {
  id: string;
  dayLabel: string;
  title: string;
  city: string;
  description: string;
};

export type BookingCrmPastBooking = {
  bookingRef: string;
  destination: string;
  amount: number;
  createdAt: string;
  status: BookingStatus;
};

export type BookingCrmLog = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  tone?: "default" | "success" | "warning";
};

export type BookingCrmPricing = {
  packageBase: number;
  flights: number;
  hotels: number;
  transfers: number;
  sightseeing: number;
  meals: number;
  serviceFee: number;
  extra: number;
  discount: number;
};

export type BookingCrmInitialData = {
  bookingId: string;
  bookingRef: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  destination: string;

  tripTitle: string;
  departure: string;
  startDate: string;
  endDate: string;
  duration: string;
  rooms: string;
  travellersCount: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;

  pricing: BookingCrmPricing;
  travellers: BookingCrmTraveller[];
  payments: BookingCrmPayment[];
  notes: BookingCrmNote[];
  tripPlan: BookingCrmTripDay[];
  logs: BookingCrmLog[];
  pastBookings: BookingCrmPastBooking[];

  createdAt: string;
  updatedAt: string;
};

export type BookingCrmSaveInput = {
  bookingId: string;
  tripTitle: string;
  destination: string;
  departure: string;
  startDate: string;
  endDate: string;
  duration: string;
  rooms: string;
  travellersCount: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  pricing: BookingCrmPricing;
  travellers: BookingCrmTraveller[];
  tripPlan: BookingCrmTripDay[];
};

type Props = {
  initialData: BookingCrmInitialData;
  onSave?: (input: BookingCrmSaveInput) => Promise<void> | void;
};

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function formatCurrency(value: number) {
  if (!Number.isFinite(value)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function isoDateInput(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function statusPillClasses(status: BookingStatus | PaymentStatus | string) {
  switch (status) {
    case "confirmed":
    case "paid":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "pending":
    case "partial":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "cancelled":
    case "refund":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "unpaid":
      return "border-slate-200 bg-slate-100 text-slate-600";
    default:
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

function logToneClasses(tone?: BookingCrmLog["tone"]) {
  switch (tone) {
    case "success":
      return "text-emerald-700";
    case "warning":
      return "text-amber-700";
    default:
      return "text-slate-800";
  }
}

function numberOrZero(value: number | string) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
      {children}
    </label>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  editable?: boolean;
};

function TextInput({ editable = false, className, ...props }: InputProps) {
  return (
    <input
      {...props}
      readOnly={!editable && props.type !== "hidden"}
      className={cn(
        "h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[15px] text-slate-700 outline-none transition",
        editable
          ? "cursor-text border-slate-300 bg-white focus:border-slate-400"
          : "cursor-default",
        className,
      )}
    />
  );
}

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  editable?: boolean;
};

function TextArea({ editable = false, className, ...props }: TextAreaProps) {
  return (
    <textarea
      {...props}
      readOnly={!editable}
      className={cn(
        "min-h-[120px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] text-slate-700 outline-none transition",
        editable
          ? "cursor-text border-slate-300 bg-white focus:border-slate-400"
          : "cursor-default",
        className,
      )}
    />
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  editable?: boolean;
};

function Select({ editable = false, className, children, ...props }: SelectProps) {
  return (
    <select
      {...props}
      disabled={!editable}
      className={cn(
        "h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[15px] text-slate-700 outline-none transition",
        editable
          ? "cursor-pointer border-slate-300 bg-white focus:border-slate-400"
          : "cursor-default opacity-100",
        className,
      )}
    >
      {children}
    </select>
  );
}

function SectionCard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[32px] border border-[#ded6c9] bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.02)] sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[26px] font-semibold tracking-[-0.03em] text-slate-900">
            {title}
          </h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function BookingCrmWorkspace({ initialData, onSave }: Props) {
  const router = useRouter();

  const [isEditEnabled, setIsEditEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [tripTitle, setTripTitle] = useState(initialData.tripTitle);
  const [destination, setDestination] = useState(initialData.destination);
  const [departure, setDeparture] = useState(initialData.departure);
  const [startDate, setStartDate] = useState(isoDateInput(initialData.startDate));
  const [endDate, setEndDate] = useState(isoDateInput(initialData.endDate));
  const [duration, setDuration] = useState(initialData.duration);
  const [rooms, setRooms] = useState(initialData.rooms);
  const [travellersCount, setTravellersCount] = useState(initialData.travellersCount);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>(initialData.bookingStatus);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(initialData.paymentStatus);

  const [pricing, setPricing] = useState<BookingCrmPricing>(
    initialData.pricing ?? {
      packageBase: 0,
      flights: 0,
      hotels: 0,
      transfers: 0,
      sightseeing: 0,
      meals: 0,
      serviceFee: 0,
      extra: 0,
      discount: 0,
    },
  );

  const [travellers, setTravellers] = useState<BookingCrmTraveller[]>(
    initialData.travellers ?? [],
  );

  const [tripPlan, setTripPlan] = useState<BookingCrmTripDay[]>(
    initialData.tripPlan ?? [],
  );

  const [payments, setPayments] = useState<BookingCrmPayment[]>(
    initialData.payments ?? [],
  );

  const [notes, setNotes] = useState<BookingCrmNote[]>(
    initialData.notes ?? [],
  );

  const [logs, setLogs] = useState<BookingCrmLog[]>(
    initialData.logs ?? [],
  );

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [newNote, setNewNote] = useState("");

  const amountPaid = useMemo(
    () => payments.reduce((sum, item) => sum + numberOrZero(item.amount), 0),
    [payments],
  );

  const tripTotal = useMemo(() => {
    const gross =
      numberOrZero(pricing.packageBase) +
      numberOrZero(pricing.flights) +
      numberOrZero(pricing.hotels) +
      numberOrZero(pricing.transfers) +
      numberOrZero(pricing.sightseeing) +
      numberOrZero(pricing.meals) +
      numberOrZero(pricing.serviceFee) +
      numberOrZero(pricing.extra);

    return Math.max(0, gross - numberOrZero(pricing.discount));
  }, [pricing]);

  const balanceDue = Math.max(0, tripTotal - amountPaid);

  function appendLog(
    title: string,
    description: string,
    tone: BookingCrmLog["tone"] = "default",
  ) {
    const now = new Date().toISOString();

    setLogs((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title,
        description,
        createdAt: now,
        tone,
      },
      ...prev,
    ]);
  }

  function handleEnableEdit() {
    if (isEditEnabled) {
      setIsEditEnabled(false);
      appendLog("EDIT DISABLED", "Edit mode disabled for booking.");
      return;
    }

    const confirmed = window.confirm(
      "Enable edit mode for this booking? Changes will remain local until you save.",
    );

    if (!confirmed) return;

    setIsEditEnabled(true);
    appendLog("EDIT ENABLED", "Edit mode enabled for booking.", "warning");
  }

  async function handleSaveBooking() {
    try {
      setIsSaving(true);

      const payload: BookingCrmSaveInput = {
        bookingId: initialData.bookingId,
        tripTitle,
        destination,
        departure,
        startDate,
        endDate,
        duration,
        rooms,
        travellersCount,
        bookingStatus,
        paymentStatus,
        pricing,
        travellers,
        tripPlan,
      };

      await onSave?.(payload);

      appendLog("BOOKING SAVED", "Booking details updated successfully.", "success");
      setIsEditEnabled(false);
    } finally {
      setIsSaving(false);
    }
  }

  function handleAddPayment() {
    if (!isEditEnabled) return;
    const amount = Number(paymentAmount);

    if (!amount || amount <= 0) {
      window.alert("Enter a valid payment amount.");
      return;
    }

    const createdAt = paymentDate
      ? new Date(`${paymentDate}T12:00:00`).toISOString()
      : new Date().toISOString();

    const record: BookingCrmPayment = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      amount,
      mode: paymentMode,
      date: createdAt,
      note: paymentNote || null,
    };

    setPayments((prev) => [record, ...prev]);
    setPaymentAmount("");
    setPaymentMode("UPI");
    setPaymentDate("");
    setPaymentNote("");

    appendLog(
      "PAYMENT ADDED",
      `Payment added: ${formatCurrency(record.amount)} via ${record.mode}.`,
      "success",
    );
  }

  function handleAddNote() {
    if (!isEditEnabled) return;
    const text = newNote.trim();
    if (!text) return;

    const createdAt = new Date().toISOString();

    setNotes((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text,
        createdAt,
      },
      ...prev,
    ]);

    setNewNote("");
    appendLog("NOTE ADDED", "Internal note added.", "default");
  }

  function updateTraveller(
    travellerId: string,
    field: keyof BookingCrmTraveller,
    value: string,
  ) {
    setTravellers((prev) =>
      prev.map((item) => (item.id === travellerId ? { ...item, [field]: value } : item)),
    );
  }

  function updateTripDay(dayId: string, field: keyof BookingCrmTripDay, value: string) {
    setTripPlan((prev) =>
      prev.map((item) => (item.id === dayId ? { ...item, [field]: value } : item)),
    );
  }

  function updatePricing(field: keyof BookingCrmPricing, value: string) {
    setPricing((prev) => ({
      ...prev,
      [field]: numberOrZero(value),
    }));
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6f1ea_0%,#f7f4ef_45%,#f5f7f8_100%)]">
      <div className="mx-auto max-w-[1580px] px-4 py-5 sm:px-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/bookings")}
            className="inline-flex h-12 items-center rounded-full border border-[#d9d0c2] bg-white px-5 text-[15px] font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            Back to bookings
          </button>

          <div className="flex items-center gap-3">
            {isEditEnabled ? (
              <button
                type="button"
                onClick={handleSaveBooking}
                disabled={isSaving}
                className="inline-flex h-12 items-center rounded-full bg-emerald-600 px-5 text-[15px] font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleEnableEdit}
              className={cn(
                "inline-flex h-12 items-center rounded-full px-5 text-[15px] font-semibold transition",
                isEditEnabled
                  ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  : "bg-[#0a1338] text-white hover:bg-[#131f53]",
              )}
            >
              {isEditEnabled ? "Disable edit" : "Enable edit"}
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <main className="space-y-5">
            <section className="rounded-[34px] border border-[#ded6c9] bg-white p-6 sm:p-7">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-slate-100 px-4 py-2 text-[14px] font-semibold tracking-[0.18em] text-slate-700">
                  {initialData.bookingRef}
                </span>
                <span
                  className={cn(
                    "rounded-full border px-4 py-2 text-[14px] font-semibold uppercase tracking-[0.18em]",
                    statusPillClasses(bookingStatus),
                  )}
                >
                  {bookingStatus}
                </span>
                <span
                  className={cn(
                    "rounded-full border px-4 py-2 text-[14px] font-semibold uppercase tracking-[0.18em]",
                    statusPillClasses(paymentStatus),
                  )}
                >
                  {paymentStatus}
                </span>
                <span className="rounded-full bg-slate-100 px-4 py-2 text-[14px] font-semibold tracking-[0.18em] text-slate-700">
                  TAGS
                </span>
              </div>

              <h1 className="text-[56px] font-semibold leading-none tracking-[-0.05em] text-slate-950">
                {initialData.customerName}
              </h1>

              <div className="mt-5 flex flex-wrap gap-x-7 gap-y-2 text-[17px] text-slate-500">
                <span>{initialData.customerEmail}</span>
                <span>{initialData.customerPhone}</span>
                <span>{destination}</span>
              </div>
            </section>

            <SectionCard title="Trip details">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div>
                  <FieldLabel>Trip title</FieldLabel>
                  <TextInput
                    editable={isEditEnabled}
                    value={tripTitle}
                    onChange={(e) => setTripTitle(e.target.value)}
                  />
                </div>

                <div>
                  <FieldLabel>Destination</FieldLabel>
                  <TextInput
                    editable={isEditEnabled}
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>

                <div>
                  <FieldLabel>Departure</FieldLabel>
                  <TextInput
                    editable={isEditEnabled}
                    value={departure}
                    onChange={(e) => setDeparture(e.target.value)}
                  />
                </div>

                <div>
                  <FieldLabel>Start date</FieldLabel>
                  <TextInput
                    editable={isEditEnabled}
                    type={isEditEnabled ? "date" : "text"}
                    value={isEditEnabled ? startDate : startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <FieldLabel>End date</FieldLabel>
                  <TextInput
                    editable={isEditEnabled}
                    type={isEditEnabled ? "date" : "text"}
                    value={isEditEnabled ? endDate : endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div>
                  <FieldLabel>Duration</FieldLabel>
                  <TextInput
                    editable={isEditEnabled}
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>

                <div>
                  <FieldLabel>Rooms</FieldLabel>
                  <TextInput
                    editable={isEditEnabled}
                    value={rooms}
                    onChange={(e) => setRooms(e.target.value)}
                  />
                </div>

                <div>
                  <FieldLabel>Travellers</FieldLabel>
                  <TextInput
                    editable={isEditEnabled}
                    value={travellersCount}
                    onChange={(e) => setTravellersCount(e.target.value)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                  <div>
                    <FieldLabel>Booking status</FieldLabel>
                    <Select
                      editable={isEditEnabled}
                      value={bookingStatus}
                      onChange={(e) => setBookingStatus(e.target.value as BookingStatus)}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </Select>
                  </div>

                  <div>
                    <FieldLabel>Payment status</FieldLabel>
                    <Select
                      editable={isEditEnabled}
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    >
                      <option value="paid">Paid</option>
                      <option value="partial">Partial</option>
                      <option value="refund">Refund</option>
                      <option value="unpaid">Unpaid</option>
                    </Select>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Pricing" subtitle="Compact commercial edit block.">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <FieldLabel>Package base</FieldLabel>
                  <TextInput
                    editable={isEditEnabled}
                    type="number"
                    value={pricing.packageBase}
                    onChange={(e) => updatePricing("packageBase", e.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel>Flights</FieldLabel>
                  <TextInput
                    editable={isEditEnabled}
                    type="number"
                    value={pricing.flights}
                    onChange={(e) => updatePricing("flights", e.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel>Hotels</FieldLabel>
                  <TextInput
                    editable={isEditEnabled}
                    type="number"
                    value={pricing.hotels}
                    onChange={(e) => updatePricing("hotels", e.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel>Transfers</FieldLabel>
                  <TextInput
                    editable={isEditEnabled}
                    type="number"
                    value={pricing.transfers}
                    onChange={(e) => updatePricing("transfers", e.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel>Sightseeing</FieldLabel>
                  <TextInput
                    editable={isEditEnabled}
                    type="number"
                    value={pricing.sightseeing}
                    onChange={(e) => updatePricing("sightseeing", e.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel>Meals</FieldLabel>
                  <TextInput
                    editable={isEditEnabled}
                    type="number"
                    value={pricing.meals}
                    onChange={(e) => updatePricing("meals", e.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel>Service fee</FieldLabel>
                  <TextInput
                    editable={isEditEnabled}
                    type="number"
                    value={pricing.serviceFee}
                    onChange={(e) => updatePricing("serviceFee", e.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel>Extra</FieldLabel>
                  <TextInput
                    editable={isEditEnabled}
                    type="number"
                    value={pricing.extra}
                    onChange={(e) => updatePricing("extra", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 xl:col-span-1">
                  <FieldLabel>Discount</FieldLabel>
                  <TextInput
                    editable={isEditEnabled}
                    type="number"
                    value={pricing.discount}
                    onChange={(e) => updatePricing("discount", e.target.value)}
                  />
                </div>
              </div>
            </SectionCard>

            <div className="grid gap-5 xl:grid-cols-2">
              <SectionCard title="Travellers">
                <div className="space-y-4">
                  {travellers.map((traveller, index) => (
                    <div
                      key={traveller.id}
                      className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-4"
                    >
                      <div className="mb-4 text-sm font-semibold text-slate-700">
                        Traveller {index + 1}
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <FieldLabel>Name</FieldLabel>
                          <TextInput
                            editable={isEditEnabled}
                            value={traveller.name}
                            onChange={(e) =>
                              updateTraveller(traveller.id, "name", e.target.value)
                            }
                          />
                        </div>

                        <div>
                          <FieldLabel>Age</FieldLabel>
                          <TextInput
                            editable={isEditEnabled}
                            value={traveller.age}
                            onChange={(e) =>
                              updateTraveller(traveller.id, "age", e.target.value)
                            }
                          />
                        </div>

                        <div>
                          <FieldLabel>Type</FieldLabel>
                          <Select
                            editable={isEditEnabled}
                            value={traveller.type}
                            onChange={(e) =>
                              updateTraveller(traveller.id, "type", e.target.value)
                            }
                          >
                            <option value="Adult">Adult</option>
                            <option value="Child">Child</option>
                            <option value="Infant">Infant</option>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Payments and notes">
                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <FieldLabel>Amount</FieldLabel>
                      <TextInput
                        editable={isEditEnabled}
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                      />
                    </div>

                    <div>
                      <FieldLabel>Mode</FieldLabel>
                      <Select
                        editable={isEditEnabled}
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                      >
                        <option value="UPI">UPI</option>
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Card">Card</option>
                      </Select>
                    </div>

                    <div>
                      <FieldLabel>Date</FieldLabel>
                      <TextInput
                        editable={isEditEnabled}
                        type={isEditEnabled ? "date" : "text"}
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        placeholder="dd / mm / yyyy"
                      />
                    </div>

                    <div>
                      <FieldLabel>Note</FieldLabel>
                      <TextInput
                        editable={isEditEnabled}
                        value={paymentNote}
                        onChange={(e) => setPaymentNote(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!isEditEnabled}
                    onClick={handleAddPayment}
                    className="inline-flex h-11 items-center rounded-full bg-[#0a1338] px-5 text-sm font-semibold text-white transition hover:bg-[#131f53] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Add payment
                  </button>

                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <div className="text-[15px] font-semibold text-slate-900">
                          {formatCurrency(payment.amount)} · {payment.mode}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          {formatDateTime(payment.date)}
                        </div>
                        {payment.note ? (
                          <div className="mt-1 text-sm text-slate-600">{payment.note}</div>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  <div>
                    <FieldLabel>New note</FieldLabel>
                    <TextArea
                      editable={isEditEnabled}
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add internal note..."
                    />
                  </div>

                  <button
                    type="button"
                    disabled={!isEditEnabled}
                    onClick={handleAddNote}
                    className="inline-flex h-11 items-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Add note
                  </button>

                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <div className="text-[15px] text-slate-700">{note.text}</div>
                        <div className="mt-1 text-sm text-slate-500">
                          {formatDateTime(note.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
            </div>

            <SectionCard
              title="Trip plan"
              subtitle="Compact day cards first. Use builder only if deeper customization is needed."
              action={
                <button
                  type="button"
                  className="inline-flex h-11 items-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Open trip builder
                </button>
              }
            >
              <div className="space-y-4">
                {tripPlan.map((day) => (
                  <div
                    key={day.id}
                    className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-4"
                  >
                    <div className="mb-4 text-sm font-semibold text-slate-700">
                      {day.dayLabel}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <FieldLabel>Title</FieldLabel>
                        <TextInput
                          editable={isEditEnabled}
                          value={day.title}
                          onChange={(e) => updateTripDay(day.id, "title", e.target.value)}
                        />
                      </div>

                      <div>
                        <FieldLabel>City</FieldLabel>
                        <TextInput
                          editable={isEditEnabled}
                          value={day.city}
                          onChange={(e) => updateTripDay(day.id, "city", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <FieldLabel>Description</FieldLabel>
                      <TextArea
                        editable={isEditEnabled}
                        value={day.description}
                        onChange={(e) =>
                          updateTripDay(day.id, "description", e.target.value)
                        }
                        className="min-h-[110px]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Past bookings">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {(initialData.pastBookings ?? []).length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    No past bookings found.
                  </div>
                ) : (
                  (initialData.pastBookings ?? []).map((item) => (
                    <div
                      key={item.bookingRef}
                      className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm font-semibold text-slate-800">
                          {item.bookingRef}
                        </div>
                        <span
                          className={cn(
                            "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                            statusPillClasses(item.status),
                          )}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="mt-3 text-[15px] text-slate-700">{item.destination}</div>
                      <div className="mt-1 text-sm text-slate-500">
                        {formatDateTime(item.createdAt)}
                      </div>
                      <div className="mt-4 text-right text-lg font-semibold text-slate-900">
                        {formatCurrency(item.amount)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SectionCard>
          </main>

          <aside className="xl:pl-2">
            <div className="space-y-5 xl:sticky xl:top-5">
              <section className="rounded-[32px] border border-[#ded6c9] bg-white p-6">
                <h3 className="text-[22px] font-semibold tracking-[-0.03em] text-slate-900">
                  Summary
                </h3>

                <div className="mt-6 divide-y divide-slate-200">
                  <div className="flex items-center justify-between py-4">
                    <span className="text-[18px] text-slate-500">Trip total</span>
                    <span className="text-[18px] font-semibold text-slate-900">
                      {formatCurrency(tripTotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <span className="text-[18px] text-slate-500">Amount paid</span>
                    <span className="text-[18px] font-semibold text-slate-900">
                      {formatCurrency(amountPaid)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <span className="text-[18px] text-slate-500">Balance due</span>
                    <span className="text-[18px] font-semibold text-slate-900">
                      {formatCurrency(balanceDue)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <span className="text-[18px] text-slate-500">Created</span>
                    <span className="text-[18px] font-semibold text-slate-900">
                      {formatDateTime(initialData.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <span className="text-[18px] text-slate-500">Updated</span>
                    <span className="text-[18px] font-semibold text-slate-900">
                      {formatDateTime(initialData.updatedAt)}
                    </span>
                  </div>
                </div>
              </section>

              <section className="rounded-[32px] border border-[#ded6c9] bg-white p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h3 className="text-[22px] font-semibold tracking-[-0.03em] text-slate-900">
                    Logs
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const content = logs
                        .map(
                          (log) =>
                            `${log.title}\n${log.description}\n${formatDateTime(log.createdAt)}`,
                        )
                        .join("\n\n----------------\n\n");

                      window.alert(content || "No logs available.");
                    }}
                    className="text-sm font-semibold text-slate-600 transition hover:text-slate-900"
                  >
                    View all
                  </button>
                </div>

                <div className="space-y-3">
                  {logs.slice(0, 4).map((log) => (
                    <div
                      key={log.id}
                      className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4"
                    >
                      <div
                        className={cn(
                          "text-[12px] font-bold uppercase tracking-[0.22em]",
                          logToneClasses(log.tone),
                        )}
                      >
                        {log.title}
                      </div>
                      <div className="mt-2 text-[15px] text-slate-800">{log.description}</div>
                      <div className="mt-2 text-sm text-slate-500">
                        {formatDateTime(log.createdAt)}
                      </div>
                    </div>
                  ))}

                  {logs.length === 0 ? (
                    <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                      No logs available.
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}