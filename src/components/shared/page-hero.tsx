"use client";

import Link from "next/link";
import { useState } from "react";
import { HeroSearchCard } from "@/components/public/hero-search-card";
import { AiHelperWidget } from "@/components/public/ai-helper-widget";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  className?: string;
};

const destinationPills = ["Bangkok", "Phuket", "Krabi", "Dubai", "Singapore"];
const packagePills = ["Couples", "Family", "Luxury"];

export function PageHero({
  eyebrow,
  title,
  description,
  className = "",
}: PageHeroProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <>
      <section
        className={`mobile-bottom-search-safe relative overflow-hidden px-3 pt-24 sm:px-5 sm:pt-28 ${className}`}
      >
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.22),transparent_28%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.22),transparent_30%),linear-gradient(180deg,#f8f5ef_0%,#f5efe4_52%,#eef6fb_100%)]" />
        <div className="absolute inset-0 -z-10 opacity-[0.08] [background-image:radial-gradient(#0f172a_0.8px,transparent_0.8px)] [background-size:20px_20px]" />

        <div className="mx-auto max-w-7xl">
          <div className="hero-shell">
            <div className="absolute inset-0">
              <div className="absolute left-[-8%] top-[10%] h-[320px] w-[320px] rounded-full bg-amber-200/45 blur-3xl" />
              <div className="absolute right-[-8%] top-[5%] h-[320px] w-[320px] rounded-full bg-sky-200/45 blur-3xl" />
              <div className="absolute bottom-[-10%] left-[20%] h-[240px] w-[240px] rounded-full bg-orange-200/30 blur-3xl" />
            </div>

            <div className="relative px-5 pb-10 pt-8 sm:px-8 sm:pb-12 lg:px-10 lg:pb-28 lg:pt-10">
              <div className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="relative z-10 pt-2 lg:pt-10">
                  {eyebrow ? (
                    <div className="inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-600 sm:text-[11px]">
                      <span className="h-px w-10 bg-slate-300" />
                      <span>{eyebrow}</span>
                    </div>
                  ) : null}

                  <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-[-0.06em] text-slate-950 sm:text-5xl lg:text-7xl lg:leading-[0.9]">
                    {title}
                  </h1>

                  <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                    {description}
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      href="/results"
                      className="inline-flex rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Explore Trips
                    </Link>
                    <Link
                      href="/trip-builder"
                      className="inline-flex rounded-full border border-slate-300/80 bg-white/70 px-6 py-3.5 text-sm font-semibold text-slate-800 backdrop-blur transition hover:bg-white"
                    >
                      Plan a Custom Trip
                    </Link>
                  </div>

                  <div className="mt-8 grid gap-4 sm:max-w-[560px] sm:grid-cols-2">
                    <div className="rounded-[28px] bg-[#ddecbd] p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
                      <h3 className="text-2xl font-bold leading-tight tracking-[-0.03em] text-slate-950">
                        Handpicked stays, transfers, sightseeing, and smarter pricing.
                      </h3>
                      <p className="mt-4 text-sm leading-7 text-slate-700">
                        Compare package-ready options and customize your route without
                        losing clarity on trip value, upgrades, or inclusions.
                      </p>
                      <p className="mt-5 text-base font-semibold text-slate-900">
                        Curated journeys starting from ₹46,000+
                      </p>
                    </div>

                    <div className="rounded-[28px] bg-[#dbeafe] p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)] sm:translate-y-8">
                      <h3 className="text-2xl font-bold leading-tight tracking-[-0.03em] text-slate-950">
                        Designed to help customers choose faster.
                      </h3>
                      <p className="mt-4 text-sm leading-7 text-slate-700">
                        Surface stronger options, compare them faster, and move toward
                        booking with less confusion and better confidence.
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {destinationPills.map((item) => (
                          <span
                            key={item}
                            className="rounded-full bg-white/85 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.04)]"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative min-h-[430px] lg:min-h-[650px]">
                  <div className="absolute inset-x-0 bottom-0 top-6 rounded-[34px] bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04))]" />

                  <div
                    className="absolute left-[8%] top-[2%] z-20 h-[96px] w-[96px] rounded-full border-[5px] border-white/90 bg-cover bg-center shadow-[0_18px_40px_rgba(15,23,42,0.14)] lg:h-[110px] lg:w-[110px]"
                    style={{
                      backgroundImage:
                        "url('https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800')",
                    }}
                  />

                  <div className="absolute right-[2%] top-6 z-20 w-[230px] rounded-[28px] bg-[#fde8e8]/92 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur sm:w-[280px]">
                    <p className="text-xl font-bold tracking-[-0.03em] text-slate-950">
                      Explore top destinations
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {destinationPills.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-[4%] right-[14%] overflow-hidden rounded-[36px] shadow-[0_28px_70px_rgba(15,23,42,0.14)]">
                    <div
                      className="aspect-[1.05/1] bg-cover bg-center"
                      style={{
                        backgroundImage:
                          "url('https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=1400')",
                      }}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_42%,rgba(10,15,25,0.18)_100%)]" />
                  </div>

                  <div className="absolute bottom-8 left-[7%] z-20 w-[46%] rounded-[26px] bg-slate-950 p-4 text-white shadow-[0_18px_40px_rgba(15,23,42,0.24)] sm:w-[38%]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
                      Most booked
                    </p>
                    <p className="mt-3 text-sm font-bold leading-5 sm:text-base">
                      Bangkok city stays with sightseeing-ready upgrades
                    </p>
                  </div>

                  <div className="absolute bottom-0 right-0 z-20 w-[34%] overflow-hidden rounded-[30px] bg-[#fbe4e4]/95 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
                    <div className="px-4 pb-4 pt-5">
                      <p className="text-lg font-bold tracking-[-0.03em] text-slate-950">
                        Explore packages
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {packagePills.map((item) => (
                          <span
                            key={item}
                            className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-slate-700"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div
                      className="aspect-[0.9/1] bg-cover bg-center"
                      style={{
                        backgroundImage:
                          "url('https://images.pexels.com/photos/3889843/pexels-photo-3889843.jpeg?auto=compress&cs=tinysrgb&w=1000')",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed inset-x-5 bottom-[142px] z-[72] hidden lg:block">
          <div className="mx-auto max-w-5xl">
            <AiHelperWidget compact className="mx-auto max-w-[920px]" />
          </div>
        </div>

        <div className="fixed inset-x-5 bottom-5 z-[72] hidden lg:block">
          <div className="mx-auto max-w-5xl">
            <HeroSearchCard compact />
          </div>
        </div>

        <div className="fixed inset-x-3 bottom-2 z-[72] lg:hidden">
          <div className="space-y-1.5">
            <AiHelperWidget compact />
            <button
              type="button"
              onClick={() => setMobileSearchOpen(true)}
              className="search-glass flex w-full items-center justify-between rounded-[20px] border border-white/10 px-4 py-2.5 text-left text-white"
            >
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/60">
                  Search your trip
                </p>
                <p className="mt-0.5 text-[13px] font-medium text-white">
                  Destination, dates, budget
                </p>
              </div>
              <span className="inline-flex rounded-full bg-yellow-400 px-3.5 py-1.5 text-[13px] font-bold text-slate-950">
                Open
              </span>
            </button>
          </div>
        </div>
      </section>

      {mobileSearchOpen ? (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-white">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Trip Search
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">
                Plan your journey
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Close
            </button>
          </div>

          <div className="px-4 py-5">
            <HeroSearchCard mobile />
          </div>
        </div>
      ) : null}
    </>
  );
}