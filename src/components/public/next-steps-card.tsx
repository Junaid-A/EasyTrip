type NextStepsCardProps = {
  steps?: string[];
};

const defaultSteps = [
  "We match your trip intent to curated package options.",
  "We highlight better-value and better-fit recommendations.",
  "You compare, customize, review, and confirm with more clarity.",
];

export function NextStepsCard({
  steps = defaultSteps,
}: NextStepsCardProps) {
  return (
    <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
        What happens next
      </p>
      <h3 className="mt-2 text-xl font-semibold text-slate-950">
        Your trip moves into guided results
      </h3>

      <div className="mt-5 space-y-3">
        {steps.map((step, index) => (
          <div
            key={step}
            className="flex items-start gap-3 rounded-[22px] bg-slate-50 p-4"
          >
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-900 shadow-sm">
              {index + 1}
            </span>
            <p className="pt-1 text-sm leading-6 text-slate-700">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}