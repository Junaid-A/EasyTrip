type TestimonialCardProps = {
  name: string;
  role: string;
  quote: string;
};

export function TestimonialCard({
  name,
  role,
  quote,
}: TestimonialCardProps) {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
      <div className="flex gap-1 text-amber-400">
        <span>★</span>
        <span>★</span>
        <span>★</span>
        <span>★</span>
        <span>★</span>
      </div>

      <p className="mt-5 text-base leading-8 text-slate-600">{quote}</p>

      <div className="mt-6 border-t border-slate-200 pt-4">
        <p className="font-semibold text-slate-950">{name}</p>
        <p className="mt-1 text-sm text-slate-500">{role}</p>
      </div>
    </div>
  );
}
