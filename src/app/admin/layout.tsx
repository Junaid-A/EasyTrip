import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
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