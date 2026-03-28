import { PortalShell } from "@/components/shared/portal-shell";
import { AgentSidebar } from "@/components/agent/agent-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";

export default function AgentProfilePage() {
  return (
    <PortalShell
      title="Agent Profile"
      subtitle="Company details, branding status, onboarding state, and approval visibility."
      sidebar={<AgentSidebar />}
    >
      <InfoPanel title="Company Profile">
        <div className="grid gap-4 md:grid-cols-2">
          {["Company Name", "Brand Theme", "Approval Status", "Onboarding Status"].map((item) => (
            <div key={item} className="rounded-[24px] bg-slate-50 p-5">
              <p className="text-sm text-slate-500">{item}</p>
              <p className="mt-2 font-semibold text-slate-950">Demo value</p>
            </div>
          ))}
        </div>
      </InfoPanel>
    </PortalShell>
  );
}