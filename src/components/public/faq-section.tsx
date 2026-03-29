"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Plus, X } from "lucide-react";

const faqGroups = [
  {
    key: "general",
    label: "General Questions",
    faqs: [
      {
        question: "How does EasyTrip365 help me plan faster?",
        answer:
          "EasyTrip365 helps you compare curated packages, explore destination options, and move into customization without going through a messy booking flow. You can start with ready-made packages, use AI-assisted planning, or build a trip around your exact needs.",
      },
      {
        question: "Can I customize a package after selecting it?",
        answer:
          "Yes. You can begin with a curated package and then move into customization for hotels, tours, transfers, pace, and other trip preferences.",
      },
      {
        question: "Is this suitable for first-time travelers?",
        answer:
          "Yes. The platform is designed to reduce confusion and make comparison easier, especially for travelers who want clearer choices and guided flows.",
      },
      {
        question: "Do I need to finalize everything in one go?",
        answer:
          "No. You can explore options, compare packages, review details, and then continue toward final confirmation when you are ready.",
      },
    ],
  },
  {
    key: "support",
    label: "Support Team",
    faqs: [
      {
        question: "Can I get help while deciding between packages?",
        answer:
          "Yes. The flow is built to make decisions easier, and support options can be layered into the final experience for assistance during package selection or customization.",
      },
      {
        question: "What happens if I need changes after review?",
        answer:
          "You can return to the relevant step, revise trip details, and continue forward without restarting the entire flow.",
      },
      {
        question: "Will I be able to see what is included clearly?",
        answer:
          "Yes. Packages are meant to be presented in a way that makes inclusions, durations, and pricing easier to understand at a glance.",
      },
    ],
  },
  {
    key: "booking",
    label: "Bookings & Payments",
    faqs: [
      {
        question: "Can I compare pricing across multiple package options?",
        answer:
          "Yes. The package flow is intended to help users compare packages more easily and understand which option fits their budget and travel style.",
      },
      {
        question: "Will the final booking summary show my choices clearly?",
        answer:
          "Yes. The confirmation flow should reflect selected package details, customization choices, add-ons, and final totals in a clean summary.",
      },
      {
        question: "Can this support partial payments later?",
        answer:
          "Yes. The broader EasyTrip365 direction includes receivables and partial-payment style flows, which can be integrated into later versions.",
      },
    ],
  },
  {
    key: "custom",
    label: "Customization",
    faqs: [
      {
        question: "Can I build a trip from scratch instead of using a package?",
        answer:
          "Yes. EasyTrip365 supports a fully custom path so travelers can plan around their own hotel, sightseeing, pace, and budget preferences.",
      },
      {
        question: "Can AI help shortlist better options for me?",
        answer:
          "Yes. The AI-assisted flow is intended to reduce overwhelm and guide travelers toward more relevant choices faster.",
      },
      {
        question: "Can I mix curated packages and custom planning?",
        answer:
          "Yes. A user can start from a package and then adjust parts of the trip instead of rebuilding everything from zero.",
      },
    ],
  },
  {
    key: "agents",
    label: "For Agents",
    faqs: [
      {
        question: "Can agents also use the same package and customization logic?",
        answer:
          "Yes. EasyTrip365 is structured so customer, agent, and admin experiences can work from the same travel inventory and planning logic.",
      },
      {
        question: "Can agents present curated quotations to clients?",
        answer:
          "Yes. That is aligned with the broader EasyTrip365 direction where agents can build and present more polished travel quotations.",
      },
    ],
  },
];

export function FaqSection() {
  const [activeGroup, setActiveGroup] = useState(faqGroups[0].key);
  const currentGroup =
    faqGroups.find((group) => group.key === activeGroup) ?? faqGroups[0];

  const initialOpen = useMemo(() => currentGroup.faqs[0]?.question ?? "", [currentGroup]);
  const [openQuestion, setOpenQuestion] = useState(initialOpen);

  if (openQuestion !== initialOpen && !currentGroup.faqs.some((faq) => faq.question === openQuestion)) {
    setOpenQuestion(initialOpen);
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,247,247,0.95)_0%,rgba(243,247,255,0.94)_45%,rgba(232,250,255,0.96)_100%)] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-8 lg:p-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_72%,rgba(251,146,60,0.10),transparent_22%),radial-gradient(circle_at_78%_26%,rgba(56,189,248,0.12),transparent_24%),radial-gradient(circle_at_50%_88%,rgba(167,139,250,0.10),transparent_18%)]" />
          <div className="pointer-events-none absolute left-[18%] top-[18%] h-4 w-4 rounded-full bg-sky-300/80" />
          <div className="pointer-events-none absolute left-[52%] top-[8%] h-5 w-5 rounded-full bg-indigo-300/80" />
          <div className="pointer-events-none absolute right-[14%] top-[24%] h-7 w-7 rounded-full bg-cyan-200/90" />
          <div className="pointer-events-none absolute right-[4%] top-[22%] h-2 w-2 rounded-full bg-sky-300/80" />
          <div className="pointer-events-none absolute left-[24%] bottom-[8%] h-3 w-3 rounded-full bg-indigo-300/70" />

          <div className="relative">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600">
                FAQ
              </span>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Frequently Asked Questions
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Common questions about planning, comparing packages, customization,
                and how the booking flow is designed to stay clean and easy to use.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.25fr]">
              <div className="space-y-4">
                {faqGroups.map((group) => {
                  const active = group.key === activeGroup;

                  return (
                    <button
                      key={group.key}
                      type="button"
                      onClick={() => {
                        setActiveGroup(group.key);
                        setOpenQuestion(group.faqs[0]?.question ?? "");
                      }}
                      className={`flex w-full items-center justify-between rounded-[18px] border px-5 py-5 text-left transition ${
                        active
                          ? "border-slate-200 bg-white text-slate-950 shadow-[0_14px_32px_rgba(15,23,42,0.06)]"
                          : "border-slate-200/80 bg-white/55 text-slate-500 hover:bg-white/80"
                      }`}
                    >
                      <span className="text-base font-medium">{group.label}</span>
                      <ChevronRight
                        className={`h-5 w-5 transition ${
                          active ? "text-slate-900" : "text-slate-400"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="space-y-4">
                {currentGroup.faqs.map((faq, index) => {
                  const open = faq.question === openQuestion;

                  return (
                    <div
                      key={faq.question}
                      className={`overflow-hidden rounded-[18px] border transition ${
                        open
                          ? "border-slate-200 bg-white shadow-[0_14px_32px_rgba(15,23,42,0.06)]"
                          : "border-slate-200/90 bg-white/50"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenQuestion(open ? "" : faq.question)
                        }
                        className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left"
                      >
                        <span className="pr-2 text-base font-medium leading-7 text-slate-900">
                          {faq.question}
                        </span>

                        <span className="mt-0.5 shrink-0 text-slate-900">
                          {open ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                        </span>
                      </button>

                      <div
                        className={`grid transition-all duration-300 ease-out ${
                          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="px-5 pb-5 text-sm leading-7 text-slate-600 sm:text-base">
                            {faq.answer}
                          </div>
                        </div>
                      </div>

                      {!open && index !== currentGroup.faqs.length - 1 ? null : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}