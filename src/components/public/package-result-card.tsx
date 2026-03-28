import Link from "next/link";

type PackageResultCardProps = {
  pkg: {
    id: number;
    title: string;
    nights: string;
    price: string;
    tag: string;
  };
  isSelected?: boolean;
};

export function PackageResultCard({
  pkg,
  isSelected = false,
}: PackageResultCardProps) {
  return (
    <div
      className={`rounded-3xl border p-5 shadow-sm ${
        isSelected
          ? "border-black bg-neutral-50"
          : "border-neutral-200 bg-white"
      }`}
    >
      <div className="mb-4 h-44 rounded-2xl bg-gradient-to-br from-orange-200 via-rose-100 to-amber-100" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
            {pkg.tag}
          </p>
          <h3 className="mt-3 text-xl font-bold text-neutral-900">
            {pkg.title}
          </h3>
          <p className="mt-1 text-sm text-neutral-500">{pkg.nights}</p>
        </div>

        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            Starting
          </p>
          <p className="mt-1 text-2xl font-black text-neutral-900">
            {pkg.price}
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-2 text-sm text-neutral-600">
        <li>• Premium area hotel stay</li>
        <li>• Airport transfers included</li>
        <li>• Flexible sightseeing feel</li>
        <li>• Easy customization available</li>
      </ul>

      <p className="mt-4 text-sm font-medium text-neutral-500">
        Strong match for a premium Bangkok couple trip with shopping and nightlife.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/customize"
          className="inline-flex items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white"
        >
          Customize
        </Link>
        <Link
          href="/review"
          className="inline-flex items-center justify-center rounded-full border border-black px-5 py-3 text-sm font-semibold text-black"
        >
          Quick Review
        </Link>
      </div>
    </div>
  );
}