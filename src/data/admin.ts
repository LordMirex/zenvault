export type AdminUserStatus = 'Active' | 'Review' | 'Suspended';
export type AdminKycStatus = 'Approved' | 'Pending' | 'Needs review';

export type AdminTransactionStatus = 'Completed' | 'Pending' | 'Review';

export type AdminHolding = {
  id: string;
  symbol: string;
  name: string;
  network: string;
  icon: string;
  balance: number;
  valueUsd: number;
  address: string;
  status: 'Enabled' | 'Watch' | 'Paused';
};

export type AdminCardRecord = {
  id: string;
  label: string;
  brand: 'Visa' | 'Mastercard';
  last4: string;
  status: 'Active' | 'Frozen' | 'Review';
  spendLimitUsd: number;
  utilizationUsd: number;
  issuedAt: string;
  requestOnly?: boolean;
  requestedAt?: string;
  holderName?: string;
  applicationFeeUsd?: number;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  uuid: string;
  country: string;
  status: AdminUserStatus;
  kycStatus: AdminKycStatus;
  portfolioUsd: number;
  availableUsd: number;
  lastSeen: string;
  note: string;
  openCards: number;
  holdings: AdminHolding[];
  cards: AdminCardRecord[];
};

export type AdminKycDocument = {
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

export type AdminKycCase = {
  id: string;
  userId: string;
  documentType: string;
  submittedAt: string;
  country: string;
  status: AdminKycStatus;
  note: string;
  documents: AdminKycDocument[];
};

export type AdminTransactionRecord = {
  id: string;
  userId: string;
  type: 'Deposit' | 'Withdrawal' | 'Reward' | 'Transfer';
  asset: string;
  amount: string;
  channel: string;
  destination: string;
  status: AdminTransactionStatus;
  createdAt: string;
  fromAsset?: string;
  toAsset?: string;
  whichCrypto?: string;
  networkFee?: string;
  rate?: string;
};

export type AdminMetric = {
  id: string;
  label: string;
  value: string;
  change: string;
  tone: 'amber' | 'emerald' | 'blue' | 'rose';
  detail: string;
};

export type AdminAssetCatalogItem = {
  id: string;
  symbol: string;
  name: string;
  icon: string;
  price: number;
  change: number;
  marketCapRank: number;
  network: string;
  tags: string[];
  active: boolean;
  depositAddress: string;
};

export type AdminEmailTemplate = {
  id: string;
  name: string;
  subject: string;
  status: 'Live' | 'Draft';
  updatedAt: string;
};

export let adminUsers: AdminUser[] = [];
export let adminMetrics: AdminMetric[] = [];
export let adminKycCases: AdminKycCase[] = [];
export let adminTransactions: AdminTransactionRecord[] = [];
export let adminAssetCatalog: AdminAssetCatalogItem[] = [];
export let adminEmailTemplates: AdminEmailTemplate[] = [];

export let adminAlerts: string[] = [];
export let adminTimeline: { id: string; title: string; detail: string; time: string }[] = [];

export const getAdminUserById = (userId: string) =>
  adminUsers.find((user) => user.id === userId);

export const hydrateAdminData = (payload: any) => {
  adminUsers = payload.adminUsers;
  adminMetrics = payload.adminMetrics;
  adminKycCases = payload.adminKycCases;
  adminTransactions = payload.adminTransactions;
  adminAssetCatalog = payload.adminAssetCatalog;
  adminEmailTemplates = payload.adminEmailTemplates;
  adminAlerts = payload.adminAlerts;
  adminTimeline = payload.adminTimeline;
};
