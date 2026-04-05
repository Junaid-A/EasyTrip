"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getMyProfile, type UserProfile } from "@/lib/auth/profile-client";

type AuthRole = "admin" | "agent" | "customer" | null;

type AuthUser = {
  id: string;
  email: string | undefined;
  role: AuthRole;
} | null;

type AuthContextValue = {
  user: AuthUser;
  profile: UserProfile | null;
  loading: boolean;
  isCustomerPortalUser: boolean;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getRoleFromUser(user: {
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
} | null): AuthRole {
  if (!user) return null;

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

function isCustomerRole(role: AuthRole) {
  return role === "customer";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshAuth() {
    try {
      setLoading(true);

      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        setUser(null);
        setProfile(null);
        return;
      }

      const role = getRoleFromUser(data.user);

      setUser({
        id: data.user.id,
        email: data.user.email,
        role,
      });

      if (!isCustomerRole(role)) {
        setProfile(null);
        return;
      }

      const profileResult = await getMyProfile();

      if (!profileResult.error && profileResult.data) {
        setProfile(profileResult.data);
      } else {
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  useEffect(() => {
    refreshAuth();

    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      refreshAuth();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      isCustomerPortalUser: !!user && isCustomerRole(user.role),
      refreshAuth,
      logout,
    }),
    [user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}