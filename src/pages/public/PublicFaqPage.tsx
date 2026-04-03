import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import { publicFaqs } from '../../data/public';
import { cn } from '../../lib/cn';

export const PublicFaqPage = () => {
  const [openQuestion, setOpenQuestion] = useState(publicFaqs[0]?.question ?? '');

  return (
    <main className="mx-auto max-w-5xl px-4 py-14 lg:px-6 lg:py-20">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900">
        <ChevronLeft className="h-4 w-4" />
        Back to home
      </Link>

      <section className="mt-6 rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm md:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--vb-orange)]">Frequently asked questions</p>
        <h1 className="public-display mt-4 text-4xl font-bold tracking-tight text-slate-950">Questions people ask before they buy crypto locally</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
          Straight answers for first-time buyers, returning clients, and anyone comparing cash, e-Transfer, wire transfer, or OTC options.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        {publicFaqs.map((faq) => {
          const isOpen = openQuestion === faq.question;

          return (
            <button
              key={faq.question}
              type="button"
              onClick={() => setOpenQuestion(isOpen ? '' : faq.question)}
              className="w-full rounded-[2rem] border border-black/10 bg-white p-6 text-left shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-black text-slate-950">{faq.question}</h2>
                <ChevronDown className={cn('h-5 w-5 text-slate-400 transition-transform', isOpen && 'rotate-180')} />
              </div>
              {isOpen && <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-600">{faq.answer}</p>}
            </button>
          );
        })}
      </section>
    </main>
  );
};
