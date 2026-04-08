"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/shared/portal-shell";
import { AgentSidebar } from "@/components/agent/agent-sidebar";

export default function NewQuotePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    customer_name: "",
    destination: "",
    amount: "",
  });

  async function handleSubmit() {
    const res = await fetch("/api/agent/quotes/create", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        amount: Number(form.amount),
      }),
    });

    if (res.ok) {
      router.push("/agent/quotes");
    }
  }

  return (
    <PortalShell title="Create Quote" sidebar={<AgentSidebar />}>
      <div className="space-y-4 max-w-md">
        <input
          placeholder="Customer Name"
          className="w-full border p-2 rounded"
          onChange={(e) =>
            setForm({ ...form, customer_name: e.target.value })
          }
        />

        <input
          placeholder="Destination"
          className="w-full border p-2 rounded"
          onChange={(e) =>
            setForm({ ...form, destination: e.target.value })
          }
        />

        <input
          placeholder="Amount"
          className="w-full border p-2 rounded"
          type="number"
          onChange={(e) =>
            setForm({ ...form, amount: e.target.value })
          }
        />

        <button
          onClick={handleSubmit}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Save Quote
        </button>
      </div>
    </PortalShell>
  );
}