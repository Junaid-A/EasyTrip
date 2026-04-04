import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const phone = String(body?.phone ?? "").trim();

    if (!email && !phone) {
      return NextResponse.json(
        { exists: false, matchedBy: null },
        { status: 200 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Missing server auth configuration." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    let exists = false;
    let matchedBy: "email" | "phone" | "both" | null = null;

    if (email) {
      const { data: emailMatch, error: emailError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .limit(1);

      if (emailError) {
        return NextResponse.json(
          { error: emailError.message },
          { status: 500 }
        );
      }

      if (emailMatch && emailMatch.length > 0) {
        exists = true;
        matchedBy = "email";
      }
    }

    if (phone) {
      const { data: phoneMatch, error: phoneError } = await supabase
        .from("profiles")
        .select("id")
        .eq("phone", phone)
        .limit(1);

      if (phoneError) {
        return NextResponse.json(
          { error: phoneError.message },
          { status: 500 }
        );
      }

      if (phoneMatch && phoneMatch.length > 0) {
        exists = true;
        matchedBy = matchedBy === "email" ? "both" : "phone";
      }
    }

    return NextResponse.json({
      exists,
      matchedBy,
    });
  } catch (error) {
    console.error("check-user-exists error", error);
    return NextResponse.json(
      { error: "Unable to check user existence." },
      { status: 500 }
    );
  }
}