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
};

const defaultBranding: BrandingSettings = {
  siteName: 'Zenvault Wallet',
  siteUrl: typeof window === 'undefined' ? '' : window.location.origin,
  logoUrl: '/logo.png',
  faviconUrl: '/favicon.png',
  publicTopbarLabel: 'Zenvault Wallet',
  publicTopbarText:
    'Secure digital asset management with guided support and transparent pricing.',
  publicHeroTitle: 'Your trusted digital wallet platform.',
  publicHeroDescription:
    'Manage your digital assets with confidence — secure transactions, transparent pricing, and dedicated support when you need it.',
  footerSummary:
    'Zenvault Wallet — secure crypto wallet and OTC trading with transparent pricing and human support.',
  authHeadline: 'Sign in to your Zenvault Wallet account',
  authDescription:
    'Access your wallet, portfolio activity, and account controls through a secure login flow.',
  companyName: 'Zenvault Wallet',
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
};

const cleanText = (value: unknown, fallback: string) => {
  const next = String(value ?? '').trim();
  return next || fallback;
};

type BrandingContextValue = {
  branding: BrandingSettings;
  refreshBranding: () => void;
};

const BrandingContext = createContext<BrandingContextValue>({
  branding: defaultBranding,
  refreshBranding: () => {},
});

const normalizeBranding = (raw: Record<string, unknown>): BrandingSettings => ({
  siteName: cleanText(raw.siteName, defaultBranding.siteName),
  siteUrl: cleanText(raw.siteUrl, defaultBranding.siteUrl),
  logoUrl: cleanText(raw.logoUrl, defaultBranding.logoUrl),
  faviconUrl: cleanText(raw.faviconUrl, defaultBranding.faviconUrl),
  publicTopbarLabel: cleanText(raw.publicTopbarLabel, defaultBranding.publicTopbarLabel),
  publicTopbarText: cleanText(raw.publicTopbarText, defaultBranding.publicTopbarText),
  publicHeroTitle: cleanText(raw.publicHeroTitle, defaultBranding.publicHeroTitle),
  publicHeroDescription: cleanText(raw.publicHeroDescription, defaultBranding.publicHeroDescription),
  footerSummary: cleanText(raw.footerSummary, defaultBranding.footerSummary),
  authHeadline: cleanText(raw.authHeadline, defaultBranding.authHeadline),
  authDescription: cleanText(raw.authDescription, defaultBranding.authDescription),
  companyName: cleanText(raw.companyName, defaultBranding.companyName),
  companyAddress: cleanText(raw.companyAddress, defaultBranding.companyAddress),
  companyPhone: cleanText(raw.companyPhone, defaultBranding.companyPhone),
  companyEmail: cleanText(raw.companyEmail, defaultBranding.companyEmail),
});

export function BrandingProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const location = useLocation();
  const [branding, setBranding] = useState<BrandingSettings>(defaultBranding);
  const [tick, setTick] = useState(0);

  const refreshBranding = () => setTick((n) => n + 1);

  useEffect(() => {
    let cancelled = false;
    apiRequest<{ branding: Record<string, unknown> }>('/api/public/settings', { method: 'GET' })
      .then((data) => {
        if (!cancelled && data?.branding) {
          setBranding(normalizeBranding(data.branding));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user, location.pathname, tick]);

  useEffect(() => {
    if (branding.siteName) {
      document.title = branding.siteName;
    }
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon && branding.faviconUrl) {
      favicon.href = branding.faviconUrl;
    }
  }, [branding.siteName, branding.faviconUrl]);

  const value = useMemo<BrandingContextValue>(
    () => ({ branding, refreshBranding }),
    [branding],
  );

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  return useContext(BrandingContext);
}
