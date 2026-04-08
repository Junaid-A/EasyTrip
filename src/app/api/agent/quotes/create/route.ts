import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function generateQuoteRef() {
  return "QT-" + Math.floor(100000 + Math.random() * 900000);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const { data: agent } = await supabase
    .from("agents")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const { error } = await supabase.from("quotes").insert({
    agent_id: agent.id,
    quote_ref: generateQuoteRef(),
    customer_name: body.customer_name,
    destination: body.destination,
    amount: body.amount,
    status: "draft",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}