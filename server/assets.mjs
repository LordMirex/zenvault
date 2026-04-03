const DEFAULT_ICON = '/crypto/btc-icon.png';

export const SUPPORTED_MARKET_ASSETS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'tether', symbol: 'USDT', name: 'Tether' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'usd-coin', symbol: 'USDC', name: 'USDC' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'tron', symbol: 'TRX', name: 'TRON' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
  { id: 'stellar', symbol: 'XLM', name: 'Stellar' },
  { id: 'litecoin', symbol: 'LTC', name: 'Litecoin' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
  { id: 'shiba-inu', symbol: 'SHIB', name: 'Shiba Inu' },
  { id: 'toncoin', symbol: 'TON', name: 'Toncoin' },
  { id: 'sui', symbol: 'SUI', name: 'Sui' },
  { id: 'hedera-hashgraph', symbol: 'HBAR', name: 'Hedera' },
  { id: 'monero', symbol: 'XMR', name: 'Monero' },
];

export const DEFAULT_ACTIVE_ASSET_IDS = SUPPORTED_MARKET_ASSETS.slice(0, 10).map((asset) => asset.id);
export const DEFAULT_CARD_APPLICATION_FEE_USD = 75;

const supportedAssetIds = new Set(SUPPORTED_MARKET_ASSETS.map((asset) => asset.id));
const assetIdBySymbol = new Map(SUPPORTED_MARKET_ASSETS.map((asset) => [asset.symbol, asset.id]));

const assetMeta = {
  bitcoin: {
    network: 'Bitcoin',
    minimumDeposit: 0.0002,
    minimumWithdrawal: 0.00035,
    withdrawFee: 0.00035,
    confirmations: '2 confirmations',
    tags: ['Major', 'Store of Value', 'Native'],
  },
  ethereum: {
    network: 'Ethereum',
    minimumDeposit: 0.005,
    minimumWithdrawal: 0.01,
    withdrawFee: 0.0025,
    confirmations: '12 confirmations',
    tags: ['Major', 'Smart Contracts', 'Native'],
  },
  tether: {
    network: 'Tether',
    minimumDeposit: 10,
    minimumWithdrawal: 25,
    withdrawFee: 1,
    confirmations: 'Rapid settlement',
    tags: ['Stablecoin', 'Treasury', 'Payments'],
  },
  ripple: {
    network: 'XRP Ledger',
    minimumDeposit: 10,
    minimumWithdrawal: 20,
    withdrawFee: 0.25,
    confirmations: 'Ledger finality in seconds',
    tags: ['Payments', 'Fast Settlement', 'Native'],
  },
  binancecoin: {
    network: 'BNB Chain',
    minimumDeposit: 0.03,
    minimumWithdrawal: 0.06,
    withdrawFee: 0.0015,
    confirmations: '15 confirmations',
    tags: ['Major', 'Utility', 'Trading'],
  },
  'usd-coin': {
    network: 'USD Coin',
    minimumDeposit: 10,
    minimumWithdrawal: 25,
    withdrawFee: 1,
    confirmations: 'Rapid settlement',
    tags: ['Stablecoin', 'Treasury', 'Payments'],
  },
  solana: {
    network: 'Solana',
    minimumDeposit: 0.15,
    minimumWithdrawal: 0.2,
    withdrawFee: 0.01,
    confirmations: '32 confirmations',
    tags: ['Major', 'Fast Settlement', 'Native'],
  },
  tron: {
    network: 'TRON',
    minimumDeposit: 50,
    minimumWithdrawal: 100,
    withdrawFee: 1,
    confirmations: '20 confirmations',
    tags: ['Payments', 'Fast Settlement', 'Native'],
  },
  dogecoin: {
    network: 'Dogecoin',
    minimumDeposit: 10,
    minimumWithdrawal: 25,
    withdrawFee: 2,
    confirmations: '6 confirmations',
    tags: ['Payments', 'Community', 'Native'],
  },
  cardano: {
    network: 'Cardano',
    minimumDeposit: 2,
    minimumWithdrawal: 5,
    withdrawFee: 0.3,
    confirmations: '2 confirmations',
    tags: ['Layer 1', 'Staking', 'Native'],
  },
  chainlink: {
    network: 'Chainlink',
    minimumDeposit: 1,
    minimumWithdrawal: 2,
    withdrawFee: 0.2,
    confirmations: '12 confirmations',
    tags: ['Oracle', 'DeFi', 'Utility'],
  },
  stellar: {
    network: 'Stellar',
    minimumDeposit: 25,
    minimumWithdrawal: 50,
    withdrawFee: 0.35,
    confirmations: 'Network finality under 10 seconds',
    tags: ['Payments', 'Fast Settlement', 'Native'],
  },
  litecoin: {
    network: 'Litecoin',
    minimumDeposit: 0.1,
    minimumWithdrawal: 0.2,
    withdrawFee: 0.001,
    confirmations: '6 confirmations',
    tags: ['Payments', 'Major', 'Native'],
  },
  'avalanche-2': {
    network: 'Avalanche',
    minimumDeposit: 0.5,
    minimumWithdrawal: 1,
    withdrawFee: 0.05,
    confirmations: 'Block finality under 1 minute',
    tags: ['Layer 1', 'Fast Settlement', 'Utility'],
  },
  polkadot: {
    network: 'Polkadot',
    minimumDeposit: 1,
    minimumWithdrawal: 2,
    withdrawFee: 0.25,
    confirmations: 'Block finality under 1 minute',
    tags: ['Layer 1', 'Staking', 'Native'],
  },
  'shiba-inu': {
    network: 'Shiba Inu',
    minimumDeposit: 100000,
    minimumWithdrawal: 250000,
    withdrawFee: 15000,
    confirmations: '12 confirmations',
    tags: ['Meme', 'Community', 'ERC20'],
  },
  toncoin: {
    network: 'TON',
    minimumDeposit: 0.5,
    minimumWithdrawal: 1,
    withdrawFee: 0.05,
    confirmations: 'Network finality in seconds',
    tags: ['Layer 1', 'Payments', 'Native'],
  },
  sui: {
    network: 'Sui',
    minimumDeposit: 1,
    minimumWithdrawal: 2,
    withdrawFee: 0.1,
    confirmations: 'Network finality in seconds',
    tags: ['Layer 1', 'Fast Settlement', 'Native'],
  },
  'hedera-hashgraph': {
    network: 'Hedera',
    minimumDeposit: 10,
    minimumWithdrawal: 20,
    withdrawFee: 1,
    confirmations: 'Network finality in seconds',
    tags: ['Enterprise', 'Payments', 'Native'],
  },
  monero: {
    network: 'Monero',
    minimumDeposit: 0.05,
    minimumWithdrawal: 0.1,
    withdrawFee: 0.0001,
    confirmations: '10 confirmations',
    tags: ['Privacy', 'Payments', 'Native'],
  },
};

