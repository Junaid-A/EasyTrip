"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const cards = [
  {
    key: "standard",
    title: "Standard Packages",
    subtitle: "Fastest way to start",
    description:
      "Ready-made itineraries, quick comparisons, and faster booking decisions.",
    image: "/images/why-standard.jpg",
    alt: "Standard package preview",
    badgeClass: "bg-lime-300 text-slate-950",
    stackClass: "stack-left z-10",
    stat1: { value: "5 min", label: "Shortlist time" },
    stat2: { value: "Quick", label: "Best for" },
    pills: ["Ready-made", "Easy compare"],
  },
  {
    key: "ai",
    title: "AI Assisted",
    subtitle: "Smartest planning mode",
    description:
      "AI narrows options, improves fit, and reduces decision fatigue faster.",
    image: "/images/why-ai.jpg",
    alt: "AI assisted planning preview",
    badgeClass: "bg-white text-slate-950",
    stackClass: "stack-center z-30",
    stat1: { value: "62%", label: "Time saved" },
    stat2: { value: "9.1/10", label: "Fit score" },
    pills: ["Budget-aware", "Smarter picks", "Live AI"],
    featured: true,
  },
  {
    key: "custom",
    title: "Personal Custom",
    subtitle: "Most flexible route",
    description:
      "Build around hotels, tours, pace, budget, and traveler priorities.",
    image: "/images/why-custom.jpg",
    alt: "Personal custom builder preview",
    badgeClass: "bg-yellow-300 text-slate-950",
    stackClass: "stack-right z-20",
    stat1: { value: "Full", label: "Control level" },
    stat2: { value: "Tailored", label: "Best for" },
    pills: ["Flexible", "Personalized"],
  },
];

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex w-fit rounded-full border border-slate-300/80 bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur md:text-[11px]">
      {children}
    </span>
  );
}

function MetaPill({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-[14px] border border-white/12 bg-white/10 px-3 py-2.5 backdrop-blur-xl">
      <p className="text-sm font-semibold text-white">{value}</p>
      <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-white/60">
        {label}
      </p>
    </div>
  );
}

