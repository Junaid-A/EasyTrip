import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { WhyChooseUsGrid } from "@/components/public/why-choose-us-grid";
import { DestinationHighlightCard } from "@/components/public/destination-highlight-card";
import { PackagePreviewCard } from "@/components/public/package-preview-card";
import { TestimonialCard } from "@/components/public/testimonial-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { PageHero } from "@/components/shared/page-hero";
import { destinations } from "@/data/destinations";
import { packages } from "@/data/packages";
import { testimonials } from "@/data/testimonials";
import { PartnersMarquee } from "@/components/public/partners-marquee";
import { FaqSection } from "@/components/public/faq-section";

export default function HomePage() {
  const featuredDestinations = destinations.slice(0, 4);
  const featuredPackages = packages.slice(0, 3);
  const featuredTestimonials = testimonials.slice(0, 3);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f3ee_0%,#f8fafc_48%,#ffffff_100%)] text-slate-950">
      <PublicHeader />

      <main className="pb-28 sm:pb-32 lg:pb-44">
        <section className="px-3 pt-3 sm:px-5 sm:pt-5">
          <PageHero
            eyebrow="Smart holiday planning"
            title="Explore curated journeys built for smarter travel decisions."
            description="Discover curated packages, compare destinations, personalize your trip, and move from first search to final confirmation in a cleaner, more premium booking flow."
          />
          <PartnersMarquee />
        </section>

        <section className="py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

 <SectionHeading
  eyebrow="Why EasyTrip365"
  title="A simpler, smarter way to plan vacations."
  description="Choose ready packages, smarter AI suggestions, or a fully custom trip path."
  align="center"
/>

            <div className="mt-10">
              <WhyChooseUsGrid />
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Featured Destinations"
              title="Explore destinations that match your travel style."
              description="Browse standout locations, compare trip ideas, and start with options that already feel curated instead of overwhelming."
            align="center"
            />

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {featuredDestinations.map((item) => (
                <DestinationHighlightCard
                  key={item.id}
                  title={item.title}
                  country={item.country}
                  image={item.image}
                  tag={item.tag}
                  priceFrom={item.priceFrom}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 lg:py-24">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="relative">
      <div className="mx-auto max-w-3xl text-center">
        <SectionHeading
          eyebrow="Curated Packages"
          title="Packages that are easy to compare and easier to trust."
          description="See the essentials at a glance, understand what is included, and move into customization without confusion."
          align="center"
        />
      </div>

      <div className="mt-6 flex justify-center md:mt-0 md:block">
        <a
          href="/results"
          className="inline-flex rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2"
        >
          View All Packages
        </a>
      </div>
    </div>

    <div className="mt-10 grid gap-6 lg:grid-cols-3">
      {featuredPackages.map((item) => (
        <PackagePreviewCard
          key={item.id}
          title={item.title}
          duration={item.duration}
          price={item.price}
          image={item.image}
          badge={item.badge}
          highlights={item.highlights}
        />
      ))}
    </div>
  </div>
</section>

        <section className="py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Traveler Feedback"
              title="Trusted by travelers who want a smoother planning experience."
              description="Real feedback builds confidence. Keep the proof visible, calm, and premium."
              align="center"
            />

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {featuredTestimonials.map((item) => (
                <TestimonialCard
                  key={item.id}
                  name={item.name}
                  role={item.role}
                  quote={item.quote}
                />
              ))}
            </div>
          </div>
        </section>

                <section className="pb-16 pt-6 sm:pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-[40px] border border-black/10 bg-[linear-gradient(135deg,#111827_0%,#1f2937_35%,#f97316_140%)] px-6 py-12 text-white shadow-[0_30px_120px_rgba(15,23,42,0.18)] sm:px-10 lg:px-14 lg:py-16">
              <div className="max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-200">
                  Start your journey
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Ready to build a trip that feels more personalized from the start?
                </h2>
                <p className="mt-4 text-base leading-8 text-white/80">
                  Begin with the trip builder, explore curated options, and move to
                  review and confirmation with a flow that feels simple, clear, and
                  premium throughout.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <a
                    href="/trip-builder"
                    className="inline-flex rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                  >
                    Start Planning
                  </a>
                  <a
                    href="/results"
                    className="inline-flex rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    Explore Trips
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FaqSection />
      </main>

      <PublicFooter />
    </div>
  );
}
