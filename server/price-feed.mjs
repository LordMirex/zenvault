import {
  SUPPORTED_MARKET_ASSETS,
  getSupportedMarketAssetIds,
} from './assets.mjs';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const DEFAULT_ICON = '/crypto/btc-icon.png';
const FETCH_INTERVAL_MS = 15 * 60 * 1000;
const RATE_LIMIT_BACKOFF_MS = 15 * 60 * 1000;

const buildRequestConfig = () => {
  const apiKey = String(process.env.COINGECKO_API_KEY ?? '').trim();
  if (!apiKey) {
    console.warn('[PriceFeed] WARNING: COINGECKO_API_KEY is not set. Requests may be rate limited.');
  }
  return {
    url: `${COINGECKO_BASE}/coins/markets`,
    headers: {
      accept: 'application/json',
      ...(apiKey ? { 'x-cg-demo-api-key': apiKey } : {}),
    },
  };
};

const fallbackMarketAssets = SUPPORTED_MARKET_ASSETS.map((asset, index) => ({
  id: asset.id,
  symbol: asset.symbol,
  name: asset.name,
  icon: DEFAULT_ICON,
  price: 0,
  change: 0,
  marketCapRank: index + 1,
}));

class PriceFeed {
  constructor() {
    this.cache = new Map();
    this.marketAssets = [...fallbackMarketAssets];
    this.lastUpdatedAt = null;
    this.isFetching = false;
    this.rateLimitedUntil = null;
    this.lastFetchedCount = 0;
    this.totalCount = SUPPORTED_MARKET_ASSETS.length;
  }

  async fetchFromCoinGecko() {
    const { url, headers } = buildRequestConfig();
    const assetIds = getSupportedMarketAssetIds();
    const params = new URLSearchParams({
      vs_currency: 'usd',
      ids: assetIds.join(','),
      order: 'market_cap_desc',
      per_page: String(assetIds.length),
      page: '1',
      sparkline: 'false',
      price_change_percentage: '24h',
    });

    const response = await fetch(`${url}?${params.toString()}`, { headers });
    if (!response.ok) {
      throw new Error(`CoinGecko responded with ${response.status}`);
    }

    const payload = await response.json();

    return (Array.isArray(payload) ? payload : [])
      .map((asset, index) => ({
        id: String(asset.id ?? '').trim(),
        symbol: String(asset.symbol ?? '').trim().toUpperCase(),
        name: String(asset.name ?? '').trim(),
        icon: String(asset.image ?? '').trim() || DEFAULT_ICON,
        price: Number(asset.current_price ?? 0),
        change: Number(asset.price_change_percentage_24h ?? 0),
        marketCapRank: Number(asset.market_cap_rank ?? index + 1),
      }))
      .filter((asset) => asset.id && asset.symbol && asset.name);
  }

  async update() {
    if (this.isFetching) {
      return;
    }

    if (this.rateLimitedUntil && Date.now() < this.rateLimitedUntil) {
      return;
    }

    this.isFetching = true;

    try {
      const marketAssets = await this.fetchFromCoinGecko();
      if (!marketAssets.length) {
        return;
      }

      this.rateLimitedUntil = null;
      this.marketAssets = marketAssets;
      this.cache = new Map(
        marketAssets.map((asset) => [
          asset.symbol,
          {
            price: asset.price,
            change: asset.change,
          },
        ]),
      );
      this.lastUpdatedAt = new Date();
      this.lastFetchedCount = marketAssets.length;
    } catch (error) {
      if (error.message && error.message.includes('429')) {
        this.rateLimitedUntil = Date.now() + RATE_LIMIT_BACKOFF_MS;
        console.warn(`PriceFeed: rate limited by CoinGecko, pausing for 15 minutes`);
      } else {
        console.warn('PriceFeed: market update failed', error.message);
      }
    } finally {
      this.isFetching = false;
    }
  }

  getPrice(symbol) {
    return this.cache.get(String(symbol ?? '').trim().toUpperCase());
  }

  getAllPrices() {
    return Object.fromEntries(this.cache);
  }

  getMarketAssets() {
    return this.marketAssets.map((asset) => ({ ...asset }));
  }

  getStatus() {
    return {
      lastUpdatedAt: this.lastUpdatedAt ? this.lastUpdatedAt.toISOString() : null,
      fetchedCount: this.lastFetchedCount,
      totalCount: this.totalCount,
      rateLimitedUntil: this.rateLimitedUntil,
    };
  }

  getIntervalMs() {
    return FETCH_INTERVAL_MS;
  }
}

export const priceFeed = new PriceFeed();
