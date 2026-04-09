import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type PaymentPayload = {
  amount?: number;
  paymentMode?: string;
  paymentDate?: string;
  note?: string;
};

function safeNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (user.app_metadata?.role !== "agent") {
      return NextResponse.json({ error: "Only agents can record payments." }, { status: 403 });
    }

    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("id, contact_name, contact_person, company_name, email")
      .eq("auth_user_id", user.id)
      .single();

    if (agentError || !agent?.id) {
      return NextResponse.json({ error: "Agent record not found." }, { status: 400 });
    }

    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("id, agent_id, quote_ref, destination")
      .eq("id", id)
      .maybeSingle();

    if (quoteError || !quote) {
      return NextResponse.json({ error: "Quote not found." }, { status: 404 });
    }

    if (quote.agent_id !== agent.id) {
      return NextResponse.json({ error: "You do not have access to this quote." }, { status: 403 });
    }

    const body = (await request.json()) as PaymentPayload;
    const amount = safeNumber(body.amount);

    if (amount <= 0) {
      return NextResponse.json({ error: "Payment amount must be greater than 0." }, { status: 400 });
    }

    if (!body.paymentMode?.trim()) {
      return NextResponse.json({ error: "Payment mode is required." }, { status: 400 });
    }

    const actorName =
      agent.contact_name ||
      agent.contact_person ||
      agent.company_name ||
      agent.email ||
      user.email ||
      "Agent";

    const { data: insertedPayment, error: paymentError } = await supabase
      .from("quote_payments")
      .insert({
        quote_id: quote.id,
        agent_id: agent.id,
        amount,
        payment_mode: body.paymentMode.trim(),
        payment_date: body.paymentDate?.trim() || new Date().toISOString().slice(0, 10),
        note: body.note?.trim() || null,
        entered_by: actorName,
      })
      .select("*")
      .single();

    if (paymentError) {
      return NextResponse.json(
        {
          error: "Failed to record payment.",
          details: paymentError.message,
        },
        { status: 500 },
      );
    }

    await supabase.rpc("recalculate_quote_financials", { target_quote_id: quote.id });

    const { data: refreshedQuote } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", quote.id)
      .single();

    await supabase.from("quote_activity_logs").insert({
      quote_id: quote.id,
      agent_id: agent.id,
      actor_name: actorName,
      actor_email: user.email || null,
      action: "payment_recorded",
      activity_type: "payment",
      activity_label: "Payment recorded",
      meta: {
        quote_ref: quote.quote_ref,
        destination: quote.destination,
        amount,
        payment_mode: body.paymentMode.trim(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        payment: insertedPayment,
        quote: refreshedQuote,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";

    return NextResponse.json(
      {
        error: "Unexpected server error.",
        details: message,
      },
      { status: 500 },
    );
  }
}