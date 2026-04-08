"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/shared/portal-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";
import { createClient } from "@/lib/supabase/client";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

type BookingRow = Record<string, any>;

type PaymentMode =
  | "cash"
  | "upi"
  | "bank_transfer"
  | "card"
  | "payment_link"
  | "other";

type PaymentStatus = "paid" | "partial" | "unpaid" | "refunded";
type PaymentFilter = "all" | PaymentStatus;

type PaymentRow = {
  id: string;
  booking_id: string;
  booking_ref: string;
  amount: number;
  payment_mode: PaymentMode;
  payment_date: string;
  note: string | null;
  receipt_number: string | null;
  receipt_file_path: string | null;
  receipt_file_name: string | null;
  entered_by: string | null;
  entered_by_name: string | null;
  entered_by_email: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  deleted_by?: string | null;
};

type PaymentFormState = {
  amount: string;
  payment_mode: PaymentMode;
  payment_date: string;
  note: string;
  receipt_number: string;
};

type EditPaymentState = {
  id: string;
  amount: string;
  payment_mode: PaymentMode;
  payment_date: string;
  note: string;
  receipt_number: string;
  receipt_file_path: string | null;
  receipt_file_name: string | null;
};

const PAYMENT_MODES: PaymentMode[] = [
  "cash",
  "upi",
  "bank_transfer",
  "card",
  "payment_link",
  "other",
];

