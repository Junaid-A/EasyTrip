import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      applicationId?: string;
      reviewNotes?: string;
    };

    const applicationId = body.applicationId?.trim();

    if (!applicationId) {
      return NextResponse.json({ error: "applicationId is required." }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { data: application, error: applicationError } = await supabase
      .from("agent_applications")
      .select("*")
      .eq("id", applicationId)
      .maybeSingle();

    if (applicationError) {
      return NextResponse.json({ error: applicationError.message }, { status: 500 });
    }

    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    const { error: appError } = await supabase
      .from("agent_applications")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        review_notes: body.reviewNotes?.trim() || null,
      })
      .eq("id", applicationId);

    if (appError) {
      return NextResponse.json({ error: appError.message }, { status: 500 });
    }

    const { data: existingAgent } = await supabase
      .from("agents")
      .select("id")
      .or(`application_id.eq.${application.id},email.ilike.${application.email}`)
      .maybeSingle();

    if (existingAgent?.id) {
      const { error: agentUpdateError } = await supabase
        .from("agents")
        .update({
          status: "rejected",
          onboarding_stage: "Rejected by admin",
          approval_status: "rejected",
          last_activity_at: new Date().toISOString(),
        })
        .eq("id", existingAgent.id);

      if (agentUpdateError) {
        return NextResponse.json({ error: agentUpdateError.message }, { status: 500 });
      }

      const { error: logError } = await supabase.from("agent_activity_logs").insert({
        agent_id: existingAgent.id,
        action: "agent_application_rejected",
        actor_name: "Admin",
        actor_email: user.email ?? "admin@easytrip365.local",
        activity_type: "application_rejected",
        activity_label: "Agent application rejected",
        meta: {
          application_id: application.id,
          review_notes: body.reviewNotes?.trim() || null,
        },
      });

      if (logError) {
        return NextResponse.json({ error: logError.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Agent application rejected successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected server error." },
      { status: 500 },
    );
  }
}