import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useBranding } from '../../context/BrandingContext';
import { BrandLogo } from '../common/BrandLogo';

const primaryLinks = [
  { label: 'Home', to: '/', end: true },
  { label: 'E-Transfer', to: '/buy-with-e-transfer' },
  { label: 'Resources', to: '/crypto-basics' },
  { label: 'Locations', to: '/locations' },
  { label: 'FAQs', to: '/faqs' },
];

export const PublicShell = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { branding } = useBranding();

  useEffect(() => {
    window.scrollTo(0, 0);
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="public-site min-h-screen bg-[var(--vb-sand)] text-[var(--vb-ink)]">
      <div className="hidden border-b border-black/10 bg-[var(--vb-ink)] px-4 py-3 text-sm text-white lg:block">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:px-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">{branding.publicTopbarLabel}</p>
          <p className="text-sm text-white/80">{branding.publicTopbarText}</p>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-black/10 bg-[rgba(246,239,229,0.94)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-6">
          <Link to="/" className="flex items-center gap-3">
            <BrandLogo size="md" variant="full" textClassName="text-lg font-black tracking-tight text-slate-900" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {primaryLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                    isActive ? 'bg-[var(--vb-orange)] text-[var(--vb-ink)]' : 'text-slate-700 hover:bg-white hover:text-[var(--vb-ink)]',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white">
              Login
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--vb-orange)] px-5 py-2.5 text-sm font-bold text-[var(--vb-ink)] transition-transform hover:-translate-y-0.5"
            >
              Create account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-[var(--vb-ink)] lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-black/10 bg-[var(--vb-cream)] px-4 py-4 lg:hidden">
            <div className="mx-auto max-w-7xl space-y-2">
              {primaryLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-3xl px-4 py-3 text-sm font-semibold',
                      isActive ? 'bg-[var(--vb-orange)] text-[var(--vb-ink)]' : 'bg-white text-slate-700',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="grid grid-cols-2 gap-3 pt-3">
                <Link to="/login" className="rounded-3xl border border-black/10 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700">
                  Login
                </Link>
                <Link to="/signup" className="rounded-3xl bg-[var(--vb-orange)] px-4 py-3 text-center text-sm font-bold text-[var(--vb-ink)]">
                  Create account
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <Outlet />

      <footer className="border-t border-black/10 bg-[var(--vb-ink)] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:px-6">
          <div className="space-y-5">
            <BrandLogo size="lg" variant="full" invertFallback textClassName="text-2xl font-black text-white" />
            <p className="max-w-md text-sm leading-7 text-white/70">
              {branding.footerSummary}
            </p>
          </div>

          <FooterGroup
            title="Explore"
            links={[
              ['Buy With E-Transfer', '/buy-with-e-transfer'],
              ['Home', '/'],
              ['Locations', '/locations'],
              ['Contact', '/contact'],
            ]}
          />
          <FooterGroup
            title="Learn"
            links={[
              ['Crypto Basics', '/crypto-basics'],
              ['Wallets', '/crypto-wallets'],
              ['FAQs', '/faqs'],
              ['Contact', '/contact'],
            ]}
          />
          <FooterGroup
            title="Access"
            links={[
              ['Login', '/login'],
              ['Create Account', '/signup'],
              ['Privacy Policy', '/privacy-policy'],
              ['Terms of Service', '/terms-of-service'],
            ]}
          />
        </div>
      </footer>
    </div>
  );
};

type FooterGroupProps = {
  title: string;
  links: [string, string][];
};

const FooterGroup = ({ title, links }: FooterGroupProps) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">{title}</p>
    <div className="mt-5 space-y-3">
      {links.map(([label, to]) => (
        <Link key={to} to={to} className="block text-sm text-white/70 transition-colors hover:text-white">
          {label}
        </Link>
      ))}
    </div>
  </div>
);
