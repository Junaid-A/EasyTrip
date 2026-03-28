type RecommendationStripProps = {
  items: string[];
};

export function RecommendationStrip({
  items,
}: RecommendationStripProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => (
        <div
          key={item}
          className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700"
        >
          {item}
        </div>
      ))}
    </div>
  );
}