import Link from "next/link";
import { PortalShell } from "@/components/shared/portal-shell";
import { AgentSidebar } from "@/components/agent/agent-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";
import { StatCard } from "@/components/shared/stat-card";

export default function AgentPricingPage() {
  return (
    <PortalShell
      title="Pricing"
      subtitle="Base cost summary, markup controls, and customer-facing final price."
      sidebar={<AgentSidebar />}
    >
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard label="Base Cost" value="₹38,000" />
        <StatCard label="Markup" value="₹11,000" />
        <StatCard label="Final Quote" value="₹49,000" />
      </div>

      <InfoPanel title="Pricing Logic">
        <p className="text-sm leading-7 text-slate-600">
          This prototype simulates flat markup, percentage markup, and final customer price visibility.
        </p>
        <div className="mt-6">
          <Link href="/agent/pdf-preview" className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
            Generate PDF Preview
          </Link>
        </div>
      </InfoPanel>
    </PortalShell>
  );
}