"use client";

import Link from "next/link";
import { Mail, ChevronDown } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f3ee_0%,#f8fafc_48%,#ffffff_100%)] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[1.02fr_0.98fr]">
        <section className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-[linear-gradient(160deg,#0f172a_0%,#1f2937_24%,#f97316_140%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(251,146,60,0.18),transparent_30%)]" />

          <div className="relative z-10 flex min-h-screen w-full flex-col justify-between px-10 py-9 xl:px-14 xl:py-12">
            <div className="flex items-center justify-between gap-6">
              <Link
                href="/"
                className="inline-flex items-center gap-3 text-white/95 transition hover:text-white"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 text-sm font-bold text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] backdrop-blur">
                  ET
                </div>
                <div>
                  <p className="text-[12px] font-semibold tracking-[0.22em]">
                    EASYTRIP365
                  </p>
                  <p className="mt-1 text-sm text-white/70">
                    Curated holiday journeys
                  </p>
                </div>
              </Link>

              <Link
                href="/trip-builder"
                className="rounded-full border border-white/18 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/14"
              >
                Explore Trips
              </Link>
            </div>

            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-orange-200">
                Welcome back
              </p>
              <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-tight text-white">
                Clean sign in, faster bookings, smoother trip planning.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-8 text-white/75">
                Continue with your email or Google account. Phone number is kept
                mandatory for booking records, updates, and future travel
                communication.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <FeatureCard
                  title="Email-first"
                  description="Primary sign in flow built around email."
                />
                <FeatureCard
                  title="Phone on file"
                  description="Mandatory for records and support communication."
                />
                <FeatureCard
                  title="No OTP"
                  description="Less friction for a cleaner conversion flow."
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 text-sm text-white/60">
              <p>Premium, mobile-first holiday booking flow.</p>
              <Link href="/" className="transition hover:text-white">
                Back to home
              </Link>
            </div>
          </div>
        </section>

        <section className="relative flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <div className="absolute inset-0 lg:hidden">
            <div className="absolute inset-x-0 top-0 h-[38vh] bg-[linear-gradient(160deg,#0f172a_0%,#1f2937_26%,#f97316_140%)]" />
            <div className="absolute inset-x-0 top-0 h-[38vh] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_26%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.18),transparent_30%)]" />
          </div>

          <div className="relative z-10 w-full max-w-[560px]">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <Link
                href="/"
                className="inline-flex items-center gap-3 text-white transition hover:text-white/90"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 text-sm font-bold text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] backdrop-blur">
                  ET
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.18em]">
                    EASYTRIP365
                  </p>
                  <p className="mt-1 text-xs text-white/70">
                    Curated holiday journeys
                  </p>
                </div>
              </Link>

              <Link
                href="/trip-builder"
                className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/15"
              >
                Explore
              </Link>
            </div>

            <div className="overflow-hidden rounded-[34px] border border-black/5 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
              <div className="px-5 pb-8 pt-7 sm:px-8 sm:pb-10 sm:pt-9">
                <div className="text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-500">
                    Sign in / Create account
                  </p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2.15rem]">
                    Let&apos;s get you started
                  </h2>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500 sm:text-[15px]">
                    Use your email to continue. Phone number is required for
                    booking records and future communication.
                  </p>
                </div>

                <div className="mt-8 space-y-5">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                      Email address <span className="text-rose-500">*</span>
                    </span>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      className="mt-2.5 h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[15px] text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    />
                  </label>

                  <div>
                    <div className="flex items-start gap-3">
                      <div className="w-[112px] shrink-0">
                        <span className="text-sm font-medium text-slate-700">
                          Code
                        </span>
                        <button
                          type="button"
                          className="mt-2.5 flex h-14 w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-[15px] font-medium text-slate-950 transition hover:border-slate-300"
                        >
                          <span>+91</span>
                          <ChevronDown className="h-4 w-4 text-slate-500" />
                        </button>
                      </div>

                      <label className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-slate-700">
                          Phone number <span className="text-rose-500">*</span>
                        </span>
                        <input
                          type="tel"
                          placeholder="Enter your phone number"
                          className="mt-2.5 h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[15px] text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                        />
                      </label>
                    </div>

                    <p className="mt-2.5 text-xs leading-6 text-slate-500">
                      No SMS OTP. Number is collected only for booking records,
                      updates, support, and future communication.
                    </p>
                  </div>

                  <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
                    />
                    <span className="text-sm leading-6 text-slate-600">
                      Receive booking updates, reminders, offers, and trip
                      communication on email and phone.
                    </span>
                  </label>

                  <button
                    type="button"
                    className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-orange-500 px-6 text-[15px] font-semibold text-white shadow-[0_16px_34px_rgba(249,115,22,0.28)] transition hover:bg-orange-600"
                  >
                    Continue with Email
                  </button>
                </div>

                <div className="mt-7 flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-200" />
                  <p className="text-sm text-slate-400">or continue with</p>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 text-[15px] font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <GoogleIcon />
                    Continue with Google
                  </button>

                  <button
                    type="button"
                    className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 text-[15px] font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <Mail className="h-4.5 w-4.5 text-slate-600" />
                    Email Login
                  </button>
                </div>

                <div className="mt-8 text-center text-sm leading-7 text-slate-500">
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

                <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center">
                  <p className="text-sm text-slate-500">
                    Need help? Contact{" "}
                    <a
                      href="mailto:support@easytrip365.com"
                      className="font-medium text-slate-800 underline underline-offset-4 transition hover:text-orange-600"
                    >
                      support@easytrip365.com
                    </a>
                  </p>
                </div>

                <div className="mt-8 text-center">
                  <Link
                    href="/"
                    className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
                  >
                    Back to EasyTrip365
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/8 p-4 backdrop-blur">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-white/65">{description}</p>
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