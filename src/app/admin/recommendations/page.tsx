import { PortalShell } from "@/components/shared/portal-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";

export default function AdminRecommendationsPage() {
  return (
    <PortalShell
      title="Recommendations"
      subtitle="Business-favored items, high-margin visibility, and what customers see versus what admin optimizes."
      sidebar={<AdminSidebar />}
    >
      <InfoPanel title="Recommendation Logic">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            "High-margin items",
            "Top-converting combinations",
            "Customer-facing persuasive labels",
          ].map((item) => (
            <div key={item} className="rounded-[24px] bg-slate-50 p-5">
              <p className="font-semibold text-slate-950">{item}</p>
              <p className="mt-2 text-sm text-slate-600">Prototype recommendation matrix placeholder</p>
            </div>
          ))}
        </div>
      </InfoPanel>
    </PortalShell>
  );
}