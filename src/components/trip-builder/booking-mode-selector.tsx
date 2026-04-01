"use client";

import type { BookingMode } from "@/lib/mock/bangkok-builder-data";
import { Sparkles, Package, SlidersHorizontal } from "lucide-react";

type Props = {
  value: BookingMode;
  onChange: (mode: BookingMode) => void;
};

const modes = [
  {
    id: "ready" as BookingMode,
    title: "Ready Packages",
    description: "Quickest way to book a Bangkok trip",
    icon: Package,
  },
  {
    id: "ai" as BookingMode,
    title: "AI Guided",
    description: "Answer a few prompts and let AI shape the trip",
    icon: Sparkles,
  },
  {
    id: "custom" as BookingMode,
    title: "Build My Trip",
    description: "Choose every detail with step-by-step guidance",
    icon: SlidersHorizontal,
  },
];

export function BookingModeSelector({ value, onChange }: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const active = value === mode.id;

        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => onChange(mode.id)}
            className={`rounded-[28px] border p-5 text-left transition ${
              active
                ? "border-sky-500 bg-sky-50 shadow-[0_18px_50px_rgba(14,165,233,0.12)]"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                  active ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h3 className="text-base font-semibold text-slate-950">{mode.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{mode.description}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}