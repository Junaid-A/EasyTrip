import { PrimaryButton } from "@/components/shared/primary-button";

export function AIHelperWidget() {
  return (
    <div className="rounded-3xl border border-orange-200 bg-orange-50 p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
        AI Trip Helper
      </p>
      <h3 className="mt-2 text-lg font-bold text-neutral-900">
        Tell us the vibe, and we shape the trip around it.
      </h3>
      <p className="mt-2 text-sm leading-6 text-neutral-700">
        Example: “I want a premium Bangkok trip with nightlife, shopping, and one luxury dinner.”
      </p>

      <div className="mt-4">
        <PrimaryButton href="/trip-builder">Try Demo Builder</PrimaryButton>
      </div>
    </div>
  );
}