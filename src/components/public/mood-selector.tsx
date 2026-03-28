const moodOptions = [
  "Romantic",
  "Family",
  "Adventure",
  "Luxury",
  "Shopping",
  "Nightlife",
];

type MoodSelectorProps = {
  value: string;
  onChange?: (value: string) => void;
};

export function MoodSelector({
  value,
  onChange,
}: MoodSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {moodOptions.map((option) => {
        const active = value === option;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange?.(option)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              active
                ? "bg-orange-500 text-white"
                : "border border-orange-200 bg-white text-orange-700 hover:border-orange-400"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}