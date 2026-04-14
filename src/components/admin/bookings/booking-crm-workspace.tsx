"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type BookingStatus = "pending" | "confirmed" | "cancelled";
export type PaymentStatus = "unpaid" | "partial" | "paid" | "refunded";

export type BookingTraveller = {
  id: string;
  name: string;
  age: string;
  gender: string;
};

export type BookingPayment = {
  id: string;
  amount: number;
  mode: string;
  date: string;
  note?: string | null;
};

export type BookingNote = {
  id: string;
  text: string;
  createdAt: string;
};

export type BookingItineraryItem = {
  id: string;
  day: number;
  title: string;
  city: string;
  description: string;
};

export type PastBookingItem = {
  id: string;
  bookingRef: string;
  destination: string;
  status: BookingStatus;
  totalAmount: number;
  createdAt: string;
};

export type BookingActivityLog = {
  id: string;
  createdAt: string;
  actorName: string;
  actorId: string;
  action: string;
  entityType: string;
  summary: string;
  changes: Array<{
    field: string;
    before: string | null;
    after: string | null;
  }>;
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
  createdAt: string;
  updatedAt: string;

  tripTitle: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  alternatePhone: string;
  whatsappNumber: string;

  destination: string;
  departure: string;
  startDate: string;
  endDate: string;
  duration: string;
  rooms: string;
  travellersCount: string;

  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;

  totalAmount: number;
  amountPaid: number;

  tags: string[];
  notes: BookingNote[];
  payments: BookingPayment[];
  travellers: BookingTraveller[];
  itinerary: BookingItineraryItem[];

  pricing: BookingCrmPricing;
  activityLogs: BookingActivityLog[];
  pastBookings: PastBookingItem[];
};

export type BookingCrmSaveInput = {
  bookingId: string;
  bookingRef: string;

  tripTitle: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  alternatePhone: string;
  whatsappNumber: string;

  destination: string;
  departure: string;
  startDate: string;
  endDate: string;
  duration: string;
  rooms: string;
  travellersCount: string;

  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;

  tags: string[];
  notes: BookingNote[];
  payments: BookingPayment[];
  travellers: BookingTraveller[];
  itinerary: BookingItineraryItem[];

  pricing: BookingCrmPricing;

  changes: Array<{
    field: string;
    before: string | null;
    after: string | null;
  }>;
  pendingLogs: Array<{
    action: string;
    entityType: string;
    summary: string;
    changes: Array<{
      field: string;
      before: string | null;
      after: string | null;
    }>;
  }>;
};

type LogActionInput = {
  bookingId: string;
  bookingRef: string;
  action: string;
  entityType: string;
  summary: string;
  changes?: Array<{
    field: string;
    before: string | null;
    after: string | null;
  }>;
};

