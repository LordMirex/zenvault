import { Search, ShieldCheck, CreditCard, Landmark, ArrowRight, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatPercent, formatUsd } from '../lib/format';
import { useBranding } from '../context/BrandingContext';

const filters = ['All', 'Major', 'Stablecoin', 'Fast Settlement', 'EVM'];

export const BuyCrypto = () => {
  const { branding } = useBranding();
  const { clientWalletAssets } = useAuth();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedAssetId, setSelectedAssetId] = useState(clientWalletAssets[0]?.id ?? '');

  const filteredAssets = clientWalletAssets.filter((asset) => {
    const matchesQuery =
      asset.name.toLowerCase().includes(query.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = activeFilter === 'All' || asset.tags.includes(activeFilter);

    return matchesQuery && matchesFilter;
  });

  const selectedAsset =
    filteredAssets.find((asset) => asset.id === selectedAssetId) ??
    filteredAssets[0] ??
    clientWalletAssets[0];

  if (!selectedAsset) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="rounded-[2rem] border border-gray-800 bg-dark-800 p-8 text-center text-gray-500">
          Loading assets...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="rounded-[2rem] border border-gray-800 bg-gradient-to-br from-dark-800 via-dark-900 to-dark-900 p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <Sparkles size={14} />
              Buy Desk
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                Buy crypto with settlement-ready payment rails
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-gray-400 md:text-base">
                Source assets into {branding.siteName} with cards, bank wires, or internal treasury approvals.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-[420px]">
            <div className="rounded-3xl border border-gray-800 bg-dark-900/80 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Min Order</p>
              <p className="mt-2 text-xl font-black text-white">$250</p>
            </div>
            <div className="rounded-3xl border border-gray-800 bg-dark-900/80 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Settlement</p>
              <p className="mt-2 text-xl font-black text-success">Instant</p>
            </div>
            <div className="rounded-3xl border border-gray-800 bg-dark-900/80 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Partners</p>
              <p className="mt-2 text-xl font-black text-white">3 Active</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-[2rem] border border-gray-800 bg-dark-900 p-5 md:p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search BTC, USDT, ETH..."
                className="w-full rounded-2xl border border-gray-800 bg-dark-800 py-3 pl-11 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-primary/50 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
                    activeFilter === filter
                      ? 'border-primary/30 bg-primary text-dark-900'
                      : 'border-gray-800 bg-dark-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {filteredAssets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => setSelectedAssetId(asset.id)}
                className={`flex items-center justify-between rounded-[1.75rem] border p-4 text-left transition-all ${
                  selectedAsset.id === asset.id
                    ? 'border-primary/30 bg-primary/10'
                    : 'border-gray-800 bg-dark-800/80 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-700 bg-dark-900">
                    <img src={asset.icon} alt={asset.name} className="h-8 w-8 object-contain" />
                  </div>
                  <div>
                    <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-white">
                      {asset.symbol}
                      <span className="rounded-full bg-dark-900 px-2 py-1 text-[10px] font-bold text-gray-400">
                        {asset.network}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{asset.name}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-white">{formatUsd(asset.price)}</p>
                  <p className={`mt-1 text-xs font-bold ${asset.change >= 0 ? 'text-success' : 'text-danger'}`}>
                    {formatPercent(asset.change)}
                  </p>
                </div>
              </button>
            ))}

            {filteredAssets.length === 0 && (
              <div className="rounded-[1.75rem] border border-dashed border-gray-800 bg-dark-800/40 p-8 text-center text-sm text-gray-500">
                No assets match that search yet. Try a symbol or clear the filter.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-gray-700 bg-dark-800">
                <img src={selectedAsset.icon} alt={selectedAsset.name} className="h-10 w-10 object-contain" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Selected Asset</p>
                <h3 className="mt-1 text-2xl font-black text-white">
                  {selectedAsset.name} ({selectedAsset.symbol})
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  {formatUsd(selectedAsset.price)} per coin on the current buy desk.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-gray-800 bg-dark-800/80 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">24h Move</p>
                <p className={`mt-2 text-xl font-black ${selectedAsset.change >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatPercent(selectedAsset.change)}
                </p>
              </div>
              <div className="rounded-3xl border border-gray-800 bg-dark-800/80 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Live Network</p>
                <p className="mt-2 text-xl font-black text-white">{selectedAsset.network}</p>
              </div>
            </div>

            <button
              type="button"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-[1.5rem] bg-primary px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-dark-900 transition-colors hover:bg-yellow-400"
            >
              Continue Purchase
              <ArrowRight size={18} />
            </button>
          </section>

          <section className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white">Payment Rails</h3>
            <div className="mt-4 space-y-3">
              {[
                {
                  label: 'Instant Card',
                  detail: 'Visa and Mastercard settlement under 60 seconds.',
                  icon: CreditCard,
                },
                {
                  label: 'Bank Wire',
                  detail: 'Treasury-approved business transfers in supported regions.',
                  icon: Landmark,
                },
                {
                  label: 'Compliance Checked',
                  detail: 'Screened for KYC, source-of-funds, and limits.',
                  icon: ShieldCheck,
                },
              ].map((item) => (
                <div key={item.label} className="flex gap-4 rounded-3xl border border-gray-800 bg-dark-800/70 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{item.label}</p>
                    <p className="mt-1 text-sm text-gray-500">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};
