import { PortalShell } from "@/components/shared/portal-shell";
import { AgentSidebar } from "@/components/agent/agent-sidebar";
import { StatCard } from "@/components/shared/stat-card";
import { InfoPanel } from "@/components/shared/info-panel";

export default function AgentDashboardPage() {
  return (
    <PortalShell
      title="Agent Dashboard"
      subtitle="Quote stats, converted bookings, revenue widgets, and quick actions."
      sidebar={<AgentSidebar />}
    >
      <div className="grid gap-6 md:grid-cols-4">
        <StatCard label="Quotes" value="18" hint="This month" />
        <StatCard label="Bookings" value="6" hint="Converted" />
        <StatCard label="Revenue" value="₹2.8L" hint="Expected" />
        <StatCard label="Receivables" value="₹74K" hint="Pending" />
      </div>

      <InfoPanel title="Recent Quote Activity">
        <div className="space-y-4">
          {["Bangkok Family Escape", "Phuket Honeymoon Proposal", "Bangkok Luxury Discovery PDF"].map((item) => (
            <div key={item} className="rounded-[24px] bg-slate-50 p-5">
              <p className="font-semibold text-slate-950">{item}</p>
              <p className="mt-2 text-sm text-slate-600">Generated in prototype workflow</p>
            </div>
          ))}
        </div>
      </InfoPanel>
    </PortalShell>
  );
}