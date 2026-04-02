import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, ChevronLeft, MapPin, PhoneCall } from 'lucide-react';
import { getPublicLocationBySlug } from '../../data/public';

export const PublicLocationDetailPage = ({ slug: forcedSlug }: { slug?: string }) => {
  const { slug: routeSlug } = useParams();
  const slug = forcedSlug ?? routeSlug;
  const location = slug ? getPublicLocationBySlug(slug) : undefined;

  if (!location) {
    return <Navigate to="/locations" replace />;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-14 lg:px-6 lg:py-20">
      <Link to="/locations" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900">
        <ChevronLeft className="h-4 w-4" />
        Back to all locations
      </Link>

      <section className="mt-6 grid gap-8 lg:grid-cols-[1fr_0.95fr]">
        <div className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--vb-orange)]">{location.city} office</p>
          <h1 className="public-display mt-4 text-4xl font-bold tracking-tight text-slate-950">{location.title}</h1>
          <p className="mt-4 text-base leading-8 text-slate-600">{location.description}</p>
          <div className="mt-8 grid gap-4">
            <div className="flex items-start gap-3 rounded-[1.5rem] bg-[var(--vb-cream)] p-5">
              <MapPin className="mt-1 h-5 w-5 text-[var(--vb-orange)]" />
              <div>
                <p className="text-sm font-bold text-slate-950">Address</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{location.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-[1.5rem] bg-[var(--vb-cream)] p-5">
              <PhoneCall className="mt-1 h-5 w-5 text-[var(--vb-orange)]" />
              <div>
                <p className="text-sm font-bold text-slate-950">Phone</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{location.phone}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-[var(--vb-ink)] p-8 text-white shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--vb-orange)]">At this branch</p>
          <div className="mt-6 space-y-4">
            {location.specialties.map((specialty) => (
              <div key={specialty} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-200">
                {specialty}
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <p className="text-sm leading-7 text-slate-200">{location.note}</p>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <Link to="/signup" className="rounded-full bg-[var(--vb-orange)] px-5 py-3 text-center text-sm font-bold text-slate-950">
              Create account
            </Link>
            <Link to="/login" className="rounded-full border border-white/15 px-5 py-3 text-center text-sm font-semibold text-white">
              Login to your portal
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Hours</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {location.hours.map((hour) => (
            <div key={hour} className="rounded-[1.5rem] bg-[var(--vb-cream)] p-4 text-sm leading-7 text-slate-700">
              {hour}
            </div>
          ))}
        </div>
        <Link
          to="/contact"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white"
        >
          Contact the branch
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
};
