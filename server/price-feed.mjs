import {
  SUPPORTED_MARKET_ASSETS,
  getSupportedMarketAssetIds,
} from './assets.mjs';

const COINGECKO_PUBLIC_BASE = 'https://api.coingecko.com/api/v3';
const COINGECKO_PRO_BASE = 'https://pro-api.coingecko.com/api/v3';
const DEFAULT_ICON = '/crypto/btc-icon.png';

const buildRequestConfig = () => {
  const proKey = String(process.env.COINGECKO_PRO_API_KEY ?? '').trim();
  if (proKey) {
    return {
      url: `${COINGECKO_PRO_BASE}/coins/markets`,
      headers: {
        accept: 'application/json',
        'x-cg-pro-api-key': proKey,
      },
    };
  }

  const demoKey = String(process.env.COINGECKO_DEMO_API_KEY ?? '').trim();
  return {
    url: `${COINGECKO_PUBLIC_BASE}/coins/markets`,
    headers: {
      accept: 'application/json',
      ...(demoKey ? { 'x-cg-demo-api-key': demoKey } : {}),
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
  }

  async fetchFromCoinGecko() {
    const { url, headers } = buildRequestConfig();
    const params = new URLSearchParams({
      vs_currency: 'usd',
      ids: getSupportedMarketAssetIds().join(','),
      order: 'market_cap_desc',
      per_page: String(SUPPORTED_MARKET_ASSETS.length),
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
      console.log(
        `PriceFeed: updated ${marketAssets.length} supported assets at ${this.lastUpdatedAt.toISOString()}`,
      );
    } catch (error) {
      if (error.message && error.message.includes('429')) {
        const backoffMs = 5 * 60 * 1000;
        this.rateLimitedUntil = Date.now() + backoffMs;
        console.warn(`PriceFeed: rate limited by CoinGecko, pausing updates for 5 minutes`);
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
}

export const priceFeed = new PriceFeed();
