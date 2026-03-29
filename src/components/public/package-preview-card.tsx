import Link from "next/link";

type PackagePreviewCardProps = {
  title: string;
  duration: string;
  price: string;
  image: string;
  badge?: string;
  highlights: string[];
};

export function PackagePreviewCard({
  title,
  duration,
  price,
  image,
  badge,
  highlights,
}: PackagePreviewCardProps) {
  return (
    <Link
      href="/results"
      className="group overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-1"
    >
      <div
        className="h-60 bg-cover bg-center transition duration-500 group-hover:scale-[1.03]"
        style={{ backgroundImage: `url(${image})` }}
      />

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            {badge ? (
              <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                {badge}
              </span>
            ) : null}
            <h3 className="mt-3 text-xl font-semibold text-slate-950">{title}</h3>
            <p className="mt-2 text-sm text-slate-500">{duration}</p>
          </div>

          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
              Starting at
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{price}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {highlights.map((item) => (
            <span
              key={item}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="mt-6 border-t border-slate-200 pt-4">
          <span className="text-sm font-semibold text-slate-950">
            View package details
          </span>
        </div>
      </div>
    </Link>
  );
}
