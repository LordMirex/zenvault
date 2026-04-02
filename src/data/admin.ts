export type AdminUserStatus = 'Active' | 'Review' | 'Suspended';
export type AdminKycStatus = 'Approved' | 'Pending' | 'Needs review';
export type AdminRiskLevel = 'Low' | 'Medium' | 'High';
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
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  uuid: string;
  country: string;
  deskLabel: string;
  tier: string;
  status: AdminUserStatus;
  kycStatus: AdminKycStatus;
  riskLevel: AdminRiskLevel;
  portfolioUsd: number;
  availableUsd: number;
  plan: string;
  lastSeen: string;
  note: string;
  openCards: number;
  holdings: AdminHolding[];
  cards: AdminCardRecord[];
};

export type AdminKycCase = {
  id: string;
  userId: string;
  documentType: string;
  submittedAt: string;
  country: string;
  riskLevel: AdminRiskLevel;
  status: AdminKycStatus;
  note: string;
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

export type AdminWalletRail = {
  id: string;
  symbol: string;
  name: string;
  network: string;
  address: string;
  payId: string;
  status: 'Healthy' | 'Watch' | 'Paused';
  minDeposit: string;
  minWithdrawal: string;
  fee: string;
  confirmations: string;
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
export let adminWalletRails: AdminWalletRail[] = [];
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
  adminWalletRails = payload.adminWalletRails;
  adminEmailTemplates = payload.adminEmailTemplates;
  adminAlerts = payload.adminAlerts;
  adminTimeline = payload.adminTimeline;
};
