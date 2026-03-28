const travelStyleOptions = [
  "Leisure",
  "Premium Leisure",
  "Luxury Escape",
  "Fast-Paced Explorer",
];

type TravelStyleSelectorProps = {
  value: string;
  onChange?: (value: string) => void;
};

export function TravelStyleSelector({
  value,
  onChange,
}: TravelStyleSelectorProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {travelStyleOptions.map((option) => {
        const active = value === option;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange?.(option)}
            className={`rounded-3xl border p-4 text-left transition ${
              active
                ? "border-black bg-black text-white"
                : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-400"
            }`}
          >
            <p className="text-sm font-bold">{option}</p>
          </button>
        );
      })}
    </div>
  );
}