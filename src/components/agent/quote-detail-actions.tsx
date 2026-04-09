"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Loader2, RotateCcw, Send, Trash2, Wallet } from "lucide-react";

type QuoteDetailActionsProps = {
  quoteId: string;
  currentStatus: string | null;
};

type QuoteAction = "approve" | "share" | "mark_paid" | "discard" | "recover";

function getButtonLabel(action: QuoteAction) {
  if (action === "approve") return "Approve Quote";
  if (action === "share") return "Mark as Shared";
  if (action === "mark_paid") return "Mark as Paid";
  if (action === "discard") return "Discard Quote";
  return "Recover Quote";
}

function getButtonIcon(action: QuoteAction) {
  if (action === "approve") return BadgeCheck;
  if (action === "share") return Send;
  if (action === "mark_paid") return Wallet;
  if (action === "discard") return Trash2;
  return RotateCcw;
}

function getButtonClasses(action: QuoteAction) {
  if (action === "approve") {
    return "border-emerald-300 bg-emerald-50 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100";
  }

  if (action === "share") {
    return "border-sky-300 bg-sky-50 text-sky-700 hover:border-sky-400 hover:bg-sky-100";
  }

  if (action === "mark_paid") {
    return "border-violet-300 bg-violet-50 text-violet-700 hover:border-violet-400 hover:bg-violet-100";
  }

  if (action === "discard") {
    return "border-rose-300 bg-rose-50 text-rose-700 hover:border-rose-400 hover:bg-rose-100";
  }

  return "border-amber-300 bg-amber-50 text-amber-700 hover:border-amber-400 hover:bg-amber-100";
}

export function QuoteDetailActions({
  quoteId,
  currentStatus,
}: QuoteDetailActionsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAction, setActiveAction] = useState<QuoteAction | null>(null);
  const [actionError, setActionError] = useState("");

  const normalizedStatus = (currentStatus || "").trim().toLowerCase();

  const actions: QuoteAction[] =
    normalizedStatus === "discarded"
      ? ["recover"]
      : [
          ...(normalizedStatus === "approved" || normalizedStatus === "paid" ? [] : ["approve" as QuoteAction]),
          ...(normalizedStatus === "paid" ? [] : ["share" as QuoteAction]),
          ...(normalizedStatus === "paid" ? [] : ["mark_paid" as QuoteAction]),
          "discard",
        ];

  async function handleAction(action: QuoteAction) {
    setActionError("");

    const discardConfirmed =
      action !== "discard" ||
      window.confirm("Discard this quote? You can recover it later.");
    if (!discardConfirmed) return;

    try {
      setIsSubmitting(true);
      setActiveAction(action);

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
      setActiveAction(null);
    }
  }

  return (
    <div className="space-y-3">
      {actionError ? (
        <div className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {actionError}
        </div>
      ) : null}

      <div className="grid gap-3">
        {actions.map((action) => {
          const Icon = getButtonIcon(action);

          return (
            <button
              key={action}
              type="button"
              disabled={isSubmitting}
              onClick={() => handleAction(action)}
              className={[
                "inline-flex w-full items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
                getButtonClasses(action),
              ].join(" ")}
            >
              {isSubmitting && activeAction === action ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Icon className="h-4 w-4" />
                  {getButtonLabel(action)}
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}