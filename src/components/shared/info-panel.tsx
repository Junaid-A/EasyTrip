import { ReactNode } from "react";

type InfoPanelProps = {
  title: string;
  children: ReactNode;
};

export function InfoPanel({ title, children }: InfoPanelProps) {
  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-8">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}