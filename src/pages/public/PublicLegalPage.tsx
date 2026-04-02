import { Link, Navigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { getLegalPageBySlug } from '../../data/public';

export const PublicLegalPage = ({ slug: forcedSlug }: { slug?: string }) => {
  const { slug: routeSlug } = useParams();
  const slug = forcedSlug ?? routeSlug;
  const page = slug ? getLegalPageBySlug(slug) : undefined;

  if (!page) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-14 lg:px-6 lg:py-20">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900">
        <ChevronLeft className="h-4 w-4" />
        Back to home
      </Link>

      <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Legal</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">{page.title}</h1>
        <p className="mt-4 text-base leading-8 text-slate-600">{page.intro}</p>
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
                  <div key={bullet} className="rounded-[1.5rem] bg-[#f8f6f1] p-4 text-sm leading-7 text-slate-700">
                    {bullet}
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </section>
    </main>
  );
};
