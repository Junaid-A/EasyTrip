import { PortalShell } from "@/components/shared/portal-shell";
import { CustomerSidebar } from "@/components/customer/customer-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";

const bookings = [
  ["ET365-DEMO-001", "Bangkok Luxury Discovery", "Confirmed", "₹19,000 pending"],
  ["ET365-DEMO-002", "Bangkok Signature Escape", "Proposal", "Awaiting approval"],
];

export default function CustomerBookingsPage() {
  return (
    <PortalShell
      title="Bookings"
      subtitle="Booking list, status visibility, and pending actions."
      sidebar={<CustomerSidebar />}
    >
      <InfoPanel title="Booking List">
        <div className="space-y-4">
          {bookings.map(([ref, trip, status, payment]) => (
            <div key={ref} className="rounded-[24px] border border-slate-200 p-5">
              <p className="text-lg font-semibold text-slate-950">{trip}</p>
              <p className="mt-2 text-sm text-slate-600">{ref}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">{status}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{payment}</span>
              </div>
            </div>
          ))}
        </div>
      </InfoPanel>
    </PortalShell>
  );
}