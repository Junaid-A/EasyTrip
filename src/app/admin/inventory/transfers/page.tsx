const transfers = [
  { route: "BKK Airport → Bangkok Hotel", type: "Private Sedan", rate: "₹1,800" },
  { route: "Bangkok Hotel → Pattaya Hotel", type: "Private SUV", rate: "₹4,900" },
  { route: "Phuket Airport → Patong", type: "Shared Van", rate: "₹950" },
  { route: "Krabi Hotel → Airport", type: "Private Sedan", rate: "₹1,600" },
];

export default function AdminInventoryTransfersPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-sky-600">Admin Inventory</p>
          <h1 className="text-3xl font-bold text-slate-900">Transfers</h1>
          <p className="mt-2 text-sm text-slate-600">
            Track point-to-point transport options and internal costing.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-3 gap-4 border-b border-slate-200 bg-slate-100 px-5 py-4 text-sm font-semibold text-slate-700">
            <div>Route</div>
            <div>Vehicle Type</div>
            <div>Rate</div>
          </div>

          {transfers.map((item) => (
            <div
              key={item.route}
              className="grid grid-cols-3 gap-4 border-b border-slate-100 px-5 py-4 text-sm text-slate-700 last:border-b-0"
            >
              <div>{item.route}</div>
              <div>{item.type}</div>
              <div className="font-semibold text-slate-900">{item.rate}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}