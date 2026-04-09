"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Copy,
  IndianRupee,
  Loader2,
  Mail,
  RotateCcw,
  Send,
  Trash2,
  Wallet,
} from "lucide-react";

type QuoteDetailActionsProps = {
  quoteId: string;
  quoteRef: string | null;
  currentStatus: string | null;
  paymentStatus: string | null;
  amount: number;
  amountReceived: number;
  additionalExpenseTotal: number;
  balanceDue: number;
};

type QuoteAction = "approve" | "discard" | "recover";
type ShareChannel = "copy_link" | "whatsapp" | "email" | "manual";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function safeNumber(value: unknown) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

function getActionLabel(action: QuoteAction) {
  if (action === "approve") return "Approve Quote";
  if (action === "discard") return "Discard Quote";
  return "Recover Quote";
}

function getActionIcon(action: QuoteAction) {
  if (action === "approve") return BadgeCheck;
  if (action === "discard") return Trash2;
  return RotateCcw;
}

function getActionClasses(action: QuoteAction) {
  if (action === "approve") {
    return "border-emerald-300 bg-emerald-50 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100";
  }

  if (action === "discard") {
    return "border-rose-300 bg-rose-50 text-rose-700 hover:border-rose-400 hover:bg-rose-100";
  }

  return "border-amber-300 bg-amber-50 text-amber-700 hover:border-amber-400 hover:bg-amber-100";
}

