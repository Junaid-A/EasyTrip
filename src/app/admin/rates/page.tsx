import { PortalShell } from "@/components/shared/portal-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";

export default function AdminRatesPage() {
  return (
    <PortalShell
      title="Rates"
      subtitle="Control customer pricing rules, agent markups, preferred buying rates, and commercial pricing logic."
      sidebar={<AdminSidebar />}
    >
      <InfoPanel title="Rate Controls">
        <div className="space-y-4">
          {[
            "Customer pricing rules",
            "Agent markup guidance",
            "Preferred inventory rates",
          ].map((item) => (
            <div
              key={item}
              className="rounded-[24px] bg-slate-50 p-5 text-sm text-slate-700"
            >
              {item}
            </div>
          ))}
        </div>
      </InfoPanel>
    </PortalShell>
  );
}