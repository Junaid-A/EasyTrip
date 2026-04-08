"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AgentLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const resetSuccess = searchParams.get("reset") === "success";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (signInError || !data.user) {
      setError(signInError?.message ?? "Could not sign in.");
      setSubmitting(false);
      return;
    }

    const role = data.user.app_metadata?.role;
    const approved = data.user.app_metadata?.approved;
    const mustChangePassword = data.user.app_metadata?.must_change_password;

    if (role !== "agent" || approved !== true) {
      await supabase.auth.signOut();
      setError("This account is not allowed to access the agent portal.");
      setSubmitting(false);
      return;
    }

    router.replace(mustChangePassword ? "/agent/reset-password" : "/agent/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#f7f3ee] px-4 py-12">
      <div className="mx-auto max-w-md rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-500">
          EasyTrip365
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Agent login</h1>
        <p className="mt-2 text-sm text-slate-600">
          Approved agents can sign in here to access the dashboard.
        </p>

        {resetSuccess ? (
          <div className="mt-5 rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Password changed successfully. Please sign in with your new password.
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-[22px] border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 w-full rounded-[22px] border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="h-12 w-full rounded-full bg-[#020826] text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}