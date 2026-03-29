import { PortalShell } from "@/components/shared/portal-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";

export default function AdminProductsPage() {
  return (
    <PortalShell
      title="Inventory Overview"
      subtitle="Review hotels, sightseeing, transfers, meals, and their commercial visibility across the catalog."
      sidebar={<AdminSidebar />}
    >
      <InfoPanel title="Inventory Categories">
        <div className="grid gap-4 md:grid-cols-4">
          {["Hotels", "Sightseeing", "Transfers", "Meals"].map((item) => (
            <div key={item} className="rounded-[24px] bg-slate-50 p-5">
              <p className="font-semibold text-slate-950">{item}</p>
              <p className="mt-2 text-sm text-slate-600">
                Prototype inventory category summary
              </p>
            </div>
          ))}
        </div>
      </InfoPanel>
    </PortalShell>
  );
}