const normalizeText = (value) => String(value ?? '').trim();
const normalizeSymbol = (value) => normalizeText(value).toUpperCase();
const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const uniqueStrings = (values = []) =>
  Array.from(
    new Set(
      values
        .map((value) => normalizeText(value))
        .filter(Boolean),
    ),
  );

const normalizeAssetConfigs = (input = {}, marketAssets = SUPPORTED_MARKET_ASSETS) => {
  const availableIds = new Set((Array.isArray(marketAssets) ? marketAssets : SUPPORTED_MARKET_ASSETS).map((asset) => asset.id));
  const nextConfigs = {};

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return nextConfigs;
  }

  for (const [rawAssetId, rawConfig] of Object.entries(input)) {
    const assetId = normalizeText(rawAssetId);
    if (!availableIds.has(assetId) || !rawConfig || typeof rawConfig !== 'object' || Array.isArray(rawConfig)) {
      continue;
    }

    const depositAddress = normalizeText(rawConfig.depositAddress ?? rawConfig.address);
    if (!depositAddress) {
      continue;
    }

    nextConfigs[assetId] = {
      depositAddress,
    };
  }

  return nextConfigs;
};

const buildFallbackAddress = (user, asset) =>
  `QFS-${normalizeText(user?.uuid || user?.email || 'wallet').replace(/[^A-Za-z0-9]/g, '').slice(0, 18)}-${asset.symbol}`;

const buildFallbackPayId = (user, symbol) => {
  const base = normalizeText(user?.email || user?.uuid || user?.name || 'wallet')
    .toLowerCase()
    .split('@')[0]
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.|\.$/g, '');

  return `${base || 'wallet'}+${String(symbol).toLowerCase()}@qfs`;
};

export const getSupportedMarketAssetIds = () => SUPPORTED_MARKET_ASSETS.map((asset) => asset.id);

