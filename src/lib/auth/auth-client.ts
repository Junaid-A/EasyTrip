"use client";

import { createClient } from "@/lib/supabase/client";
import { upsertProfile, type UserRole } from "@/lib/auth/profile-client";

function getDashboardPathForRole(role: UserRole) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "agent") return "/agent/dashboard";
  return "/customer/dashboard";
}

function isSafeNextPath(next?: string) {
  return !!next && next.startsWith("/");
}

function canAccessPath(role: UserRole, pathname: string) {
  if (pathname.startsWith("/admin")) return role === "admin";
  if (pathname.startsWith("/agent")) return role === "agent";
  if (pathname.startsWith("/customer")) return role === "customer";
  return true;
}

function resolveRedirectPath(role: UserRole, next?: string) {
  if (isSafeNextPath(next) && canAccessPath(role, next!)) {
    return next!;
  }

  return getDashboardPathForRole(role);
}

export async function signUpWithEmail(input: {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  role?: UserRole;
  next?: string;
}) {
  const supabase = createClient();
  const role = input.role ?? "customer";

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
    return { data, error, redirectTo: null as string | null };
  }

  const profileResult = await upsertProfile({
    id: data.user.id,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    authProvider: "email",
    role,
  });

  if (profileResult.error) {
    return {
      data,
      error: profileResult.error,
      redirectTo: null as string | null,
    };
  }

  return {
    data,
    error: null,
    redirectTo: resolveRedirectPath(role, input.next),
  };
}

export async function signInWithEmail(input: {
  email: string;
  password: string;
  next?: string;
}) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error || !data.user) {
    return { data, error, redirectTo: null as string | null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const role: UserRole = profile?.role ?? "customer";

  return {
    data,
    error: null,
    redirectTo: resolveRedirectPath(role, input.next),
  };
}

export async function signInWithGoogle(next: string = "/") {
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