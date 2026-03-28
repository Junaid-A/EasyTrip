const steps = ["Choose", "Results", "Customize", "Review"];

type TripBuilderStepperProps = {
  currentStep: number;
};

export function TripBuilderStepper({
  currentStep,
}: TripBuilderStepperProps) {
  return (
    <div className="grid gap-3 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm md:grid-cols-4">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isDone = stepNumber < currentStep;

        return (
          <div
            key={step}
            className={`rounded-2xl px-4 py-3 ${
              isActive
                ? "bg-black text-white"
                : isDone
                ? "bg-green-50 text-green-700"
                : "bg-neutral-100 text-neutral-500"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em]">
              Step {stepNumber}
            </p>
            <p className="mt-1 text-sm font-semibold">{step}</p>
          </div>
        );
      })}
    </div>
  );
}