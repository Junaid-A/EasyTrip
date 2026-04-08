import { TripBuilderShell } from "@/components/trip-builder/trip-builder-shell";

export default function NewQuotePage() {
  return (
    <TripBuilderShell
      flowMode="agent_quote"
      chrome="agent"
      continueHref="/agent/quotes/review"
    />
  );
}