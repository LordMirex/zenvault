import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Clock3, MapPin, PhoneCall } from 'lucide-react';
import { publicLocations } from '../../data/public';

export const PublicLocationsPage = () => {
  return (
    <main className="mx-auto max-w-7xl px-4 py-14 lg:px-6 lg:py-20">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--vb-orange)]">Branch locations</p>
          <h1 className="public-display mt-4 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Find a local crypto exchange office near you
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            Choose the branch that fits you best, get local support, and transact with more confidence than a typical self-serve exchange flow.
          </p>
        </div>
        <div className="rounded-[2rem] bg-[var(--vb-ink)] p-8 text-white shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--vb-orange)]">Need help right away?</p>
          <p className="mt-3 text-2xl font-black">Talk to the desk before you transact</p>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Reach out if you need help choosing the right payment method, understanding wallet setup, or planning a larger OTC-style order.
          </p>
          <a
            href="tel:+16042567936"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--vb-orange)] px-5 py-3 text-sm font-bold text-slate-950"
          >
            <PhoneCall className="h-4 w-4" />
            Call the desk
          </a>
        </div>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-2">
        {publicLocations.map((location) => (
          <article key={location.slug} className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">{location.city}</p>
                <h2 className="mt-3 text-3xl font-black text-slate-950">{location.title}</h2>
              </div>
                <Building2 className="h-6 w-6 text-[var(--vb-orange)]" />
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-600">{location.description}</p>

            <div className="mt-6 grid gap-3">
              <div className="flex items-start gap-3 rounded-[1.5rem] bg-[var(--vb-cream)] p-4">
                <MapPin className="mt-1 h-5 w-5 text-[var(--vb-orange)]" />
                <p className="text-sm leading-7 text-slate-700">{location.address}</p>
              </div>
              <div className="flex items-start gap-3 rounded-[1.5rem] bg-[var(--vb-cream)] p-4">
                <Clock3 className="mt-1 h-5 w-5 text-[var(--vb-orange)]" />
                <div className="text-sm leading-7 text-slate-700">
                  {location.hours.map((hour) => (
                    <p key={hour}>{hour}</p>
                  ))}
                </div>
              </div>
            </div>

            <Link
              to={location.path}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white"
            >
              View branch details
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
};
