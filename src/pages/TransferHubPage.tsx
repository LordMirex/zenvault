import { useMemo, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { formatCompactUsd } from '../lib/format';
import { getReceiveAssetPath, getSendAssetPath } from '../lib/walletRoutes';
import { useBranding } from '../context/BrandingContext';
import { useAuth } from '../context/AuthContext';

export const TransferHubPage = () => {
  const location = useLocation();
  const { branding } = useBranding();
  const { clientWalletAssets } = useAuth();
  const [query, setQuery] = useState('');
  const method = location.pathname.includes('/payid') ? 'payid' : 'external';
  const mode = location.pathname.includes('/receive/') ? 'receive' : 'send';

  const filteredAssets = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) {
      return clientWalletAssets;
    }

    return clientWalletAssets.filter((asset) =>
      [asset.symbol, asset.name, asset.network].some((value) => value.toLowerCase().includes(search)),
    );
  }, [query, clientWalletAssets]);

  const title =
    mode === 'send'
      ? method === 'payid'
        ? 'Send via PayID'
        : 'Send to External Wallet'
      : method === 'payid'
        ? 'Receive via PayID'
        : 'Receive from External Wallet';

  const description =
    mode === 'send'
      ? method === 'payid'
        ? `Choose an asset and route an internal instant transfer to another verified ${branding.siteName} PayID.`
        : 'Choose an asset and open the outbound wallet transfer screen with fee and balance preview.'
      : method === 'payid'
        ? `Choose an asset to expose your internal settlement alias and share it with another ${branding.siteName} account.`
        : 'Choose an asset to display its deposit address, network rail, and recent incoming activity.';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <section className="rounded-[2rem] border border-gray-800 bg-gradient-to-br from-dark-800 via-dark-900 to-dark-900 p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
          {mode === 'send' ? 'Send Assets' : 'Receive Assets'}
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">{title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">{description}</p>
      </section>

      <section className="rounded-[2rem] border border-gray-800 bg-dark-900 p-5 md:p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by asset or network"
            className="w-full rounded-2xl border border-gray-800 bg-dark-800 py-3 pl-11 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-primary/50 focus:outline-none"
          />
        </div>

        <div className="mt-6 grid gap-3">
          {filteredAssets.map((asset) => {
            const to = mode === 'send' ? getSendAssetPath(asset, method) : getReceiveAssetPath(asset, method);

            return (
              <Link
                key={`${mode}-${method}-${asset.id}`}
                to={to}
                className="flex items-center justify-between rounded-[1.75rem] border border-gray-800 bg-dark-800/60 p-4 transition-colors hover:border-gray-700 hover:bg-dark-800"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-700 bg-dark-900">
                    <img src={asset.icon} alt={asset.name} className="h-8 w-8 object-contain" />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.16em] text-white">{asset.symbol}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {asset.name} - {asset.network}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden text-right md:block">
                    <p className="text-sm font-semibold text-white">
                      {asset.balance.toLocaleString()} {asset.symbol}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">{formatCompactUsd(asset.valueUsd)}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 text-gray-400">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};
