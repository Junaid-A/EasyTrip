"use client";

type ReadyPackagesFlowProps = {
  adults?: number;
  children?: number;
  startDate?: string;
  endDate?: string;
  budget?: string;
  tripStyle?: string;
};

export function ReadyPackagesFlow({
  adults = 2,
  children = 0,
  startDate,
  endDate,
  budget = "medium",
  tripStyle = "balanced",
}: ReadyPackagesFlowProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Ready Packages
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Quick packages based on your selected dates, passengers, budget, and trip style.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Bangkok Starter",
            nights: "3N / 4D",
            hotel: "3★ hotel",
            transfer: `${adults + children} pax airport transfer`,
            tag: "Best for quick trips",
            price: "₹18,900",
          },
          {
            title: "Bangkok Comfort",
            nights: "4N / 5D",
            hotel: "4★ hotel",
            transfer: `${adults + children} pax private transfer`,
            tag: "Most booked",
            price: "₹29,900",
          },
          {
            title: "Bangkok Premium",
            nights: "5N / 6D",
            hotel: "4★ premium stay",
            transfer: `${adults + children} pax premium transfer`,
            tag: "Better value",
            price: "₹42,900",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="mb-2 inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
              {item.tag}
            </div>

            <h4 className="text-base font-semibold text-slate-900">
              {item.title}
            </h4>

            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>{item.nights}</p>
              <p>{item.hotel}</p>
              <p>{item.transfer}</p>
              <p>Budget: {budget}</p>
              <p>Style: {tripStyle}</p>
              {startDate && endDate ? (
                <p>
                  Travel: {startDate} → {endDate}
                </p>
              ) : null}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-lg font-bold text-slate-900">
                {item.price}
              </span>
              <button
                type="button"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Select
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}