const walletRailStatuses = ['Healthy', 'Watch', 'Paused'];
const supportedIcons = new Set(['bch', 'bnb', 'btc', 'dash', 'dot', 'eth', 'ltc', 'sol', 'trx', 'usdt', 'xlm']);

let walletRailPresets = {
  BCH: {
    name: 'Bitcoin Cash',
    network: 'Bitcoin Cash',
    icon: '/crypto/bch.png',
    minDeposit: 0.0001,
    minWithdrawal: 0.0002,
    fee: 0.0001,
    confirmations: '2 confirmations',
    tags: ['Payments', 'Native'],
    price: 468.13,
    change: 0.74,
  },
  BNB: {
    name: 'BNB',
    network: 'BEP20',
    icon: '/crypto/bnb.png',
    minDeposit: 0.03,
    minWithdrawal: 0.06,
    fee: 0.0015,
    confirmations: '15 confirmations',
    tags: ['Major', 'EVM', 'Trading'],
    price: 592.74,
    change: 0.82,
  },
  BTC: {
    name: 'Bitcoin',
    network: 'Bitcoin',
    icon: '/crypto/btc.png',
    minDeposit: 0.0002,
    minWithdrawal: 0.00035,
    fee: 0.00035,
    confirmations: '2 confirmations',
    tags: ['Major', 'Store of Value', 'Native'],
    price: 69675.68,
    change: -4.29,
  },
  DASH: {
    name: 'Dash',
    network: 'Dash',
    icon: '/crypto/dash.png',
    minDeposit: 0.01,
    minWithdrawal: 0.02,
    fee: 0.001,
    confirmations: '6 confirmations',
    tags: ['Payments', 'Native'],
    price: 29.47,
    change: 0.43,
  },
  DOT: {
    name: 'Polkadot',
    network: 'Polkadot',
    icon: '/crypto/dot.png',
    minDeposit: 1,
    minWithdrawal: 2,
    fee: 0.25,
    confirmations: 'Block finality under 1 minute',
    tags: ['Staking', 'Native'],
    price: 6.91,
    change: 1.08,
  },
  ETH: {
    name: 'Ethereum',
    network: 'ERC20',
    icon: '/crypto/eth.png',
    minDeposit: 0.005,
    minWithdrawal: 0.01,
    fee: 0.0025,
    confirmations: '12 confirmations',
    tags: ['Major', 'EVM', 'Smart Contracts'],
    price: 3452.12,
    change: 1.25,
  },
  LTC: {
    name: 'Litecoin',
    network: 'Litecoin',
    icon: '/crypto/ltc.png',
    minDeposit: 0.1,
    minWithdrawal: 0.2,
    fee: 0.001,
    confirmations: '6 confirmations',
    tags: ['Payments', 'Native'],
    price: 53.93,
    change: -0.35,
  },
  SOL: {
    name: 'Solana',
    network: 'Solana',
    icon: '/crypto/sol.png',
    minDeposit: 0.15,
    minWithdrawal: 0.2,
    fee: 0.01,
    confirmations: '32 confirmations',
    tags: ['Major', 'Fast Settlement', 'Native'],
    price: 145.82,
    change: -2.15,
  },
  TRX: {
    name: 'Tron',
    network: 'TRON',
    icon: '/crypto/trx.png',
    minDeposit: 50,
    minWithdrawal: 100,
    fee: 1,
    confirmations: '20 confirmations',
    tags: ['Payments', 'Fast Settlement', 'Native'],
    price: 0.32,
    change: 1.77,
  },
  USDT: {
    name: 'Tether',
    network: 'TRC20',
    icon: '/crypto/usdt.png',
    minDeposit: 10,
    minWithdrawal: 25,
    fee: 1,
    confirmations: '20 confirmations',
    tags: ['Stablecoin', 'Fast Settlement', 'Treasury'],
    price: 1,
    change: 0,
  },
  XLM: {
    name: 'Stellar',
    network: 'Stellar',
    icon: '/crypto/xlm.png',
    minDeposit: 25,
    minWithdrawal: 50,
    fee: 0.35,
    confirmations: 'Network finality under 10 seconds',
    tags: ['Payments', 'Fast Settlement', 'Native'],
    price: 0.14,
    change: 3.12,
  },
};

export const updateWalletRailPresets = (newPrices) => {
  for (const [symbol, data] of Object.entries(newPrices || {})) {
    const preset = walletRailPresets[symbol.toUpperCase()];
    if (preset) {
      preset.price = data.price || preset.price;
      preset.change = data.change || preset.change;
    }
  }
};


const slugify = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const toFiniteNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseAmountNumber = (value, fallback = 0) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }

  const normalized = String(value ?? '').replace(/,/g, '');
  const matched = normalized.match(/-?\d+(?:\.\d+)?/);

  if (!matched) {
    return fallback;
  }

  const parsed = Number(matched[0]);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeNetworkKey = (value) =>
  String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');

const sanitizeTags = (value) =>
  Array.isArray(value)
    ? value
        .map((entry) => String(entry ?? '').trim())
        .filter(Boolean)
    : [];

