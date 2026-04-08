import { config } from './config.mjs';

const trimString = (value) => String(value ?? '').trim();
const trimLowercase = (value) => trimString(value).toLowerCase();

export const defaultGeneralSettings = {
  siteName: 'Zenvault Wallet',
  siteUrl: String(config.clientOrigin ?? 'http://localhost:5173').replace(/\/$/, ''),
  logoUrl: '/logo.png',
  faviconUrl: '/favicon.png',
  companyName: 'Zenvault Wallet',
  publicTopbarLabel: 'Zenvault Wallet',
  publicTopbarText:
    'Secure digital asset management with guided support and transparent pricing.',
  publicHeroTitle: 'Your trusted digital wallet platform.',
  publicHeroDescription:
    'Manage your digital assets with confidence — secure transactions, transparent pricing, and dedicated support when you need it.',
  footerSummary:
    'Zenvault Wallet — secure crypto wallet and OTC trading with transparent pricing and human support.',
  authHeadline: 'Sign in to your Zenvault Wallet account',
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
};

export const normalizeGeneralSettings = (input = {}) => {
  const merged = {
    ...defaultGeneralSettings,
    ...(input ?? {}),
  };

  return {
    siteName: trimString(merged.siteName) || defaultGeneralSettings.siteName,
    siteUrl: trimString(merged.siteUrl).replace(/\/$/, '') || defaultGeneralSettings.siteUrl,
    logoUrl: trimString(merged.logoUrl) || defaultGeneralSettings.logoUrl,
    faviconUrl: trimString(merged.faviconUrl) || defaultGeneralSettings.faviconUrl,
    companyName: trimString(merged.companyName) || defaultGeneralSettings.companyName,
    publicTopbarLabel: trimString(merged.publicTopbarLabel) || defaultGeneralSettings.publicTopbarLabel,
    publicTopbarText: trimString(merged.publicTopbarText) || defaultGeneralSettings.publicTopbarText,
    publicHeroTitle: trimString(merged.publicHeroTitle) || defaultGeneralSettings.publicHeroTitle,
    publicHeroDescription: trimString(merged.publicHeroDescription) || defaultGeneralSettings.publicHeroDescription,
    footerSummary: trimString(merged.footerSummary) || defaultGeneralSettings.footerSummary,
    authHeadline: trimString(merged.authHeadline) || defaultGeneralSettings.authHeadline,
    authDescription: trimString(merged.authDescription) || defaultGeneralSettings.authDescription,
    companyAddress: trimString(merged.companyAddress) || defaultGeneralSettings.companyAddress,
    companyPhone: trimString(merged.companyPhone) || defaultGeneralSettings.companyPhone,
    companyEmail: trimLowercase(merged.companyEmail) || defaultGeneralSettings.companyEmail,
  };
};

export const resolveSiteOrigin = (settings = {}) => {
  const candidate = trimString(settings.siteUrl).replace(/\/$/, '');
  if (/^https?:\/\//i.test(candidate)) {
    return candidate;
  }

  return String(config.clientOrigin ?? 'http://localhost:5173').replace(/\/$/, '');
};
