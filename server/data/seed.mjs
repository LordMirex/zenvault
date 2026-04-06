// ─── Seed data ────────────────────────────────────────────────────────────────
// Only the admin account is seeded. No demo/test users.
// All settings use Zenvault Wallet branding.

export const seedUsers = [
  {
    id: 1,
    role: 'admin',
    name: 'Admin',
    email: 'Wilburpace01@gmail.com',
    phone: '',
    city: '',
    uuid: 'ADMIN-001',
    country: '',
    deskLabel: 'Operations Control',
    tier: 'Tier 3',
    status: 'Active',
    kycStatus: 'Approved',
    riskLevel: 'Low',
    portfolioUsd: 0,
    availableUsd: 0,
    portfolioChangeUsd: 0,
    portfolioChangePct: 0,
    walletConnected: true,
    plan: 'Admin',
    lastSeen: 'Active now',
    note: 'Primary administrator account.',
    password: '12345678',
    passcode: '123456',
    holdings: [],
    cards: [],
    depositActivity: [],
    withdrawalActivity: [],
    notifications: [],
    addressBook: [],
    referrals: [],
    recentSessions: [],
    kycChecklist: [],
  },
];

export const seedBots = [];

export const seedSubscriptions = [];

export const seedTrades = [];

export const seedTransactions = [];

export const seedKycCases = [];

export const seedSettings = {
  general: {
    siteName: 'Zenvault Wallet',
    appName: 'Zenvault Wallet',
    siteUrl: '',
    logoUrl: '/logo.png',
    faviconUrl: '/favicon.png',
    publicTopbarLabel: 'Zenvault Wallet',
    publicTopbarText: 'Secure, professional crypto wallet and OTC trading platform.',
    publicHeroTitle: 'Buy Bitcoin with a local desk, not a cold exchange.',
    publicHeroDescription: 'Cash, e-Transfer, wire transfer, and OTC support with clear pricing, human guidance, and local branches that make first-time buys feel straightforward.',
    footerSummary: 'Zenvault Wallet — secure crypto wallet and OTC trading with transparent pricing and human support.',
    authHeadline: 'Sign in to your Zenvault Wallet account',
    authDescription: 'Access your wallet, portfolio activity, and account controls through a secure login flow for traders and operators.',
    companyName: 'Zenvault Wallet',
    companyAddress: '',
    companyPhone: '',
    companyEmail: 'Wilburpace01@gmail.com',
    referralEnabled: true,
    referralBonusAmount: 5,
    bonusDistribution: 'Instant Bonus',
  },
  email: {
    mailDriver: 'SMTP',
    mailHost: '',
    mailPort: '465',
    mailUsername: '',
    mailPasswordMasked: '',
    mailEncryption: 'SSL',
    fromAddress: 'Wilburpace01@gmail.com',
    fromName: 'Zenvault Wallet',
    notifyOnUserRegistration: true,
    notifyOnKycSubmission: true,
    notifyOnKycApproval: true,
  },
  wallets: {
    activeAssetIds: [
      'bitcoin',
      'ethereum',
      'tether',
      'ripple',
      'binancecoin',
      'usd-coin',
      'solana',
      'tron',
      'dogecoin',
      'cardano',
    ],
    cardApplicationFeeUsd: 75,
  },
  referralMilestones: [
    { label: 'Starter Circle', reward: '100 USDT', requirement: 'Invite 1 verified trader' },
    { label: 'Growth Desk', reward: '500 USDT', requirement: 'Invite 5 active wallets' },
    { label: 'Prime Ambassador', reward: '1,500 USDT', requirement: 'Invite 15 funded accounts' },
  ],
  adminDashboard: {
    alerts: [],
    timeline: [],
  },
  adminProfile: {
    fullName: 'Admin',
    email: 'Wilburpace01@gmail.com',
    role: 'Super Operator',
    timezone: 'UTC',
    profileNote: 'Primary administrator account for the Zenvault Wallet operations dashboard.',
  },
  adminTwoFactor: {
    enabled: false,
    recoveryCodes: [],
    lastUpdated: 'Not enabled',
  },
};
