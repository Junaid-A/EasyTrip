"use client";

import { useEffect, useState } from "react";
import { useAuthModalStore } from "@/store/useAuthModalStore";
import { signInWithEmail, signUpWithEmail } from "@/lib/auth/auth-client";
import { useAuth } from "@/components/providers/auth-provider";

export function AuthModal() {
  const isOpen = useAuthModalStore((state) => state.isOpen);
  const mode = useAuthModalStore((state) => state.mode);
  const prefillEmail = useAuthModalStore((state) => state.prefillEmail);
  const prefillPhone = useAuthModalStore((state) => state.prefillPhone);
  const closeAuthModal = useAuthModalStore((state) => state.closeAuthModal);
  const setMode = useAuthModalStore((state) => state.setMode);
  const clearPrefill = useAuthModalStore((state) => state.clearPrefill);

  const { refreshAuth } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    if (isOpen) {
      setEmail(prefillEmail || "");
      setPhone(prefillPhone || "");
      setErrorText("");
      setPassword("");
    }
  }, [isOpen, prefillEmail, prefillPhone]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeAuthModal();
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeAuthModal]);

  async function handleSubmit() {
    setLoading(true);
    setErrorText("");

    try {
      if (mode === "signup") {
        if (!fullName.trim() || !phone.trim() || !email.trim() || !password.trim()) {
          setErrorText("Please fill all signup fields.");
          setLoading(false);
          return;
        }

        const { error } = await signUpWithEmail({
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) {
          setErrorText(error.message);
          setLoading(false);
          return;
        }

        await refreshAuth();
        clearPrefill();
        closeAuthModal();
        return;
      }

      if (!email.trim() || !password.trim()) {
        setErrorText("Please enter email and password.");
        setLoading(false);
        return;
      }

      const { error } = await signInWithEmail({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setErrorText(error.message);
        setLoading(false);
        return;
      }

      await refreshAuth();
      clearPrefill();
      closeAuthModal();
    } catch (error) {
      console.error(error);
      setErrorText("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/55 px-4 py-6">
      <div className="absolute inset-0" onClick={closeAuthModal} />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-500">
              EasyTrip365
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {mode === "login"
                ? "Login to continue your booking."
                : "Sign up to save your details and continue faster."}
            </p>
          </div>

          <button
            type="button"
            onClick={closeAuthModal}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === "login"
                  ? "bg-slate-950 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === "signup"
                  ? "bg-slate-950 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              Signup
            </button>
          </div>

          <div className="space-y-4">
            {mode === "signup" ? (
              <>
                <label className="block">
                  <span className="text-sm text-slate-500">Full Name</span>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="text-sm text-slate-500">Phone</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
                  />
                </label>
              </>
            ) : null}

            <label className="block">
              <span className="text-sm text-slate-500">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
              />
            </label>

            <label className="block">
              <span className="text-sm text-slate-500">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
              />
            </label>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Login"
                : "Create account"}
            </button>

            {errorText ? (
              <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorText}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}