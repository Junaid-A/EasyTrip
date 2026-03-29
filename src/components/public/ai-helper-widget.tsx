"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Sparkles, Wand2 } from "lucide-react";

const prompts = [
  "Plan your next dream vacation...",
  "Where do you want to go?",
  "Type your destination...",
  "Find your perfect getaway...",
  "Let AI help you plan faster...",
];

type AiHelperWidgetProps = {
  className?: string;
  compact?: boolean;
};

export function AiHelperWidget({
  className = "",
  compact = false,
}: AiHelperWidgetProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const activePrompt = useMemo(() => prompts[activeIndex], [activeIndex]);

  useEffect(() => {
    let current = 0;
    setDisplayedText("");

    const typingInterval = setInterval(() => {
      current += 1;
      setDisplayedText(activePrompt.slice(0, current));

      if (current >= activePrompt.length) {
        clearInterval(typingInterval);
      }
    }, 30);

    return () => clearInterval(typingInterval);
  }, [activePrompt]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % prompts.length);
    }, 2600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`ai-widget-shell group relative overflow-hidden rounded-[18px] p-[1.5px] ${
        compact ? "min-h-[54px]" : "min-h-[72px]"
      } ${className}`}
    >
      <div className="ai-widget-inner relative h-full rounded-[16px] bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(248,250,252,0.94))] px-3 py-2 backdrop-blur-xl sm:px-4">
        <div className="pointer-events-none absolute inset-0 rounded-[16px] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.10),transparent_36%)]" />
        <div className="ai-widget-shine pointer-events-none absolute -left-20 top-0 h-full w-16 rotate-12 bg-white/50 blur-xl" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white shadow-[0_8px_18px_rgba(15,23,42,0.18)] sm:h-8 sm:w-8">
            <div className="absolute inset-0 rounded-xl bg-sky-400/25 blur-md animate-pulse" />
            <Sparkles className="relative h-3.5 w-3.5 animate-pulse" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.2em] text-sky-700">
                <Wand2 className="h-2.5 w-2.5" />
                AI Trip Assist
              </span>
            </div>

            <div className="truncate text-[11px] font-semibold leading-4 text-slate-900 sm:text-[12px]">
              {displayedText}
              <span className="ml-0.5 inline-block h-3 w-[1.5px] translate-y-[2px] bg-slate-900 animate-pulse" />
            </div>

            {!compact ? (
              <p className="mt-0.5 line-clamp-1 text-[10px] leading-4 text-slate-500">
                Smart suggestions, destinations, and quick itinerary ideas.
              </p>
            ) : null}
          </div>

          <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-yellow-300 to-orange-400 text-slate-950 shadow-[0_10px_18px_rgba(251,191,36,0.28)] sm:h-8 sm:w-8">
            <div className="absolute inset-0 rounded-xl bg-yellow-300/40 blur-md animate-pulse" />
            <Search className="ai-search-icon relative h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}