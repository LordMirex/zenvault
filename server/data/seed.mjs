const icon = {
  btc: '/crypto/btc.png',
  eth: '/crypto/eth.png',
  usdt: '/crypto/usdt.png',
  sol: '/crypto/sol.png',
  bnb: '/crypto/bnb.png',
  trx: '/crypto/trx.png',
  ltc: '/crypto/ltc.png',
  dash: '/crypto/dash.png',
  dot: '/crypto/dot.png',
  bch: '/crypto/bch.png',
  xlm: '/crypto/xlm.png',
};

const powerUserHoldings = [
  { id: 'btc-native', symbol: 'BTC', name: 'Bitcoin', network: 'Bitcoin', icon: icon.btc, price: 66728.89, change: 0.06, balance: 3.2399, valueUsd: 216194.93, address: '1Fhv4jtqv6bChqgyRr86FeAH6Mi8zEr8HD', payId: 'ofofonobs+btc@qfs', minimumDeposit: 0.0002, minimumWithdrawal: 0.00035, withdrawFee: 0.00035, confirmations: '2 confirmations', enabledByDefault: true, tags: ['Major', 'Native', 'Treasury'], status: 'Enabled' },
  { id: 'usdt-trc20', symbol: 'USDT', name: 'Tether', network: 'TRC20', icon: icon.usdt, price: 1, change: 0, balance: 20150040.71, valueUsd: 20150040.71, address: 'TYqzd9FnZs9WQ8SR6S1HdvXeJPCbLyStL6', payId: 'ofofonobs+usdt@qfs', minimumDeposit: 10, minimumWithdrawal: 25, withdrawFee: 1, confirmations: '20 confirmations', enabledByDefault: true, tags: ['Stablecoin', 'Fast Settlement', 'Treasury'], status: 'Enabled' },
  { id: 'usdt-bnb', symbol: 'USDT', name: 'Tether', network: 'BNB', icon: icon.usdt, price: 1, change: 0, balance: 36411193.9964, valueUsd: 36411193.99, address: '0x247c9a48e6713c38f046709f084d82b67ad7f3a0', payId: 'ofofonobs+usdtbsc@qfs', minimumDeposit: 10, minimumWithdrawal: 25, withdrawFee: 0.8, confirmations: '15 confirmations', enabledByDefault: true, tags: ['Stablecoin', 'BEP20', 'Treasury'], status: 'Enabled' },
  { id: 'usdt-erc20', symbol: 'USDT', name: 'Tether', network: 'ERC20', icon: icon.usdt, price: 1, change: 0, balance: 1362825.3834, valueUsd: 1362825.38, address: '0x247c9a48e6713c38f046709f084d82b67ad7f3a0', payId: 'ofofonobs+usdteth@qfs', minimumDeposit: 10, minimumWithdrawal: 25, withdrawFee: 8, confirmations: '12 confirmations', enabledByDefault: true, tags: ['Stablecoin', 'ERC20', 'Treasury'], status: 'Watch' },
  { id: 'eth-native', symbol: 'ETH', name: 'Ethereum', network: 'native', icon: icon.eth, price: 2013.8, change: 0.36, balance: 448.5243, valueUsd: 903238.24, address: '0x247c9a48e6713c38f046709f084d82b67ad7f3a0', payId: 'ofofonobs+eth@qfs', minimumDeposit: 0.01, minimumWithdrawal: 0.02, withdrawFee: 0.0025, confirmations: '12 confirmations', enabledByDefault: true, tags: ['Major', 'Native', 'EVM'], status: 'Enabled' },
  { id: 'trx-native', symbol: 'TRX', name: 'Tron', network: 'native', icon: icon.trx, price: 0.32, change: 1.77, balance: 119287724.6171, valueUsd: 38410727.88, address: 'TYqzd9FnZs9WQ8SR6S1HdvXeJPCbLyStL6', payId: 'ofofonobs+trx@qfs', minimumDeposit: 50, minimumWithdrawal: 100, withdrawFee: 1, confirmations: '20 confirmations', enabledByDefault: true, tags: ['Payments', 'Fast Settlement', 'Native'], status: 'Enabled' },
  { id: 'bnb-native', symbol: 'BNB', name: 'Binance Coin', network: 'native', icon: icon.bnb, price: 613.32, change: -0.01, balance: 18430.9466, valueUsd: 11304068.17, address: '0x247c9a48e6713c38f046709f084d82b67ad7f3a0', payId: 'ofofonobs+bnb@qfs', minimumDeposit: 0.03, minimumWithdrawal: 0.06, withdrawFee: 0.0015, confirmations: '15 confirmations', enabledByDefault: true, tags: ['Major', 'BSC', 'Trading'], status: 'Enabled' },
  { id: 'dot-native', symbol: 'DOT', name: 'Polkadot', network: 'native', icon: icon.dot, price: 1.27, change: 0.71, balance: 222536.4055, valueUsd: 282538.84, address: '13ZdgQfCTLMJ84v7wVH9rFBT8YhKuFJu9vCVJvXZHJvA', payId: 'ofofonobs+dot@qfs', minimumDeposit: 5, minimumWithdrawal: 10, withdrawFee: 0.25, confirmations: 'Block finality under 1 minute', enabledByDefault: true, tags: ['Treasury', 'Native', 'Staking'], status: 'Watch' },
  { id: 'ltc-native', symbol: 'LTC', name: 'Litecoin', network: 'native', icon: icon.ltc, price: 53.93, change: -0.35, balance: 4111.8796, valueUsd: 221753.67, address: 'LRXLeDjnKbFcBitygNcptJuLwo7tDekiZm', payId: 'ofofonobs+ltc@qfs', minimumDeposit: 0.1, minimumWithdrawal: 0.2, withdrawFee: 0.001, confirmations: '6 confirmations', enabledByDefault: true, tags: ['Major', 'Payments', 'Native'], status: 'Enabled' },
  { id: 'xlm-native', symbol: 'XLM', name: 'Stellar', network: 'native', icon: icon.xlm, price: 0.17, change: -0.3, balance: 246.7898, valueUsd: 41.36, address: 'GDT7ARDYZRBXXYOCSQ3MUMISTITSSRWZI6KR2A5L5Q3KB4QIZHGYMTIH', payId: 'ofofonobs+xlm@qfs', minimumDeposit: 25, minimumWithdrawal: 50, withdrawFee: 0.35, confirmations: 'Network finality under 10 seconds', enabledByDefault: true, tags: ['Payments', 'Native', 'Fast Settlement'], status: 'Enabled' },
  { id: 'sol-native', symbol: 'SOL', name: 'Solana', network: 'native', icon: icon.sol, price: 82.78, change: 0.17, balance: 6.9988, valueUsd: 579.36, address: 'EPlSTRXpvwUZydsHm62mqqUyZNThdrn4rLCowK7wYfv2', payId: 'ofofonobs+sol@qfs', minimumDeposit: 0.15, minimumWithdrawal: 0.2, withdrawFee: 0.01, confirmations: '32 confirmations', enabledByDefault: true, tags: ['Native', 'Fast Settlement', 'Trading'], status: 'Enabled' },
];

