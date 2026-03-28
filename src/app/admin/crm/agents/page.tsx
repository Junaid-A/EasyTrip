import { PortalShell } from "@/components/shared/portal-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { StatCard } from "@/components/shared/stat-card";
import { InfoPanel } from "@/components/shared/info-panel";

export default function AdminCrmAgentsPage() {
  return (
    <PortalShell
      title="CRM • Agents"
      subtitle="Agent KPI strip, onboarding funnel, performance, converted deals, and receivables."
      sidebar={<AdminSidebar />}
    >
      <div className="grid gap-6 md:grid-cols-4">
        <StatCard label="Active Agents" value="12" />
        <StatCard label="Pending Approval" value="3" />
        <StatCard label="Converted Deals" value="22" />
        <StatCard label="Pending Receivables" value="₹2.1L" />
      </div>

      <InfoPanel title="Agent Performance">
        <p className="text-sm leading-7 text-slate-600">
          Prototype funnel and performance table for onboarding, quotes, bookings, and revenue.
        </p>
      </InfoPanel>
    </PortalShell>
  );
}