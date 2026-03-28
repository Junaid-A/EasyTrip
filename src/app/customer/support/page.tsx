import { PortalShell } from "@/components/shared/portal-shell";
import { CustomerSidebar } from "@/components/customer/customer-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";

export default function CustomerSupportPage() {
  return (
    <PortalShell
      title="Support"
      subtitle="FAQ preview, support placeholders, and travel advisor contact."
      sidebar={<CustomerSidebar />}
    >
      <InfoPanel title="Support Options">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Travel Advisor", "Assigned advisor available in prototype"],
            ["Booking Help", "Payment and confirmation guidance"],
            ["FAQ", "Top customer questions placeholder"],
          ].map(([title, copy]) => (
            <div key={title} className="rounded-[24px] bg-slate-50 p-5">
              <p className="font-semibold text-slate-950">{title}</p>
              <p className="mt-2 text-sm text-slate-600">{copy}</p>
            </div>
          ))}
        </div>
      </InfoPanel>
    </PortalShell>
  );
}