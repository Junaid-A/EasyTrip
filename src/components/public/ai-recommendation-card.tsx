type AIRecommendationCardProps = {
  title?: string;
  message: string;
};

export function AIRecommendationCard({
  title = "AI Recommendation",
  message,
}: AIRecommendationCardProps) {
  return (
    <div className="rounded-3xl border border-orange-200 bg-orange-50 p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
        Smart Suggestion
      </p>
      <h3 className="mt-2 text-lg font-bold text-neutral-900">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-neutral-700">{message}</p>
    </div>
  );
}