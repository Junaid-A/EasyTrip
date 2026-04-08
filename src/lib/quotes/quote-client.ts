export type CreateAgentQuoteInput = {
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  destination: string;
  amount: number;
  currency?: string;
  valid_till?: string | null;
  base_total: number;
  sell_total: number;
  markup_total: number;
  pricing_snapshot: Record<string, unknown>;
  builder_payload: Record<string, unknown>;
  markup_config: Record<string, unknown>;
  internal_note?: string;
  customer_note?: string;
  status: "draft" | "saved" | "discarded";
};

export async function createAgentQuoteInDb(input: CreateAgentQuoteInput) {
  const response = await fetch("/api/agent/quotes/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Failed to save quote.");
  }

  return data;
}