const powerUserCards = [
  { id: 'card-19-1', label: 'Operations Visa', brand: 'Visa', last4: '5855', status: 'Inactive', spendLimitUsd: 50000, utilizationUsd: 0, issuedAt: 'Issued Sep 10, 2025', expiry: '01/29', cvv: '732', billingAddress: '651 N Broad Street, Middletown, Delaware, US', zipCode: '19709', balance: 0 },
];

const reviewUserHoldings = [
  { id: 'btc-native', symbol: 'BTC', name: 'Bitcoin', network: 'Bitcoin', icon: icon.btc, balance: 0, price: 66728.89, change: 0.06, valueUsd: 0, address: '1Fhv4jtqv6bChqgyRr86FeAH6Mi8zEr8HD', payId: 'dfdf+btc@qfs', minimumDeposit: 0.0002, minimumWithdrawal: 0.00035, withdrawFee: 0.00035, confirmations: '2 confirmations', enabledByDefault: true, tags: ['Major', 'Native'], status: 'Enabled' },
  { id: 'usdt-trc20', symbol: 'USDT', name: 'Tether', network: 'TRC20', icon: icon.usdt, balance: 0, price: 1, change: 0, valueUsd: 0, address: 'TYqzd9FnZs9WQ8SR6S1HdvXeJPCbLyStL6', payId: 'dfdf+usdt@qfs', minimumDeposit: 10, minimumWithdrawal: 25, withdrawFee: 1, confirmations: '20 confirmations', enabledByDefault: true, tags: ['Stablecoin', 'TRC20'], status: 'Enabled' },
];

