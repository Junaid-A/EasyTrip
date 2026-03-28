import { PortalShell } from "@/components/shared/portal-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { StatCard } from "@/components/shared/stat-card";
import { InfoPanel } from "@/components/shared/info-panel";

export default function AdminDashboardPage() {
  return (
    <PortalShell
      title="Admin Dashboard"
      subtitle="Top KPIs, revenue, receivables, funnel visibility, and operations summary."
      sidebar={<AdminSidebar />}
    >
      <div className="grid gap-6 md:grid-cols-4">
        <StatCard label="Expected Revenue" value="₹18.4L" />
        <StatCard label="Collected" value="₹11.2L" />
        <StatCard label="Receivables" value="₹4.7L" />
        <StatCard label="Active Agents" value="12" />
      </div>

      <InfoPanel title="Operations Snapshot">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] bg-slate-50 p-5">
            <p className="font-semibold text-slate-950">Customer Funnel</p>
            <p className="mt-2 text-sm text-slate-600">Leads → Proposal → Review → Paid → Confirmed</p>
          </div>
          <div className="rounded-[24px] bg-slate-50 p-5">
            <p className="font-semibold text-slate-950">Top Destination</p>
            <p className="mt-2 text-sm text-slate-600">Bangkok remains the strongest demo-performing route</p>
          </div>
        </div>
      </InfoPanel>
    </PortalShell>
  );
}