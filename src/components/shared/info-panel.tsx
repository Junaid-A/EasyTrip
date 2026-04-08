"use client";

import { ReactNode } from "react";

type InfoPanelProps = {
  title: string;
  children: ReactNode;
  action?: ReactNode;
};

export function InfoPanel({ title, children, action }: InfoPanelProps) {
  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}