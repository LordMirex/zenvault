import { Mail, PhoneCall } from 'lucide-react';
import { publicLocations } from '../../data/public';
import { useBranding } from '../../context/BrandingContext';

export const PublicContactPage = () => {
  const { branding } = useBranding();

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 lg:px-6 lg:py-20">
      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] bg-[var(--vb-ink)] p-8 text-white shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--vb-orange)]">Contact</p>
          <h1 className="public-display mt-4 text-4xl font-bold">Talk to {branding.siteName}</h1>
          <p className="mt-4 text-base leading-8 text-slate-300">
            Reach out before you transact if you need help choosing the right payment method, understanding wallet setup, or planning a larger order.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <PhoneCall className="h-5 w-5 text-[var(--vb-orange)]" />
              <div>
                <p className="text-sm font-bold text-white">Phone</p>
                <p className="text-sm text-slate-300">{branding.companyPhone || 'Not configured yet'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <Mail className="h-5 w-5 text-[var(--vb-orange)]" />
              <div>
                <p className="text-sm font-bold text-white">Email</p>
                <p className="text-sm text-slate-300">{branding.companyEmail || 'Not configured yet'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Locations</p>
          <div className="mt-6 grid gap-4">
            {publicLocations.map((location) => (
              <div key={location.slug} className="rounded-[1.5rem] bg-[#f8f6f1] p-5">
                <p className="text-sm font-bold text-slate-950">{location.city}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{location.address}</p>
                <p className="mt-2 text-sm text-slate-500">{location.phone}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};
