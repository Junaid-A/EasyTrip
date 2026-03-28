const items = [
  {
    title: "Cleaner booking flow",
    description:
      "Reduce friction with a more guided and premium way to move from discovery to trip confirmation.",
  },
  {
    title: "Better package presentation",
    description:
      "Show higher quality destination and pricing options in a way that feels curated, not cluttered.",
  },
  {
    title: "Premium visual trust",
    description:
      "Sharper hierarchy, calmer spacing, and more polished sections make the product feel credible.",
  },
  {
    title: "Demo-ready structure",
    description:
      "A simple clickable prototype that already resembles a strong customer-facing final product.",
  },
];

export function WhyChooseUsGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <div
          key={item.title}
          className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#e0f2fe_0%,#dbeafe_100%)] text-sm font-semibold text-slate-950">
            0{index + 1}
          </div>

          <h3 className="mt-5 text-lg font-semibold text-slate-950">
            {item.title}
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
}