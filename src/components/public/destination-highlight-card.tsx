import Link from "next/link";

type DestinationHighlightCardProps = {
  title: string;
  country: string;
  image: string;
  tag?: string;
  priceFrom?: string;
};

export function DestinationHighlightCard({
  title,
  country,
  image,
  tag,
  priceFrom,
}: DestinationHighlightCardProps) {
  return (
    <Link
      href="/results"
      className="group relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.08)]"
    >
      <div
        className="h-[380px] bg-cover bg-center transition duration-500 group-hover:scale-[1.04]"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/10 to-transparent" />

      <div className="absolute left-5 top-5 flex items-center gap-2">
        {tag ? (
          <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
            {tag}
          </span>
        ) : null}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
        <p className="text-sm text-white/75">{country}</p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-white/75">
              Curated premium stays and smoother itinerary planning
            </p>
          </div>

          {priceFrom ? (
            <div className="rounded-2xl bg-white/15 px-4 py-3 text-right backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/70">
                From
              </p>
              <p className="mt-1 text-sm font-semibold">{priceFrom}</p>
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}