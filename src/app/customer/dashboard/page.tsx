import Link from "next/link";
import { PortalShell } from "@/components/shared/portal-shell";
import { CustomerSidebar } from "@/components/customer/customer-sidebar";
import { StatCard } from "@/components/shared/stat-card";
import { InfoPanel } from "@/components/shared/info-panel";

export default function CustomerDashboardPage() {
  return (
    <PortalShell
      title="Customer Dashboard"
      subtitle="This makes the post-booking flow feel complete, exactly as required in the prototype plan."
      sidebar={<CustomerSidebar />}
    >
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard label="Upcoming Trip" value="Bangkok" hint="Departure: 12 Apr 2026" />
        <StatCard label="Booking Status" value="Confirmed" hint="Prototype state" />
        <StatCard label="Payment Summary" value="₹49,000" hint="₹19,000 pending" />
      </div>

      <InfoPanel title="Upcoming Trip">
        <div className="rounded-[24px] bg-slate-50 p-5">
          <p className="text-lg font-semibold text-slate-950">Bangkok Luxury Discovery</p>
          <p className="mt-2 text-sm text-slate-600">
            5 Nights / 6 Days • Deluxe Room • Private transfers • Selected sightseeing
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/customer/bookings" className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
              View Booking
            </Link>
            <Link href="/customer/support" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800">
              Contact Support
            </Link>
          </div>
        </div>
      </InfoPanel>
    </PortalShell>
  );
}