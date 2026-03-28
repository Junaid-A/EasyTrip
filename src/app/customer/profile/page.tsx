import { PortalShell } from "@/components/shared/portal-shell";
import { CustomerSidebar } from "@/components/customer/customer-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";

export default function CustomerProfilePage() {
  return (
    <PortalShell
      title="Profile"
      subtitle="Personal details, traveler preferences, and saved trip style."
      sidebar={<CustomerSidebar />}
    >
      <InfoPanel title="Traveler Profile">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Name</p>
            <p className="mt-2 font-semibold text-slate-950">Junaid Demo User</p>
          </div>
          <div className="rounded-[24px] bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Email</p>
            <p className="mt-2 font-semibold text-slate-950">demo@easytrip365.com</p>
          </div>
          <div className="rounded-[24px] bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Preferred Style</p>
            <p className="mt-2 font-semibold text-slate-950">Luxury / Clean</p>
          </div>
          <div className="rounded-[24px] bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Preferred Destination</p>
            <p className="mt-2 font-semibold text-slate-950">Bangkok</p>
          </div>
        </div>
      </InfoPanel>
    </PortalShell>
  );
}