export function WhyChooseUsGrid() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsOpen(entry.isIntersecting && entry.intersectionRatio > 0.42);
      },
      {
        threshold: [0.2, 0.42, 0.6],
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="overflow-hidden rounded-[34px] border border-slate-200 bg-[linear-gradient(180deg,#f7fbfb_0%,#eff5f4_55%,#f7f7f4_100%)] px-4 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:px-6 sm:py-10 lg:px-8 lg:py-12"
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <span className="inline-flex rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600">
            How EasyTrip365 works
          </span>

          <h3 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Three ways. One smarter booking flow.
          </h3>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Choose a faster package path, let AI narrow decisions, or build the
            trip your own way.
          </p>
        </div>

        <div className="relative mt-10 h-[470px] sm:h-[540px] md:h-[620px]">
          <div className="absolute inset-x-0 bottom-12 mx-auto h-[30%] w-[54%] rounded-full bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.14),rgba(15,23,42,0.05)_45%,transparent_75%)] blur-3xl" />

          <div className="absolute inset-0 flex justify-center">
            <div
              className={`relative h-full w-full max-w-[760px] ${
                isOpen ? "stage-open" : "stage-closed"
              }`}
            >
              {cards.map((card) => (
                <article
                  key={card.key}
                  className={`phone-card absolute left-1/2 top-[30px] w-[165px] -translate-x-1/2 sm:top-[28px] sm:w-[200px] md:top-[18px] md:w-[230px] ${card.stackClass}`}
                >
                  <div className="relative rounded-[28px] bg-[#090a0b] p-2.5 shadow-[0_28px_60px_rgba(0,0,0,0.28)]">
                    <div className="absolute inset-[1px] rounded-[27px] border border-white/10" />

                    <div className="relative overflow-hidden rounded-[23px] bg-black">
                      <div className="relative aspect-[9/17]">
                        <Image
                          src={card.image}
                          alt={card.alt}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 165px, 230px"
                          priority={Boolean(card.featured)}
                        />

                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.16)_0%,rgba(0,0,0,0.08)_34%,rgba(0,0,0,0.54)_100%)]" />

                        <div className="absolute left-3 right-3 top-3 flex items-center justify-between gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] ${card.badgeClass}`}
                          >
                            {card.subtitle}
                          </span>

                          <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[9px] font-medium text-white/78 backdrop-blur-md">
                            {card.featured ? "Recommended" : "EasyTrip365"}
                          </span>
                        </div>

                        <div className="absolute inset-x-0 bottom-0 p-3">
                          <div className="rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.10))] p-3 backdrop-blur-xl">
                            <h4 className="text-[17px] font-semibold leading-[1.05] tracking-tight text-white sm:text-[19px] md:text-[21px]">
                              {card.title}
                            </h4>

                            <p className="mt-2 text-[11px] leading-[1.45] text-white/78 sm:text-xs md:text-[13px]">
                              {card.description}
                            </p>

                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <MetaPill
                                value={card.stat1.value}
                                label={card.stat1.label}
                              />
                              <MetaPill
                                value={card.stat2.value}
                                label={card.stat2.label}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              <div className="absolute left-1/2 top-[74%] hidden w-full max-w-[760px] -translate-x-1/2 md:block">
                <div className="grid grid-cols-3 items-start">
                  <div className="flex flex-col items-center gap-2">
                    {cards[0].pills.map((pill) => (
                      <Pill key={pill}>{pill}</Pill>
                    ))}
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    {cards[1].pills.map((pill) => (
                      <Pill key={pill}>{pill}</Pill>
                    ))}
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    {cards[2].pills.map((pill) => (
                      <Pill key={pill}>{pill}</Pill>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .phone-card {
          transform-origin: bottom center;
          transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .stage-closed .stack-left {
          transform: translateX(calc(-50% - 104px)) rotate(-10deg) translateY(10px)
            scale(0.97);
        }

        .stage-closed .stack-center {
          transform: translateX(-50%) rotate(0deg) translateY(0) scale(0.985);
        }

        .stage-closed .stack-right {
          transform: translateX(calc(-50% + 104px)) rotate(10deg) translateY(10px)
            scale(0.97);
        }

        .stage-open .stack-left {
          transform: translateX(calc(-50% - 168px)) rotate(-17deg) translateY(0)
            scale(1);
        }

        .stage-open .stack-center {
          transform: translateX(-50%) rotate(0deg) translateY(-8px) scale(1.03);
        }

        .stage-open .stack-right {
          transform: translateX(calc(-50% + 168px)) rotate(17deg) translateY(0)
            scale(1);
        }

        @media (min-width: 640px) {
          .stage-closed .stack-left {
            transform: translateX(calc(-50% - 118px)) rotate(-10deg)
              translateY(10px) scale(0.97);
          }

          .stage-closed .stack-right {
            transform: translateX(calc(-50% + 118px)) rotate(10deg)
              translateY(10px) scale(0.97);
          }

          .stage-open .stack-left {
            transform: translateX(calc(-50% - 186px)) rotate(-17deg)
              translateY(0) scale(1);
          }

          .stage-open .stack-right {
            transform: translateX(calc(-50% + 186px)) rotate(17deg)
              translateY(0) scale(1);
          }
        }

        @media (min-width: 768px) {
          .stage-closed .stack-left {
            transform: translateX(calc(-50% - 126px)) rotate(-10deg)
              translateY(10px) scale(0.97);
          }

          .stage-closed .stack-right {
            transform: translateX(calc(-50% + 126px)) rotate(10deg)
              translateY(10px) scale(0.97);
          }

          .stage-open .stack-left {
            transform: translateX(calc(-50% - 194px)) rotate(-17deg)
              translateY(0) scale(1);
          }

          .stage-open .stack-right {
            transform: translateX(calc(-50% + 194px)) rotate(17deg)
              translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .phone-card {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}