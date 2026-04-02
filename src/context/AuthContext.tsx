import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import type {
  AddressBookEntry,
  NotificationItem,
  WalletActivity,
  WalletAsset,
} from '../data/wallet';
import type {
  AdminEmailTemplate,
  AdminKycCase,
  AdminMetric,
  AdminTransactionRecord,
  AdminUser,
  AdminWalletRail,
} from '../data/admin';

import { hydrateWalletData } from '../data/wallet';
import {
  AUTH_EXPIRED_EVENT,
  apiRequest,
  clearPendingToken,
  clearStoredAuth,
  getAccessToken,
  getPendingToken,
  setAccessToken,
  setPendingToken,
} from '../lib/api';

type SessionUser = {
  id: string;
  role: 'user' | 'admin';
  name: string;
  email: string;
  uuid: string;
  kycStatus: string;
  status: string;
};

type ClientBootstrap = {
  profile: {
    id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    uuid: string;
    country: string;
    plan: string;
    tier: string;
    kycStatus: string;
  };
  summary: {
    portfolioUsd: number;
    availableUsd: number;
    changeUsd: number;
    changePct: number;
    walletConnected: boolean;
  };
  walletAssets: WalletAsset[];
  depositActivity: WalletActivity[];
  withdrawalActivity: WalletActivity[];
  notificationItems: NotificationItem[];
  addressBookEntries: AddressBookEntry[];
  recentSessions: {
    id: string;
    device: string;
    location: string;
    status: string;
    lastSeen: string;
  }[];
  kycChecklist: {
    id: string;
    title: string;
    detail: string;
    status: string;
  }[];
  referralMilestones: { label: string; reward: string; requirement: string }[];
  recentReferrals: { id: string; name: string; joinedAt: string; status: string; reward: string }[];
};

type AdminBootstrap = {
  adminUsers: AdminUser[];
  adminMetrics: AdminMetric[];
  adminKycCases: AdminKycCase[];

  adminTransactions: AdminTransactionRecord[];
  adminWalletRails: AdminWalletRail[];
  adminEmailTemplates: AdminEmailTemplate[];
  adminAlerts: string[];
  adminTimeline: {
    id: string;
    title: string;
    detail: string;
    time: string;
  }[];
  adminSettings: {
    general: Record<string, unknown>;
    email: Record<string, unknown>;
    wallets: Record<string, unknown>;
  };
};

