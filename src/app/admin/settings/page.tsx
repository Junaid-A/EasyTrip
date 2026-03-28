import { PortalShell } from "@/components/shared/portal-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";

export default function AdminSettingsPage() {
  return (
    <PortalShell
      title="Settings"
      subtitle="Branding placeholders, AI tone controls placeholder, and system preferences."
      sidebar={<AdminSidebar />}
    >
      <InfoPanel title="System Settings">
        <div className="grid gap-4 md:grid-cols-3">
          {["Branding", "Business Preferences", "AI Controls"].map((item) => (
            <div key={item} className="rounded-[24px] bg-slate-50 p-5">
              <p className="font-semibold text-slate-950">{item}</p>
              <p className="mt-2 text-sm text-slate-600">Prototype settings block</p>
            </div>
          ))}
        </div>
      </InfoPanel>
    </PortalShell>
  );
}