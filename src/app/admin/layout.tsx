import { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const headerStore = await headers();
  const pathname = headerStore.get("x-current-pathname") || "";

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const { user, role } = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  if (role !== "admin") {
    if (role === "agent") {
      redirect("/agent/dashboard");
    }

    if (role === "customer") {
      redirect("/customer/dashboard");
    }

    redirect("/admin/login");
  }

  return <>{children}</>;
}