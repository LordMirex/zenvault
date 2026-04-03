import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { apiRequest } from '../lib/api';

export type BrandingSettings = {
  siteName: string;
  siteUrl: string;
  logoUrl: string;
  faviconUrl: string;
  publicTopbarLabel: string;
  publicTopbarText: string;
  publicHeroTitle: string;
  publicHeroDescription: string;
  footerSummary: string;
  authHeadline: string;
  authDescription: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  referralEnabled: boolean;
  referralBonusAmount: number;
  bonusDistribution: string;
};

const defaultBranding: BrandingSettings = {
  siteName: 'My Wallet',
  siteUrl: typeof window === 'undefined' ? '' : window.location.origin,
  logoUrl: '',
  faviconUrl: '',
  publicTopbarLabel: 'Welcome',
  publicTopbarText:
    'Secure digital asset management with guided support and transparent pricing.',
  publicHeroTitle: 'Your trusted digital wallet platform.',
  publicHeroDescription:
    'Manage your digital assets with confidence — secure transactions, transparent pricing, and dedicated support when you need it.',
  footerSummary:
    'A secure and transparent digital asset platform with dedicated support for every step of your journey.',
  authHeadline: 'Sign in to your account',
  authDescription:
    'Access your wallet, portfolio activity, and account controls through a secure login flow.',
  companyName: '',
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
  referralEnabled: true,
  referralBonusAmount: 5,
  bonusDistribution: 'Instant Bonus',
};

const cleanText = (value: unknown, fallback: string) => {
  const next = String(value ?? '').trim();
  return next || fallback;
};

const cleanNumber = (value: unknown, fallback: number) => {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
};

const normalizeBranding = (input: Record<string, unknown> | null | undefined): BrandingSettings => {
  const merged = {
    ...defaultBranding,
    ...(input ?? {}),
  };

  return {
    siteName: cleanText(merged.siteName, defaultBranding.siteName),
    siteUrl: cleanText(merged.siteUrl, defaultBranding.siteUrl).replace(/\/$/, ''),
    logoUrl: cleanText(merged.logoUrl, defaultBranding.logoUrl),
    faviconUrl: cleanText(merged.faviconUrl, defaultBranding.faviconUrl),
    publicTopbarLabel: cleanText(merged.publicTopbarLabel, defaultBranding.publicTopbarLabel),
    publicTopbarText: cleanText(merged.publicTopbarText, defaultBranding.publicTopbarText),
    publicHeroTitle: cleanText(merged.publicHeroTitle, defaultBranding.publicHeroTitle),
    publicHeroDescription: cleanText(merged.publicHeroDescription, defaultBranding.publicHeroDescription),
    footerSummary: cleanText(merged.footerSummary, defaultBranding.footerSummary),
    authHeadline: cleanText(merged.authHeadline, defaultBranding.authHeadline),
    authDescription: cleanText(merged.authDescription, defaultBranding.authDescription),
    companyName: cleanText(merged.companyName, defaultBranding.companyName),
    companyAddress: cleanText(merged.companyAddress, defaultBranding.companyAddress),
    companyPhone: cleanText(merged.companyPhone, defaultBranding.companyPhone),
    companyEmail: cleanText(merged.companyEmail, defaultBranding.companyEmail),
    referralEnabled: merged.referralEnabled !== false,
    referralBonusAmount: cleanNumber(merged.referralBonusAmount, defaultBranding.referralBonusAmount),
    bonusDistribution: cleanText(merged.bonusDistribution, defaultBranding.bonusDistribution),
  };
};

const ensureFaviconLink = () => {
  let favicon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
  if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    document.head.appendChild(favicon);
  }

  return favicon;
};

const routeTitles = [
  { matcher: (pathname: string) => pathname === '/', title: 'Home', public: true },
  { matcher: (pathname: string) => pathname.startsWith('/buy-with-'), title: 'Services', public: true },
  { matcher: (pathname: string) => pathname.startsWith('/resources/'), title: 'Resources', public: true },
  { matcher: (pathname: string) => pathname === '/crypto-basics', title: 'Crypto Basics', public: true },
  { matcher: (pathname: string) => pathname === '/crypto-wallets', title: 'Crypto Wallets', public: true },
  { matcher: (pathname: string) => pathname === '/faqs', title: 'FAQs', public: true },
  { matcher: (pathname: string) => pathname.startsWith('/locations'), title: 'Locations', public: true },
  { matcher: (pathname: string) => pathname === '/contact', title: 'Contact', public: true },
  { matcher: (pathname: string) => pathname === '/privacy-policy', title: 'Privacy Policy', public: true },
  { matcher: (pathname: string) => pathname === '/terms-of-service', title: 'Terms of Service', public: true },
  { matcher: (pathname: string) => pathname === '/login', title: 'Login', public: false },
  { matcher: (pathname: string) => pathname === '/signup', title: 'Create Account', public: false },

  { matcher: (pathname: string) => pathname === '/app' || pathname === '/dashboard', title: 'Dashboard', public: false },
  { matcher: (pathname: string) => pathname === '/app/cards' || pathname === '/cards', title: 'Cards', public: false },
  { matcher: (pathname: string) => pathname.startsWith('/app/'), title: 'Wallet', public: false },
  { matcher: (pathname: string) => pathname.startsWith('/admin/broadcasts'), title: 'Broadcasts', public: false },
  { matcher: (pathname: string) => pathname.startsWith('/admin'), title: 'Admin', public: false },
];

const BrandingContext = createContext<{
  branding: BrandingSettings;
  refreshBranding: () => Promise<void>;
} | null>(null);

export const BrandingProvider = ({ children }: PropsWithChildren) => {
  const location = useLocation();
  const { adminSettings } = useAuth();
  const [branding, setBranding] = useState<BrandingSettings>(defaultBranding);

  const refreshBranding = async () => {
    try {
      const payload = await apiRequest<{ branding: Record<string, unknown> }>('/api/public/settings', { token: null });
      setBranding(normalizeBranding(payload.branding));
    } catch {
      setBranding((current) => normalizeBranding(current));
    }
  };

  useEffect(() => {
    void refreshBranding();
  }, []);

  useEffect(() => {
    if (adminSettings?.general) {
      setBranding(normalizeBranding(adminSettings.general));
    }
  }, [adminSettings]);

  useEffect(() => {
    const favicon = ensureFaviconLink();
    favicon.type = branding.faviconUrl.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
    favicon.href = branding.faviconUrl;
  }, [branding.faviconUrl]);

  useEffect(() => {
    const match = routeTitles.find((entry) => entry.matcher(location.pathname));
    const pageTitle = match?.title;
    const baseTitle = branding.siteName;
    document.title = pageTitle ? `${pageTitle} | ${baseTitle}` : baseTitle;
  }, [branding.siteName, location.pathname]);

  const value = useMemo(
    () => ({
      branding,
      refreshBranding,
    }),
    [branding],
  );

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within BrandingProvider.');
  }

  return context;
};
