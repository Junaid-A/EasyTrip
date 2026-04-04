"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  signUpWithEmail,
} from "@/lib/auth/auth-client";

type UserInfo = {
  id: string;
  email: string | undefined;
} | null;

export default function AuthTestPage() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState<UserInfo>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadUser() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      setUser(null);
      return;
    }

    setUser({
      id: data.user.id,
      email: data.user.email,
    });
  }

  useEffect(() => {
    loadUser();

    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit() {
    setLoading(true);
    setMessage("");

    try {
      if (mode === "signup") {
        const { error } = await signUpWithEmail({
          fullName,
          phone,
          email,
          password,
        });

        if (error) {
          setMessage(error.message);
        } else {
          setMessage(
            "Signup successful. If email confirmation is enabled in Supabase, check your email before login."
          );
          await loadUser();
        }
      } else {
        const { error } = await signInWithEmail({
          email,
          password,
        });

        if (error) {
          setMessage(error.message);
        } else {
          setMessage("Login successful.");
          await loadUser();
        }
      }
    } catch (error) {
      setMessage("Something went wrong.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setMessage("");

    const { error } = await signInWithGoogle("/auth-test");

    if (error) {
      setMessage(error.message);
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoading(true);
    setMessage("");

    const { error } = await signOutUser();

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Logged out.");
      setUser(null);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500">
            EasyTrip365
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">Auth Test</h1>
          <p className="mt-2 text-sm text-slate-500">
            This is only a temporary test page to confirm Supabase auth works.
          </p>
        </div>

        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              mode === "signup"
                ? "bg-slate-950 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Signup
          </button>
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              mode === "login"
                ? "bg-slate-950 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Login
          </button>
        </div>

        <div className="space-y-4">
          {mode === "signup" && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Phone
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none"
                  placeholder="Enter phone number"
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none"
              placeholder="Enter email"
              type="email"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none"
              placeholder="Enter password"
              type="password"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : mode === "signup"
              ? "Create account"
              : "Login"}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 disabled:opacity-60"
          >
            Continue with Google
          </button>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="w-full rounded-2xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 disabled:opacity-60"
          >
            Logout
          </button>
        </div>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Current user</p>
          {user ? (
            <div className="mt-2 space-y-1">
              <p>
                <span className="font-medium">User ID:</span> {user.id}
              </p>
              <p>
                <span className="font-medium">Email:</span> {user.email}
              </p>
            </div>
          ) : (
            <p className="mt-2">No user logged in.</p>
          )}
        </div>

        {message && (
          <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}