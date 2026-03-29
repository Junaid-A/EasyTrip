import Link from "next/link";
import { PortalShell } from "@/components/shared/portal-shell";
import { AgentSidebar } from "@/components/agent/agent-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";

export default function AgentCreatePackagePage() {
  return (
    <PortalShell
      title="Create Quote"
      subtitle="Capture customer details, destination, hotel, sightseeing, transfers, meals, and travel notes."
      sidebar={<AgentSidebar />}
    >
      <InfoPanel title="Quote Builder">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            "Customer Name",
            "Destination",
            "Hotel Selection",
            "Sightseeing Selection",
            "Transfers",
            "Meals",
          ].map((item) => (
            <div key={item} className="rounded-[24px] bg-slate-50 p-5">
              <p className="text-sm text-slate-500">{item}</p>
              <p className="mt-2 font-semibold text-slate-950">Prototype input block</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Link
            href="/agent/pricing"
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
          >
            Continue to Quote Pricing
          </Link>
        </div>
      </InfoPanel>
    </PortalShell>
  );
}