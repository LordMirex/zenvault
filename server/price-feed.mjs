import { config } from './config.mjs';

const SYMBOL_MAP = {
  BTC: { coingecko: 'bitcoin', binance: 'BTCUSDT' },
  ETH: { coingecko: 'ethereum', binance: 'ETHUSDT' },
  USDT: { coingecko: 'tether', binance: 'USDTUSDT' }, // Binance doesn't really have USDTUSDT, usually 1.0
  SOL: { coingecko: 'solana', binance: 'SOLUSDT' },
  BNB: { coingecko: 'binancecoin', binance: 'BNBUSDT' },
  DOT: { coingecko: 'polkadot', binance: 'DOTUSDT' },
  TRX: { coingecko: 'tron', binance: 'TRXUSDT' },
  LTC: { coingecko: 'litecoin', binance: 'LTCUSDT' },
  BCH: { coingecko: 'bitcoin-cash', binance: 'BCHUSDT' },
  XLM: { coingecko: 'stellar', binance: 'XLMUSDT' },
  DASH: { coingecko: 'dash', binance: 'DASHUSDT' },
};

class PriceFeed {
  constructor() {
    this.cache = new Map();
    this.lastUpdatedAt = null;
    this.isFetching = false;
  }

  async fetchFromBinance() {
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
      if (!response.ok) throw new Error('Binance API response not OK');
      const data = await response.json();
      
      const results = {};
      for (const [symbol, mapping] of Object.entries(SYMBOL_MAP)) {
        const ticker = data.find(t => t.symbol === mapping.binance);
        if (ticker) {
          results[symbol] = {
            price: parseFloat(ticker.lastPrice),
            change: parseFloat(ticker.priceChangePercent),
          };
        }
      }
      return results;
    } catch (error) {
      console.warn('PriceFeed: Binance fetch failed', error.message);
      return null;
    }
  }

  async fetchFromCoinGecko() {
    try {
      const ids = Object.values(SYMBOL_MAP).map(m => m.coingecko).join(',');
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
      if (!response.ok) throw new Error('CoinGecko API response not OK');
      const data = await response.json();
      
      const results = {};
      for (const [symbol, mapping] of Object.entries(SYMBOL_MAP)) {
        const coin = data[mapping.coingecko];
        if (coin) {
          results[symbol] = {
            price: coin.usd,
            change: coin.usd_24h_change || 0,
          };
        }
      }
      return results;
    } catch (error) {
      console.warn('PriceFeed: CoinGecko fetch failed', error.message);
      return null;
    }
  }

  async update() {
    if (this.isFetching) return;
    this.isFetching = true;

    try {
      // Try Binance first (faster, less rate limited)
      let results = await this.fetchFromBinance();
      
      // Fallback to CoinGecko
      if (!results) {
        results = await this.fetchFromCoinGecko();
      }

      if (results && Object.keys(results).length > 0) {
        for (const [symbol, data] of Object.entries(results)) {
          this.cache.set(symbol, data);
        }
        this.lastUpdatedAt = new Date();
        console.log(`PriceFeed: Successfully updated ${Object.keys(results).length} symbols at ${this.lastUpdatedAt.toISOString()}`);
      }
    } finally {
      this.isFetching = false;
    }
  }

  getPrice(symbol) {
    return this.cache.get(symbol);
  }

  getAllPrices() {
    return Object.fromEntries(this.cache);
  }
}

export const priceFeed = new PriceFeed();
