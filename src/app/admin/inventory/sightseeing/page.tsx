const sightseeing = [
  { name: "Safari World", city: "Bangkok", type: "Family", rate: "₹2,900" },
  { name: "Phi Phi Island Tour", city: "Phuket", type: "Island Tour", rate: "₹4,600" },
  { name: "Alcazar Show", city: "Pattaya", type: "Show", rate: "₹1,700" },
  { name: "Four Islands Tour", city: "Krabi", type: "Boat Tour", rate: "₹3,800" },
];

export default function AdminInventorySightseeingPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-sky-600">Admin Inventory</p>
          <h1 className="text-3xl font-bold text-slate-900">Sightseeing</h1>
          <p className="mt-2 text-sm text-slate-600">
            Control sightseeing products, destination tags, and internal buy rates.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {sightseeing.map((item) => (
            <div
              key={item.name}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-slate-900">{item.name}</h2>
              <p className="mt-2 text-sm text-slate-600">{item.city}</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                  {item.type}
                </span>
                <span className="font-semibold text-slate-900">{item.rate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}