const getWalletIcon = (symbol) => {
  const normalized = String(symbol ?? '').trim().toLowerCase();
  return supportedIcons.has(normalized) ? `/crypto/${normalized}.png` : '/crypto/btc-icon.png';
};

const pickAllowedValue = (input, allowed, fallback) => {
  const normalized = String(input ?? '').trim().toLowerCase();
  return allowed.find((value) => value.toLowerCase() === normalized) ?? fallback;
};

const createFallbackPayId = (user, symbol) => {
  const base = String(user?.email ?? user?.uuid ?? user?.name ?? 'wallet')
    .trim()
    .toLowerCase()
    .split('@')[0]
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.|\.$/g, '');

  return `${base || 'wallet'}+${String(symbol ?? '').trim().toLowerCase()}@qfs`;
};

export const getWalletLookupKey = (asset) =>
  `${String(asset?.symbol ?? '').trim().toUpperCase()}::${normalizeNetworkKey(asset?.network)}`;

export const buildWalletRailFallbacksFromHoldings = (holdingsSources = []) => {
  const discovered = new Map();

  for (const holdings of holdingsSources) {
    for (const holding of Array.isArray(holdings) ? holdings : []) {
      const key = getWalletLookupKey(holding);

      if (!key || key === '::' || discovered.has(key)) {
        continue;
      }

      discovered.set(key, {
        id: String(holding.id ?? `rail-${slugify(key)}`),
        symbol: String(holding.symbol ?? '').trim().toUpperCase(),
        name: String(holding.name ?? holding.symbol ?? '').trim(),
        network: String(holding.network ?? '').trim(),
        status: String(holding.status ?? '').trim() === 'Paused' ? 'Paused' : 'Healthy',
        address: String(holding.address ?? '').trim(),
        payId: String(holding.payId ?? '').trim(),
        minDeposit: holding.minimumDeposit,
        minWithdrawal: holding.minimumWithdrawal,
        fee: holding.withdrawFee,
        confirmations: String(holding.confirmations ?? '').trim(),
        icon: String(holding.icon ?? '').trim(),
        tags: sanitizeTags(holding.tags),
        price: holding.price,
        change: holding.change,
      });
    }
  }

  return Array.from(discovered.values());
};

const normalizeWalletRail = (rawRail = {}, index = 0, fallbackRail = {}) => {
  const merged = { ...fallbackRail, ...rawRail };
  const presetKey = String(merged.symbol ?? merged.name ?? fallbackRail.symbol ?? '')
    .trim()
    .toUpperCase();
  const preset = walletRailPresets[presetKey] ?? {};
  const symbol = String(merged.symbol ?? fallbackRail.symbol ?? presetKey).trim().toUpperCase();
  const name = String(merged.name ?? fallbackRail.name ?? preset.name ?? symbol).trim();
  const network = String(merged.network ?? fallbackRail.network ?? preset.network ?? 'Native').trim();
  const idSource = String(merged.id ?? fallbackRail.id ?? '').trim();

  return {
    id: idSource || `rail-${slugify(`${symbol}-${network}` || `wallet-${index + 1}`)}`,
    symbol,
    name,
    network,
    status: pickAllowedValue(merged.status, walletRailStatuses, fallbackRail.status ?? 'Healthy'),
    address: String(merged.address ?? fallbackRail.address ?? '').trim(),
    payId: String(merged.payId ?? fallbackRail.payId ?? '').trim(),
    minDeposit: parseAmountNumber(merged.minDeposit, parseAmountNumber(fallbackRail.minDeposit, parseAmountNumber(preset.minDeposit, 0))),
    minWithdrawal: parseAmountNumber(merged.minWithdrawal, parseAmountNumber(fallbackRail.minWithdrawal, parseAmountNumber(preset.minWithdrawal, 0))),
    fee: parseAmountNumber(merged.fee, parseAmountNumber(fallbackRail.fee, parseAmountNumber(preset.fee, 0))),
    confirmations: String(merged.confirmations ?? fallbackRail.confirmations ?? preset.confirmations ?? 'Pending confirmation').trim(),
    icon: String(merged.icon ?? fallbackRail.icon ?? preset.icon ?? getWalletIcon(symbol)).trim(),
    tags: sanitizeTags(merged.tags).length > 0 ? sanitizeTags(merged.tags) : sanitizeTags(fallbackRail.tags).length > 0 ? sanitizeTags(fallbackRail.tags) : sanitizeTags(preset.tags),
    price: toFiniteNumber(merged.price, toFiniteNumber(fallbackRail.price, toFiniteNumber(preset.price, 0))),
    change: toFiniteNumber(merged.change, toFiniteNumber(fallbackRail.change, toFiniteNumber(preset.change, 0))),
  };
};

