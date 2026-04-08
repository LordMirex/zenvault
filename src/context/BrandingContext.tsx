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
  siteName: 'My Wallet',
  siteUrl: typeof window === 'undefined' ? '' : window.location.origin,
  logoUrl: '/logo.png',
  faviconUrl: '/favicon.png',
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
};

const cleanText = (value: unknown, fallback: string) => {
  const next = String(value ?? '').trim();
  return next || fallback;
};

