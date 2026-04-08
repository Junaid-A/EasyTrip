import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (user.app_metadata?.role !== "agent") {
      return NextResponse.json({ error: "Only agent users can do this." }, { status: 403 });
    }

    const { error: metaError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      app_metadata: {
        ...(user.app_metadata ?? {}),
        role: "agent",
        approved: true,
        must_change_password: false,
      },
      user_metadata: {
        ...(user.user_metadata ?? {}),
        approved: true,
        must_change_password: false,
      },
    });

    if (metaError) {
      return NextResponse.json({ error: metaError.message }, { status: 500 });
    }

    const { error: agentError } = await supabase
      .from("agents")
      .update({
        password_reset_required: false,
        last_login_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .eq("auth_user_id", user.id);

    if (agentError) {
      return NextResponse.json({ error: agentError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Password reset completed successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected server error." },
      { status: 500 },
    );
  }
}