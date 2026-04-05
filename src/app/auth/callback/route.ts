import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type UserRole = "customer" | "agent" | "admin";

function getDashboardPathForRole(role: UserRole) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "agent") return "/agent/dashboard";
  return "/customer/dashboard";
}

function isSafeNextPath(next: string | null) {
  return !!next && next.startsWith("/");
}

function canAccessPath(role: UserRole, pathname: string) {
  if (pathname.startsWith("/admin")) return role === "admin";
  if (pathname.startsWith("/agent")) return role === "agent";
  if (pathname.startsWith("/customer")) return role === "customer";
  return true;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(new URL("/?auth=error", requestUrl.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/?auth=error", requestUrl.origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/?auth=error", requestUrl.origin));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role: UserRole = profile?.role ?? "customer";

  let finalPath = getDashboardPathForRole(role);

  if (isSafeNextPath(requestedNext) && canAccessPath(role, requestedNext!)) {
    finalPath = requestedNext!;
  }

  return NextResponse.redirect(new URL(finalPath, requestUrl.origin));
}