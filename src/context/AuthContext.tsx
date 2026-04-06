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
  MarketAsset,
  NotificationItem,
  WalletActivity,
  WalletAsset,
  WalletCardRecord,
} from '../data/wallet';
import type {
  AdminEmailTemplate,
  AdminAssetCatalogItem,
  AdminKycCase,
  AdminMetric,
  AdminTransactionRecord,
  AdminUser,
} from '../data/admin';

import { hydrateWalletData } from '../data/wallet';
import {
  AUTH_EXPIRED_EVENT,
  apiRequest,
  clearStoredAuth,
  getAccessToken,
  setAccessToken,
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
  marketAssets: MarketAsset[];
  depositActivity: WalletActivity[];
  withdrawalActivity: WalletActivity[];
  notificationItems: NotificationItem[];
  addressBookEntries: AddressBookEntry[];
  cards: WalletCardRecord[];
  cardRequests: WalletCardRecord[];
  cardApplicationFeeUsd: number;
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
  kycCases: {
    id: string;
    userId: string;
    documentType: string;
    submittedAt: string;
    country: string;
    riskLevel: string;
    status: string;
    note: string;
    documents: {
      id: string;
      fieldName: string;
      label: string;
      originalName: string;
      storedName: string;
      mimeType: string;
      sizeBytes: number;
      uploadedAt: string;
      downloadPath: string;
    }[];
  }[];
  referralMilestones: { label: string; reward: string; requirement: string }[];
  recentReferrals: { id: string; name: string; joinedAt: string; status: string; reward: string }[];
};

