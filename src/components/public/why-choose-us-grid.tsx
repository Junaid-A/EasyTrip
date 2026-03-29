const items = [
  {
    title: "Simpler planning flow",
    description:
      "Move from discovery to final review in a way that feels guided, clear, and easy to follow.",
  },
  {
    title: "Curated package options",
    description:
      "Compare destinations, stays, and trip details without feeling overwhelmed by too many choices.",
  },
  {
    title: "Clearer decisions",
    description:
      "See the essential details faster so you can choose what fits your budget, style, and travel goals.",
  },
  {
    title: "More confident booking",
    description:
      "A cleaner experience helps travelers feel more comfortable moving ahead with customization and review.",
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
