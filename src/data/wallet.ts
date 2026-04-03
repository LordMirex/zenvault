export type WalletAsset = {
  id: string;
  marketAssetId?: string;
  symbol: string;
  name: string;
  network: string;
  icon: string;
  price: number;
  change: number;
  balance: number;
  valueUsd: number;
  address: string;
  payId: string;
  minimumDeposit: number;
  minimumWithdrawal: number;
  withdrawFee: number;
  confirmations: string;
  enabledByDefault: boolean;
  tags: string[];
};

export type MarketAsset = {
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
};

export type WalletCardRecord = {
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

export type WalletActivity = {
  id: string;
  assetId: string;
  amount: string;
  method: string;
  destination: string;
  status: 'Completed' | 'Pending' | 'Review';
  time: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  category: 'Transfers' | 'Security' | 'Market' | 'Rewards';
  time: string;
  unread: boolean;
  tone: 'success' | 'warning' | 'info';
};

export type AddressBookEntry = {
  id: string;
  label: string;
  network: string;
  address: string;
  kind: 'External Wallet' | 'Treasury' | 'Vendor';
  trustedSince: string;
};

export let walletAssets: WalletAsset[] = [
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    network: 'Bitcoin',
    icon: '/crypto/btc.png',
    price: 69675.68,
    change: -4.29,
    balance: 3.2384,
    valueUsd: 225637.72,
    address: 'bc1q6h6m9g7u8n4k2zv0s9r7t6x5p4d3f2m1n8z6q',
    payId: 'john.doe+btc@qfs',
    minimumDeposit: 0.0002,
    minimumWithdrawal: 0.00035,
    withdrawFee: 0.00035,
    confirmations: '2 confirmations',
    enabledByDefault: true,
    tags: ['Major', 'Store of Value', 'Native'],
  },
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    network: 'ERC20',
    icon: '/crypto/eth.png',
    price: 3452.12,
    change: 1.25,
    balance: 15.5,
    valueUsd: 53507.86,
    address: '0x7f4A6D7C52f1C3b7A8a2D4b9e0f6C12D78Ac0F31',
    payId: 'john.doe+eth@qfs',
    minimumDeposit: 0.005,
    minimumWithdrawal: 0.01,
    withdrawFee: 0.0025,
    confirmations: '12 confirmations',
    enabledByDefault: true,
    tags: ['Major', 'EVM', 'Smart Contracts'],
  },
  {
    id: 'usdt',
    symbol: 'USDT',
    name: 'Tether',
    network: 'TRC20',
    icon: '/crypto/usdt.png',
    price: 1,
    change: 0,
    balance: 20150140.71,
    valueUsd: 20150140.71,
    address: 'TG3oW5a4wH6z2Q8dV9rJ4tX0pM6nK1sQ2Y',
    payId: 'john.doe+usdt@qfs',
    minimumDeposit: 10,
    minimumWithdrawal: 25,
    withdrawFee: 1,
    confirmations: '20 confirmations',
    enabledByDefault: true,
    tags: ['Stablecoin', 'Fast Settlement', 'Treasury'],
  },
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    network: 'Solana',
    icon: '/crypto/sol.png',
    price: 145.82,
    change: -2.15,
    balance: 45.2,
    valueUsd: 6591.06,
    address: '9Sz6mLvfhWv1nRyuBv4GpX8LzA2kQj61Y7dM3tQf8bTq',
    payId: 'john.doe+sol@qfs',
    minimumDeposit: 0.15,
    minimumWithdrawal: 0.2,
    withdrawFee: 0.01,
    confirmations: '32 confirmations',
    enabledByDefault: true,
    tags: ['Fast Settlement', 'Major', 'Native'],
  },
  {
    id: 'bnb',
    symbol: 'BNB',
    name: 'BNB',
    network: 'BEP20',
    icon: '/crypto/bnb.png',
    price: 592.74,
    change: 0.82,
    balance: 110.5,
    valueUsd: 65447.77,
    address: '0x4D54b02A1aD6e7C5f0a9B3F41A2d17f51f7E44c0',
    payId: 'john.doe+bnb@qfs',
    minimumDeposit: 0.03,
    minimumWithdrawal: 0.06,
    withdrawFee: 0.0015,
    confirmations: '15 confirmations',
    enabledByDefault: true,
    tags: ['EVM', 'Fast Settlement', 'Trading'],
  },
  {
    id: 'xlm',
    symbol: 'XLM',
    name: 'Stellar',
    network: 'Stellar',
    icon: '/crypto/xlm.png',
    price: 0.14,
    change: 3.12,
    balance: 285000,
    valueUsd: 39900,
    address: 'GB2L6OZB2K6M4A3V5Q2U6P4R1S8N9T7V4W6X2Y3Z5A8B1C4D6E7F8G9H',
    payId: 'john.doe+xlm@qfs',
    minimumDeposit: 25,
    minimumWithdrawal: 50,
    withdrawFee: 0.35,
    confirmations: 'Network finality under 10 seconds',
    enabledByDefault: false,
    tags: ['Fast Settlement', 'Treasury', 'Payments'],
  },
];

export let depositActivity: WalletActivity[] = [
  {
    id: 'dep-1',
    assetId: 'usdt',
    amount: '250,000 USDT',
    method: 'TRC20 Wallet',
    destination: 'Treasury replenishment',
    status: 'Completed',
    time: 'Today, 09:24',
  },
  {
    id: 'dep-2',
    assetId: 'btc',
    amount: '0.824 BTC',
    method: 'QFS PayID',
    destination: 'Prime member transfer',
    status: 'Pending',
    time: 'Today, 07:10',
  },
  {
    id: 'dep-3',
    assetId: 'eth',
    amount: '5.20 ETH',
    method: 'ERC20 Wallet',
    destination: 'Cold vault sweep',
    status: 'Review',
    time: 'Yesterday, 22:15',
  },
];

