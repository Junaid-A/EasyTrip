"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
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

type AdminLoginClientProps = {
  nextPath: string;
};

export default function AdminLoginClient({
  nextPath,
}: AdminLoginClientProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");

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

      if (role !== "admin") {
        await supabase.auth.signOut();
        setErrorText("Not an admin account.");
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
            Admin login
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Authorized administrators only.
          </p>
        </div>

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
              placeholder="admin@easytrip365.com"
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