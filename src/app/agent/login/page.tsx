import { Suspense } from "react";
import AgentLoginClient from "./page.client";

type AgentLoginPageProps = {
  searchParams?: Promise<{
    reset?: string;
    next?: string;
  }>;
};

export default async function AgentLoginPage({
  searchParams,
}: AgentLoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const resetSuccess = resolvedSearchParams?.reset === "success";
  const nextPath = resolvedSearchParams?.next || "/agent/dashboard";

  return (
    <Suspense fallback={null}>
      <AgentLoginClient resetSuccess={resetSuccess} nextPath={nextPath} />
    </Suspense>
  );
}