import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PortalShell } from "@/components/shared/portal-shell";
import { AgentSidebar } from "@/components/agent/agent-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AgentProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/agent/login");
  }

  if (user.app_metadata?.role !== "agent" || user.app_metadata?.approved !== true) {
    redirect("/agent/login");
  }

  if (user.app_metadata?.must_change_password === true) {
    redirect("/agent/reset-password");
  }

  const { data: agent, error: agentError } = await supabase
    .from("agents")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (agentError || !agent) {
    redirect("/agent/login");
  }

  const contactPerson = agent.contact_person || agent.contact_name || "—";

  return (
    <PortalShell
      title="Agent Profile"
      subtitle="Company details, support information, onboarding state, and operational identity fetched from the database."
      sidebar={<AgentSidebar />}
    >
      <div className="space-y-6">
        <InfoPanel title="Company Profile">
          <div className="grid gap-4 md:grid-cols-2">
            <ProfileCard label="Company Name" value={agent.company_name} />
            <ProfileCard label="Contact Person" value={contactPerson} />
            <ProfileCard label="Email" value={agent.email} />
            <ProfileCard label="Phone" value={agent.phone} />
            <ProfileCard label="City" value={agent.city} />
            <ProfileCard label="Country" value={agent.country} />
            <ProfileCard label="Website" value={agent.website} />
            <ProfileCard label="White Label Brand" value={agent.white_label_brand_name} />
          </div>
        </InfoPanel>

        <InfoPanel title="Business & Support">
          <div className="grid gap-4 md:grid-cols-2">
            <ProfileCard label="GST Number" value={agent.gst_number} />
            <ProfileCard label="PAN Number" value={agent.pan_number} />
            <ProfileCard label="Support Email" value={agent.support_email} />
            <ProfileCard label="Support Phone" value={agent.support_phone} />
            <ProfileCard label="Address" value={agent.company_address} />
            <ProfileCard label="State" value={agent.state} />
            <ProfileCard label="Pincode" value={agent.pincode} />
            <ProfileCard label="Logo URL" value={agent.logo_url} />
          </div>
        </InfoPanel>

        <InfoPanel title="Operational Status">
          <div className="grid gap-4 md:grid-cols-2">
            <ProfileCard label="Status" value={agent.status} />
            <ProfileCard label="Approval Status" value={agent.approval_status} />
            <ProfileCard label="Onboarding Stage" value={agent.onboarding_stage} />
            <ProfileCard
              label="Password Reset Required"
              value={agent.password_reset_required ? "Yes" : "No"}
            />
            <ProfileCard label="Joined At" value={formatDate(agent.joined_at)} />
            <ProfileCard label="Last Login At" value={formatDate(agent.last_login_at)} />
            <ProfileCard label="Last Activity At" value={formatDate(agent.last_activity_at)} />
            <ProfileCard label="Notes" value={agent.notes} />
          </div>
        </InfoPanel>
      </div>
    </PortalShell>
  );
}

function ProfileCard({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value || "—"}</p>
    </div>
  );
}