"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AgentResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!user) {
        router.replace("/agent/login");
        return;
      }

      if (user.app_metadata?.role !== "agent") {
        router.replace("/");
        return;
      }

      if (!user.app_metadata?.must_change_password) {
        router.replace("/agent/dashboard");
        return;
      }

      setChecking(false);
    }

    void load();

    return () => {
      active = false;
    };
  }, [router, supabase]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    const { error: updateUserError } = await supabase.auth.updateUser({ password });

    if (updateUserError) {
      setError(updateUserError.message);
      setSubmitting(false);
      return;
    }

    const res = await fetch("/api/agent/complete-password-reset", {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Password updated, but reset completion failed.");
      setSubmitting(false);
      return;
    }

    await supabase.auth.signOut();
    router.replace("/agent/login?reset=success");
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#f7f3ee] px-4 py-12">
        <div className="mx-auto max-w-md rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3ee] px-4 py-12">
      <div className="mx-auto max-w-md rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-500">
          EasyTrip365
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
          Change password
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          First login requires a password change before dashboard access is allowed.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 w-full rounded-[22px] border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 w-full rounded-[22px] border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
              required
            />
          </div>

          {error ? (
            <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="h-12 w-full rounded-full bg-[#020826] text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Updating password..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}