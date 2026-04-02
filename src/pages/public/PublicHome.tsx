import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Headphones,
  Landmark,
  MapPin,
  MoveRight,
  PhoneCall,
  Wallet,
} from 'lucide-react';
import {
  publicCoins,
  publicKnowledgePages,
  publicLocations,
  publicServices,
  publicStats,
  publicTestimonials,
} from '../../data/public';
import { useBranding } from '../../context/BrandingContext';

const hiddenServiceSlugs = new Set(['otc-trading-desk', 'fees-and-pricing']);

const reasons = [
  {
    title: 'Local desk support',
    detail: 'Talk to a real person before you send funds, choose a network, or confirm a wallet address.',
    icon: Headphones,
  },
  {
    title: 'Clear quotes',
    detail: 'Every trade starts with transparent pricing so you know the numbers before you commit.',
    icon: CircleDollarSign,
  },
  {
    title: 'Self-custody friendly',
    detail: 'Buy directly into a wallet you control, with help available if you are new to crypto.',
    icon: Wallet,
  },
  {
    title: 'Built for larger orders too',
    detail: 'Cash, wire, and OTC options make it easier to move beyond one-size-fits-all exchange flows.',
    icon: Landmark,
  },
];

const serviceArtwork: Record<string, string> = {
  'buy-with-cash': '/marketing/cash.png',
  'buy-with-e-transfer': '/marketing/etransfer.png',
  'buy-with-wire-transfer': '/marketing/wire-transfer.png',
  'otc-trading-desk': '/marketing/established-and-trusted.png',
  'fees-and-pricing': '/marketing/live-support.png',
};

