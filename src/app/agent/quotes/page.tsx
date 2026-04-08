"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/shared/portal-shell";
import { AgentSidebar } from "@/components/agent/agent-sidebar";

type Quote = {
  id: string;
  quote_ref: string;
  customer_name: string;
  destination: string;
  amount: number;
  status: string;
};

export default function AgentQuotesPage() {
  const supabase = createClient();
  const router = useRouter();

  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    fetchQuotes();
  }, []);

  async function fetchQuotes() {
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

    const { data } = await supabase
      .from("quotes")
      .select("*")
      .eq("agent_id", agent.id)
      .order("created_at", { ascending: false });

    setQuotes(data || []);
  }

  return (
    <PortalShell title="Quotes" sidebar={<AgentSidebar />}>
      <div className="space-y-4">
        <button
          onClick={() => router.push("/agent/quotes/new")}
          className="rounded-xl bg-black px-4 py-2 text-white"
        >
          + Create Quote
        </button>

        {quotes.map((q) => (
          <div key={q.id} className="rounded-xl bg-white p-4 shadow">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{q.customer_name}</p>
                <p className="text-sm text-gray-500">{q.destination}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">₹{q.amount}</p>
                <p className="text-sm">{q.status}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PortalShell>
  );
}