export const normalizeWalletSettings = (input = {}, marketAssets = SUPPORTED_MARKET_ASSETS) => {
  const availableIds = new Set((Array.isArray(marketAssets) ? marketAssets : SUPPORTED_MARKET_ASSETS).map((asset) => asset.id));
  const activeAssetIds = uniqueStrings(Array.isArray(input?.activeAssetIds) ? input.activeAssetIds : []).filter((id) =>
    availableIds.has(id),
  );

  const cardApplicationFeeUsd = toNumber(input?.cardApplicationFeeUsd, DEFAULT_CARD_APPLICATION_FEE_USD);
  const assetConfigs = normalizeAssetConfigs(input?.assetConfigs, marketAssets);

  return {
    activeAssetIds: activeAssetIds.length ? activeAssetIds : DEFAULT_ACTIVE_ASSET_IDS.filter((id) => availableIds.has(id)),
    cardApplicationFeeUsd: cardApplicationFeeUsd >= 0 ? cardApplicationFeeUsd : DEFAULT_CARD_APPLICATION_FEE_USD,
    assetConfigs,
  };
};

const getAssetCatalogMeta = (marketAsset = {}) => {
  const meta = assetMeta[marketAsset.id] ?? {};

  return {
    network: normalizeText(meta.network) || normalizeText(marketAsset.network) || normalizeText(marketAsset.name) || 'Wallet asset',
    minimumDeposit: toNumber(meta.minimumDeposit, 0),
    minimumWithdrawal: toNumber(meta.minimumWithdrawal, 0),
    withdrawFee: toNumber(meta.withdrawFee, 0),
    confirmations: normalizeText(meta.confirmations) || 'Network confirmation pending',
    tags: uniqueStrings(meta.tags ?? marketAsset.tags ?? []),
  };
};

export const buildAdminAssetCatalog = (marketAssets = [], walletSettings = {}) => {
  const settings = normalizeWalletSettings(walletSettings, marketAssets);
  const activeAssetIds = new Set(settings.activeAssetIds);

  return (Array.isArray(marketAssets) ? marketAssets : []).map((asset, index) => {
    const meta = getAssetCatalogMeta(asset);

    return {
      id: asset.id,
      symbol: normalizeSymbol(asset.symbol),
      name: normalizeText(asset.name),
      icon: normalizeText(asset.icon) || DEFAULT_ICON,
      price: toNumber(asset.price, 0),
      change: toNumber(asset.change, 0),
      marketCapRank: toNumber(asset.marketCapRank, index + 1),
      network: meta.network,
      tags: meta.tags,
      active: activeAssetIds.has(asset.id),
      depositAddress: normalizeText(settings.assetConfigs?.[asset.id]?.depositAddress),
    };
  });
};

export const resolveHoldingAssetId = (holding = {}) => {
  const directId = normalizeText(holding.marketAssetId || holding.assetId || holding.coinId);
  if (supportedAssetIds.has(directId)) {
    return directId;
  }

  const symbolMatch = assetIdBySymbol.get(normalizeSymbol(holding.symbol));
  if (symbolMatch) {
    return symbolMatch;
  }

  return null;
};

export const normalizeActivityRecords = (records = [], holdings = []) => {
  const legacyIdMap = new Map(
    (Array.isArray(holdings) ? holdings : [])
      .map((holding) => [normalizeText(holding.id), resolveHoldingAssetId(holding)])
      .filter((entry) => entry[0] && entry[1]),
  );

  return (Array.isArray(records) ? records : []).map((record) => {
    const currentAssetId = normalizeText(record.assetId);
    return {
      ...record,
      assetId: legacyIdMap.get(currentAssetId) || currentAssetId,
    };
  });
};

const aggregateHoldingsByAssetId = (holdings = []) => {
  const aggregated = new Map();

  for (const holding of Array.isArray(holdings) ? holdings : []) {
    const assetId = resolveHoldingAssetId(holding);
    if (!assetId) {
      continue;
    }

    const current = aggregated.get(assetId) ?? {
      balance: 0,
      valueUsd: 0,
      address: '',
      payId: '',
      enabledByDefault: null,
      status: '',
      tags: new Set(),
      sample: null,
    };

    current.balance += toNumber(holding.balance, 0);
    current.valueUsd += toNumber(holding.valueUsd, 0);

    if (!current.address) {
      current.address = normalizeText(holding.address);
    }

    if (!current.payId) {
      current.payId = normalizeText(holding.payId);
    }

    if (typeof holding.enabledByDefault === 'boolean') {
      current.enabledByDefault = current.enabledByDefault === null
        ? holding.enabledByDefault
        : current.enabledByDefault || holding.enabledByDefault;
    }

    const status = normalizeText(holding.status);
    if (status === 'Watch') {
      current.status = 'Watch';
    } else if (!current.status && status) {
      current.status = status;
    }

    for (const tag of Array.isArray(holding.tags) ? holding.tags : []) {
      const normalizedTag = normalizeText(tag);
      if (normalizedTag) {
        current.tags.add(normalizedTag);
      }
    }

    if (!current.sample) {
      current.sample = holding;
    }

    aggregated.set(assetId, current);
  }

  return aggregated;
};

