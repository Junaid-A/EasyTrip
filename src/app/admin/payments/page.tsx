import { PortalShell } from "@/components/shared/portal-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { StatCard } from "@/components/shared/stat-card";
import { InfoPanel } from "@/components/shared/info-panel";

export default function AdminPaymentsPage() {
  return (
    <PortalShell
      title="Payments"
      subtitle="Total collected, partial payments, overdue payments, and recent activity."
      sidebar={<AdminSidebar />}
    >
      <div className="grid gap-6 md:grid-cols-4">
        <StatCard label="Collected" value="₹11.2L" />
        <StatCard label="Partial Payments" value="₹2.6L" />
        <StatCard label="Overdue" value="₹1.4L" />
        <StatCard label="Recent Activity" value="28 entries" />
      </div>

      <InfoPanel title="Payment State Management">
        <p className="text-sm leading-7 text-slate-600">
          This route represents payment summary cards, payment state tables, and collection progress visibility.
        </p>
      </InfoPanel>
    </PortalShell>
  );
}