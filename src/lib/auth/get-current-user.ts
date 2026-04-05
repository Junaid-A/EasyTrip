import { createClient } from "@/lib/supabase/server";

export type CurrentAuthUser = {
  id: string;
  email: string | null;
};

export type CurrentUserRole = "customer" | "agent" | "admin";

export type CurrentAuthProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  auth_provider: string | null;
  role: CurrentUserRole;
  created_at: string;
  updated_at: string;
};

function getRoleFromUser(user: {
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}): CurrentUserRole | null {
  const appRole = user.app_metadata?.role;
  const userRole = user.user_metadata?.role;

  if (appRole === "admin" || appRole === "agent" || appRole === "customer") {
    return appRole;
  }

  if (userRole === "admin" || userRole === "agent" || userRole === "customer") {
    return userRole;
  }

  return null;
}

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      user: null,
      profile: null,
      role: null,
    };
  }

  const metadataRole = getRoleFromUser(user);

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profileRole =
    profile?.role === "admin" || profile?.role === "agent" || profile?.role === "customer"
      ? profile.role
      : null;

  const resolvedRole = metadataRole ?? profileRole ?? null;

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
    } satisfies CurrentAuthUser,
    profile: (profile ?? null) as CurrentAuthProfile | null,
    role: resolvedRole,
  };
}