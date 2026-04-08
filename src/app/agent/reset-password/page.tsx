"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function getRoleFromUser(user: {
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
} | null) {
  if (!user) return null;

  const appRole = user.app_metadata?.role;
  const userRole = user.user_metadata?.role;

  if (appRole === "admin" || appRole === "agent" || appRole === "customer") {
    return appRole;
  }

  if (userRole === "admin" || userRole === "agent" || userRole === "customer") {
    return userRole;
  }

  return null;
}

function isApprovedAgent(user: {
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
} | null) {
  if (!user) return false;

  return (
    user.app_metadata?.approved === true ||
    user.user_metadata?.approved === true ||
    user.app_metadata?.agent_approved === true ||
    user.user_metadata?.agent_approved === true
  );
}

function mustChangePassword(user: {
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
} | null) {
  if (!user) return false;

  return (
    user.app_metadata?.must_change_password === true ||
    user.user_metadata?.must_change_password === true
  );
}

export default function AgentResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  const passwordValid = useMemo(() => password.length >= 8, [password]);

  useEffect(() => {
    let ignore = false;

    async function verifyAccess() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (ignore) return;

      const role = getRoleFromUser(user);
      const approved = isApprovedAgent(user);
      const needsReset = mustChangePassword(user);

      if (!user || role !== "agent" || !approved) {
        router.replace("/agent/login");
        router.refresh();
        return;
      }

      if (!needsReset) {
        router.replace("/agent/dashboard");
        router.refresh();
        return;
      }

      setChecking(false);
    }

    verifyAccess();

    return () => {
      ignore = true;
    };
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorText("");
    setSuccessText("");

    if (!passwordValid) {
      setErrorText("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorText("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        password,
        data: {
          must_change_password: false,
        },
      });

      if (error) {
        setErrorText(error.message || "Unable to update password.");
        return;
      }

      const {
        data: { user: refreshedUser },
      } = await supabase.auth.getUser();

      const stillNeedsReset = mustChangePassword(refreshedUser);

      if (stillNeedsReset) {
        setErrorText("Password updated, but reset flag is still active.");
        return;
      }

      setSuccessText("Password updated successfully.");
      router.replace("/agent/dashboard");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-[#f8f4ee] px-4 py-10">
        <div className="mx-auto max-w-md rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-sm text-slate-600">Checking access...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f4ee] px-4 py-10">
      <div className="mx-auto max-w-md rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">
            EasyTrip365
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Change password
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            First login requires a password change before agent access is allowed.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              New password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400"
              placeholder="Minimum 8 characters"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Confirm new password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400"
              placeholder="Re-enter password"
            />
          </div>

          {errorText ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorText}
            </div>
          ) : null}

          {successText ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successText}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="h-12 w-full rounded-2xl bg-slate-950 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </main>
  );
}