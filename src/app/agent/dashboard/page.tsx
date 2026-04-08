import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PortalShell } from "@/components/shared/portal-shell";
import { InfoPanel } from "@/components/shared/info-panel";
import { StatCard } from "@/components/shared/stat-card";

function formatCurrency(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function AgentSidebar() {
  return (
    <div className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-white p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-500">
          EasyTrip365
        </p>
        <h2 className="mt-3 text-lg font-semibold text-slate-950">Agent portal</h2>
      </div>

      <div className="mt-6 space-y-2 text-sm">
        <div className="rounded-[18px] bg-slate-900 px-4 py-3 font-medium text-white">
          Dashboard
        </div>
      </div>
    </div>
  );
}

export default async function AgentDashboardPage() {
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

  if (user.app_metadata?.must_change_password) {
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

  const { data: logs } = await supabase
    .from("agent_activity_logs")
    .select("*")
    .eq("agent_id", agent.id)
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <PortalShell
      title="Agent Dashboard"
      subtitle="Performance metrics, profile summary, and recent activity."
      sidebar={<AgentSidebar />}
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Bookings" value={String(agent.total_bookings ?? 0)} />
          <StatCard label="Total Revenue" value={formatCurrency(agent.total_revenue)} />
          <StatCard label="Total Commission" value={formatCurrency(agent.total_commission)} />
          <StatCard label="Active Customers" value={String(agent.active_customers ?? 0)} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <InfoPanel title="Agent Profile">
            <div className="grid gap-4 md:grid-cols-2">
              <ProfileRow label="Company name" value={agent.company_name} />
              <ProfileRow label="Contact person" value={contactPerson} />
              <ProfileRow label="Email" value={agent.email} />
              <ProfileRow label="Phone" value={agent.phone} />
              <ProfileRow label="City" value={agent.city} />
              <ProfileRow label="Country" value={agent.country} />
              <ProfileRow label="Joined" value={formatDate(agent.joined_at)} />
              <ProfileRow label="Last login" value={formatDate(agent.last_login_at)} />
            </div>
          </InfoPanel>

          <InfoPanel title="Status">
            <div className="space-y-4">
              <StatusPill label="Operational status" value={agent.status ?? "approved"} />
              <StatusPill label="Approval status" value={agent.approval_status ?? "approved"} />
              <StatusPill
                label="Password reset required"
                value={agent.password_reset_required ? "yes" : "no"}
              />
              <StatusPill label="Last booking" value={formatDate(agent.last_booking_at)} />
            </div>
          </InfoPanel>
        </div>

        <InfoPanel title="Recent Activity">
          <div className="space-y-3">
            {logs?.length ? (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {log.activity_label || log.action || "Activity"}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                        {log.activity_type || log.action || "general"}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500">{formatDate(log.created_at)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No recent activity available.</p>
            )}
          </div>
        </InfoPanel>
      </div>
    </PortalShell>
  );
}

function ProfileRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value || "—"}</p>
    </div>
  );
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}