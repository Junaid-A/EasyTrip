import { createClient } from "@/lib/supabase/server";

export type CurrentAuthUser = {
  id: string;
  email: string | null;
};

export type CurrentAuthProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  auth_provider: string | null;
  created_at: string;
  updated_at: string;
};

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
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
    } satisfies CurrentAuthUser,
    profile: (profile ?? null) as CurrentAuthProfile | null,
  };
}