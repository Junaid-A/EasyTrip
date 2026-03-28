const budgetOptions = [
  "Budget Friendly",
  "Value Plus",
  "Premium",
  "Luxury",
];

type BudgetSelectorProps = {
  value: string;
  onChange?: (value: string) => void;
};

export function BudgetSelector({
  value,
  onChange,
}: BudgetSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {budgetOptions.map((option) => {
        const active = value === option;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange?.(option)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              active
                ? "bg-black text-white"
                : "border border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}