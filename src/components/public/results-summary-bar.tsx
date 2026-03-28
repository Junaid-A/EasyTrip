type ResultsSummaryBarProps = {
  destination: string;
  nights: string;
  adults: number;
  children: number;
  mode: string;
  budget: string;
  mood: string;
};

export function ResultsSummaryBar({
  destination,
  nights,
  adults,
  children,
  mode,
  budget,
  mood,
}: ResultsSummaryBarProps) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-7">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            Destination
          </p>
          <p className="mt-1 text-sm font-bold text-neutral-900">
            {destination}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            Nights
          </p>
          <p className="mt-1 text-sm font-bold text-neutral-900">{nights}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            Adults
          </p>
          <p className="mt-1 text-sm font-bold text-neutral-900">{adults}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            Children
          </p>
          <p className="mt-1 text-sm font-bold text-neutral-900">{children}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            Mode
          </p>
          <p className="mt-1 text-sm font-bold text-neutral-900">{mode}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            Budget
          </p>
          <p className="mt-1 text-sm font-bold text-neutral-900">{budget}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            Mood
          </p>
          <p className="mt-1 text-sm font-bold text-neutral-900">{mood}</p>
        </div>
      </div>
    </div>
  );
}