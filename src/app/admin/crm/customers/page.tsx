import { PortalShell } from "@/components/shared/portal-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { StatCard } from "@/components/shared/stat-card";
import { InfoPanel } from "@/components/shared/info-panel";

export default function AdminCrmCustomersPage() {
  return (
    <PortalShell
      title="CRM • Customers"
      subtitle="Customer CRM KPI strip, lead funnel, demand view, and follow-up priorities."
      sidebar={<AdminSidebar />}
    >
      <div className="grid gap-6 md:grid-cols-4">
        <StatCard label="Leads" value="84" />
        <StatCard label="Proposal Sent" value="39" />
        <StatCard label="Bookings" value="16" />
        <StatCard label="Forecast" value="₹9.6L" />
      </div>

      <InfoPanel title="Lead Funnel">
        <p className="text-sm leading-7 text-slate-600">
          Prototype board for lead pipeline, destination demand, and expected revenue.
        </p>
      </InfoPanel>
    </PortalShell>
  );
}