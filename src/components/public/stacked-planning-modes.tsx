"use client";

import Image from "next/image";

const cards = [
  {
    id: "standard",
    title: "Standard Packages",
    badge: "FASTEST WAY TO START",
    description:
      "Ready-made packages for travelers who want fast decisions and clean comparisons.",
    image: "/images/stack-standard.jpg",
    alt: "Standard packages preview",
    rotation: "-rotate-[14deg]",
    position: "left-[2%] top-[40px] md:left-[4%] md:top-[52px]",
    accent: "from-sky-400/30 via-cyan-300/10 to-transparent",
    ring: "ring-sky-200/50",
  },
  {
    id: "ai",
    title: "AI Assisted",
    badge: "SMARTEST PLANNING MODE",
    description:
      "AI narrows down better options, reduces overwhelm, and guides users faster.",
    image: "/images/stack-ai.jpg",
    alt: "AI assisted preview",
    rotation: "rotate-0",
    position: "left-1/2 top-0 z-20 -translate-x-1/2",
    accent: "from-violet-500/30 via-fuchsia-400/10 to-transparent",
    ring: "ring-violet-300/50",
  },
  {
    id: "custom",
    title: "Personal Custom",
    badge: "MOST FLEXIBLE ROUTE",
    description:
      "For travelers who want control over hotels, tours, pace, and trip priorities.",
    image: "/images/stack-custom.jpg",
    alt: "Custom trip builder preview",
    rotation: "rotate-[14deg]",
    position: "right-[2%] top-[36px] md:right-[4%] md:top-[50px]",
    accent: "from-emerald-400/30 via-lime-300/10 to-transparent",
    ring: "ring-emerald-200/50",
  },
];

export function StackedPlanningModes() {
  return (
    <section className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-[#f7f4ee] px-4 py-10 shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:px-6 md:px-8 md:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Booking modes
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            Three ways. One smarter booking flow.
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-600 md:text-base">
            Choose a fast package flow, use AI to narrow decisions, or build the
            trip around exact traveler priorities.
          </p>
        </div>

        <div className="relative mt-12 h-[440px] sm:h-[520px] md:mt-16 md:h-[640px]">
          <div className="absolute inset-x-0 bottom-0 mx-auto h-[82%] w-full max-w-6xl rounded-[36px] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.9),_rgba(255,255,255,0.45)_35%,_transparent_72%)]" />

          {cards.map((card, index) => (
            <article
              key={card.id}
              className={[
                "group absolute w-[52%] min-w-[220px] max-w-[260px] sm:max-w-[300px] md:max-w-[360px]",
                "transition-transform duration-500 ease-out",
                card.position,
                card.rotation,
                card.ring,
                index === 0 ? "animate-cardFloatLeft z-10" : "",
                index === 1 ? "animate-cardFloatCenter z-20" : "",
                index === 2 ? "animate-cardFloatRight z-10" : "",
              ].join(" ")}
            >
              <div className="relative overflow-hidden rounded-[34px] border border-white/20 bg-[#0a0a0c] p-3 shadow-[0_30px_60px_rgba(0,0,0,0.28)] ring-1 backdrop-blur-md">
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.accent}`}
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_28%,transparent_72%,rgba(255,255,255,0.04))]" />

                <div className="relative aspect-[9/18] overflow-hidden rounded-[28px] border border-white/10 bg-neutral-900">
                  <Image
                    src={card.image}
                    alt={card.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 42vw, 360px"
                    priority={index === 1}
                  />

                  <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

                  <div className="absolute left-4 top-4 right-4 flex items-start justify-between gap-3">
                    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/85 backdrop-blur-md md:text-[11px]">
                      {card.badge}
                    </span>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium text-white/75 backdrop-blur-md md:text-xs">
                      EasyTrip365
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                    <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                      <h3 className="text-xl font-semibold text-white md:text-2xl">
                        {card.title}
                      </h3>
                      <p className="mt-2 text-xs leading-5 text-white/75 md:text-sm">
                        {card.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {card.id === "standard" && (
                          <>
                            <Tag>Quick compare</Tag>
                            <Tag>Ready-made</Tag>
                            <Tag>Fast booking</Tag>
                          </>
                        )}

                        {card.id === "ai" && (
                          <>
                            <Tag>Budget-aware</Tag>
                            <Tag>Smarter picks</Tag>
                            <Tag>Live AI</Tag>
                          </>
                        )}

                        {card.id === "custom" && (
                          <>
                            <Tag>Flexible</Tag>
                            <Tag>Tailored fit</Tag>
                            <Tag>More control</Tag>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes cardFloatLeft {
          0%,
          100% {
            transform: translateY(0px) rotate(-14deg);
          }
          50% {
            transform: translateY(-10px) rotate(-12deg);
          }
        }

        @keyframes cardFloatCenter {
          0%,
          100% {
            transform: translateX(-50%) translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateX(-50%) translateY(-14px) rotate(1deg);
          }
        }

        @keyframes cardFloatRight {
          0%,
          100% {
            transform: translateY(0px) rotate(14deg);
          }
          50% {
            transform: translateY(-10px) rotate(12deg);
          }
        }

        .animate-cardFloatLeft {
          animation: cardFloatLeft 6s ease-in-out infinite;
        }

        .animate-cardFloatCenter {
          animation: cardFloatCenter 6.8s ease-in-out infinite;
        }

        .animate-cardFloatRight {
          animation: cardFloatRight 6.2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-medium text-white/85 backdrop-blur-md md:text-xs">
      {children}
    </span>
  );
}