const powerUserNotifications = [
  { id: 'notif-1', title: 'Withdrawal approved', message: '0.500 BTC was approved for release after passcode and review.', category: 'Transfers', time: '12 minutes ago', unread: true, tone: 'success' },
  { id: 'notif-2', title: 'New device sign-in', message: 'A Windows session was detected from Lagos and marked as trusted.', category: 'Security', time: '1 hour ago', unread: true, tone: 'warning' },
  { id: 'notif-3', title: 'Referral bonus settled', message: 'A 250 USDT referral reward has been credited to your rewards ledger.', category: 'Rewards', time: 'Yesterday', unread: false, tone: 'success' },
  { id: 'notif-4', title: 'USDT market update', message: 'Stablecoin routing remains healthy across TRC20 and BNB rails.', category: 'Market', time: 'Yesterday', unread: false, tone: 'info' },
];

const powerUserDepositActivity = [
  { id: 'dep-1', assetId: 'usdt-trc20', amount: '250,000 USDT', method: 'TRC20 Wallet', destination: 'Treasury replenishment', status: 'Completed', time: 'Today, 09:24' },
  { id: 'dep-2', assetId: 'btc-native', amount: '0.824 BTC', method: 'QFS PayID', destination: 'Prime member transfer', status: 'Pending', time: 'Today, 07:10' },
];

const powerUserWithdrawalActivity = [
  { id: 'wd-1', assetId: 'btc-native', amount: '0.500 BTC', method: 'External Wallet', destination: 'btc-algo-vault-01', status: 'Completed', time: 'Today, 11:42' },
  { id: 'wd-2', assetId: 'usdt-trc20', amount: '45,000 USDT', method: 'QFS PayID', destination: 'settlements@qfs', status: 'Pending', time: 'Today, 08:55' },
];

const defaultAddressBook = [
  { id: 'addr-1', label: 'Primary OTC Desk', network: 'Bitcoin', address: 'bc1q4q8h0z7n2s6x9p5k1r3v8m2u6f4d0t5y8n1c4', kind: 'Treasury', trustedSince: 'Trusted since Feb 12, 2026' },
  { id: 'addr-2', label: 'Liquidity Partner A', network: 'TRC20', address: 'TY8tq9Q5vC1rJ6Lw3Fh4Kp2Nz0s7Ua5YcR', kind: 'Vendor', trustedSince: 'Trusted since Jan 28, 2026' },
];

const powerUserReferrals = [
  { id: 'ref-1', name: 'Ava Martins', joinedAt: 'Mar 18, 2026', status: 'Verified', reward: '250 USDT' },
];

const powerUserSessions = [
  { id: 'session-1', device: 'Windows 11 / Chrome', location: 'Lagos, Nigeria', status: 'Current session', lastSeen: 'Active now' },
  { id: 'session-2', device: 'iPhone 15 / Safari', location: 'Abuja, Nigeria', status: 'Trusted mobile', lastSeen: 'Yesterday at 21:08' },
];

const approvedKycChecklist = [
  { id: 'kyc-1', title: 'Government ID verified', detail: 'Passport scan passed liveness and identity review.', status: 'Completed' },
  { id: 'kyc-2', title: 'Proof of address approved', detail: 'Utility bill accepted and stamped within 90 days.', status: 'Completed' },
  { id: 'kyc-3', title: 'Source of funds review', detail: 'Treasury statements confirmed during compliance review.', status: 'Completed' },
];

const pendingKycChecklist = [
  { id: 'kyc-1', title: 'Government ID uploaded', detail: 'Awaiting manual review.', status: 'Pending' },
  { id: 'kyc-2', title: 'Proof of address missing', detail: 'Upload required before approval.', status: 'Review' },
];

