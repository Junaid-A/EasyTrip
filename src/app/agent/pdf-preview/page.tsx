import { PortalShell } from "@/components/shared/portal-shell";
import { AgentSidebar } from "@/components/agent/agent-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";

export default function AgentPdfPreviewPage() {
  return (
    <PortalShell
      title="PDF Preview"
      subtitle="White-label itinerary preview. This should not show EasyTrip365 branding in the proposal body."
      sidebar={<AgentSidebar />}
    >
      <InfoPanel title="White-label Proposal Mock">
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
          <p className="text-sm font-medium text-slate-500">Agent Brand Header</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Skyline Holidays</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Bangkok Luxury Discovery • 5 Nights / 6 Days • Hotel, transfers, sightseeing, and pricing summary.
          </p>
        </div>
      </InfoPanel>
    </PortalShell>
  );
}