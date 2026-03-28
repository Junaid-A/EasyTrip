import { PortalShell } from "@/components/shared/portal-shell";
import { CustomerSidebar } from "@/components/customer/customer-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";

export default function CustomerTripsPage() {
  return (
    <PortalShell
      title="Trips"
      subtitle="Saved trips, viewed packages, and customization history."
      sidebar={<CustomerSidebar />}
    >
      <InfoPanel title="Saved and Viewed Trips">
        <div className="grid gap-4 md:grid-cols-2">
          {["Bangkok Luxury Discovery", "Bangkok Signature Escape", "Krabi Romantic Retreat", "Phuket Premium Beach Break"].map((item) => (
            <div key={item} className="rounded-[24px] bg-slate-50 p-5">
              <p className="font-semibold text-slate-950">{item}</p>
              <p className="mt-2 text-sm text-slate-600">Viewed in prototype flow</p>
            </div>
          ))}
        </div>
      </InfoPanel>
    </PortalShell>
  );
}