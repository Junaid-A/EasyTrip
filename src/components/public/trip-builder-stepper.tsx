type TripBuilderStepperProps = {
  currentStep: number;
};

const steps = [
  { number: "01", label: "Choose" },
  { number: "02", label: "Results" },
  { number: "03", label: "Customize" },
  { number: "04", label: "Review" },
  { number: "05", label: "Confirm" },
];

export function TripBuilderStepper({
  currentStep,
}: TripBuilderStepperProps) {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white/75 p-3 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="grid gap-2 md:grid-cols-5">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isComplete = stepNumber < currentStep;

          return (
            <div
              key={step.label}
              className={`rounded-[22px] border px-4 py-3 transition ${
                isActive
                  ? "border-slate-950 bg-slate-950 text-white shadow-[0_16px_34px_rgba(15,23,42,0.20)]"
                  : isComplete
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-white text-slate-500"
              }`}
            >
              <p
                className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${
                  isActive ? "text-white/70" : isComplete ? "text-emerald-600" : "text-slate-400"
                }`}
              >
                {step.number}
              </p>
              <p className="mt-1 text-sm font-semibold">{step.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}