function getDefaultPaymentForm(): PaymentFormState {
  return {
    amount: "",
    payment_mode: "upi",
    payment_date: new Date().toISOString().slice(0, 10),
    note: "",
    receipt_number: "",
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatCompactCurrency(value: number) {
  const num = Number.isFinite(value) ? value : 0;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${Math.round(num)}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function toDateInput(value?: string | null) {
  if (!value) return new Date().toISOString().slice(0, 10);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function getFirstString(
  row: Record<string, any>,
  keys: string[],
  fallback = "—",
) {
  for (const key of keys) {
    const value = row?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return fallback;
}

function getFirstNumber(
  row: Record<string, any>,
  keys: string[],
  fallback = 0,
) {
  for (const key of keys) {
    const value = Number(row?.[key]);
    if (Number.isFinite(value)) return value;
  }
  return fallback;
}

function getTotalAmount(row: BookingRow) {
  return getFirstNumber(
    row,
    ["total_amount", "amount_total", "grand_total", "final_amount"],
    0,
  );
}

function getDueDate(row: BookingRow) {
  return getFirstString(row, ["payment_due_date", "due_date"], "");
}

function groupPaymentsByBooking(payments: PaymentRow[]) {
  const map = new Map<string, PaymentRow[]>();
  for (const item of payments) {
    const existing = map.get(item.booking_id) ?? [];
    existing.push(item);
    map.set(item.booking_id, existing);
  }
  return map;
}

function getPaidAmountFromLedger(
  bookingId: string,
  paymentsByBooking: Map<string, PaymentRow[]>,
) {
  const rows = paymentsByBooking.get(bookingId) ?? [];
  return rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
}

function derivePaymentStatus(total: number, paid: number): PaymentStatus {
  if (paid < 0) return "refunded";
  if (total <= 0 && paid <= 0) return "unpaid";
  if (paid <= 0) return "unpaid";
  if (paid >= total) return "paid";
  return "partial";
}

function getAmountDue(total: number, paid: number) {
  return Math.max(total - Math.max(paid, 0), 0);
}

function isOverdue(row: BookingRow, status: PaymentStatus) {
  if (status === "paid" || status === "refunded") return false;
  const dueDate = getDueDate(row);
  if (!dueDate) return false;
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return false;
  due.setHours(23, 59, 59, 999);
  return due.getTime() < Date.now();
}

function statusClasses(status: PaymentStatus) {
  switch (status) {
    case "paid":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "partial":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "refunded":
      return "border-slate-200 bg-slate-100 text-slate-700";
    default:
      return "border-rose-200 bg-rose-50 text-rose-700";
  }
}

function sanitizeNumberInput(value: string) {
  return value.replace(/[^\d.-]/g, "");
}

function storagePathForReceipt(
  bookingRef: string,
  paymentId: string,
  fileName: string,
) {
  const safeName = fileName
    .replace(/\s+/g, "-")
    .replace(/[^\w.\-]/g, "");
  return `${bookingRef}/${paymentId}/${Date.now()}-${safeName}`;
}

function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="h-full w-full max-w-[720px] overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function ConfirmModal({
  open,
  title,
  description,
  confirming,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirming: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className="inline-flex h-10 items-center justify-center rounded-full bg-rose-600 px-4 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
          >
            {confirming ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPaymentsPage() {
  const supabase = createClient();

  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentFilter>("all");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [savingBookingId, setSavingBookingId] = useState<string | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(
    null,
  );
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [receiptUploadingId, setReceiptUploadingId] = useState<string | null>(
    null,
  );

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [addPaymentBookingId, setAddPaymentBookingId] = useState<string | null>(
    null,
  );
  const [addPaymentState, setAddPaymentState] =
    useState<PaymentFormState>(getDefaultPaymentForm());

  const [editState, setEditState] = useState<EditPaymentState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PaymentRow | null>(null);

  async function syncBookingSummary(
    booking: BookingRow,
    nextPayments: PaymentRow[],
  ) {
    const bookingId = String(booking?.id ?? "");
    if (!bookingId) return;

    const related = nextPayments.filter((item) => item.booking_id === bookingId);
    const total = getTotalAmount(booking);
    const amountPaid = related.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
    );
    const amountDue = getAmountDue(total, amountPaid);
    const paymentStatus = derivePaymentStatus(total, amountPaid);

    const { error } = await supabase
      .from("bookings")
      .update({
        amount_paid: amountPaid,
        amount_due: amountDue,
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (error) throw error;
  }

  async function loadData(showRefresh = false) {
    try {
      setError(null);
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const [
        { data: bookingsData, error: bookingsError },
        { data: paymentsData, error: paymentsError },
      ] = await Promise.all([
        supabase.from("bookings").select("*").order("created_at", {
          ascending: false,
        }),
        supabase
          .from("booking_payments")
          .select("*")
          .is("deleted_at", null)
          .order("payment_date", { ascending: false }),
      ]);

      if (bookingsError) throw bookingsError;
      if (paymentsError) throw paymentsError;

      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setPayments(
        Array.isArray(paymentsData) ? (paymentsData as PaymentRow[]) : [],
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load payment data.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const paymentsByBooking = useMemo(
    () => groupPaymentsByBooking(payments),
    [payments],
  );

  const bookingRows = useMemo(() => {
    return bookings.map((booking) => {
      const bookingId = String(booking?.id ?? "");
      const total = getTotalAmount(booking);
      const paid = getPaidAmountFromLedger(bookingId, paymentsByBooking);
      const due = getAmountDue(total, paid);
      const status = derivePaymentStatus(total, paid);
      const overdue = isOverdue(booking, status);

      return {
        booking,
        bookingId,
        total,
        paid,
        due,
        status,
        overdue,
        paymentRows: paymentsByBooking.get(bookingId) ?? [],
      };
    });
  }, [bookings, paymentsByBooking]);

  const filteredBookings = useMemo(() => {
    const q = search.trim().toLowerCase();

    return bookingRows.filter((item) => {
      const bookingRef = getFirstString(
        item.booking,
        ["booking_ref", "reference_code"],
        "",
      ).toLowerCase();

      const customer = getFirstString(
        item.booking,
        [
          "customer_name",
          "full_name",
          "lead_name",
          "traveller_name",
          "name",
          "customer_email",
          "email",
        ],
        "",
      ).toLowerCase();

      const email = getFirstString(
        item.booking,
        ["customer_email", "email"],
        "",
      ).toLowerCase();

      const matchesSearch =
        !q || bookingRef.includes(q) || customer.includes(q) || email.includes(q);

      const matchesStatus =
        statusFilter === "all" ? true : item.status === statusFilter;

      const matchesOverdue = overdueOnly ? item.overdue : true;

      return matchesSearch && matchesStatus && matchesOverdue;
    });
  }, [bookingRows, overdueOnly, search, statusFilter]);

  const metrics = useMemo(() => {
    const collected = bookingRows.reduce(
      (sum, item) => sum + Math.max(item.paid, 0),
      0,
    );

    const partial = bookingRows.reduce((sum, item) => {
      if (item.status !== "partial") return sum;
      return sum + item.due;
    }, 0);

    const overdue = bookingRows.reduce((sum, item) => {
      if (!item.overdue) return sum;
      return sum + item.due;
    }, 0);

    const recentActivity = payments.filter((item) => {
      const dt = new Date(item.payment_date);
      if (Number.isNaN(dt.getTime())) return false;
      return Date.now() - dt.getTime() <= 14 * 24 * 60 * 60 * 1000;
    }).length;

    return { collected, partial, overdue, recentActivity };
  }, [bookingRows, payments]);

  const selectedBooking = useMemo(() => {
    return bookingRows.find((item) => item.bookingId === selectedBookingId) ?? null;
  }, [bookingRows, selectedBookingId]);

  const addPaymentBooking = useMemo(() => {
    return bookingRows.find((item) => item.bookingId === addPaymentBookingId) ?? null;
  }, [bookingRows, addPaymentBookingId]);

  function openAddPaymentDrawer(bookingId: string) {
    setAddPaymentBookingId(bookingId);
    setAddPaymentState(getDefaultPaymentForm());
  }

  async function addPayment(booking: BookingRow) {
    const bookingId = String(booking?.id ?? "");
    if (!bookingId) return;

    const amount = Number(addPaymentState.amount);
    if (!Number.isFinite(amount) || amount === 0) {
      setError(
        "Enter a valid payment amount. Use negative amount for refund or reversal entries.",
      );
      return;
    }

    try {
      setSavingBookingId(bookingId);
      setError(null);

      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user ?? null;

      const bookingRef = getFirstString(
        booking,
        ["booking_ref", "reference_code"],
        "—",
      );

      const payload = {
        booking_id: bookingId,
        booking_ref: bookingRef,
        amount,
        payment_mode: addPaymentState.payment_mode,
        payment_date: new Date(addPaymentState.payment_date).toISOString(),
        note: addPaymentState.note.trim() || null,
        receipt_number: addPaymentState.receipt_number.trim() || null,
        entered_by: user?.id ?? null,
        entered_by_name:
          (user?.user_metadata?.full_name as string | undefined) ||
          (user?.user_metadata?.name as string | undefined) ||
          null,
        entered_by_email: user?.email ?? null,
      };

      const { data, error } = await supabase
        .from("booking_payments")
        .insert(payload)
        .select("*")
        .single();

      if (error) throw error;

      const nextPayments = [data as PaymentRow, ...payments];
      setPayments(nextPayments);
      await syncBookingSummary(booking, nextPayments);

      setBookings((prev) =>
        prev.map((item) => {
          if (String(item?.id) !== bookingId) return item;
          const total = getTotalAmount(item);
          const paid = nextPayments
            .filter((payment) => payment.booking_id === bookingId)
            .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

          return {
            ...item,
            amount_paid: paid,
            amount_due: getAmountDue(total, paid),
            payment_status: derivePaymentStatus(total, paid),
            updated_at: new Date().toISOString(),
          };
        }),
      );

      setAddPaymentState(getDefaultPaymentForm());
      setAddPaymentBookingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add payment.");
    } finally {
      setSavingBookingId(null);
    }
  }

  async function confirmDeletePayment() {
    if (!deleteTarget) return;

    try {
      setDeletingPaymentId(deleteTarget.id);
      setError(null);

      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user ?? null;

      const { error } = await supabase
        .from("booking_payments")
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", deleteTarget.id);

      if (error) throw error;

      const nextPayments = payments.filter((item) => item.id !== deleteTarget.id);
      setPayments(nextPayments);

      const parentBooking = bookings.find(
        (item) => String(item?.id) === deleteTarget.booking_id,
      );

      if (parentBooking) {
        await syncBookingSummary(parentBooking, nextPayments);

        setBookings((prev) =>
          prev.map((item) => {
            if (String(item?.id) !== deleteTarget.booking_id) return item;
            const total = getTotalAmount(item);
            const paid = nextPayments
              .filter((entry) => entry.booking_id === deleteTarget.booking_id)
              .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

            return {
              ...item,
              amount_paid: paid,
              amount_due: getAmountDue(total, paid),
              payment_status: derivePaymentStatus(total, paid),
              updated_at: new Date().toISOString(),
            };
          }),
        );
      }

      setDeleteTarget(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete payment entry.",
      );
    } finally {
      setDeletingPaymentId(null);
    }
  }

  function startEdit(payment: PaymentRow) {
    setEditState({
      id: payment.id,
      amount: String(payment.amount),
      payment_mode: payment.payment_mode,
      payment_date: toDateInput(payment.payment_date),
      note: payment.note ?? "",
      receipt_number: payment.receipt_number ?? "",
      receipt_file_path: payment.receipt_file_path ?? null,
      receipt_file_name: payment.receipt_file_name ?? null,
    });
  }

  async function saveEdit(payment: PaymentRow) {
    if (!editState || editState.id !== payment.id) return;

    const amount = Number(editState.amount);
    if (!Number.isFinite(amount) || amount === 0) {
      setError("Edited payment amount must be a valid non-zero number.");
      return;
    }

    try {
      setEditingPaymentId(payment.id);
      setError(null);

      const payload = {
        amount,
        payment_mode: editState.payment_mode,
        payment_date: new Date(editState.payment_date).toISOString(),
        note: editState.note.trim() || null,
        receipt_number: editState.receipt_number.trim() || null,
        receipt_file_path: editState.receipt_file_path,
        receipt_file_name: editState.receipt_file_name,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("booking_payments")
        .update(payload)
        .eq("id", payment.id);

      if (error) throw error;

      const nextPayments = payments.map((item) =>
        item.id === payment.id ? { ...item, ...payload } : item,
      );

      setPayments(nextPayments);

      const parentBooking = bookings.find(
        (item) => String(item?.id) === payment.booking_id,
      );

      if (parentBooking) {
        await syncBookingSummary(parentBooking, nextPayments);

        setBookings((prev) =>
          prev.map((item) => {
            if (String(item?.id) !== payment.booking_id) return item;
            const total = getTotalAmount(item);
            const paid = nextPayments
              .filter((entry) => entry.booking_id === payment.booking_id)
              .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

            return {
              ...item,
              amount_paid: paid,
              amount_due: getAmountDue(total, paid),
              payment_status: derivePaymentStatus(total, paid),
              updated_at: new Date().toISOString(),
            };
          }),
        );
      }

      setEditState(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update payment entry.",
      );
    } finally {
      setEditingPaymentId(null);
    }
  }

  async function uploadReceipt(payment: PaymentRow, file: File) {
    try {
      setReceiptUploadingId(payment.id);
      setError(null);

      const path = storagePathForReceipt(payment.booking_ref, payment.id, file.name);

      const { error: uploadError } = await supabase.storage
        .from("payment-receipts")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const payload = {
        receipt_file_path: path,
        receipt_file_name: file.name,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("booking_payments")
        .update(payload)
        .eq("id", payment.id);

      if (error) throw error;

      setPayments((prev) =>
        prev.map((item) => (item.id === payment.id ? { ...item, ...payload } : item)),
      );

      if (editState?.id === payment.id) {
        setEditState({
          ...editState,
          receipt_file_path: path,
          receipt_file_name: file.name,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload receipt. Check that the payment-receipts storage bucket exists.",
      );
    } finally {
      setReceiptUploadingId(null);
    }
  }

  function getReceiptPublicUrl(path: string | null | undefined) {
    if (!path) return null;
    const { data } = supabase.storage.from("payment-receipts").getPublicUrl(path);
    return data?.publicUrl ?? null;
  }

  return (
    <>
      <PortalShell
        title="Payments"
        subtitle="Total collected, partial payments, overdue payments, and payment ledger activity."
        sidebar={<AdminSidebar />}
      >
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoPanel title="Collected">
              <p className="text-2xl font-bold text-slate-950">
                {formatCompactCurrency(metrics.collected)}
              </p>
            </InfoPanel>

            <InfoPanel title="Partial Payments">
              <p className="text-2xl font-bold text-slate-950">
                {formatCompactCurrency(metrics.partial)}
              </p>
            </InfoPanel>

            <InfoPanel title="Overdue">
              <p className="text-2xl font-bold text-slate-950">
                {formatCompactCurrency(metrics.overdue)}
              </p>
            </InfoPanel>

            <InfoPanel title="Recent Activity">
              <p className="text-2xl font-bold text-slate-950">
                {metrics.recentActivity} entries
              </p>
            </InfoPanel>
          </div>

          <InfoPanel title="Payment Ledger Management">
            <div className="space-y-5">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-1 flex-col gap-3 md:flex-row">
                  <label className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by booking ref, customer, or email"
                      className="h-11 w-full rounded-full border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-slate-300"
                    />
                  </label>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as PaymentFilter)}
                    className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-300"
                  >
                    <option value="all">All statuses</option>
                    <option value="paid">Paid</option>
                    <option value="partial">Partial</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="refunded">Refunded</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setOverdueOnly((prev) => !prev)}
                    className={`h-11 rounded-full border px-4 text-sm font-medium transition ${
                      overdueOnly
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {overdueOnly ? "Showing overdue only" : "Overdue only"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => loadData(true)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>

              {error ? (
                <div className="flex items-start gap-3 rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              ) : null}

              <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="min-w-[1320px] w-full text-left">
                    <thead className="border-b border-slate-200 bg-slate-50/80">
                      <tr className="text-xs uppercase tracking-[0.16em] text-slate-500">
                        <th className="px-5 py-4 font-semibold">Booking</th>
                        <th className="px-5 py-4 font-semibold">Customer</th>
                        <th className="px-5 py-4 font-semibold">Total</th>
                        <th className="px-5 py-4 font-semibold">Paid</th>
                        <th className="px-5 py-4 font-semibold">Due</th>
                        <th className="px-5 py-4 font-semibold">Due Date</th>
                        <th className="px-5 py-4 font-semibold">State</th>
                        <th className="px-5 py-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-500">
                            Loading payments...
                          </td>
                        </tr>
                      ) : filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-500">
                            No payment rows found for the current filters.
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((item) => {
                          const booking = item.booking;
                          const bookingRef = getFirstString(
                            booking,
                            ["booking_ref", "reference_code"],
                            "—",
                          );
                          const customerName = getFirstString(
                            booking,
                            ["customer_name", "full_name", "lead_name", "traveller_name", "name"],
                            getFirstString(booking, ["customer_email", "email"], "—"),
                          );
                          const customerEmail = getFirstString(
                            booking,
                            ["customer_email", "email"],
                            "—",
                          );

                          return (
                            <tr
                              key={item.bookingId}
                              className="border-b border-slate-100 align-top last:border-b-0"
                            >
                              <td className="px-5 py-4">
                                <div className="space-y-1">
                                  <p className="font-semibold text-slate-950">{bookingRef}</p>
                                  <p className="text-xs text-slate-500">
                                    Updated{" "}
                                    {formatDateTime(
                                      getFirstString(booking, ["updated_at", "created_at"], ""),
                                    )}
                                  </p>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <div className="space-y-1">
                                  <p className="font-medium text-slate-900">{customerName}</p>
                                  <p className="text-xs text-slate-500">{customerEmail}</p>
                                </div>
                              </td>

                              <td className="px-5 py-4 text-sm font-semibold text-slate-950">
                                {formatCurrency(item.total)}
                              </td>

                              <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                                {formatCurrency(item.paid)}
                              </td>

                              <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                                {formatCurrency(item.due)}
                              </td>

                              <td className="px-5 py-4">
                                <div className="space-y-1">
                                  <p className="text-sm text-slate-700">
                                    {formatDate(getDueDate(booking))}
                                  </p>
                                  {item.overdue ? (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700">
                                      <Clock3 className="h-3 w-3" />
                                      Overdue
                                    </span>
                                  ) : null}
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <div className="space-y-2">
                                  <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusClasses(
                                      item.status,
                                    )}`}
                                  >
                                    {item.status}
                                  </span>
                                  <p className="text-xs text-slate-500">
                                    {item.paymentRows.length} ledger entr
                                    {item.paymentRows.length === 1 ? "y" : "ies"}
                                  </p>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex flex-wrap items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedBookingId(item.bookingId)}
                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                  >
                                    <Eye className="h-4 w-4" />
                                    View ledger
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => openAddPaymentDrawer(item.bookingId)}
                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-slate-950 px-3 text-sm font-medium text-white hover:bg-slate-800"
                                  >
                                    <Plus className="h-4 w-4" />
                                    Add payment
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </InfoPanel>

          <InfoPanel title="Recent Payment History">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-[1400px] w-full text-left">
                  <thead className="border-b border-slate-200 bg-slate-50/80">
                    <tr className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      <th className="px-5 py-4 font-semibold">Booking Ref</th>
                      <th className="px-5 py-4 font-semibold">Amount</th>
                      <th className="px-5 py-4 font-semibold">Mode</th>
                      <th className="px-5 py-4 font-semibold">Payment Date</th>
                      <th className="px-5 py-4 font-semibold">Receipt / Ref</th>
                      <th className="px-5 py-4 font-semibold">Note</th>
                      <th className="px-5 py-4 font-semibold">Entered By</th>
                      <th className="px-5 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-500">
                          Loading payment history...
                        </td>
                      </tr>
                    ) : payments.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-500">
                          No payment history found.
                        </td>
                      </tr>
                    ) : (
                      payments.map((payment) => {
                        const receiptUrl = getReceiptPublicUrl(payment.receipt_file_path);

                        return (
                          <tr key={payment.id} className="border-b border-slate-100 last:border-b-0">
                            <td className="px-5 py-4 font-medium text-slate-950">
                              {payment.booking_ref}
                            </td>
                            <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                              {formatCurrency(Number(payment.amount || 0))}
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-700">
                              {payment.payment_mode.replace("_", " ")}
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-700">
                              {formatDateTime(payment.payment_date)}
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-700">
                              <div className="space-y-1">
                                <p>{payment.receipt_number?.trim() || "—"}</p>
                                {receiptUrl ? (
                                  <a
                                    href={receiptUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700"
                                  >
                                    <FileText className="h-3.5 w-3.5" />
                                    View receipt
                                  </a>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-700">
                              {payment.note?.trim() || "—"}
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-700">
                              {payment.entered_by_name ||
                                payment.entered_by_email ||
                                (payment.entered_by
                                  ? `${payment.entered_by.slice(0, 8)}...`
                                  : "—")}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEdit(payment)}
                                  className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                  <Pencil className="h-4 w-4" />
                                  Edit
                                </button>

                                <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                  {receiptUploadingId === payment.id ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Upload className="h-4 w-4" />
                                  )}
                                  Receipt
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept=".jpg,.jpeg,.png,.pdf,.webp"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) uploadReceipt(payment, file);
                                      e.currentTarget.value = "";
                                    }}
                                  />
                                </label>

                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget(payment)}
                                  className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 text-sm font-medium text-rose-700 hover:bg-rose-100"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </InfoPanel>
        </div>
      </PortalShell>

      <Drawer
        open={Boolean(selectedBooking)}
        onClose={() => setSelectedBookingId(null)}
        title={
          selectedBooking
            ? `Payment Ledger · ${getFirstString(
                selectedBooking.booking,
                ["booking_ref", "reference_code"],
                "—",
              )}`
            : "Payment Ledger"
        }
      >
        {selectedBooking ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Total</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {formatCurrency(selectedBooking.total)}
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Paid</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {formatCurrency(selectedBooking.paid)}
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Due</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {formatCurrency(selectedBooking.due)}
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Status</p>
                <div className="mt-2">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusClasses(
                      selectedBooking.status,
                    )}`}
                  >
                    {selectedBooking.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {selectedBooking.paymentRows.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No ledger entries found for this booking.
                </p>
              ) : (
                selectedBooking.paymentRows.map((payment) => {
                  const receiptUrl = getReceiptPublicUrl(payment.receipt_file_path);

                  return (
                    <div
                      key={payment.id}
                      className="rounded-[24px] border border-slate-200 bg-white p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-base font-semibold text-slate-950">
                            {formatCurrency(payment.amount)}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {payment.payment_mode.replace("_", " ")} ·{" "}
                            {formatDateTime(payment.payment_date)}
                          </p>
                          <p className="mt-2 text-sm text-slate-600">
                            {payment.note?.trim() || "No note"}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                            <span>Ref: {payment.receipt_number?.trim() || "—"}</span>
                            <span>
                              By:{" "}
                              {payment.entered_by_name ||
                                payment.entered_by_email ||
                                (payment.entered_by
                                  ? `${payment.entered_by.slice(0, 8)}...`
                                  : "—")}
                            </span>
                            {receiptUrl ? (
                              <a
                                href={receiptUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-orange-600 hover:text-orange-700"
                              >
                                View receipt
                              </a>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(payment)}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>

                          <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            {receiptUploadingId === payment.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                            Receipt
                            <input
                              type="file"
                              className="hidden"
                              accept=".jpg,.jpeg,.png,.pdf,.webp"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadReceipt(payment, file);
                                e.currentTarget.value = "";
                              }}
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(payment)}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 text-sm font-medium text-rose-700 hover:bg-rose-100"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : null}
      </Drawer>

      <Drawer
        open={Boolean(addPaymentBooking)}
        onClose={() => {
          setAddPaymentBookingId(null);
          setAddPaymentState(getDefaultPaymentForm());
        }}
        title={
          addPaymentBooking
            ? `Add Payment · ${getFirstString(
                addPaymentBooking.booking,
                ["booking_ref", "reference_code"],
                "—",
              )}`
            : "Add Payment"
        }
      >
        {addPaymentBooking ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Total</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {formatCurrency(addPaymentBooking.total)}
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Paid</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {formatCurrency(addPaymentBooking.paid)}
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Due</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {formatCurrency(addPaymentBooking.due)}
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Status</p>
                <div className="mt-2">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusClasses(
                      addPaymentBooking.status,
                    )}`}
                  >
                    {addPaymentBooking.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={addPaymentState.amount}
                  onChange={(e) =>
                    setAddPaymentState((prev) => ({
                      ...prev,
                      amount: sanitizeNumberInput(e.target.value),
                    }))
                  }
                  placeholder="Amount"
                  inputMode="decimal"
                  className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-300"
                />

                <select
                  value={addPaymentState.payment_mode}
                  onChange={(e) =>
                    setAddPaymentState((prev) => ({
                      ...prev,
                      payment_mode: e.target.value as PaymentMode,
                    }))
                  }
                  className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-300"
                >
                  {PAYMENT_MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode.replace("_", " ")}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={addPaymentState.payment_date}
                  onChange={(e) =>
                    setAddPaymentState((prev) => ({
                      ...prev,
                      payment_date: e.target.value,
                    }))
                  }
                  className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-300"
                />

                <input
                  value={addPaymentState.receipt_number}
                  onChange={(e) =>
                    setAddPaymentState((prev) => ({
                      ...prev,
                      receipt_number: e.target.value,
                    }))
                  }
                  placeholder="Receipt / Ref no."
                  className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-300"
                />
              </div>

              <textarea
                value={addPaymentState.note}
                onChange={(e) =>
                  setAddPaymentState((prev) => ({
                    ...prev,
                    note: e.target.value,
                  }))
                }
                placeholder="Note"
                rows={4}
                className="mt-4 w-full rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-300"
              />

              <p className="mt-3 text-xs text-slate-500">
                Use negative amount to record refund or reversal entries.
              </p>

              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAddPaymentBookingId(null);
                    setAddPaymentState(getDefaultPaymentForm());
                  }}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => addPayment(addPaymentBooking.booking)}
                  disabled={savingBookingId === addPaymentBooking.bookingId}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingBookingId === addPaymentBooking.bookingId ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Save payment
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </Drawer>

      <Drawer
        open={Boolean(editState)}
        onClose={() => setEditState(null)}
        title="Edit Payment Entry"
      >
        {editState ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={editState.amount}
                onChange={(e) =>
                  setEditState({
                    ...editState,
                    amount: sanitizeNumberInput(e.target.value),
                  })
                }
                placeholder="Amount"
                inputMode="decimal"
                className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-300"
              />

              <select
                value={editState.payment_mode}
                onChange={(e) =>
                  setEditState({
                    ...editState,
                    payment_mode: e.target.value as PaymentMode,
                  })
                }
                className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-300"
              >
                {PAYMENT_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode.replace("_", " ")}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={editState.payment_date}
                onChange={(e) =>
                  setEditState({ ...editState, payment_date: e.target.value })
                }
                className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-300"
              />

              <input
                value={editState.receipt_number}
                onChange={(e) =>
                  setEditState({ ...editState, receipt_number: e.target.value })
                }
                placeholder="Receipt / Ref no."
                className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-300"
              />
            </div>

            <textarea
              value={editState.note}
              onChange={(e) => setEditState({ ...editState, note: e.target.value })}
              placeholder="Note"
              rows={4}
              className="w-full rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-300"
            />

            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">Receipt attachment</p>
              <p className="mt-1 text-sm text-slate-600">
                {editState.receipt_file_name || "No receipt uploaded yet."}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditState(null)}
                className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = payments.find((item) => item.id === editState.id);
                  if (target) saveEdit(target);
                }}
                disabled={editingPaymentId === editState.id}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {editingPaymentId === editState.id ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Save changes
              </button>
            </div>
          </div>
        ) : null}
      </Drawer>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete payment entry"
        description="This will remove the payment entry from the active ledger and recalculate the booking payment summary."
        confirming={Boolean(deleteTarget && deletingPaymentId === deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDeletePayment}
      />
    </>
  );
}