type AdminBootstrap = {
  adminUsers: AdminUser[];
  adminMetrics: AdminMetric[];
  adminKycCases: AdminKycCase[];
  adminTransactions: AdminTransactionRecord[];
  adminAssetCatalog: AdminAssetCatalogItem[];
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

type ClientSession = { id: string; device: string; location: string; status: string; lastSeen: string };
type KycChecklistItem = { id: string; title: string; detail: string; status: string };
type ClientKycDocument = {
  id: string;
  fieldName: string;
  label: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  downloadPath: string;
};
type ClientKycCase = {
  id: string;
  userId: string;
  documentType: string;
  submittedAt: string;
  country: string;
  riskLevel: string;
  status: string;
  note: string;
  documents: ClientKycDocument[];
};
type ReferralMilestone = { label: string; reward: string; requirement: string };
type RecentReferral = { id: string; name: string; joinedAt: string; status: string; reward: string };

type AuthContextValue = {
  status: 'loading' | 'anonymous' | 'authenticated';
  user: SessionUser | null;
  clientProfile: ClientBootstrap['profile'] | null;
  clientSummary: ClientBootstrap['summary'] | null;
  clientWalletAssets: WalletAsset[];
  marketAssets: MarketAsset[];
  clientDepositActivity: WalletActivity[];
  clientWithdrawalActivity: WalletActivity[];
  clientAddressBookEntries: AddressBookEntry[];
  clientNotificationItems: NotificationItem[];
  clientCards: WalletCardRecord[];
  clientCardRequests: WalletCardRecord[];
  clientCardApplicationFeeUsd: number;
  clientRecentSessions: ClientSession[];
  clientKycChecklist: KycChecklistItem[];
  clientKycCases: ClientKycCase[];
  clientReferralMilestones: ReferralMilestone[];
  clientRecentReferrals: RecentReferral[];
  adminSettings: AdminBootstrap['adminSettings'] | null;
  adminUsers: AdminBootstrap['adminUsers'];
  adminKycCases: AdminBootstrap['adminKycCases'];
  adminTransactions: AdminBootstrap['adminTransactions'];
  adminAssetCatalog: AdminBootstrap['adminAssetCatalog'];
  adminEmailTemplates: AdminBootstrap['adminEmailTemplates'];
  adminAlerts: AdminBootstrap['adminAlerts'];
  adminTimeline: AdminBootstrap['adminTimeline'];
  adminMetrics: AdminBootstrap['adminMetrics'];
  bootstrapReady: boolean;
  login: (email: string, password: string) => Promise<{ user: SessionUser }>;
  signup: (input: {
    fullName: string;
    email: string;
    phone: string;
    city: string;
    password: string;
  }) => Promise<string>;
  logout: () => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  toggleClientAsset: (assetId: string) => Promise<void>;
  submitCardApplication: (input: { holderName: string; brand: 'Visa' | 'Mastercard'; note: string }) => Promise<string>;
  updateClientSecurity: (input: {
    currentPassword: string;
    newPassword: string;
    passcode: string;
    newPasscode?: string;
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
  const [marketAssets, setMarketAssets] = useState<MarketAsset[]>([]);
  const [clientDepositActivity, setClientDepositActivity] = useState<WalletActivity[]>([]);
  const [clientWithdrawalActivity, setClientWithdrawalActivity] = useState<WalletActivity[]>([]);
  const [clientAddressBookEntries, setClientAddressBookEntries] = useState<AddressBookEntry[]>([]);
  const [clientNotificationItems, setClientNotificationItems] = useState<NotificationItem[]>([]);
  const [clientCards, setClientCards] = useState<WalletCardRecord[]>([]);
  const [clientCardRequests, setClientCardRequests] = useState<WalletCardRecord[]>([]);
  const [clientCardApplicationFeeUsd, setClientCardApplicationFeeUsd] = useState(0);
  const [clientRecentSessions, setClientRecentSessions] = useState<ClientSession[]>([]);
  const [clientKycChecklist, setClientKycChecklist] = useState<KycChecklistItem[]>([]);
  const [clientKycCases, setClientKycCases] = useState<ClientKycCase[]>([]);
  const [clientReferralMilestones, setClientReferralMilestones] = useState<ReferralMilestone[]>([]);
  const [clientRecentReferrals, setClientRecentReferrals] = useState<RecentReferral[]>([]);
  const [adminSettings, setAdminSettings] = useState<AdminBootstrap['adminSettings'] | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminBootstrap['adminUsers']>([]);
  const [adminKycCases, setAdminKycCases] = useState<AdminBootstrap['adminKycCases']>([]);
  const [adminTransactions, setAdminTransactions] = useState<AdminBootstrap['adminTransactions']>([]);
  const [adminAssetCatalog, setAdminAssetCatalog] = useState<AdminBootstrap['adminAssetCatalog']>([]);
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
    setMarketAssets([]);
    setClientDepositActivity([]);
    setClientWithdrawalActivity([]);
    setClientAddressBookEntries([]);
    setClientNotificationItems([]);
    setClientCards([]);
    setClientCardRequests([]);
    setClientCardApplicationFeeUsd(0);
    setClientRecentSessions([]);
    setClientKycChecklist([]);
    setClientKycCases([]);
    setClientReferralMilestones([]);
    setClientRecentReferrals([]);
    setAdminSettings(null);
    setAdminUsers([]);
    setAdminKycCases([]);
    setAdminTransactions([]);
    setAdminAssetCatalog([]);
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
      setMarketAssets(payload.marketAssets ?? []);
      setClientDepositActivity(payload.depositActivity ?? []);
      setClientWithdrawalActivity(payload.withdrawalActivity ?? []);
      setClientAddressBookEntries(payload.addressBookEntries ?? []);
      setClientNotificationItems(payload.notificationItems ?? []);
      setClientCards(payload.cards ?? []);
      setClientCardRequests(payload.cardRequests ?? []);
      setClientCardApplicationFeeUsd(payload.cardApplicationFeeUsd ?? 0);
      setClientRecentSessions(payload.recentSessions ?? []);
      setClientKycChecklist(payload.kycChecklist ?? []);
      setClientKycCases(payload.kycCases ?? []);
      setClientReferralMilestones(payload.referralMilestones ?? []);
      setClientRecentReferrals(payload.recentReferrals ?? []);
      setAdminSettings(null);
      setAdminUsers([]);
      setAdminKycCases([]);
      setAdminTransactions([]);
      setAdminAssetCatalog([]);
      setAdminEmailTemplates([]);
      setAdminAlerts([]);
      setAdminTimeline([]);
      setAdminMetrics([]);
    } else {
      const payload = await apiRequest<AdminBootstrap>('/api/admin/bootstrap');
      setAdminSettings(payload.adminSettings);
      setAdminUsers(payload.adminUsers);
      setAdminKycCases(payload.adminKycCases);
      setAdminTransactions(payload.adminTransactions);
      setAdminAssetCatalog(payload.adminAssetCatalog);
      setAdminEmailTemplates(payload.adminEmailTemplates);
      setAdminAlerts(payload.adminAlerts);
      setAdminTimeline(payload.adminTimeline);
      setAdminMetrics(payload.adminMetrics);
      setClientProfile(null);
      setClientSummary(null);
      setClientWalletAssets([]);
      setMarketAssets([]);
      setClientDepositActivity([]);
      setClientWithdrawalActivity([]);
      setClientAddressBookEntries([]);
      setClientNotificationItems([]);
      setClientCards([]);
      setClientCardRequests([]);
      setClientCardApplicationFeeUsd(0);
      setClientRecentSessions([]);
      setClientKycChecklist([]);
      setClientKycCases([]);
      setClientReferralMilestones([]);
      setClientRecentReferrals([]);
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

      if (!accessToken) {
        setStatus('anonymous');
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
        setStatus('anonymous');
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

  useEffect(() => {
    if (status !== 'authenticated' || user?.role !== 'user') return;

    const pollPrices = async () => {
      try {
        const { prices, marketAssets: liveMarketAssets } = await apiRequest<{
          prices: Record<string, { price: number; change: number }>;
          marketAssets: MarketAsset[];
        }>('/api/prices');
        setMarketAssets(liveMarketAssets ?? []);
        setClientWalletAssets((prev) => {
          const nextAssets = prev.map((asset) => {
            const live = prices[asset.symbol];
            if (!live) return asset;
            const livePrice = live.price ?? asset.price;
            return {
              ...asset,
              price: livePrice,
              change: live.change ?? asset.change,
              valueUsd: Number((asset.balance * livePrice).toFixed(2)),
            };
          });
          const visiblePortfolioUsd = Number(
            nextAssets
              .filter((asset) => asset.enabledByDefault)
              .reduce((total, asset) => total + asset.valueUsd, 0)
              .toFixed(2),
          );
          const totalWalletUsd = Number(nextAssets.reduce((total, asset) => total + asset.valueUsd, 0).toFixed(2));
          const changeUsd = Number(
            nextAssets
              .filter((asset) => asset.enabledByDefault)
              .reduce((total, asset) => {
                const multiplier = 1 + asset.change / 100;
                if (!Number.isFinite(multiplier) || multiplier === 0) {
                  return total;
                }

                const previousValue = asset.valueUsd / multiplier;
                return total + (asset.valueUsd - previousValue);
              }, 0)
              .toFixed(2),
          );
          const previousPortfolioUsd = visiblePortfolioUsd - changeUsd;
          const changePct =
            visiblePortfolioUsd > 0 && previousPortfolioUsd !== 0
              ? Number(((changeUsd / previousPortfolioUsd) * 100).toFixed(2))
              : 0;

          setClientSummary((current) =>
            current
              ? {
                ...current,
                portfolioUsd: visiblePortfolioUsd,
                availableUsd: totalWalletUsd,
                changeUsd,
                changePct,
              }
              : current,
          );

          return nextAssets;
        });
      } catch {
        // silent — keep cached prices on failure
      }
    };

    void pollPrices();
    const interval = setInterval(() => void pollPrices(), 30000);
    return () => clearInterval(interval);
  }, [status, user?.role]);

  const login = async (email: string, password: string) => {
    const payload = await apiRequest<{
      accessToken: string;
      user: SessionUser;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    clearStoredAuth();
    resetAuthState();

    if (!payload.accessToken) {
      throw new Error('Access token could not be created.');
    }

    setUser(payload.user);
    setAccessToken(payload.accessToken);
    await loadBootstrap(payload.user);
    setStatus('authenticated');
    return { user: payload.user };
  };

  const signup = async (input: {
    fullName: string;
    email: string;
    phone: string;
    city: string;
    password: string;
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
    setClientNotificationItems((prev) => prev.map((item) => ({ ...item, unread: false })));
    await apiRequest('/api/client/notifications/read-all', { method: 'PATCH' });
  };

  const toggleClientAsset = async (assetId: string) => {
    await apiRequest(`/api/client/assets/${assetId}/toggle`, { method: 'PATCH' });
    await refreshBootstrap();
  };

  const submitCardApplication = async (input: {
    holderName: string;
    brand: 'Visa' | 'Mastercard';
    note: string;
  }) => {
    const payload = await apiRequest<{ message: string }>('/api/client/cards/apply', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    await refreshBootstrap();
    return payload.message;
  };

  const updateClientSecurity = async (input: {
    currentPassword: string;
    newPassword: string;
    passcode: string;
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

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      clientProfile,
      clientSummary,
      clientWalletAssets,
      marketAssets,
      clientDepositActivity,
      clientWithdrawalActivity,
      clientAddressBookEntries,
      clientNotificationItems,
      clientCards,
      clientCardRequests,
      clientCardApplicationFeeUsd,
      clientRecentSessions,
      clientKycChecklist,
      clientKycCases,
      clientReferralMilestones,
      clientRecentReferrals,
      adminSettings,
      adminUsers,
      adminKycCases,
      adminTransactions,
      adminAssetCatalog,
      adminEmailTemplates,
      adminAlerts,
      adminTimeline,
      adminMetrics,
      bootstrapReady,
      login,
      signup,
      logout,
      markAllNotificationsRead,
      toggleClientAsset,
      submitCardApplication,
      updateClientSecurity,
      createAdminUser,
      sendAdminEmail,
      saveAdminSettings,
      refreshBootstrap,
    }),
    [
      status, user, clientProfile, clientSummary, clientWalletAssets, marketAssets,
      clientDepositActivity, clientWithdrawalActivity, clientAddressBookEntries,
      clientNotificationItems, clientCards, clientCardRequests, clientCardApplicationFeeUsd,
      clientRecentSessions, clientKycChecklist, clientKycCases, clientReferralMilestones,
      clientRecentReferrals, adminSettings, adminUsers, adminKycCases, adminTransactions,
      adminAssetCatalog, adminEmailTemplates, adminAlerts, adminTimeline, adminMetrics,
      bootstrapReady
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