const buildWalletAsset = ({ marketAsset, holding, walletConfig, user }) => {
  const meta = getAssetCatalogMeta(marketAsset);
  const balance = toNumber(holding?.balance, 0);
  const enabledByDefault =
    typeof holding?.enabledByDefault === 'boolean'
      ? holding.enabledByDefault
      : balance > 0;
  const resolvedStatus =
    normalizeText(holding?.status) ||
    (enabledByDefault ? 'Enabled' : 'Paused');
  const symbol = normalizeSymbol(marketAsset.symbol);
  const price = toNumber(marketAsset.price, 0);

  return {
    id: marketAsset.id,
    marketAssetId: marketAsset.id,
    symbol,
    name: normalizeText(marketAsset.name),
    network: meta.network,
    icon: normalizeText(marketAsset.icon) || DEFAULT_ICON,
    price,
    change: toNumber(marketAsset.change, 0),
    balance: Number(balance.toFixed(8)),
    valueUsd: Number((balance * price).toFixed(2)),
    address: normalizeText(walletConfig?.depositAddress) || normalizeText(holding?.address) || buildFallbackAddress(user, { symbol }),
    payId: normalizeText(holding?.payId) || buildFallbackPayId(user, symbol),
    minimumDeposit: meta.minimumDeposit,
    minimumWithdrawal: meta.minimumWithdrawal,
    withdrawFee: meta.withdrawFee,
    confirmations: meta.confirmations,
    enabledByDefault,
    tags: uniqueStrings(holding?.tags?.length ? holding.tags : meta.tags),
    status: resolvedStatus === 'Watch' ? 'Watch' : enabledByDefault ? 'Enabled' : 'Paused',
  };
};

export const buildUserWalletAssets = ({
  user,
  holdings = [],
  marketAssets = [],
  walletSettings = {},
} = {}) => {
  const settings = normalizeWalletSettings(walletSettings, marketAssets);
  const activeAssetIds = new Set(settings.activeAssetIds);
  const aggregatedHoldings = aggregateHoldingsByAssetId(holdings);

  return buildAdminAssetCatalog(marketAssets, settings)
    .filter((asset) => activeAssetIds.has(asset.id))
    .map((asset) =>
      buildWalletAsset({
        marketAsset: asset,
        holding: aggregatedHoldings.get(asset.id),
        walletConfig: settings.assetConfigs?.[asset.id],
        user,
      }),
    );
};

export const serializeWalletHolding = (asset, existingHolding = null) => ({
  ...(existingHolding ?? {}),
  id: normalizeText(asset.marketAssetId || asset.id),
  marketAssetId: normalizeText(asset.marketAssetId || asset.id),
  symbol: normalizeSymbol(asset.symbol),
  name: normalizeText(asset.name),
  network: normalizeText(asset.network),
  icon: normalizeText(asset.icon) || DEFAULT_ICON,
  price: toNumber(asset.price, 0),
  change: toNumber(asset.change, 0),
  balance: Number(toNumber(asset.balance, 0).toFixed(8)),
  valueUsd: Number(toNumber(asset.valueUsd, 0).toFixed(2)),
  address: normalizeText(asset.address),
  payId: normalizeText(asset.payId),
  minimumDeposit: toNumber(asset.minimumDeposit, 0),
  minimumWithdrawal: toNumber(asset.minimumWithdrawal, 0),
  withdrawFee: toNumber(asset.withdrawFee, 0),
  confirmations: normalizeText(asset.confirmations),
  enabledByDefault: Boolean(asset.enabledByDefault),
  tags: uniqueStrings(asset.tags),
  status: normalizeText(asset.status) || (asset.enabledByDefault ? 'Enabled' : 'Paused'),
});

export const upsertWalletHolding = (holdings = [], asset) => {
  const normalizedHoldings = Array.isArray(holdings) ? holdings : [];
  const assetId = normalizeText(asset.marketAssetId || asset.id);
  const existingHolding = normalizedHoldings.find((holding) => resolveHoldingAssetId(holding) === assetId) ?? null;
  const remainingHoldings = normalizedHoldings.filter((holding) => resolveHoldingAssetId(holding) !== assetId);

  return [
    serializeWalletHolding(asset, existingHolding),
    ...remainingHoldings,
  ];
};

export const sumVisiblePortfolioValue = (assets = []) =>
  (Array.isArray(assets) ? assets : [])
    .filter((asset) => asset.enabledByDefault)
    .reduce((total, asset) => total + toNumber(asset.valueUsd, 0), 0);

export const sumWalletValue = (assets = []) =>
  (Array.isArray(assets) ? assets : []).reduce((total, asset) => total + toNumber(asset.valueUsd, 0), 0);
