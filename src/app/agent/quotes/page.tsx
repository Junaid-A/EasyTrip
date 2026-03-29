const quotes = [
  {
    id: "QT-2401",
    customer: "Aarav Sharma",
    destination: "Bangkok",
    status: "Sent",
    amount: "₹48,500",
  },
  {
    id: "QT-2402",
    customer: "Neha Patel",
    destination: "Phuket + Krabi",
    status: "Draft",
    amount: "₹62,900",
  },
  {
    id: "QT-2403",
    customer: "Rahul Mehta",
    destination: "Dubai",
    status: "Approved",
    amount: "₹71,200",
  },
  {
    id: "QT-2404",
    customer: "Simran Kaur",
    destination: "Singapore",
    status: "Payment Pending",
    amount: "₹55,400",
  },
];

export default function AgentQuotesPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-sky-600">Agent Panel</p>
            <h1 className="text-3xl font-bold text-slate-900">Quotes</h1>
            <p className="mt-2 text-sm text-slate-600">
              View active quotations, follow-up status, and value.
            </p>
          </div>

          <a
            href="/agent/quotes/new"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Create New Quote
          </a>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-5 gap-4 border-b border-slate-200 bg-slate-100 px-5 py-4 text-sm font-semibold text-slate-700">
            <div>Quote ID</div>
            <div>Customer</div>
            <div>Destination</div>
            <div>Status</div>
            <div>Amount</div>
          </div>

          {quotes.map((quote) => (
            <div
              key={quote.id}
              className="grid grid-cols-5 gap-4 border-b border-slate-100 px-5 py-4 text-sm text-slate-700 last:border-b-0"
            >
              <div className="font-semibold text-slate-900">{quote.id}</div>
              <div>{quote.customer}</div>
              <div>{quote.destination}</div>
              <div>{quote.status}</div>
              <div className="font-semibold text-slate-900">{quote.amount}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