export const seedUsers = [
  { id: 1, role: 'admin', name: 'Admin Admin', email: 'support@developerplug.com', phone: '+2348114313795', city: 'Lagos', uuid: 'ADMIN-001', country: 'Nigeria', deskLabel: 'Operations Control', tier: 'Tier 3', status: 'Active', kycStatus: 'Approved', riskLevel: 'Low', portfolioUsd: 0, availableUsd: 0, portfolioChangeUsd: 0, portfolioChangePct: 0, walletConnected: true, plan: 'Admin', lastSeen: 'Active now', note: 'Primary administrator account.', password: '12345678', passcode: '123456', holdings: [], cards: [], depositActivity: [], withdrawalActivity: [], notifications: [], addressBook: [], referrals: [], recentSessions: [], kycChecklist: [] },
  { id: 8, role: 'user', name: 'dfdf', email: 'c0d3g0d.01@gmail.com', phone: '+2348000000008', city: 'Benin City', uuid: 'TS1EXBU', country: 'Nigeria', deskLabel: 'Growth Operations', tier: 'Tier 1', status: 'Review', kycStatus: 'Pending', riskLevel: 'Medium', portfolioUsd: 0, availableUsd: 0, portfolioChangeUsd: 0, portfolioChangePct: 0, walletConnected: true, plan: 'Starter', lastSeen: 'Today, 08:55', note: 'Needs KYC completion before outbound limits increase.', password: '12345678', passcode: '123456', holdings: reviewUserHoldings, cards: [], depositActivity: [], withdrawalActivity: [], notifications: [], addressBook: defaultAddressBook, referrals: [], recentSessions: [], kycChecklist: pendingKycChecklist },
  { id: 19, role: 'user', name: 'Ofofonobs Developer', email: 'ofofonobs@gmail.com', phone: '+2348000000019', city: 'Lagos', uuid: 'QFS-9823-1904', country: 'Nigeria', deskLabel: 'Prime Treasury Desk', tier: 'Tier 3', status: 'Active', kycStatus: 'Approved', riskLevel: 'Low', portfolioUsd: 109363502.05, availableUsd: 107894210.12, portfolioChangeUsd: 124532.12, portfolioChangePct: 2.4, walletConnected: true, plan: 'Prime Treasury', lastSeen: 'Active 4 minutes ago', note: 'High-liquidity operating wallet with approved outbound permissions.', password: '12345678', passcode: '123456', holdings: powerUserHoldings, cards: powerUserCards, depositActivity: powerUserDepositActivity, withdrawalActivity: powerUserWithdrawalActivity, notifications: powerUserNotifications, addressBook: defaultAddressBook, referrals: powerUserReferrals, recentSessions: powerUserSessions, kycChecklist: approvedKycChecklist },
  { id: 27, role: 'user', name: 'Ava Martins', email: 'ava.martins@qfstrading.com', phone: '+2348000000027', city: 'Abuja', uuid: 'QFS-4410-0088', country: 'Nigeria', deskLabel: 'Growth Desk', tier: 'Tier 2', status: 'Active', kycStatus: 'Approved', riskLevel: 'Low', portfolioUsd: 6457004.41, availableUsd: 5826001.53, portfolioChangeUsd: 18554.29, portfolioChangePct: 1.2, walletConnected: true, plan: 'Growth Desk', lastSeen: 'Today, 11:13', note: 'Stable desk account used for referrals and internal transfers.', password: '12345678', passcode: '123456', holdings: reviewUserHoldings, cards: [], depositActivity: [], withdrawalActivity: [], notifications: [], addressBook: defaultAddressBook, referrals: [], recentSessions: [], kycChecklist: approvedKycChecklist },
];

