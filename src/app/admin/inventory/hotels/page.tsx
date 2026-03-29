const hotels = [
  { name: "Grand Sukhumvit Hotel", city: "Bangkok", category: "4 Star", rate: "₹6,800 / night" },
  { name: "Chatrium Riverside", city: "Bangkok", category: "5 Star", rate: "₹10,500 / night" },
  { name: "Patong Bay Resort", city: "Phuket", category: "4 Star", rate: "₹7,100 / night" },
  { name: "Krabi Seaview Stay", city: "Krabi", category: "3 Star", rate: "₹4,900 / night" },
];

export default function AdminInventoryHotelsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-sky-600">Admin Inventory</p>
          <h1 className="text-3xl font-bold text-slate-900">Hotels</h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage hotel inventory, contracting category, and internal sell rate.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {hotels.map((hotel) => (
            <div
              key={hotel.name}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-slate-900">{hotel.name}</h2>
              <p className="mt-2 text-sm text-slate-600">{hotel.city}</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                  {hotel.category}
                </span>
                <span className="font-semibold text-slate-900">{hotel.rate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}