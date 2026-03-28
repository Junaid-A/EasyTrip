import { PortalShell } from "@/components/shared/portal-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";

export default function AdminCustomersPage() {
  return (
    <PortalShell
      title="Customers"
      subtitle="All customers, lead stage, booking stage, payment status, and expected value."
      sidebar={<AdminSidebar />}
    >
      <InfoPanel title="Customer Lead Table">
        <div className="space-y-4">
          {["Aarav Mehta", "Riya Sharma", "Kabir Anand"].map((item) => (
            <div key={item} className="rounded-[24px] bg-slate-50 p-5">
              <p className="font-semibold text-slate-950">{item}</p>
              <p className="mt-2 text-sm text-slate-600">Lead stage and payment state placeholder</p>
            </div>
          ))}
        </div>
      </InfoPanel>
    </PortalShell>
  );
}