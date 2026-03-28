import Link from "next/link";
import { PortalShell } from "@/components/shared/portal-shell";
import { AgentSidebar } from "@/components/agent/agent-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";

export default function AgentOnboardingPage() {
  return (
    <PortalShell
      title="Agent Onboarding"
      subtitle="Company details, branding preferences, and pending approval state."
      sidebar={<AgentSidebar />}
    >
      <InfoPanel title="Onboarding Form">
        <div className="grid gap-4 md:grid-cols-2">
          {["Company Name", "Email", "Phone", "Brand Preference"].map((item) => (
            <div key={item} className="rounded-[24px] bg-slate-50 p-5">
              <p className="text-sm text-slate-500">{item}</p>
              <p className="mt-2 font-semibold text-slate-950">Demo value</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/agent/dashboard" className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
            Submit Onboarding
          </Link>
          <span className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700">
            Approval state: Pending
          </span>
        </div>
      </InfoPanel>
    </PortalShell>
  );
}