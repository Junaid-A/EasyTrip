"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AllowedRole = "admin" | "agent" | "customer" | null;

function getRoleFromUser(user: {
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
} | null): AllowedRole {
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
  user_metadata?: Record<string, unknown>;
} | null) {
  if (!user) return false;

  return user.user_metadata?.must_change_password === true;
}

export default function AgentLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextPath = useMemo(
    () => searchParams.get("next") || "/agent/dashboard",
    [searchParams]
  );

  const urlError = searchParams.get("error");
  const resetSuccess = searchParams.get("reset") === "success";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState(
    urlError === "not-approved" ? "Your agent account is not approved yet." : ""
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorText("");

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorText(error.message || "Unable to sign in.");
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        await supabase.auth.signOut();
        setErrorText("Unable to verify signed-in user.");
        return;
      }

      const role = getRoleFromUser(user);
      const approved = isApprovedAgent(user);
      const needsReset = mustChangePassword(user);

      if (role !== "agent") {
        await supabase.auth.signOut();
        setErrorText("Not an agent account.");
        return;
      }

      if (!approved) {
        await supabase.auth.signOut();
        setErrorText("Your agent account is not approved yet.");
        return;
      }

      if (needsReset) {
        router.replace("/agent/reset-password");
        router.refresh();
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f4ee] px-4 py-10">
      <div className="mx-auto max-w-md rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">
            EasyTrip365
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Agent login
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Only approved agents can access the portal.
          </p>
        </div>

        {resetSuccess ? (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Password changed successfully. Please sign in with your new password.
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400"
              placeholder="agent@easytrip365.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400"
              placeholder="Enter password"
            />
          </div>

          {errorText ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorText}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="h-12 w-full rounded-2xl bg-slate-950 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}