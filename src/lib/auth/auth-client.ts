"use client";

import { createClient } from "@/lib/supabase/client";
import { upsertProfile } from "@/lib/auth/profile-client";

export async function signUpWithEmail(input: {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
        phone: input.phone,
      },
    },
  });

  if (error || !data.user) {
    return { data, error };
  }

  const profileResult = await upsertProfile({
    id: data.user.id,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    authProvider: "email",
  });

  if (profileResult.error) {
    return {
      data,
      error: profileResult.error,
    };
  }

  return { data, error: null };
}

export async function signInWithEmail(input: {
  email: string;
  password: string;
}) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  return { data, error };
}

export async function signInWithGoogle(next: string = "/auth-test") {
  const supabase = createClient();

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      : undefined;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });

  return { data, error };
}

export async function signOutUser() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}