export const collectWalletRails = (walletSettings = {}, fallbackRails = []) => {
  const rails = Array.isArray(walletSettings?.rails) ? walletSettings.rails : [];
  const fallbackById = new Map();
  const fallbackByKey = new Map();
  const seen = new Set();

  for (const rail of Array.isArray(fallbackRails) ? fallbackRails : []) {
    const id = String(rail?.id ?? '').trim();
    const key = getWalletLookupKey(rail);

    if (id && !fallbackById.has(id)) {
      fallbackById.set(id, rail);
    }

    if (key && !fallbackByKey.has(key)) {
      fallbackByKey.set(key, rail);
    }
  }

  return rails
    .map((rail, index) => {
      const fallbackRail =
        fallbackById.get(String(rail?.id ?? '').trim()) ??
        fallbackByKey.get(getWalletLookupKey(rail)) ??
        {};

      return normalizeWalletRail(rail, index, fallbackRail);
    })
    .filter((rail) => {
      const key = getWalletLookupKey(rail);

      if (!rail.symbol || !rail.name || !rail.network || !key || seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
};

const buildLegacyHolding = (holding = {}, user) => {
  const symbol = String(holding.symbol ?? '').trim().toUpperCase();
  const balance = toFiniteNumber(holding.balance, 0);
  const price = toFiniteNumber(holding.price, 0);
  const enabledByDefault =
    typeof holding.enabledByDefault === 'boolean'
      ? holding.enabledByDefault
      : String(holding.status ?? '').trim().toLowerCase() !== 'paused';

  return {
    id: String(holding.id ?? `asset-${slugify(`${symbol}-${holding.network ?? 'native'}`)}`),
    symbol,
    name: String(holding.name ?? symbol).trim(),
    network: String(holding.network ?? 'Native').trim(),
    icon: String(holding.icon ?? getWalletIcon(symbol)).trim(),
    price,
    change: toFiniteNumber(holding.change, 0),
    balance,
    valueUsd: toFiniteNumber(holding.valueUsd, Number((balance * price).toFixed(2))),
    address: String(holding.address ?? '').trim(),
    payId: String(holding.payId ?? createFallbackPayId(user, symbol)).trim(),
    minimumDeposit: parseAmountNumber(holding.minimumDeposit, 0),
    minimumWithdrawal: parseAmountNumber(holding.minimumWithdrawal, 0),
    withdrawFee: parseAmountNumber(holding.withdrawFee, 0),
    confirmations: String(holding.confirmations ?? 'Pending confirmation').trim(),
    enabledByDefault,
    tags: sanitizeTags(holding.tags),
    status: String(holding.status ?? (enabledByDefault ? 'Enabled' : 'Paused')).trim(),
  };
};

const buildRailBackedAsset = (rail, holding = {}, user) => {
  const balance = toFiniteNumber(holding.balance, 0);
  const price = toFiniteNumber(holding.price, toFiniteNumber(rail.price, 0));
  const enabledByDefault =
    typeof holding.enabledByDefault === 'boolean'
      ? holding.enabledByDefault
      : rail.status !== 'Paused';
  const fallbackStatus = rail.status === 'Watch' ? 'Watch' : enabledByDefault ? 'Enabled' : 'Paused';

  return {
    id: String(holding.id ?? rail.id),
    symbol: rail.symbol,
    name: rail.name,
    network: rail.network,
    icon: rail.icon,
    price,
    change: toFiniteNumber(holding.change, toFiniteNumber(rail.change, 0)),
    balance,
    valueUsd: toFiniteNumber(holding.valueUsd, Number((balance * price).toFixed(2))),
    address: String(rail.address || holding.address || '').trim(),
    payId: String(rail.payId || holding.payId || createFallbackPayId(user, rail.symbol)).trim(),
    minimumDeposit: parseAmountNumber(rail.minDeposit, parseAmountNumber(holding.minimumDeposit, 0)),
    minimumWithdrawal: parseAmountNumber(rail.minWithdrawal, parseAmountNumber(holding.minimumWithdrawal, 0)),
    withdrawFee: parseAmountNumber(rail.fee, parseAmountNumber(holding.withdrawFee, 0)),
    confirmations: String(rail.confirmations || holding.confirmations || 'Pending confirmation').trim(),
    enabledByDefault,
    tags: rail.tags.length > 0 ? rail.tags : sanitizeTags(holding.tags),
    status: String(holding.status ?? fallbackStatus).trim(),
  };
};

export const buildEffectiveWalletAssets = ({
  user,
  holdings = [],
  rails = [],
  includeLegacyHoldings = true,
} = {}) => {
  const normalizedHoldings = Array.isArray(holdings) ? holdings : [];
  const holdingsByKey = new Map(
    normalizedHoldings
      .filter((holding) => getWalletLookupKey(holding))
      .map((holding) => [getWalletLookupKey(holding), holding]),
  );

  const railBackedAssets = (Array.isArray(rails) ? rails : []).map((rail) =>
    buildRailBackedAsset(rail, holdingsByKey.get(getWalletLookupKey(rail)), user),
  );

  if (!includeLegacyHoldings) {
    return railBackedAssets;
  }

  const railKeys = new Set((Array.isArray(rails) ? rails : []).map((rail) => getWalletLookupKey(rail)));
  const legacyHoldings = normalizedHoldings
    .filter((holding) => !railKeys.has(getWalletLookupKey(holding)))
    .map((holding) => buildLegacyHolding(holding, user));

  return [...railBackedAssets, ...legacyHoldings];
};