export const PublicHome = () => {
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const { branding } = useBranding();
  const testimonialCount = publicTestimonials.length;
  const featuredServices = publicServices.filter((service) => !hiddenServiceSlugs.has(service.slug));

  const cycleTestimonials = (direction: number) => {
    if (testimonialCount < 2) {
      return;
    }

    setTestimonialIndex((current) => (current + direction + testimonialCount) % testimonialCount);
  };

  return (
    <main className="overflow-hidden">
      <section className="relative border-b border-black/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(247,147,26,0.18),_transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0))]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1.02fr_0.98fr] lg:px-6 lg:py-20">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--vb-orange)]/25 bg-white px-4 py-2 text-sm font-semibold text-[var(--vb-orange)] shadow-sm">
              <BadgeCheck className="h-4 w-4" />
              Trusted local crypto desk
            </div>

            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-slate-500">{branding.publicTopbarLabel}</p>
              <h1 className="public-display max-w-3xl text-5xl font-bold tracking-[-0.04em] text-slate-950 md:text-6xl">
                {branding.publicHeroTitle}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                {branding.publicHeroDescription}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--vb-orange)] px-6 py-4 text-sm font-bold text-[var(--vb-ink)] transition-transform hover:-translate-y-0.5"
              >
                Create account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/locations"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 py-4 text-sm font-semibold text-slate-700 transition-colors hover:border-[var(--vb-orange)] hover:text-slate-950"
              >
                Visit a branch
                <MoveRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {publicStats.map((item) => (
                <div key={item.label} className="rounded-[1.75rem] border border-black/10 bg-white/90 p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
                  <p className="public-display mt-3 text-2xl font-bold text-slate-950">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-[var(--vb-ink)] text-white shadow-2xl">
              <div className="border-b border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--vb-orange)]/85">How it works</p>
                    <h2 className="public-display mt-3 text-3xl font-bold">Book, fund, settle.</h2>
                  </div>
                  <PhoneCall className="h-8 w-8 text-[var(--vb-orange)]" />
                </div>
              </div>

              <div className="p-6">
                <div className="rounded-[1.6rem] bg-white/5 p-4">
                  <img
                    src="/marketing/crypto-currency-concept-830px.png"
                    alt="Crypto illustration"
                    className="w-full rounded-[1.25rem] object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--vb-orange)]">Service lanes</p>
            <h2 className="public-display mt-3 text-3xl font-bold text-slate-950 md:text-4xl">
              Choose the trading path that fits the order.
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">
            Everyday retail orders, branch visits, and larger OTC transactions do not need the same flow. Start
            where the funding method and trade size make the most sense.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {featuredServices.map((service) => (
            <Link
              key={service.slug}
              to={service.path}
              className="group overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm transition-transform hover:-translate-y-1"
            >
              <div className="h-44 overflow-hidden border-b border-black/10 bg-[var(--vb-cream)] p-5">
                <img src={serviceArtwork[service.slug]} alt={service.navLabel} className="h-full w-full object-contain" />
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--vb-orange)]">{service.eyebrow}</p>
                <h3 className="public-display mt-3 text-2xl font-bold text-slate-950">{service.navLabel}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">{service.description}</p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">Explore service</span>
                  <MoveRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-black/10 bg-white/70">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">Why people trust the desk</p>
            <h2 className="public-display mt-3 text-3xl font-bold text-slate-950 md:text-4xl">
              A local exchange experience with fewer unknowns.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {reasons.map((reason) => (
              <div key={reason.title} className="rounded-[2rem] border border-black/10 bg-[var(--vb-cream)] p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--vb-ink)] text-[var(--vb-orange)]">
                  <reason.icon className="h-5 w-5" />
                </div>
                <h3 className="public-display mt-6 text-lg font-bold text-slate-950">{reason.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{reason.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[2rem] bg-[var(--vb-ink)] p-8 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--vb-orange)]">Resources</p>
            <h2 className="public-display mt-3 text-3xl font-bold">Understand wallets, networks, and taxes before you buy.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Good public education reduces avoidable mistakes. Start with the basics before you move money or send
              assets to a wallet address.
            </p>
            <div className="mt-8 space-y-4">
              {publicKnowledgePages.slice(0, 3).map((page) => (
                <Link key={page.slug} to={page.path} className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{page.category}</p>
                      <p className="mt-2 text-lg font-semibold text-white">{page.title}</p>
                    </div>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-300">{page.readTime}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-5 rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--vb-orange)]">Supported assets</p>
                <h2 className="public-display mt-3 text-3xl font-bold text-slate-950">Major coins, familiar rails.</h2>
              </div>
              <Wallet className="hidden h-10 w-10 text-[var(--vb-orange)] sm:block" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {publicCoins.map((coin) => (
                <div key={coin.symbol} className="rounded-[1.5rem] border border-black/10 bg-[var(--vb-cream)] p-4">
                  <div className="flex items-center gap-3">
                    <img src={coin.icon} alt={coin.name} className="h-10 w-10 rounded-full bg-white p-1.5 shadow-sm" />
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{coin.symbol}</p>
                      <p className="text-xs text-slate-500">{coin.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-white/80">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--vb-orange)]">Branch locations</p>
              <h2 className="public-display mt-3 text-3xl font-bold text-slate-950">Two local branches. One clear process.</h2>
            </div>
            <Link to="/locations" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 hover:text-slate-950">
              View all locations
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {publicLocations.map((location) => (
              <Link key={location.slug} to={location.path} className="rounded-[2rem] border border-black/10 bg-[var(--vb-cream)] p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{location.city} Office</p>
                    <h3 className="public-display mt-3 text-2xl font-bold text-slate-950">{location.title}</h3>
                  </div>
                  <MapPin className="h-6 w-6 text-[var(--vb-orange)]" />
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">{location.description}</p>
                <div className="mt-6 rounded-[1.5rem] border border-black/10 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-950">{location.address}</p>
                  <p className="mt-2 text-sm text-slate-600">{location.hours[0]}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[var(--vb-orange)]">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(255,166,48,0.24))]" />
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#f9b155]/35 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-6 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.26em] text-[#1d2b6b]">Testimonials</p>
            <h2 className="public-display mt-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              How We&apos;ve Made Crypto Exchange Seamless for our Customers
            </h2>
          </div>

          <div className="relative mt-14 hidden lg:block lg:px-16 xl:px-20">
            <button
              type="button"
              aria-label="Show previous testimonial"
              onClick={() => cycleTestimonials(-1)}
              className="absolute left-4 top-1/2 z-10 inline-flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-[#35295f] text-white shadow-xl transition-transform hover:scale-105"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
            <button
              type="button"
              aria-label="Show next testimonial"
              onClick={() => cycleTestimonials(1)}
              className="absolute right-4 top-1/2 z-10 inline-flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-[#35295f] text-white shadow-xl transition-transform hover:scale-105"
            >
              <ChevronRight className="h-7 w-7" />
            </button>

            <div className="-mx-4 overflow-x-hidden rounded-[2.25rem] px-4 lg:mx-0 lg:px-0">
              <div
                className="flex gap-6 transition-transform duration-500 ease-out"
                style={{ transform: `translateX(${-testimonialIndex * 33.333}%)` }}
              >
                {publicTestimonials.map((testimonial) => (
                  <article
                    key={testimonial.name}
                    className="flex min-h-[24rem] min-w-[33.333%] flex-shrink-0 flex-col justify-between rounded-[2.25rem] bg-white px-12 py-12 text-slate-900 shadow-[0_24px_70px_rgba(17,17,17,0.18)]"
                  >
                    <p className="max-w-4xl text-xl leading-10">
                      &ldquo;
                      {testimonial.quote.map((part, index) =>
                        part.emphasis ? (
                          <strong key={`${testimonial.name}-${index}`} className="font-extrabold">
                            {part.text}
                          </strong>
                        ) : (
                          <span key={`${testimonial.name}-${index}`}>{part.text}</span>
                        ),
                      )}
                      &rdquo;
                    </p>

                    <div className="mt-10 flex items-center gap-4">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.avatarAlt}
                        loading="lazy"
                        className="h-16 w-16 rounded-full object-cover shadow-sm"
                      />
                      <p className="text-2xl font-semibold tracking-[-0.03em] text-slate-900">{testimonial.name}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-2">
              {publicTestimonials.map((testimonial, index) => (
                <button
                  key={testimonial.name}
                  type="button"
                  aria-label={`Show testimonial ${index + 1}`}
                  onClick={() => setTestimonialIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${index === testimonialIndex ? 'w-10 bg-[#35295f]' : 'w-2.5 bg-white/60'}`}
                />
              ))}
            </div>
          </div>

          <div className="relative mx-auto mt-14 max-w-3xl lg:hidden">
            <div className="mx-5 overflow-hidden rounded-[2rem] sm:mx-8">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${testimonialIndex * 100}%)` }}
              >
                {publicTestimonials.map((testimonial) => (
                  <article
                    key={testimonial.name}
                    className="flex min-h-[18rem] min-w-full flex-col justify-between rounded-[2rem] bg-white px-8 py-9 text-slate-900 shadow-[0_22px_65px_rgba(17,17,17,0.16)] sm:min-h-[20rem] sm:px-10"
                  >
                    <p className="text-[1.05rem] leading-9 sm:text-[1.15rem] sm:leading-10">
                      &ldquo;
                      {testimonial.quote.map((part, index) =>
                        part.emphasis ? (
                          <strong key={`${testimonial.name}-${index}`} className="font-extrabold">
                            {part.text}
                          </strong>
                        ) : (
                          <span key={`${testimonial.name}-${index}`}>{part.text}</span>
                        ),
                      )}
                      &rdquo;
                    </p>

                    <div className="mt-8 flex items-center gap-4">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.avatarAlt}
                        loading="lazy"
                        className="h-14 w-14 rounded-full object-cover shadow-sm"
                      />
                      <p className="text-xl font-semibold tracking-[-0.03em] text-slate-900 sm:text-2xl">{testimonial.name}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-between">
              <button
                type="button"
                aria-label="Show previous testimonial"
                onClick={() => cycleTestimonials(-1)}
                className="pointer-events-auto inline-flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full bg-[#35295f] text-white shadow-lg"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label="Show next testimonial"
                onClick={() => cycleTestimonials(1)}
                className="pointer-events-auto inline-flex h-11 w-11 translate-x-1/2 items-center justify-center rounded-full bg-[#35295f] text-white shadow-lg"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-8 flex justify-center gap-2">
              {publicTestimonials.map((testimonial, index) => (
                <button
                  key={testimonial.name}
                  type="button"
                  aria-label={`Show testimonial ${index + 1}`}
                  onClick={() => setTestimonialIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${index === testimonialIndex ? 'w-10 bg-[#35295f]' : 'w-2.5 bg-white/60'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