type AuthContextValue = {
  status: 'loading' | 'anonymous' | 'pending-passcode' | 'authenticated';
  user: SessionUser | null;
  clientProfile: ClientBootstrap['profile'] | null;
  clientSummary: ClientBootstrap['summary'] | null;
  clientWalletAssets: WalletAsset[];
  adminSettings: AdminBootstrap['adminSettings'] | null;
  adminUsers: AdminBootstrap['adminUsers'];
  adminKycCases: AdminBootstrap['adminKycCases'];
  adminTransactions: AdminBootstrap['adminTransactions'];
  adminWalletRails: AdminBootstrap['adminWalletRails'];
  adminEmailTemplates: AdminBootstrap['adminEmailTemplates'];
  adminAlerts: AdminBootstrap['adminAlerts'];
  adminTimeline: AdminBootstrap['adminTimeline'];
  adminMetrics: AdminBootstrap['adminMetrics'];
  bootstrapReady: boolean;
  login: (email: string, password: string) => Promise<{ user: SessionUser; requiresPasscode: boolean }>;
  verifyPasscode: (passcode: string) => Promise<SessionUser>;
  signup: (input: {
    fullName: string;
    email: string;
    phone: string;
    city: string;
    password: string;
    passcode: string;
  }) => Promise<string>;
  logout: () => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  toggleClientAsset: (assetId: string) => Promise<void>;
  updateClientSecurity: (input: {
    passcode: string;
    currentPassword: string;
    newPassword: string;
  }) => Promise<string>;
  createAdminUser: (input: Record<string, unknown>) => Promise<void>;
  sendAdminEmail: (input: {
    scope: 'all' | 'user';
    userId?: string;
    subject: string;
    message: string;
  }) => Promise<{
    sentCount: number;
    failedCount: number;
    totalRecipients: number;
    failedRecipients: string[];
  }>;
  saveAdminSettings: (section: 'general' | 'email' | 'wallets', payload: Record<string, unknown>) => Promise<void>;
  refreshBootstrap: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [status, setStatus] = useState<AuthContextValue['status']>('loading');
  const [user, setUser] = useState<SessionUser | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientBootstrap['profile'] | null>(null);
  const [clientSummary, setClientSummary] = useState<ClientBootstrap['summary'] | null>(null);
  const [clientWalletAssets, setClientWalletAssets] = useState<WalletAsset[]>([]);
  const [adminSettings, setAdminSettings] = useState<AdminBootstrap['adminSettings'] | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminBootstrap['adminUsers']>([]);
  const [adminKycCases, setAdminKycCases] = useState<AdminBootstrap['adminKycCases']>([]);
  const [adminTransactions, setAdminTransactions] = useState<AdminBootstrap['adminTransactions']>([]);
  const [adminWalletRails, setAdminWalletRails] = useState<AdminBootstrap['adminWalletRails']>([]);
  const [adminEmailTemplates, setAdminEmailTemplates] = useState<AdminBootstrap['adminEmailTemplates']>([]);
  const [adminAlerts, setAdminAlerts] = useState<AdminBootstrap['adminAlerts']>([]);
  const [adminTimeline, setAdminTimeline] = useState<AdminBootstrap['adminTimeline']>([]);
  const [adminMetrics, setAdminMetrics] = useState<AdminBootstrap['adminMetrics']>([]);
  const [bootstrapReady, setBootstrapReady] = useState(false);

  const resetAuthState = () => {
    setUser(null);
    setClientProfile(null);
    setClientSummary(null);
    setClientWalletAssets([]);
    setAdminSettings(null);
    setAdminUsers([]);
    setAdminKycCases([]);
    setAdminTransactions([]);
    setAdminWalletRails([]);
    setAdminEmailTemplates([]);
    setAdminAlerts([]);
    setAdminTimeline([]);
    setAdminMetrics([]);
    setBootstrapReady(false);
    setStatus('anonymous');
  };

  const loadBootstrap = async (currentUser: SessionUser) => {
    setBootstrapReady(false);

    if (currentUser.role === 'user') {
      const payload = await apiRequest<ClientBootstrap>('/api/client/bootstrap');
      hydrateWalletData(payload);
      setClientProfile(payload.profile);
      setClientSummary(payload.summary);
      setClientWalletAssets(payload.walletAssets ?? []);
      setAdminSettings(null);
    } else {
      const payload = await apiRequest<AdminBootstrap>('/api/admin/bootstrap');
      setAdminSettings(payload.adminSettings);
      setAdminUsers(payload.adminUsers);
      setAdminKycCases(payload.adminKycCases);
      setAdminTransactions(payload.adminTransactions);
      setAdminWalletRails(payload.adminWalletRails);
      setAdminEmailTemplates(payload.adminEmailTemplates);
      setAdminAlerts(payload.adminAlerts);
      setAdminTimeline(payload.adminTimeline);
      setAdminMetrics(payload.adminMetrics);
      setClientProfile(null);
      setClientSummary(null);
    }

    setBootstrapReady(true);
  };

  const refreshBootstrap = async () => {
    if (!user || !getAccessToken()) {
      return;
    }

    await loadBootstrap(user);
  };

  useEffect(() => {
    const initialize = async () => {
      const accessToken = getAccessToken();
      const pendingToken = getPendingToken();

      if (!accessToken) {
        setStatus(pendingToken ? 'pending-passcode' : 'anonymous');
        setBootstrapReady(false);
        return;
      }

      try {
        const payload = await apiRequest<{ user: SessionUser }>('/api/auth/me');
        setUser(payload.user);
        await loadBootstrap(payload.user);
        setStatus('authenticated');
      } catch {
        clearStoredAuth();
        resetAuthState();
        setStatus(pendingToken ? 'pending-passcode' : 'anonymous');
      }
    };

    void initialize();
  }, []);

  useEffect(() => {
    const handleAuthExpired = () => {
      clearStoredAuth();
      resetAuthState();
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
  }, []);

  const login = async (email: string, password: string) => {
    const payload = await apiRequest<{
      pendingToken?: string;
      accessToken?: string;
      requiresPasscode: boolean;
      user: SessionUser;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    clearStoredAuth();
    resetAuthState();

    if (payload.requiresPasscode) {
      if (!payload.pendingToken) {
        throw new Error('Passcode session could not be created.');
      }

      setUser(payload.user);
      setPendingToken(payload.pendingToken);
      setStatus('pending-passcode');
      setBootstrapReady(false);
      return { user: payload.user, requiresPasscode: true };
    }

    if (!payload.accessToken) {
      throw new Error('Access token could not be created.');
    }

    setUser(payload.user);
    setAccessToken(payload.accessToken);
    await loadBootstrap(payload.user);
    setStatus('authenticated');
    return { user: payload.user, requiresPasscode: false };
  };

  const verifyPasscode = async (passcode: string) => {
    const pendingToken = getPendingToken();

    if (!pendingToken) {
      throw new Error('No pending login session found. Please log in again.');
    }

    const payload = await apiRequest<{ accessToken: string; user: SessionUser }>('/api/auth/verify-passcode', {
      method: 'POST',
      body: JSON.stringify({ pendingToken, passcode }),
      token: null,
    });

    setAccessToken(payload.accessToken);
    clearPendingToken();
    setUser(payload.user);
    await loadBootstrap(payload.user);
    setStatus('authenticated');
    return payload.user;
  };

  const signup = async (input: {
    fullName: string;
    email: string;
    phone: string;
    city: string;
    password: string;
    passcode: string;
  }) => {
    const payload = await apiRequest<{ message: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(input),
      token: null,
    });

    return payload.message;
  };

  const logout = async () => {
    try {
      if (getAccessToken()) {
        await apiRequest('/api/auth/logout', { method: 'POST' });
      }
    } catch {
      // ignore logout failures and clear local state anyway
    }

    clearStoredAuth();
    resetAuthState();
  };

  const markAllNotificationsRead = async () => {
    await apiRequest('/api/client/notifications/read-all', { method: 'PATCH' });
    await refreshBootstrap();
  };

  const toggleClientAsset = async (assetId: string) => {
    await apiRequest(`/api/client/assets/${assetId}/toggle`, { method: 'PATCH' });
    await refreshBootstrap();
  };

  const updateClientSecurity = async (input: {
    passcode: string;
    currentPassword: string;
    newPassword: string;
  }) => {
    const payload = await apiRequest<{ message: string }>('/api/client/security', {
      method: 'PUT',
      body: JSON.stringify(input),
    });

    return payload.message;
  };

  const createAdminUser = async (input: Record<string, unknown>) => {
    await apiRequest('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    await refreshBootstrap();
  };

  const sendAdminEmail = async (input: {
    scope: 'all' | 'user';
    userId?: string;
    subject: string;
    message: string;
  }) => {
    const payload = await apiRequest<{
      sentCount: number;
      failedCount: number;
      totalRecipients: number;
      failedRecipients: string[];
    }>('/api/admin/email/send', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    await refreshBootstrap();
    return payload;
  };

  const saveAdminSettings = async (
    section: 'general' | 'email' | 'wallets',
    payload: Record<string, unknown>,
  ) => {
    await apiRequest(`/api/admin/settings/${section}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    await refreshBootstrap();
  };

  useEffect(() => {
    if (status !== 'authenticated' || !user || user.role !== 'user') return;

    const applyLivePrices = async () => {
      try {
        const data = await apiRequest<{ prices: Record<string, { price: number; change: number }> }>('/api/prices', { token: null });
        if (!data?.prices) return;
        setClientWalletAssets((prev) =>
          prev.map((asset) => {
            const live = data.prices[asset.symbol];
            if (!live) return asset;
            return { ...asset, price: live.price, change: live.change };
          }),
        );
      } catch {
        // ignore price refresh errors silently
      }
    };

    applyLivePrices();
    const interval = setInterval(applyLivePrices, 60_000);
    return () => clearInterval(interval);
  }, [status, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      clientProfile,
      clientSummary,
      clientWalletAssets,
      adminSettings,
      adminUsers,
      adminKycCases,
      adminTransactions,
      adminWalletRails,
      adminEmailTemplates,
      adminAlerts,
      adminTimeline,
      adminMetrics,
      bootstrapReady,
      login,
      verifyPasscode,
      signup,
      logout,
      markAllNotificationsRead,
      toggleClientAsset,
      updateClientSecurity,
      createAdminUser,
      sendAdminEmail,
      saveAdminSettings,
      refreshBootstrap,
    }),
    [
      status, user, clientProfile, clientSummary, clientWalletAssets, adminSettings,
      adminUsers, adminKycCases, adminTransactions, adminWalletRails,
      adminEmailTemplates, adminAlerts, adminTimeline, adminMetrics, bootstrapReady
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
