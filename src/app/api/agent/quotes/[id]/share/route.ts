import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type SharePayload = {
  channel?: "copy_link" | "whatsapp" | "email" | "manual";
};

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
      return NextResponse.json({ error: "Only agents can share quotes." }, { status: 403 });
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
      .select("id, agent_id, quote_ref, destination, shared_channel_meta")
      .eq("id", id)
      .maybeSingle();

    if (quoteError || !quote) {
      return NextResponse.json({ error: "Quote not found." }, { status: 404 });
    }

    if (quote.agent_id !== agent.id) {
      return NextResponse.json({ error: "You do not have access to this quote." }, { status: 403 });
    }

    const body = (await request.json().catch(() => null)) as SharePayload | null;
    const channel = body?.channel || "manual";
    const now = new Date().toISOString();

    const updatedMeta = {
      ...(quote.shared_channel_meta || {}),
      last_channel: channel,
      last_shared_at: now,
    };

    const { data: updatedQuote, error: updateError } = await supabase
      .from("quotes")
      .update({
        status: "sent",
        shared_at: now,
        shared_channel_meta: updatedMeta,
      })
      .eq("id", quote.id)
      .eq("agent_id", agent.id)
      .select("*")
      .single();

    if (updateError) {
      return NextResponse.json(
        {
          error: "Failed to update share status.",
          details: updateError.message,
        },
        { status: 500 },
      );
    }

    const actorName =
      agent.contact_name ||
      agent.contact_person ||
      agent.company_name ||
      agent.email ||
      user.email ||
      "Agent";

    await supabase.from("quote_activity_logs").insert({
      quote_id: quote.id,
      agent_id: agent.id,
      actor_name: actorName,
      actor_email: user.email || null,
      action: "quote_shared",
      activity_type: "shared",
      activity_label: "Quote shared",
      meta: {
        quote_ref: quote.quote_ref,
        destination: quote.destination,
        channel,
      },
    });

    return NextResponse.json(
      {
        success: true,
        quote: updatedQuote,
      },
      { status: 200 },
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