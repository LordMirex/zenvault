import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, ChevronLeft, Sparkles } from 'lucide-react';
import { getPublicKnowledgePageBySlug } from '../../data/public';

export const PublicKnowledgePage = ({ slug: forcedSlug }: { slug?: string }) => {
  const { slug: routeSlug } = useParams();
  const slug = forcedSlug ?? routeSlug;
  const page = slug ? getPublicKnowledgePageBySlug(slug) : undefined;

  if (!page) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-14 lg:px-6 lg:py-20">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900">
        <ChevronLeft className="h-4 w-4" />
        Back to home
      </Link>

      <section className="mt-6 rounded-[2.25rem] bg-[var(--vb-ink)] p-8 text-white shadow-2xl md:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--vb-orange)]">{page.category}</p>
        <h1 className="public-display mt-4 text-4xl font-bold tracking-tight md:text-5xl">{page.title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">{page.description}</p>
        <div className="mt-8 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200">
          {page.readTime}
        </div>
      </section>

      <section className="mt-10 space-y-5">
        {page.sections.map((section) => (
          <article key={section.title} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
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
                  <div key={bullet} className="rounded-[1.5rem] bg-[var(--vb-cream)] p-4 text-sm leading-7 text-slate-700">
                    {bullet}
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </section>

      <section className="mt-10 rounded-[2rem] border border-black/10 bg-[var(--vb-cream)] p-8">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-1 h-5 w-5 text-[var(--vb-orange)]" />
          <div>
            <h2 className="text-xl font-black text-slate-950">Helpful next step</h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">{page.callout}</p>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white"
          >
            Create account
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/faqs"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
          >
            Read FAQs
          </Link>
        </div>
      </section>
    </main>
  );
};
