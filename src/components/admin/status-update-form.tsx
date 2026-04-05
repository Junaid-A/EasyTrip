"use client";

import { useMemo, useState, useTransition } from "react";

type StatusValue = "pending" | "confirmed" | "cancelled";

function normalizeStatus(value?: string | null): StatusValue {
  const status = (value || "pending").toLowerCase();

  if (status === "confirmed" || status === "cancelled" || status === "pending") {
    return status;
  }

  return "pending";
}

function getStatusClasses(status?: string | null) {
  const normalized = normalizeStatus(status);

  if (normalized === "confirmed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalized === "cancelled") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

export function StatusUpdateForm({
  bookingRef,
  currentStatus,
  bookingSource,
  action,
}: {
  bookingRef: string;
  currentStatus: StatusValue;
  bookingSource: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const [selectedStatus, setSelectedStatus] = useState<StatusValue>(currentStatus);
  const [isPending, startTransition] = useTransition();

  const hasChanges = useMemo(
    () => selectedStatus !== currentStatus,
    [selectedStatus, currentStatus],
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Current status:
        <span
          className={`ml-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${getStatusClasses(
            currentStatus,
          )}`}
        >
          {currentStatus}
        </span>
      </p>

      <div className="grid gap-3">
        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Select New Status
        </label>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as StatusValue)}
          disabled={isPending}
          className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {hasChanges ? (
        <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-900">
            Selected change:
            <span
              className={`ml-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${getStatusClasses(
                selectedStatus,
              )}`}
            >
              {selectedStatus}
            </span>
          </p>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => {
                startTransition(async () => {
                  const formData = new FormData();
                  formData.set("bookingRef", bookingRef);
                  formData.set("status", selectedStatus);
                  await action(formData);
                });
              }}
              disabled={isPending}
              className="inline-flex flex-1 items-center justify-center rounded-[18px] bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus(currentStatus)}
              disabled={isPending}
              className="inline-flex items-center justify-center rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-600">
            No unsaved status changes.
          </p>
        </div>
      )}

      <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Source
        </p>
        <p className="mt-2 text-sm font-medium text-slate-900">
          {bookingSource}
        </p>
      </div>
    </div>
  );
}