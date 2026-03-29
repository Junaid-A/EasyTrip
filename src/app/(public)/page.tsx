import Link from "next/link";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { HeroSearchCard } from "@/components/public/hero-search-card";
import { WhyChooseUsGrid } from "@/components/public/why-choose-us-grid";
import { DestinationHighlightCard } from "@/components/public/destination-highlight-card";
import { PackagePreviewCard } from "@/components/public/package-preview-card";
import { TestimonialCard } from "@/components/public/testimonial-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { destinations } from "@/data/destinations";
import { packages } from "@/data/packages";
import { testimonials } from "@/data/testimonials";

export default function HomePage() {
  const featuredDestinations = destinations.slice(0, 4);
  const featuredPackages = packages.slice(0, 3);
  const featuredTestimonials = testimonials.slice(0, 3);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f8fafc_42%,#ffffff_100%)] text-slate-950">
      <PublicHeader />

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_24%)]" />

          <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
            <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="max-w-2xl">
                <span className="inline-flex rounded-full border border-sky-200 bg-white/80 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700 backdrop-blur-md">
                  Smart holiday planning, made simple
                </span>

                <h1 className="mt-6 text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                  Plan better trips without the usual back-and-forth.
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                  Discover curated packages, personalize your stay, compare options
                  clearly, and move from first search to final confirmation in one
                  smooth flow.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/trip-builder"
                    className="inline-flex rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Start Planning My Trip
                  </Link>
                  <Link
                    href="/results"
                    className="inline-flex rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    Browse Packages
                  </Link>
                </div>

                <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-500">
                  <span>Curated travel options</span>
                  <span>Simple customization flow</span>
                  <span>Clear pricing and review</span>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_28px_100px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:translate-y-10">
                  <div
                    className="h-[380px] bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "url('https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80')",
                    }}
                  />
                  <div className="p-6">
                    <p className="text-sm text-slate-500">Bangkok • City stays and memorable experiences</p>
                    <p className="mt-2 text-xl font-semibold text-slate-950">
                      Handpicked trips designed to feel easy from day one
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-[36px] border border-white/70 bg-white/80 p-6 shadow-[0_28px_100px_rgba(15,23,42,0.10)] backdrop-blur-xl">
                    <p className="text-sm text-slate-500">A smoother booking experience</p>
                    <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                      Explore, customize, review, and confirm with confidence.
                    </p>
                  </div>

                  <div className="overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_28px_100px_rgba(15,23,42,0.10)] backdrop-blur-xl">
                    <div
                      className="h-[230px] bg-cover bg-center"
                      style={{
                        backgroundImage:
                          "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80')",
                      }}
                    />
                    <div className="p-6">
                      <p className="text-sm text-slate-500">Built for modern travelers</p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">
                        A cleaner way to compare options and choose what fits you best
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 lg:mt-16">
              <HeroSearchCard />
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Why EasyTrip365"
              title="Everything you need to plan with more clarity and less friction."
              description="From package discovery to trip review, every step is designed to help travelers compare faster, decide better, and book with more confidence."
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
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <SectionHeading
                eyebrow="Curated Packages"
                title="Packages that are easy to compare and easier to trust."
                description="See the essentials at a glance, understand what is included, and move into customization without confusion."
              />
              <Link
                href="/results"
                className="inline-flex rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                View All Packages
              </Link>
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
              description="Real feedback helps build confidence. Keep the proof visible, but clean and unobtrusive."
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
            <div className="overflow-hidden rounded-[40px] border border-slate-200 bg-[linear-gradient(135deg,#020617_0%,#0f172a_35%,#1d4ed8_100%)] px-6 py-12 text-white shadow-[0_30px_120px_rgba(15,23,42,0.18)] sm:px-10 lg:px-14 lg:py-16">
              <div className="max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200">
                  Start your journey
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Ready to build a trip that feels more personalized from the start?
                </h2>
                <p className="mt-4 text-base leading-8 text-white/78">
                  Begin with the trip builder, explore curated options, and move to
                  review and confirmation with a flow that feels simple, clear, and
                  premium throughout.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/trip-builder"
                    className="inline-flex rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                  >
                    Start Planning
                  </Link>
                  <Link
                    href="/results"
                    className="inline-flex rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    Browse Packages
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}