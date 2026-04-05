import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type AppRole = "admin" | "agent" | "customer" | null;

function getRole(user: {
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}): AppRole {
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

function isApprovedAgent(user: {
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}) {
  const appApproved = user.app_metadata?.approved;
  const userApproved = user.user_metadata?.approved;
  const appAgentApproved = user.app_metadata?.agent_approved;
  const userAgentApproved = user.user_metadata?.agent_approved;

  return (
    appApproved === true ||
    userApproved === true ||
    appAgentApproved === true ||
    userAgentApproved === true
  );
}

function mustChangePassword(user: {
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}) {
  const appFlag = user.app_metadata?.must_change_password;
  const userFlag = user.user_metadata?.must_change_password;

  return appFlag === true || userFlag === true;
}

function getDashboardPathByRole(role: AppRole) {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "agent":
      return "/agent/dashboard";
    case "customer":
      return "/customer/dashboard";
    default:
      return "/login";
  }
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAgentRoute = pathname === "/agent" || pathname.startsWith("/agent/");
  const isCustomerRoute =
    pathname === "/customer" || pathname.startsWith("/customer/");

  const isAdminPublicRoute = pathname === "/admin/login";
  const isAgentPublicRoute =
    pathname === "/agent/login" ||
    pathname === "/agent/onboarding" ||
    pathname === "/agent/reset-password";

  const role = user ? getRole(user) : null;
  const approvedAgent = user ? isApprovedAgent(user) : false;
  const passwordResetRequired = user ? mustChangePassword(user) : false;

  // ADMIN ROUTE PROTECTION
  if (isAdminRoute && !isAdminPublicRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = getDashboardPathByRole(role);
      return NextResponse.redirect(url);
    }
  }

  // AGENT ROUTE PROTECTION
  if (isAgentRoute && !isAgentPublicRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/agent/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (role !== "agent") {
      const url = request.nextUrl.clone();
      url.pathname = getDashboardPathByRole(role);
      return NextResponse.redirect(url);
    }

    if (!approvedAgent) {
      await supabase.auth.signOut();

      const url = request.nextUrl.clone();
      url.pathname = "/agent/login";
      url.searchParams.set("error", "not-approved");
      return NextResponse.redirect(url);
    }

    if (passwordResetRequired) {
      const url = request.nextUrl.clone();
      url.pathname = "/agent/reset-password";
      return NextResponse.redirect(url);
    }
  }

  // CUSTOMER ROUTE PROTECTION
  if (isCustomerRoute) {
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("auth", "login");
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (role === "admin" || role === "agent") {
    const url = request.nextUrl.clone();
    url.pathname = getDashboardPathByRole(role);
    return NextResponse.redirect(url);
  }
}

  // If admin is already logged in, don't show login page again
  if (isAdminPublicRoute && user && role === "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  // If approved agent is already logged in, don't show login page again
  if (pathname === "/agent/login" && user && role === "agent") {
    if (!approvedAgent) {
      await supabase.auth.signOut();

      const url = request.nextUrl.clone();
      url.pathname = "/agent/login";
      url.searchParams.set("error", "not-approved");
      return NextResponse.redirect(url);
    }

    if (passwordResetRequired) {
      const url = request.nextUrl.clone();
      url.pathname = "/agent/reset-password";
      return NextResponse.redirect(url);
    }

    const url = request.nextUrl.clone();
    url.pathname = "/agent/dashboard";
    return NextResponse.redirect(url);
  }

  // Prevent non-agent users from opening password reset page
  if (pathname === "/agent/reset-password") {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/agent/login";
      return NextResponse.redirect(url);
    }

    if (role !== "agent") {
      const url = request.nextUrl.clone();
      url.pathname = getDashboardPathByRole(role);
      return NextResponse.redirect(url);
    }

    if (!approvedAgent) {
      await supabase.auth.signOut();

      const url = request.nextUrl.clone();
      url.pathname = "/agent/login";
      url.searchParams.set("error", "not-approved");
      return NextResponse.redirect(url);
    }
  }

  return response;
}