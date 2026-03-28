import { PortalShell } from "@/components/shared/portal-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";

export default function AdminPackagesPage() {
  return (
    <PortalShell
      title="Packages"
      subtitle="Standard packages, performance visibility, profitability, and recommendation priority."
      sidebar={<AdminSidebar />}
    >
      <InfoPanel title="Package Performance">
        <div className="space-y-4">
          {["Bangkok Luxury Discovery", "Bangkok Signature Escape", "Phuket Premium Beach Break"].map((item) => (
            <div key={item} className="rounded-[24px] bg-slate-50 p-5">
              <p className="font-semibold text-slate-950">{item}</p>
              <p className="mt-2 text-sm text-slate-600">Popularity, margin, and recommendation placeholder</p>
            </div>
          ))}
        </div>
      </InfoPanel>
    </PortalShell>
  );
}