export let withdrawalActivity: WalletActivity[] = [
  {
    id: 'wd-1',
    assetId: 'btc',
    amount: '0.500 BTC',
    method: 'External Wallet',
    destination: 'btc-algo-vault-01',
    status: 'Completed',
    time: 'Today, 11:42',
  },
  {
    id: 'wd-2',
    assetId: 'usdt',
    amount: '45,000 USDT',
    method: 'QFS PayID',
    destination: 'settlements@qfs',
    status: 'Pending',
    time: 'Today, 08:55',
  },
  {
    id: 'wd-3',
    assetId: 'sol',
    amount: '12 SOL',
    method: 'External Wallet',
    destination: 'sol-hot-wallet-2',
    status: 'Review',
    time: 'Yesterday, 19:20',
  },
];

export let notificationItems: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Withdrawal approved',
    message: '0.500 BTC was approved for release after passcode validation.',
    category: 'Transfers',
    time: '12 minutes ago',
    unread: true,
    tone: 'success',
  },
  {
    id: 'notif-2',
    title: 'New device sign-in',
    message: 'A Windows session was detected from Lagos, Nigeria and marked as trusted.',
    category: 'Security',
    time: '1 hour ago',
    unread: true,
    tone: 'warning',
  },
  {
    id: 'notif-3',
    title: 'SOL market spike',
    message: 'Solana moved 2.15% in the last hour. Swap execution remains highly liquid.',
    category: 'Market',
    time: '3 hours ago',
    unread: false,
    tone: 'info',
  },
  {
    id: 'notif-4',
    title: 'Referral bonus settled',
    message: 'A 250 USDT referral payout has been credited to your rewards ledger.',
    category: 'Rewards',
    time: 'Yesterday',
    unread: false,
    tone: 'success',
  },
];

export let addressBookEntries: AddressBookEntry[] = [
  {
    id: 'addr-1',
    label: 'Primary OTC Desk',
    network: 'Bitcoin',
    address: 'bc1q4q8h0z7n2s6x9p5k1r3v8m2u6f4d0t5y8n1c4',
    kind: 'Treasury',
    trustedSince: 'Trusted since Feb 12, 2026',
  },
  {
    id: 'addr-2',
    label: 'Liquidity Partner A',
    network: 'TRC20',
    address: 'TY8tq9Q5vC1rJ6Lw3Fh4Kp2Nz0s7Ua5YcR',
    kind: 'Vendor',
    trustedSince: 'Trusted since Jan 28, 2026',
  },
  {
    id: 'addr-3',
    label: 'Cold Vault Mirror',
    network: 'ERC20',
    address: '0x98F2A42c5a6D40b1c78fD7A9b6E4c3D25abC4f19',
    kind: 'External Wallet',
    trustedSince: 'Trusted since Mar 03, 2026',
  },
];

export let referralMilestones = [
  { label: 'Starter Circle', reward: '100 USDT', requirement: 'Invite 1 verified trader' },
  { label: 'Growth Desk', reward: '500 USDT', requirement: 'Invite 5 active wallets' },
  { label: 'Prime Ambassador', reward: '1,500 USDT', requirement: 'Invite 15 funded accounts' },
];

export let recentReferrals = [
  {
    id: 'ref-1',
    name: 'Ava Martins',
    joinedAt: 'Mar 18, 2026',
    status: 'Verified',
    reward: '250 USDT',
  },
];

export let recentSessions = [
  {
    id: 'session-1',
    device: 'Windows 11 / Chrome',
    location: 'Lagos, Nigeria',
    status: 'Current session',
    lastSeen: 'Active now',
  },
  {
    id: 'session-2',
    device: 'iPhone 15 / Safari',
    location: 'Abuja, Nigeria',
    status: 'Trusted mobile',
    lastSeen: 'Yesterday at 21:08',
  },
  {
    id: 'session-3',
    device: 'MacBook Pro / Chrome',
    location: 'London, United Kingdom',
    status: 'Revoked',
    lastSeen: 'Mar 12, 2026',
  },
];

export let kycChecklist = [
  {
    id: 'kyc-1',
    title: 'Government ID verified',
    detail: 'Passport scanned and matched with liveness review.',
    status: 'Completed',
  },
  {
    id: 'kyc-2',
    title: 'Proof of address approved',
    detail: 'Utility bill accepted and stamped for the last 90 days.',
    status: 'Completed',
  },
  {
    id: 'kyc-3',
    title: 'Source of funds review',
    detail: 'Trading statements and treasury source documents confirmed.',
    status: 'Completed',
  },
];

export const getAssetById = (assetId: string) =>
  walletAssets.find((asset) => asset.id === assetId);

export const hydrateWalletData = (payload: {
  walletAssets: WalletAsset[];
  depositActivity: WalletActivity[];
  withdrawalActivity: WalletActivity[];
  notificationItems: NotificationItem[];
  addressBookEntries: AddressBookEntry[];
  referralMilestones: typeof referralMilestones;
  recentReferrals: typeof recentReferrals;
  recentSessions: typeof recentSessions;
  kycChecklist: typeof kycChecklist;
}) => {
  walletAssets = payload.walletAssets;
  depositActivity = payload.depositActivity;
  withdrawalActivity = payload.withdrawalActivity;
  notificationItems = payload.notificationItems;
  addressBookEntries = payload.addressBookEntries;
  referralMilestones = payload.referralMilestones;
  recentReferrals = payload.recentReferrals;
  recentSessions = payload.recentSessions;
  kycChecklist = payload.kycChecklist;
};
