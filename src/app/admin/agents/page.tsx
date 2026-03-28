import { PortalShell } from "@/components/shared/portal-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";

export default function AdminAgentsPage() {
  return (
    <PortalShell
      title="Agents"
      subtitle="Pending approvals, approved agents, rejected agents, and activity visibility."
      sidebar={<AdminSidebar />}
    >
      <InfoPanel title="Agent Approvals">
        <div className="space-y-4">
          {["Skyline Holidays", "Urban Routes Travel", "BluePalm Getaways"].map((item) => (
            <div key={item} className="rounded-[24px] bg-slate-50 p-5">
              <p className="font-semibold text-slate-950">{item}</p>
              <p className="mt-2 text-sm text-slate-600">Approval and onboarding status placeholder</p>
            </div>
          ))}
        </div>
      </InfoPanel>
    </PortalShell>
  );
}