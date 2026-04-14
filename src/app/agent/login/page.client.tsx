"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AgentLoginClientProps = {
  resetSuccess: boolean;
  nextPath: string;
};

export default function AgentLoginClient({
  resetSuccess,
  nextPath,
}: AgentLoginClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message || "Unable to sign in.");
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        await supabase.auth.signOut();
        setError("Unable to verify signed-in user.");
        return;
      }

      const role = user.app_metadata?.role || user.user_metadata?.role;

      if (role !== "agent") {
        await supabase.auth.signOut();
        setError("Not an agent account.");
        return;
      }

      if (user.app_metadata?.must_change_password) {
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
            Authorized agents only.
          </p>
        </div>

        {resetSuccess ? (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Password changed successfully. Please sign in again.
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

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
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