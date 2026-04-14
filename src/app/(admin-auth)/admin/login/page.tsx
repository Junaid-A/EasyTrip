import { Suspense } from "react";
import AdminLoginClient from "./page.client";

type AdminLoginPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const nextPath = resolvedSearchParams?.next || "/admin/dashboard";

  return (
    <Suspense fallback={null}>
      <AdminLoginClient nextPath={nextPath} />
    </Suspense>
  );
}