export function QuoteDetailActions({
  quoteId,
  quoteRef,
  currentStatus,
  paymentStatus,
  amount,
  amountReceived,
  additionalExpenseTotal,
  balanceDue,
}: QuoteDetailActionsProps) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const [paymentAmount, setPaymentAmount] = useState(String(Math.max(safeNumber(balanceDue), 0)));
  const [paymentMode, setPaymentMode] = useState("bank_transfer");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentNote, setPaymentNote] = useState("");

  const [expenseLabel, setExpenseLabel] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseNote, setExpenseNote] = useState("");

  const normalizedStatus = (currentStatus || "").trim().toLowerCase();
  const normalizedPaymentStatus = (paymentStatus || "unpaid").trim().toLowerCase();
  const fullyPaid = normalizedPaymentStatus === "paid" || safeNumber(balanceDue) <= 0;

  const quotePublicLabel = quoteRef || "Quote";

  const availableActions = useMemo<QuoteAction[]>(() => {
    if (normalizedStatus === "discarded") {
      return ["recover"];
    }

    return [
      ...(normalizedStatus === "approved" || normalizedStatus === "paid" || normalizedStatus === "partially_paid"
        ? []
        : ["approve" as QuoteAction]),
      "discard",
    ];
  }, [normalizedStatus]);

  async function runStateAction(action: QuoteAction) {
    setActionError("");

    if (action === "discard") {
      const ok = window.confirm("Discard this quote? It will move to the discarded section and can be recovered later.");
      if (!ok) return;
    }

    try {
      setIsSubmitting(true);
      setActiveKey(action);

      const response = await fetch(`/api/agent/quotes/${quoteId}/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setActionError(result?.error || result?.details || "Failed to update quote.");
        return;
      }

      router.refresh();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Something went wrong while updating the quote.",
      );
    } finally {
      setIsSubmitting(false);
      setActiveKey(null);
    }
  }

  async function runShare(channel: ShareChannel) {
    setActionError("");

    try {
      setIsSubmitting(true);
      setActiveKey(`share:${channel}`);

      const response = await fetch(`/api/agent/quotes/${quoteId}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ channel }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setActionError(result?.error || result?.details || "Failed to update share status.");
        return;
      }

      const shareUrl = `${window.location.origin}/agent/quotes/${quoteId}`;
      const shareText = `${quotePublicLabel} from EasyTrip365`;

      if (channel === "copy_link") {
        await navigator.clipboard.writeText(shareUrl);
      }

      if (channel === "whatsapp") {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
          "_blank",
          "noopener,noreferrer",
        );
      }

      if (channel === "email") {
        window.location.href = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(
          `${shareText}\n\n${shareUrl}`,
        )}`;
      }

      router.refresh();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Something went wrong while sharing the quote.",
      );
    } finally {
      setIsSubmitting(false);
      setActiveKey(null);
    }
  }

  async function recordPayment() {
    setActionError("");

    const amountValue = safeNumber(paymentAmount);

    if (amountValue <= 0) {
      setActionError("Payment amount must be greater than 0.");
      return;
    }

    try {
      setIsSubmitting(true);
      setActiveKey("payment");

      const response = await fetch(`/api/agent/quotes/${quoteId}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountValue,
          paymentMode,
          paymentDate,
          note: paymentNote,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setActionError(result?.error || result?.details || "Failed to record payment.");
        return;
      }

      setPaymentNote("");
      router.refresh();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Something went wrong while recording payment.",
      );
    } finally {
      setIsSubmitting(false);
      setActiveKey(null);
    }
  }

  async function addExpense() {
    setActionError("");

    const amountValue = safeNumber(expenseAmount);

    if (!expenseLabel.trim()) {
      setActionError("Expense label is required.");
      return;
    }

    if (amountValue <= 0) {
      setActionError("Expense amount must be greater than 0.");
      return;
    }

    try {
      setIsSubmitting(true);
      setActiveKey("expense");

      const response = await fetch(`/api/agent/quotes/${quoteId}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: expenseLabel,
          amount: amountValue,
          note: expenseNote,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setActionError(result?.error || result?.details || "Failed to add expense.");
        return;
      }

      setExpenseLabel("");
      setExpenseAmount("");
      setExpenseNote("");
      router.refresh();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Something went wrong while adding expense.",
      );
    } finally {
      setIsSubmitting(false);
      setActiveKey(null);
    }
  }

  return (
    <div className="space-y-4">
      {actionError ? (
        <div className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {actionError}
        </div>
      ) : null}

      <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">Quote Status Actions</p>
        <p className="mt-1 text-sm text-slate-600">
          Approve to move into income flow. Discard keeps the quote recoverable.
        </p>

        <div className="mt-4 grid gap-3">
          {availableActions.map((action) => {
            const Icon = getActionIcon(action);

            return (
              <button
                key={action}
                type="button"
                disabled={isSubmitting}
                onClick={() => runStateAction(action)}
                className={[
                  "inline-flex w-full items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
                  getActionClasses(action),
                ].join(" ")}
              >
                {isSubmitting && activeKey === action ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Icon className="h-4 w-4" />
                    {getActionLabel(action)}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">Share Quote</p>
        <p className="mt-1 text-sm text-slate-600">
          Share with multiple channels. Share actions also update DB activity.
        </p>

        <div className="mt-4 grid gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => runShare("copy_link")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && activeKey === "share:copy_link" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Copying...
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Share Link
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => runShare("whatsapp")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-sky-300 bg-sky-50 px-5 py-3 text-sm font-semibold text-sky-700 transition hover:border-sky-400 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && activeKey === "share:whatsapp" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Opening WhatsApp...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Share on WhatsApp
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => runShare("email")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-indigo-300 bg-indigo-50 px-5 py-3 text-sm font-semibold text-indigo-700 transition hover:border-indigo-400 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && activeKey === "share:email" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Opening Email...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Share by Email
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => runShare("manual")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && activeKey === "share:manual" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Mark Shared Manually
              </>
            )}
          </button>
        </div>
      </div>

      <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Record Payment</p>
            <p className="mt-1 text-sm text-slate-600">
              Supports partial and full payments. Auto recalculates outstanding balance.
            </p>
          </div>

          <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
            {paymentStatus || "unpaid"}
          </div>
        </div>

        <div className="mt-4 grid gap-3 text-sm text-slate-700">
          <div className="flex items-center justify-between">
            <span>Base Quote</span>
            <span className="font-semibold text-slate-950">{formatCurrency(amount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Additional Expenses</span>
            <span className="font-semibold text-slate-950">{formatCurrency(additionalExpenseTotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Total Received</span>
            <span className="font-semibold text-slate-950">{formatCurrency(amountReceived)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Balance Due</span>
            <span className="font-semibold text-slate-950">{formatCurrency(balanceDue)}</span>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Payment Amount</span>
            <input
              type="number"
              min="0"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              disabled={fullyPaid}
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Payment Mode</span>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              disabled={fullyPaid}
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="upi">UPI</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Payment Date</span>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              disabled={fullyPaid}
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Payment Note</span>
            <textarea
              rows={3}
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              placeholder="Optional note"
              disabled={fullyPaid}
            />
          </label>

          <button
            type="button"
            disabled={isSubmitting || fullyPaid}
            onClick={recordPayment}
            className={[
              "inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
              fullyPaid
                ? "border border-slate-200 bg-slate-100 text-slate-400"
                : "border border-violet-300 bg-violet-50 text-violet-700 hover:border-violet-400 hover:bg-violet-100",
            ].join(" ")}
          >
            {isSubmitting && activeKey === "payment" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Recording Payment...
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4" />
                {fullyPaid ? "Fully Paid" : "Record Payment"}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <IndianRupee className="mt-0.5 h-4 w-4 text-slate-500" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Add Additional Expense</p>
            <p className="mt-1 text-sm text-slate-600">
              Add extras requested by the customer. Quote totals and due balance will auto recalculate.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Expense Label</span>
            <input
              type="text"
              value={expenseLabel}
              onChange={(e) => setExpenseLabel(e.target.value)}
              placeholder="Example: Extra sightseeing upgrade"
              className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Expense Amount</span>
            <input
              type="number"
              min="0"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Expense Note</span>
            <textarea
              rows={3}
              value={expenseNote}
              onChange={(e) => setExpenseNote(e.target.value)}
              placeholder="Optional note"
              className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            />
          </label>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={addExpense}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-orange-300 bg-orange-50 px-5 py-3 text-sm font-semibold text-orange-700 transition hover:border-orange-400 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && activeKey === "expense" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding Expense...
              </>
            ) : (
              <>
                <IndianRupee className="h-4 w-4" />
                Add Expense
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}