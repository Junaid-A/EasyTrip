"use client";

import { createClient } from "@/lib/supabase/client";

export type UserRole = "customer" | "agent" | "admin";

export type UserProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  auth_provider: string | null;
  role: UserRole;
  is_blocked?: boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
};

export async function upsertProfile(input: {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  authProvider: string;
  role?: UserRole;
}) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: input.id,
        full_name: input.fullName,
        email: input.email,
        phone: input.phone,
        auth_provider: input.authProvider,
        role: input.role ?? "customer",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
    .select()
    .single();

  return { data, error };
}

export async function getMyProfile() {
  const supabase = createClient();

  const { data: userResult, error: userError } = await supabase.auth.getUser();

  if (userError || !userResult.user) {
    return { data: null, error: userError };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userResult.user.id)
    .single();

  return { data, error };
}