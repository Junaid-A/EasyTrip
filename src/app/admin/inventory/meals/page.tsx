const meals = [
  { name: "Indian Lunch", city: "Bangkok", category: "Veg / Non-Veg", rate: "₹650" },
  { name: "Dinner Cruise Meal", city: "Bangkok", category: "Premium", rate: "₹2,200" },
  { name: "Hotel Buffet Dinner", city: "Phuket", category: "Buffet", rate: "₹1,450" },
  { name: "Local Thai Lunch", city: "Krabi", category: "Standard", rate: "₹520" },
];

export default function AdminInventoryMealsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-sky-600">Admin Inventory</p>
          <h1 className="text-3xl font-bold text-slate-900">Meals</h1>
          <p className="mt-2 text-sm text-slate-600">
            Maintain meal plans, upgrade options, and supply-side pricing.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-4 gap-4 border-b border-slate-200 bg-slate-100 px-5 py-4 text-sm font-semibold text-slate-700">
            <div>Meal</div>
            <div>City</div>
            <div>Category</div>
            <div>Rate</div>
          </div>

          {meals.map((item) => (
            <div
              key={item.name}
              className="grid grid-cols-4 gap-4 border-b border-slate-100 px-5 py-4 text-sm text-slate-700 last:border-b-0"
            >
              <div>{item.name}</div>
              <div>{item.city}</div>
              <div>{item.category}</div>
              <div className="font-semibold text-slate-900">{item.rate}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}