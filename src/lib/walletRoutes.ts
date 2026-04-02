import { walletAssets, type WalletAsset } from '../data/wallet';

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const getAssetSymbolSlug = (asset: WalletAsset) => asset.symbol.toLowerCase();

export const getAssetNetworkSlug = (asset: WalletAsset) => {
  if (asset.symbol !== 'USDT') {
    return 'native';
  }

  if (asset.network.toUpperCase().includes('TRC20')) {
    return 'trc20';
  }

  if (asset.network.toUpperCase().includes('ERC20')) {
    return 'erc20';
  }

  if (asset.network.toUpperCase().includes('BNB') || asset.network.toUpperCase().includes('BEP20')) {
    return 'bnb';
  }

  return slugify(asset.network);
};

export const getWalletAssetPath = (asset: WalletAsset) =>
  `/app/crypto/details/${getAssetSymbolSlug(asset)}/${getAssetNetworkSlug(asset)}`;

export const getSendAssetPath = (asset: WalletAsset, method: 'payid' | 'external') =>
  `/app/send/${method}/${getAssetSymbolSlug(asset)}/${getAssetNetworkSlug(asset)}`;

export const getReceiveAssetPath = (asset: WalletAsset, method: 'payid' | 'external') =>
  `/app/receive/${method}/${getAssetSymbolSlug(asset)}/${getAssetNetworkSlug(asset)}`;

export const isSensitiveAsset = (asset: WalletAsset) =>
  asset.symbol === 'BTC' && getAssetNetworkSlug(asset) === 'native';

export const findWalletAssetByRoute = (symbol: string, network: string) =>
  walletAssets.find(
    (asset) =>
      getAssetSymbolSlug(asset) === String(symbol).toLowerCase() &&
      getAssetNetworkSlug(asset) === String(network).toLowerCase(),
  );
