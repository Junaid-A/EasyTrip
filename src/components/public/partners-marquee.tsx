type PartnerLogo = {
  name: string;
  src: string;
};

const rowOne: PartnerLogo[] = [
  { name: "AOT", src: "/partners/aot.png" },
  { name: "BTS", src: "/partners/bts.png" },
  { name: "MRT", src: "/partners/mrt.png" },
  { name: "Thai Airways", src: "/partners/thai-airways.png" },
  { name: "Bangkok Airways", src: "/partners/bangkok-airways.png" },
  { name: "SRT", src: "/partners/srt.png" },
];

const rowTwo: PartnerLogo[] = [
  { name: "BTS", src: "/partners/bts.png" },
  { name: "MRT", src: "/partners/mrt.png" },
  { name: "Thai Airways", src: "/partners/thai-airways.png" },
  { name: "TAT", src: "/partners/tat.png" },
  { name: "Bangkok Seal", src: "/partners/bma.png" },
  { name: "AOT", src: "/partners/aot.png" },
];

function MarqueeRow({
  items,
  reverse = false,
}: {
  items: PartnerLogo[];
  reverse?: boolean;
}) {
  const duplicated = [...items, ...items];

  return (
    <div className="relative overflow-hidden bg-transparent">
      <div
        className={`partners-track flex w-max items-center gap-10 ${
          reverse ? "partners-track-reverse" : ""
        }`}
      >
        {duplicated.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="flex h-16 min-w-[140px] items-center justify-center bg-transparent px-2"
          >
            <img
              src={item.src}
              alt={item.name}
              className="max-h-10 w-auto object-contain"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PartnersMarquee() {
  return (
    <section className="bg-transparent py-14 sm:py-18 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-700">
            Partners
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Preferred destination and travel partners
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Trusted tourism, transport, and destination ecosystem partners across Bangkok.
          </p>
        </div>

        <div className="mt-10 space-y-6 bg-transparent">
          <MarqueeRow items={rowOne} />
          <MarqueeRow items={rowTwo} reverse />
        </div>
      </div>
    </section>
  );
}