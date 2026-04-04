"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { useAuthModalStore } from "@/store/useAuthModalStore";

export function AuthModal() {
  const { isOpen, view, closeAuthModal, setAuthView } = useAuthModalStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeAuthModal();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, closeAuthModal]);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[140]">
      <button
        type="button"
        aria-label="Close overlay"
        onClick={closeAuthModal}
        className="absolute inset-0 bg-[rgba(15,23,42,0.58)] backdrop-blur-[6px]"
      />

      <div className="relative flex min-h-screen items-center justify-center p-3 sm:p-5">
        <div className="relative max-h-[90vh] w-full max-w-[500px] overflow-y-auto rounded-[30px] border border-slate-200 bg-[#f8f6f1] shadow-[0_30px_100px_rgba(15,23,42,0.28)]">
          <button
            type="button"
            onClick={closeAuthModal}
            aria-label="Close auth modal"
            className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="px-5 pb-6 pt-8 sm:px-7 sm:pb-7 sm:pt-9">
            <div className="pr-14">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-500">
                {view === "login" ? "Welcome back" : "Create account"}
              </p>

              <h2 className="mt-3 text-[2rem] font-semibold leading-tight tracking-tight text-slate-950 sm:text-[2.5rem]">
                {view === "login"
                  ? "Continue your holiday planning"
                  : "Create your EasyTrip365 account"}
              </h2>

              <p className="mt-4 text-[15px] leading-7 text-slate-500">
                Email-first access with mandatory phone number for records and
                travel communication.
              </p>
            </div>

            <div className="mt-7 rounded-[20px] bg-slate-200/70 p-1.5">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setAuthView("login")}
                  className={`rounded-[16px] px-4 py-3 text-base font-semibold transition ${
                    view === "login"
                      ? "bg-white text-slate-950 shadow-[0_6px_18px_rgba(15,23,42,0.08)]"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() => setAuthView("signup")}
                  className={`rounded-[16px] px-4 py-3 text-base font-semibold transition ${
                    view === "signup"
                      ? "bg-white text-slate-950 shadow-[0_6px_18px_rgba(15,23,42,0.08)]"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Sign up
                </button>
              </div>
            </div>

            <div className="mt-7 space-y-5">
              {view === "signup" ? (
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Full name <span className="text-rose-500">*</span>
                  </span>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="mt-2.5 h-14 w-full rounded-[20px] border border-slate-200 bg-white px-5 text-[15px] text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </label>
              ) : null}

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Email address <span className="text-rose-500">*</span>
                </span>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="mt-2.5 h-14 w-full rounded-[20px] border border-slate-200 bg-white px-5 text-[15px] text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </label>

              <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-3">
                <div>
                  <span className="text-sm font-medium text-slate-700">
                    Code
                  </span>
                  <button
                    type="button"
                    className="mt-2.5 flex h-14 w-full items-center justify-between rounded-[20px] border border-slate-200 bg-white px-4 text-[15px] font-medium text-slate-950"
                  >
                    <span>+91</span>
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  </button>
                </div>

                <label className="min-w-0">
                  <span className="text-sm font-medium text-slate-700">
                    Phone number <span className="text-rose-500">*</span>
                  </span>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    className="mt-2.5 h-14 w-full rounded-[20px] border border-slate-200 bg-white px-5 text-[15px] text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </label>
              </div>

              <p className="-mt-1 text-sm leading-7 text-slate-500">
                No SMS OTP. Number is collected for booking records, updates,
                support, and future communication.
              </p>

              <button
                type="button"
                className="inline-flex h-14 w-full items-center justify-center rounded-[20px] bg-orange-500 px-6 text-[15px] font-semibold text-white shadow-[0_16px_34px_rgba(249,115,22,0.24)] transition hover:bg-orange-600"
              >
                {view === "login" ? "Continue with Email" : "Create account"}
              </button>

              <button
                type="button"
                className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-[20px] border border-slate-200 bg-white px-5 text-[15px] font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <GoogleIcon />
                Continue with Google
              </button>
            </div>

            <div className="mt-6 text-center text-sm leading-7 text-slate-500">
              By continuing, I agree to the{" "}
              <Link
                href="/terms"
                className="font-medium text-orange-600 underline underline-offset-4 transition hover:text-orange-700"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-medium text-orange-600 underline underline-offset-4 transition hover:text-orange-700"
              >
                Privacy Policy
              </Link>
              .
            </div>

            <div className="mt-4 text-center text-sm text-slate-500">
              Need help? Contact{" "}
              <a
                href="mailto:support@easytrip365.com"
                className="font-medium text-slate-800 underline underline-offset-4 transition hover:text-orange-600"
              >
                support@easytrip365.com
              </a>
            </div>

            <div className="mt-4 text-center text-sm text-slate-500">
              {view === "login" ? (
                <>
                  New here?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthView("signup")}
                    className="font-semibold text-orange-600 transition hover:text-orange-700"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthView("login")}
                    className="font-semibold text-orange-600 transition hover:text-orange-700"
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.4c-.24 1.26-.96 2.33-2.04 3.05l3.3 2.56c1.92-1.77 3.03-4.38 3.03-7.5 0-.72-.06-1.4-.19-2.06H12Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.73 0 5.02-.9 6.69-2.44l-3.3-2.56c-.91.61-2.08.97-3.39.97-2.61 0-4.82-1.76-5.61-4.13l-3.41 2.63A10.1 10.1 0 0 0 12 22Z"
      />
      <path
        fill="#4A90E2"
        d="M6.39 13.84A6.08 6.08 0 0 1 6.08 12c0-.64.11-1.25.31-1.84L2.98 7.53A10.02 10.02 0 0 0 1.9 12c0 1.61.38 3.13 1.08 4.47l3.41-2.63Z"
      />
      <path
        fill="#FBBC05"
        d="M12 5.98c1.49 0 2.82.51 3.87 1.51l2.9-2.9C17 2.98 14.71 2 12 2 8.05 2 4.63 4.27 2.98 7.53l3.41 2.63C7.18 7.74 9.39 5.98 12 5.98Z"
      />
    </svg>
  );
}