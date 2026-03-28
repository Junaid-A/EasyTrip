import { PortalShell } from "@/components/shared/portal-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { StatCard } from "@/components/shared/stat-card";
import { InfoPanel } from "@/components/shared/info-panel";

export default function AdminReceivablesPage() {
  return (
    <PortalShell
      title="Receivables"
      subtitle="Total receivables, customer receivables, agent receivables, and collection priorities."
      sidebar={<AdminSidebar />}
    >
      <div className="grid gap-6 md:grid-cols-4">
        <StatCard label="Total Receivables" value="₹4.7L" />
        <StatCard label="Customer Receivables" value="₹2.9L" />
        <StatCard label="Agent Receivables" value="₹1.8L" />
        <StatCard label="Priority Cases" value="11" />
      </div>

      <InfoPanel title="Receivables Ledger">
        <p className="text-sm leading-7 text-slate-600">
          Prototype ledger table, aging buckets placeholder, and high-priority follow-up list.
        </p>
      </InfoPanel>
    </PortalShell>
  );
}