type Props = {
  initialData: BookingCrmInitialData;
  onSave?: (
    input: BookingCrmSaveInput,
  ) =>
    | Promise<{
        ok?: boolean;
        message?: string;
        logs?: BookingActivityLog[];
        data?: BookingCrmInitialData;
      } | void>
    | {
        ok?: boolean;
        message?: string;
        logs?: BookingActivityLog[];
        data?: BookingCrmInitialData;
      }
    | void;
  onLog?: (
    input: LogActionInput,
  ) =>
    | Promise<{
        ok?: boolean;
        message?: string;
        log?: BookingActivityLog;
      } | void>
    | {
        ok?: boolean;
        message?: string;
        log?: BookingActivityLog;
      }
    | void;
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
    case "refunded":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "unpaid":
      return "border-slate-200 bg-slate-100 text-slate-600";
    default:
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

function actionToneClasses(action: string) {
  if (action.includes("saved") || action.includes("payment") || action.includes("confirmed")) {
    return "text-emerald-700";
  }
  if (action.includes("edit") || action.includes("cancel")) {
    return "text-amber-700";
  }
  return "text-slate-800";
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

function buildChanges(
  initialData: BookingCrmInitialData,
  current: {
    tripTitle: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    alternatePhone: string;
    whatsappNumber: string;
    destination: string;
    departure: string;
    startDate: string;
    endDate: string;
    duration: string;
    rooms: string;
    travellersCount: string;
    bookingStatus: BookingStatus;
    paymentStatus: PaymentStatus;
    tags: string[];
    pricing: BookingCrmPricing;
  },
) {
  const changes: Array<{
    field: string;
    before: string | null;
    after: string | null;
  }> = [];

  const pushChange = (field: string, before: string, after: string) => {
    if (before !== after) {
      changes.push({ field, before, after });
    }
  };

  pushChange("trip_title", initialData.tripTitle, current.tripTitle);
  pushChange("customer_name", initialData.customerName, current.customerName);
  pushChange("customer_email", initialData.customerEmail, current.customerEmail);
  pushChange("customer_phone", initialData.customerPhone, current.customerPhone);
  pushChange("alternate_phone", initialData.alternatePhone, current.alternatePhone);
  pushChange("whatsapp_number", initialData.whatsappNumber, current.whatsappNumber);
  pushChange("destination", initialData.destination, current.destination);
  pushChange("departure", initialData.departure, current.departure);
  pushChange("start_date", initialData.startDate, current.startDate);
  pushChange("end_date", initialData.endDate, current.endDate);
  pushChange("duration", initialData.duration, current.duration);
  pushChange("rooms", initialData.rooms, current.rooms);
  pushChange("travellers_count", initialData.travellersCount, current.travellersCount);
  pushChange("booking_status", initialData.bookingStatus, current.bookingStatus);
  pushChange("payment_status", initialData.paymentStatus, current.paymentStatus);
  pushChange("tags", initialData.tags.join(", "), current.tags.join(", "));

  (Object.keys(current.pricing) as Array<keyof BookingCrmPricing>).forEach((key) => {
    const before = String(initialData.pricing[key] ?? 0);
    const after = String(current.pricing[key] ?? 0);
    pushChange(`pricing.${key}`, before, after);
  });

  return changes;
}

export function BookingCrmWorkspace({ initialData, onSave, onLog }: Props) {
  const router = useRouter();

  const [isEditEnabled, setIsEditEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [tripTitle, setTripTitle] = useState(initialData.tripTitle);
  const [customerName, setCustomerName] = useState(initialData.customerName);
  const [customerEmail, setCustomerEmail] = useState(initialData.customerEmail);
  const [customerPhone, setCustomerPhone] = useState(initialData.customerPhone);
  const [alternatePhone, setAlternatePhone] = useState(initialData.alternatePhone);
  const [whatsappNumber, setWhatsappNumber] = useState(initialData.whatsappNumber);
  const [destination, setDestination] = useState(initialData.destination);
  const [departure, setDeparture] = useState(initialData.departure);
  const [startDate, setStartDate] = useState(isoDateInput(initialData.startDate));
  const [endDate, setEndDate] = useState(isoDateInput(initialData.endDate));
  const [duration, setDuration] = useState(initialData.duration);
  const [rooms, setRooms] = useState(initialData.rooms);
  const [travellersCount, setTravellersCount] = useState(initialData.travellersCount);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>(initialData.bookingStatus);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(initialData.paymentStatus);
  const [tags, setTags] = useState(initialData.tags.join(", "));

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

  const [travellers, setTravellers] = useState<BookingTraveller[]>(initialData.travellers ?? []);
  const [itinerary, setItinerary] = useState<BookingItineraryItem[]>(initialData.itinerary ?? []);
  const [payments, setPayments] = useState<BookingPayment[]>(initialData.payments ?? []);
  const [notes, setNotes] = useState<BookingNote[]>(initialData.notes ?? []);
  const [activityLogs, setActivityLogs] = useState<BookingActivityLog[]>(
    initialData.activityLogs ?? [],
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

  function appendLocalLog(action: string, summary: string) {
    const now = new Date().toISOString();

    setActivityLogs((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: now,
        actorName: "Admin",
        actorId: "local",
        action,
        entityType: "booking",
        summary,
        changes: [],
      },
      ...prev,
    ]);
  }

  async function persistLog(action: string, summary: string) {
    if (!onLog) {
      appendLocalLog(action, summary);
      return;
    }

    const response = await onLog({
      bookingId: initialData.bookingId,
      bookingRef: initialData.bookingRef,
      action,
      entityType: "booking",
      summary,
      changes: [],
    });

    if (response && response.ok && response.log) {
      setActivityLogs((prev) => [response.log!, ...prev]);
      return;
    }

    appendLocalLog(action, summary);
  }

  async function handleEnableEdit() {
    if (isEditEnabled) {
      setIsEditEnabled(false);
      await persistLog("edit_disabled", "Edit mode disabled.");
      return;
    }

    const confirmed = window.confirm(
      "Enable edit mode for this booking? Changes remain local until saved.",
    );

    if (!confirmed) return;

    setIsEditEnabled(true);
    await persistLog("edit_enabled", "Edit mode enabled.");
  }

  async function handleSaveBooking() {
    try {
      setIsSaving(true);

      const normalizedTags = tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const changes = buildChanges(initialData, {
        tripTitle,
        customerName,
        customerEmail,
        customerPhone,
        alternatePhone,
        whatsappNumber,
        destination,
        departure,
        startDate,
        endDate,
        duration,
        rooms,
        travellersCount,
        bookingStatus,
        paymentStatus,
        tags: normalizedTags,
        pricing,
      });

      const payload: BookingCrmSaveInput = {
        bookingId: initialData.bookingId,
        bookingRef: initialData.bookingRef,
        tripTitle,
        customerName,
        customerEmail,
        customerPhone,
        alternatePhone,
        whatsappNumber,
        destination,
        departure,
        startDate,
        endDate,
        duration,
        rooms,
        travellersCount,
        bookingStatus,
        paymentStatus,
        tags: normalizedTags,
        notes,
        payments,
        travellers,
        itinerary,
        pricing,
        changes,
        pendingLogs: [],
      };

      const result = await onSave?.(payload);

      if (result && result.ok === false) {
        window.alert(result.message || "Failed to save booking.");
        return;
      }

      if (result?.logs) {
        setActivityLogs(result.logs);
      } else {
        appendLocalLog("booking_saved", "Booking details updated successfully.");
      }

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

    const record: BookingPayment = {
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

    appendLocalLog("payment_added", `Payment added: ${formatCurrency(record.amount)} via ${record.mode}.`);
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
    appendLocalLog("note_added", "Internal note added.");
  }

  function updateTraveller(travellerId: string, field: keyof BookingTraveller, value: string) {
    setTravellers((prev) =>
      prev.map((item) => (item.id === travellerId ? { ...item, [field]: value } : item)),
    );
  }

  function updateItinerary(dayId: string, field: keyof BookingItineraryItem, value: string | number) {
    setItinerary((prev) =>
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
                {(tags || "TAGS").split(",").filter(Boolean).slice(0, 3).map((tag) => (
                  <span
                    key={tag.trim()}
                    className="rounded-full bg-slate-100 px-4 py-2 text-[14px] font-semibold tracking-[0.08em] text-slate-700"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>

              <h1 className="text-[56px] font-semibold leading-none tracking-[-0.05em] text-slate-950">
                {customerName}
              </h1>

              <div className="mt-5 flex flex-wrap gap-x-7 gap-y-2 text-[17px] text-slate-500">
                <span>{customerEmail}</span>
                <span>{customerPhone}</span>
                <span>{destination}</span>
              </div>
            </section>

            <SectionCard title="Customer and trip details">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div>
                  <FieldLabel>Trip title</FieldLabel>
                  <TextInput editable={isEditEnabled} value={tripTitle} onChange={(e) => setTripTitle(e.target.value)} />
                </div>

                <div>
                  <FieldLabel>Customer name</FieldLabel>
                  <TextInput editable={isEditEnabled} value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                </div>

                <div>
                  <FieldLabel>Customer email</FieldLabel>
                  <TextInput editable={isEditEnabled} value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
                </div>

                <div>
                  <FieldLabel>Customer phone</FieldLabel>
                  <TextInput editable={isEditEnabled} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                </div>

                <div>
                  <FieldLabel>Alternate phone</FieldLabel>
                  <TextInput editable={isEditEnabled} value={alternatePhone} onChange={(e) => setAlternatePhone(e.target.value)} />
                </div>

                <div>
                  <FieldLabel>Whatsapp number</FieldLabel>
                  <TextInput editable={isEditEnabled} value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} />
                </div>

                <div>
                  <FieldLabel>Destination</FieldLabel>
                  <TextInput editable={isEditEnabled} value={destination} onChange={(e) => setDestination(e.target.value)} />
                </div>

                <div>
                  <FieldLabel>Departure</FieldLabel>
                  <TextInput editable={isEditEnabled} value={departure} onChange={(e) => setDeparture(e.target.value)} />
                </div>

                <div>
                  <FieldLabel>Duration</FieldLabel>
                  <TextInput editable={isEditEnabled} value={duration} onChange={(e) => setDuration(e.target.value)} />
                </div>

                <div>
                  <FieldLabel>Start date</FieldLabel>
                  <TextInput editable={isEditEnabled} type={isEditEnabled ? "date" : "text"} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>

                <div>
                  <FieldLabel>End date</FieldLabel>
                  <TextInput editable={isEditEnabled} type={isEditEnabled ? "date" : "text"} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>

                <div>
                  <FieldLabel>Rooms</FieldLabel>
                  <TextInput editable={isEditEnabled} value={rooms} onChange={(e) => setRooms(e.target.value)} />
                </div>

                <div>
                  <FieldLabel>Travellers</FieldLabel>
                  <TextInput editable={isEditEnabled} value={travellersCount} onChange={(e) => setTravellersCount(e.target.value)} />
                </div>

                <div>
                  <FieldLabel>Tags</FieldLabel>
                  <TextInput editable={isEditEnabled} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="vip, repeat, urgent" />
                </div>

                <div>
                  <FieldLabel>Booking status</FieldLabel>
                  <Select editable={isEditEnabled} value={bookingStatus} onChange={(e) => setBookingStatus(e.target.value as BookingStatus)}>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </Select>
                </div>

                <div>
                  <FieldLabel>Payment status</FieldLabel>
                  <Select editable={isEditEnabled} value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}>
                    <option value="unpaid">Unpaid</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </Select>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Pricing" subtitle="Compact commercial edit block.">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {(
                  [
                    ["packageBase", "Package base"],
                    ["flights", "Flights"],
                    ["hotels", "Hotels"],
                    ["transfers", "Transfers"],
                    ["sightseeing", "Sightseeing"],
                    ["meals", "Meals"],
                    ["serviceFee", "Service fee"],
                    ["extra", "Extra"],
                    ["discount", "Discount"],
                  ] as Array<[keyof BookingCrmPricing, string]>
                ).map(([field, label]) => (
                  <div key={field}>
                    <FieldLabel>{label}</FieldLabel>
                    <TextInput
                      editable={isEditEnabled}
                      type="number"
                      value={pricing[field]}
                      onChange={(e) => updatePricing(field, e.target.value)}
                    />
                  </div>
                ))}
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
                          <TextInput editable={isEditEnabled} value={traveller.name} onChange={(e) => updateTraveller(traveller.id, "name", e.target.value)} />
                        </div>

                        <div>
                          <FieldLabel>Age</FieldLabel>
                          <TextInput editable={isEditEnabled} value={traveller.age} onChange={(e) => updateTraveller(traveller.id, "age", e.target.value)} />
                        </div>

                        <div>
                          <FieldLabel>Gender / Type</FieldLabel>
                          <Select editable={isEditEnabled} value={traveller.gender} onChange={(e) => updateTraveller(traveller.id, "gender", e.target.value)}>
                            <option value="Adult">Adult</option>
                            <option value="Child">Child</option>
                            <option value="Infant">Infant</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
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
                      <TextInput editable={isEditEnabled} type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
                    </div>

                    <div>
                      <FieldLabel>Mode</FieldLabel>
                      <Select editable={isEditEnabled} value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                        <option value="UPI">UPI</option>
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Card">Card</option>
                      </Select>
                    </div>

                    <div>
                      <FieldLabel>Date</FieldLabel>
                      <TextInput editable={isEditEnabled} type={isEditEnabled ? "date" : "text"} value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} placeholder="dd / mm / yyyy" />
                    </div>

                    <div>
                      <FieldLabel>Note</FieldLabel>
                      <TextInput editable={isEditEnabled} value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} />
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
                      <div key={payment.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="text-[15px] font-semibold text-slate-900">
                          {formatCurrency(payment.amount)} · {payment.mode}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">{formatDateTime(payment.date)}</div>
                        {payment.note ? <div className="mt-1 text-sm text-slate-600">{payment.note}</div> : null}
                      </div>
                    ))}
                  </div>

                  <div>
                    <FieldLabel>New note</FieldLabel>
                    <TextArea editable={isEditEnabled} value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add internal note..." />
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
                      <div key={note.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="text-[15px] text-slate-700">{note.text}</div>
                        <div className="mt-1 text-sm text-slate-500">{formatDateTime(note.createdAt)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
            </div>

            <SectionCard title="Itinerary" subtitle="Compact day cards first.">
              <div className="space-y-4">
                {itinerary.map((day) => (
                  <div key={day.id} className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-4">
                    <div className="mb-4 grid gap-4 md:grid-cols-3">
                      <div>
                        <FieldLabel>Day</FieldLabel>
                        <TextInput
                          editable={isEditEnabled}
                          type="number"
                          value={day.day}
                          onChange={(e) => updateItinerary(day.id, "day", Number(e.target.value || 0))}
                        />
                      </div>
                      <div>
                        <FieldLabel>Title</FieldLabel>
                        <TextInput editable={isEditEnabled} value={day.title} onChange={(e) => updateItinerary(day.id, "title", e.target.value)} />
                      </div>
                      <div>
                        <FieldLabel>City</FieldLabel>
                        <TextInput editable={isEditEnabled} value={day.city} onChange={(e) => updateItinerary(day.id, "city", e.target.value)} />
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Description</FieldLabel>
                      <TextArea editable={isEditEnabled} value={day.description} onChange={(e) => updateItinerary(day.id, "description", e.target.value)} className="min-h-[110px]" />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Past bookings">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {initialData.pastBookings.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    No past bookings found.
                  </div>
                ) : (
                  initialData.pastBookings.map((item) => (
                    <div key={item.id} className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm font-semibold text-slate-800">{item.bookingRef}</div>
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
                      <div className="mt-1 text-sm text-slate-500">{formatDateTime(item.createdAt)}</div>
                      <div className="mt-4 text-right text-lg font-semibold text-slate-900">
                        {formatCurrency(item.totalAmount)}
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
                    Activity
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const content = activityLogs
                        .map(
                          (log) =>
                            `${log.summary}\n${log.actorName}\n${formatDateTime(log.createdAt)}`,
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
                  {activityLogs.slice(0, 4).map((log) => (
                    <div key={log.id} className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                      <div
                        className={cn(
                          "text-[12px] font-bold uppercase tracking-[0.22em]",
                          actionToneClasses(log.action),
                        )}
                      >
                        {log.action.replaceAll("_", " ")}
                      </div>
                      <div className="mt-2 text-[15px] text-slate-800">{log.summary}</div>
                      <div className="mt-2 text-sm text-slate-500">
                        {log.actorName} · {formatDateTime(log.createdAt)}
                      </div>
                    </div>
                  ))}

                  {activityLogs.length === 0 ? (
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