"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PortalShell } from "@/components/shared/portal-shell";
import { AgentSidebar } from "@/components/agent/agent-sidebar";

export default function AgentDashboardPage() {
  const supabase = createClient();

  const [stats, setStats] = useState({
    totalQuotes: 0,
    approved: 0,
    pending: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: agent } = await supabase
      .from("agents")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (!agent) return;

    const { data: quotes } = await supabase
      .from("quotes")
      .select("status")
      .eq("agent_id", agent.id);

    const total = quotes?.length || 0;
    const approved = quotes?.filter((q) => q.status === "approved").length || 0;
    const pending = quotes?.filter((q) => q.status === "draft").length || 0;

    setStats({
      totalQuotes: total,
      approved,
      pending,
    });
  }

  return (
    <PortalShell title="Dashboard" sidebar={<AgentSidebar />}>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl shadow">
          <p>Total Quotes</p>
          <h2 className="text-xl font-bold">{stats.totalQuotes}</h2>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <p>Approved</p>
          <h2 className="text-xl font-bold">{stats.approved}</h2>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <p>Pending</p>
          <h2 className="text-xl font-bold">{stats.pending}</h2>
        </div>
      </div>
    </PortalShell>
  );
}