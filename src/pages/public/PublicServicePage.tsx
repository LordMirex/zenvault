import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ChevronLeft } from 'lucide-react';
import { getPublicServiceBySlug } from '../../data/public';

export const PublicServicePage = ({ slug: forcedSlug }: { slug?: string }) => {
  const { slug: routeSlug } = useParams();
  const slug = forcedSlug ?? routeSlug;
  const service = slug ? getPublicServiceBySlug(slug) : undefined;

  if (!service) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 lg:px-6 lg:py-20">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900">
        <ChevronLeft className="h-4 w-4" />
        Back to home
      </Link>

      <section className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--vb-orange)]">{service.eyebrow}</p>
          <h1 className="public-display max-w-3xl text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">{service.title}</h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">{service.description}</p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-bold text-white"
            >
              Start with signup
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-4 text-sm font-semibold text-slate-700"
            >
              Login to continue
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] bg-[var(--vb-ink)] p-8 text-white shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--vb-orange)]">{service.quoteLabel}</p>
          <div className="mt-6 grid gap-4">
            {service.highlights.map((item) => (
              <div key={item.label} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-sm font-semibold text-slate-300">{item.label}</p>
                  <p className="text-xl font-black text-white">{item.value}</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          {service.sections.map((section) => (
            <div key={section.title} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-black text-slate-950">{section.title}</h2>
              <div className="mt-5 space-y-4">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-8 text-slate-600">
                    {paragraph}
                  </p>
                ))}
              </div>
              {section.bullets && (
                <div className="mt-6 grid gap-3">
                  {section.bullets.map((bullet) => (
                    <div key={bullet} className="flex items-start gap-3 rounded-[1.25rem] bg-[var(--vb-cream)] p-4">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-[var(--vb-orange)]" />
                      <p className="text-sm leading-7 text-slate-700">{bullet}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-5">
          <div className="rounded-[2rem] border border-black/10 bg-[var(--vb-cream)] p-8">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Practical checklist</p>
            <div className="mt-6 space-y-3">
              {service.checklist.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[1.25rem] border border-black/10 bg-white p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-[var(--vb-orange)]" />
                  <p className="text-sm leading-7 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-[var(--vb-orange)] p-8 text-slate-950 shadow-xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-950/65">Next step</p>
            <h2 className="public-display mt-3 text-3xl font-bold">Create your account and continue with support close by</h2>
            <p className="mt-4 text-sm leading-7 text-slate-950/80">
              Start with the service that matches your trade, then move into a secure account flow for funding, verification, and transaction tracking.
            </p>
            <Link
              to="/signup"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white"
            >
              Create your account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};