export const seedBots = [
  { id: '1', name: 'BTC Grid Pro', pair: 'BTC/USDT', strategy: 'grid', ownerUserId: 19, status: 'Live', allocationUsd: 20000, pnlUsd: 0, winRate: 0, drawdownPercent: 5, updatedAt: 'Mar 18, 2026 15:50', config: { botType: 'grid', minAmount: 200, maxAmount: 20000, durations: ['5m', '10m', '15m', '30m', '1h', '4h', '12h', '24h', '3d', '7d', '30d'], supportedPairs: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT', 'ADA/USDT', 'LTC/USDT'], gridLevels: 10, upperLimit: 1.05, lowerLimit: 0.95 } },
  { id: '2', name: 'Quick Arbitrage', pair: 'BTC/USDT', strategy: 'arbitrage', ownerUserId: 27, status: 'Live', allocationUsd: 5000, pnlUsd: 0, winRate: 0, drawdownPercent: 4, updatedAt: 'Mar 19, 2026 09:24', config: { botType: 'arbitrage', minAmount: 200, maxAmount: 10000, durations: ['5m', '10m', '30m', '1h'], supportedPairs: ['BTC/USDT', 'ETH/USDT', 'TRX/USDT'], gridLevels: 5, upperLimit: 1.02, lowerLimit: 0.98 } },
  { id: '3', name: 'ETH DCA Master', pair: 'ETH/USDT', strategy: 'dca', ownerUserId: 19, status: 'Paused', allocationUsd: 4564, pnlUsd: 0, winRate: 0, drawdownPercent: 6, updatedAt: 'Mar 19, 2026 11:00', config: { botType: 'dca', minAmount: 50, maxAmount: 5000, durations: ['1h', '4h', '12h', '24h', '7d'], supportedPairs: ['ETH/USDT'], gridLevels: 1, upperLimit: 1, lowerLimit: 1 } },
];

export const seedSubscriptions = [
  { id: '58', userId: 19, botId: '1', product: 'BTC Grid Pro', status: 'Active', amountUsd: 200, renewalDate: 'Jan 10, 2026 23:53', source: 'Trial Desk', createdAt: 'Jan 10, 2026 23:48' },
  { id: '59', userId: 19, botId: '1', product: 'BTC Grid Pro', status: 'Active', amountUsd: 1000, renewalDate: 'Jan 20, 2026 08:08', source: 'Prime Desk', createdAt: 'Jan 20, 2026 08:03' },
  { id: '60', userId: 19, botId: '2', product: 'Quick Arbitrage', status: 'Active', amountUsd: 200, renewalDate: 'Jan 28, 2026 05:34', source: 'Treasury', createdAt: 'Jan 28, 2026 05:30' },
  { id: '61', userId: 19, botId: '3', product: 'ETH DCA Master', status: 'Paused', amountUsd: 4564, renewalDate: 'Feb 08, 2026 18:44', source: 'Growth Desk', createdAt: 'Feb 08, 2026 18:40' },
  { id: '62', userId: 8, botId: '1', product: 'BTC Grid Pro', status: 'Pending Renewal', amountUsd: 500, renewalDate: 'Mar 01, 2026 09:00', source: 'Review Queue', createdAt: 'Feb 20, 2026 14:00' },
  { id: '63', userId: 27, botId: '2', product: 'Quick Arbitrage', status: 'Active', amountUsd: 2000, renewalDate: 'Mar 03, 2026 16:40', source: 'Asia Desk', createdAt: 'Feb 25, 2026 10:20' },
];

export const seedTrades = [
  { id: 'trade-1', userId: 19, botId: '1', pair: 'BTC/USDT', side: 'Long', amountUsd: 1600, pnlUsd: -1600, status: 'Review', openedAt: 'Mar 18, 2026 15:50', price: 71348.64 },
  { id: 'trade-2', userId: 19, botId: '2', pair: 'BTC/USDT', side: 'Short', amountUsd: 200, pnlUsd: -200, status: 'Open', openedAt: 'Jan 28, 2026 05:34', price: 65500.01 },
  { id: 'trade-3', userId: 19, botId: '1', pair: 'BTC/USDT', side: 'Long', amountUsd: 5000, pnlUsd: -5000, status: 'Open', openedAt: 'Jan 06, 2026 12:46', price: 70575.14 },
  { id: 'trade-4', userId: 19, botId: '3', pair: 'ETH/USDT', side: 'Long', amountUsd: 100, pnlUsd: 0, status: 'Settled', openedAt: 'Feb 06, 2026 18:44', price: 1730.05 },
  { id: 'trade-5', userId: 27, botId: '2', pair: 'TRX/USDT', side: 'Long', amountUsd: 200, pnlUsd: 0, status: 'Open', openedAt: 'Dec 29, 2025 14:58', price: 0.28 },
  { id: 'trade-6', userId: 8, botId: '1', pair: 'BTC/USDT', side: 'Short', amountUsd: 200, pnlUsd: 0, status: 'Review', openedAt: 'Jan 20, 2026 23:48', price: 113640.0 },
];

export const seedTransactions = [
  { id: 'txn-1', userId: 19, type: 'Transfer', asset: 'USDT_TRC20', amount: '100,000 USDT', channel: 'QFS PayID', destination: 'settlements@qfs', status: 'Completed', createdAt: 'Mar 27, 2026 18:58', fromAsset: 'USDT_TRC20', toAsset: '', whichCrypto: 'USDT_TRC20', networkFee: '0.00', rate: '1.0000' },
  { id: 'txn-2', userId: 19, type: 'Transfer', asset: 'BTC', amount: '3.2384 BTC', channel: 'External Wallet', destination: 'cold-vault-01', status: 'Completed', createdAt: 'Mar 12, 2026 06:03', fromAsset: 'BTC', toAsset: '', whichCrypto: 'BTC', networkFee: '0.00035000', rate: '1.0000' },
  { id: 'txn-3', userId: 19, type: 'Deposit', asset: 'USDT_TRC20', amount: '1,000,000 USDT', channel: 'TRC20 Wallet', destination: 'Treasury replenishment', status: 'Completed', createdAt: 'Feb 26, 2026 21:37', fromAsset: '', toAsset: 'USDT_TRC20', whichCrypto: 'USDT_TRC20', networkFee: '0.00', rate: '1.0000' },
  { id: 'txn-4', userId: 27, type: 'Reward', asset: 'USDT', amount: '250 USDT', channel: 'Referral', destination: 'Rewards ledger', status: 'Completed', createdAt: 'Feb 06, 2026 21:10', fromAsset: '', toAsset: 'USDT', whichCrypto: 'USDT', networkFee: '0.00', rate: '1.0000' },
  { id: 'txn-5', userId: 8, type: 'Withdrawal', asset: 'ETH', amount: '4 ETH', channel: 'External Wallet', destination: 'review-address-1', status: 'Pending', createdAt: 'Jan 28, 2026 08:14', fromAsset: 'ETH', toAsset: '', whichCrypto: 'ETH', networkFee: '0.0025', rate: '2013.80' },
  { id: 'txn-6', userId: 19, type: 'Transfer', asset: 'BTC', amount: '0.824 BTC', channel: 'QFS PayID', destination: 'prime-member@qfs', status: 'Pending', createdAt: 'Jan 27, 2026 10:50', fromAsset: 'BTC', toAsset: '', whichCrypto: 'BTC', networkFee: '0.00', rate: '66728.89' },
];

export const seedKycCases = [
  { id: 'kyc-19', userId: 19, documentType: 'Passport + Utility Bill', submittedAt: 'Sep 06, 2025 01:20', country: 'Nigeria', riskLevel: 'Low', status: 'Approved', note: 'Approved after manual document review.' },
  { id: 'kyc-8', userId: 8, documentType: 'Awaiting submission', submittedAt: '', country: 'Nigeria', riskLevel: 'Medium', status: 'Pending', note: 'No documents submitted yet.' },
];

export const seedSettings = {
  general: {
    siteName: 'Vancouver Bitcoin',
    appName: 'QFS Wallet',
    siteUrl: 'http://127.0.0.1:4173',
    logoUrl: '/marketing/vb-logo-colour.svg',
    faviconUrl: '/crypto/btc-icon.png',
    publicTopbarLabel: 'Vancouver Bitcoin',
    publicTopbarText: 'Buy and sell crypto in Vancouver and Calgary with guided support, transparent pricing, and local branches.',
    publicHeroTitle: 'Buy Bitcoin with a local desk, not a cold exchange.',
    publicHeroDescription: 'Cash, e-Transfer, wire transfer, and OTC support with clear pricing, human guidance, and local branches that make first-time buys feel straightforward.',
    footerSummary: 'Local crypto exchange support in Vancouver and Calgary with transparent pricing, human assistance, and a smoother path for first-time buyers.',
    authHeadline: 'Sign in to your Vancouver Bitcoin account',
    authDescription: 'Access your wallet, portfolio activity, and account controls through a secure login flow for traders and operators.',
    companyName: 'Qfs Trading',
    companyAddress: '39, church way',
    companyPhone: '+2348114313795',
    companyEmail: 'support@developerplug.com',
    referralEnabled: true,
    referralBonusAmount: 5,
    bonusDistribution: 'Instant Bonus',
  },
  email: {
    mailDriver: 'SMTP',
    mailHost: 'mail.developerplug.com',
    mailPort: '465',
    mailUsername: 'support@developerplug.com',
    mailPasswordMasked: '********',
    mailEncryption: 'SSL',
    fromAddress: 'support@developerplug.com',
    fromName: 'Qfs Trading',
    notifyOnUserRegistration: true,
    notifyOnKycSubmission: true,
    notifyOnKycApproval: true,
    templates: [
      { id: 'tmpl-1', name: 'Welcome Email', subject: 'Welcome to QFS Trading', status: 'Live', updatedAt: 'Today' },
      { id: 'tmpl-2', name: 'KYC Approval', subject: 'Your account verification is approved', status: 'Live', updatedAt: 'Yesterday' },
      { id: 'tmpl-3', name: 'Withdrawal Review', subject: 'Your transfer is under review', status: 'Draft', updatedAt: '2 days ago' },
    ],
  },
  wallets: {
    rails: [
      { id: 'rail-btc', name: 'Bitcoin', network: 'BTC', status: 'Healthy', minDeposit: '0.0002 BTC', minWithdrawal: '0.00035 BTC', fee: '0.00035 BTC', confirmations: '2 confirmations' },
      { id: 'rail-eth', name: 'Ethereum', network: 'ETH', status: 'Healthy', minDeposit: '0.005 ETH', minWithdrawal: '0.01 ETH', fee: '0.0025 ETH', confirmations: '12 confirmations' },
      { id: 'rail-usdt-trc20', name: 'Tether', network: 'TRC20', status: 'Healthy', minDeposit: '10 USDT', minWithdrawal: '25 USDT', fee: '1 USDT', confirmations: '20 confirmations' },
      { id: 'rail-usdt-erc20', name: 'Tether', network: 'ERC20', status: 'Watch', minDeposit: '10 USDT', minWithdrawal: '25 USDT', fee: '8 USDT', confirmations: '12 confirmations' },
      { id: 'rail-sol', name: 'Solana', network: 'SOL', status: 'Healthy', minDeposit: '0.15 SOL', minWithdrawal: '0.20 SOL', fee: '0.01 SOL', confirmations: '32 confirmations' },
    ],
  },
  referralMilestones: [
    { label: 'Starter Circle', reward: '100 USDT', requirement: 'Invite 1 verified trader' },
    { label: 'Growth Desk', reward: '500 USDT', requirement: 'Invite 5 active wallets' },
    { label: 'Prime Ambassador', reward: '1,500 USDT', requirement: 'Invite 15 funded accounts' },
  ],
  adminDashboard: {
    alerts: [
      '2 withdrawals are pending review above the configured threshold.',
      'One KYC case remains pending and requires operator action.',
      'TRC20 settlement rail is healthy and processing normally.',
    ],
    timeline: [
      { id: 'tl-1', title: 'Treasury top-up completed', detail: '1,000,000 USDT settled into the primary operating wallet.', time: 'Today, 09:24' },
      { id: 'tl-2', title: 'New trusted device added', detail: 'Ofofonobs Developer added a Windows desktop to the trusted list.', time: 'Today, 08:05' },
      { id: 'tl-3', title: 'Referral reward posted', detail: 'Ava Martins triggered a verified referral reward for the treasury desk.', time: 'Yesterday, 17:42' },
    ],
  },
  adminProfile: {
    fullName: 'Admin Admin',
    email: 'support@developerplug.com',
    role: 'Super Operator',
    timezone: 'Africa/Lagos',
    profileNote: 'Primary support and oversight account for the operations dashboard.',
  },
  adminTwoFactor: {
    enabled: false,
    recoveryCodes: [],
    lastUpdated: 'Not enabled',
  },
};
