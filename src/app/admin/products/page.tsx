import { PortalShell } from "@/components/shared/portal-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";

export default function AdminProductsPage() {
  return (
    <PortalShell
      title="Products"
      subtitle="Hotels, sightseeing, transfers, meals, margin visibility, and recommendation control."
      sidebar={<AdminSidebar />}
    >
      <InfoPanel title="Product Buckets">
        <div className="grid gap-4 md:grid-cols-4">
          {["Hotels", "Sightseeing", "Transfers", "Meals"].map((item) => (
            <div key={item} className="rounded-[24px] bg-slate-50 p-5">
              <p className="font-semibold text-slate-950">{item}</p>
              <p className="mt-2 text-sm text-slate-600">Prototype inventory table placeholder</p>
            </div>
          ))}
        </div>
      </InfoPanel>
    </PortalShell>
  );
}