import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function generateQuoteRef() {
  return "QT-" + Math.floor(100000 + Math.random() * 900000);
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (agentError || !agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const status =
      body.status === "saved" || body.status === "discarded" || body.status === "draft"
        ? body.status
        : "draft";

    const nowIso = new Date().toISOString();

    const payload = {
      agent_id: agent.id,
      quote_ref: generateQuoteRef(),
      customer_name: body.customer_name ?? "",
      customer_email: body.customer_email ?? "",
      customer_phone: body.customer_phone ?? "",
      destination: body.destination ?? "",
      amount: body.amount ?? body.sell_total ?? 0,
      status,
      currency: body.currency ?? "INR",
      valid_till: body.valid_till ?? null,
      base_total: body.base_total ?? 0,
      sell_total: body.sell_total ?? 0,
      markup_total: body.markup_total ?? 0,
      pricing_snapshot: body.pricing_snapshot ?? {},
      builder_payload: body.builder_payload ?? {},
      markup_config: body.markup_config ?? {},
      internal_note: body.internal_note ?? "",
      customer_note: body.customer_note ?? "",
      discarded_at: status === "discarded" ? nowIso : null,
    };

    const { data, error } = await supabase
      .from("quotes")
      .insert(payload)
      .select("id, quote_ref, status")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      quote: data,
    });
  } catch (error) {
    console.error("agent quote create error", error);
    return NextResponse.json(
      { error: "Failed to create quote." },
      { status: 500 }
    );
  }
}