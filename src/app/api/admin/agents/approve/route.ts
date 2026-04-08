import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

function randomPassword(length = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { applicationId?: string };
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

    if (application.status === "approved") {
      return NextResponse.json({ error: "Application is already approved." }, { status: 409 });
    }

    const tempPassword = randomPassword(14);
    const normalizedEmail = String(application.email).trim().toLowerCase();

    const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    const existingAuthUser = userList.users.find(
      (item) => item.email?.trim().toLowerCase() === normalizedEmail,
    );

    let authUserId: string;

    if (existingAuthUser) {
      const { data: updatedAuthUser, error: updateAuthError } =
        await supabaseAdmin.auth.admin.updateUserById(existingAuthUser.id, {
          password: tempPassword,
          app_metadata: {
            ...(existingAuthUser.app_metadata ?? {}),
            role: "agent",
            approved: true,
            must_change_password: true,
          },
          user_metadata: {
            ...(existingAuthUser.user_metadata ?? {}),
            full_name: application.contact_person,
            company_name: application.company_name,
            must_change_password: true,
            approved: true,
          },
          email_confirm: true,
        });

      if (updateAuthError || !updatedAuthUser.user) {
        return NextResponse.json(
          { error: updateAuthError?.message ?? "Could not update agent auth user." },
          { status: 500 },
        );
      }

      authUserId = updatedAuthUser.user.id;
    } else {
      const { data: createdAuthUser, error: createAuthError } =
        await supabaseAdmin.auth.admin.createUser({
          email: normalizedEmail,
          password: tempPassword,
          email_confirm: true,
          app_metadata: {
            role: "agent",
            approved: true,
            must_change_password: true,
          },
          user_metadata: {
            full_name: application.contact_person,
            company_name: application.company_name,
            must_change_password: true,
            approved: true,
          },
        });

      if (createAuthError || !createdAuthUser.user) {
        return NextResponse.json(
          { error: createAuthError?.message ?? "Could not create agent auth user." },
          { status: 500 },
        );
      }

      authUserId = createdAuthUser.user.id;
    }

    const agentPayload = {
      auth_user_id: authUserId,
      application_id: application.id,
      company_name: application.company_name,
      contact_name: application.contact_person,
      contact_person: application.contact_person,
      email: normalizedEmail,
      phone: application.phone,
      city: application.city,
      country: application.country,
      status: "approved",
      onboarding_stage: "Live and operational",
      approval_status: "approved",
      password_reset_required: true,
      last_activity_at: new Date().toISOString(),
      joined_at: new Date().toISOString(),
    };

    const { data: existingAgent, error: existingAgentError } = await supabase
      .from("agents")
      .select("id")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (existingAgentError) {
      return NextResponse.json({ error: existingAgentError.message }, { status: 500 });
    }

    if (existingAgent) {
      const { error: updateAgentError } = await supabase
        .from("agents")
        .update(agentPayload)
        .eq("id", existingAgent.id);

      if (updateAgentError) {
        return NextResponse.json({ error: updateAgentError.message }, { status: 500 });
      }
    } else {
      const { error: insertAgentError } = await supabase.from("agents").insert(agentPayload);

      if (insertAgentError) {
        return NextResponse.json({ error: insertAgentError.message }, { status: 500 });
      }
    }

    const { error: appUpdateError } = await supabase
      .from("agent_applications")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq("id", application.id);

    if (appUpdateError) {
      return NextResponse.json({ error: appUpdateError.message }, { status: 500 });
    }

    const { data: approvedAgent, error: approvedAgentError } = await supabase
      .from("agents")
      .select("id")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (approvedAgentError) {
      return NextResponse.json({ error: approvedAgentError.message }, { status: 500 });
    }

    if (approvedAgent?.id) {
      const { error: logError } = await supabase.from("agent_activity_logs").insert({
        agent_id: approvedAgent.id,
        action: "agent_application_approved",
        actor_name: "Admin",
        actor_email: user.email ?? "admin@easytrip365.local",
        activity_type: "application_approved",
        activity_label: "Agent application approved",
        meta: {
          application_id: application.id,
        },
      });

      if (logError) {
        return NextResponse.json({ error: logError.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      email: normalizedEmail,
      temporaryPassword: tempPassword,
      message: "Agent approved successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected server error." },
      { status: 500 },
    );
  }
}