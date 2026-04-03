import { useState } from 'react';
import { Bolt, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ManageCrypto = () => {
  const { toggleClientAsset, clientWalletAssets } = useAuth();
  const [query, setQuery] = useState('');
  const [activeAssetId, setActiveAssetId] = useState('');

  const filteredAssets = clientWalletAssets.filter((asset) => {
    const search = query.toLowerCase();

    return (
      asset.name.toLowerCase().includes(search) ||
      asset.symbol.toLowerCase().includes(search) ||
      asset.network.toLowerCase().includes(search)
    );
  });

  const visibleCount = clientWalletAssets.filter((asset) => asset.enabledByDefault).length;
  const hiddenCount = clientWalletAssets.length - visibleCount;

  const handleToggle = async (assetId: string) => {
    setActiveAssetId(assetId);
    try {
      await toggleClientAsset(assetId);
    } finally {
      setActiveAssetId('');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="rounded-[2rem] border border-gray-800 bg-gradient-to-br from-dark-800 via-dark-900 to-dark-900 p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Manage Assets</p>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                Choose which live assets should appear on your dashboard
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-gray-400 md:text-base">
                The admin controls which coins are active across the platform. Here, you only decide which of those active
                coins should be shown in your personal dashboard portfolio.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-gray-800 bg-dark-900/80 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Visible</p>
              <p className="mt-2 text-2xl font-black text-primary">{visibleCount}</p>
            </div>
            <div className="rounded-3xl border border-gray-800 bg-dark-900/80 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Hidden</p>
              <p className="mt-2 text-2xl font-black text-white">{hiddenCount}</p>
            </div>
            <div className="rounded-3xl border border-gray-800 bg-dark-900/80 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Live Assets</p>
              <p className="mt-2 text-2xl font-black text-success">{clientWalletAssets.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2rem] border border-gray-800 bg-dark-900 p-5 md:p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by coin, symbol, or network"
              className="w-full rounded-2xl border border-gray-800 bg-dark-800 py-3 pl-11 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-primary/50 focus:outline-none"
            />
          </div>

          <div className="mt-6 space-y-3">
            {filteredAssets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between rounded-[1.75rem] border border-gray-800 bg-dark-800/70 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-700 bg-dark-900">
                    <img src={asset.icon} alt={asset.name} className="h-8 w-8 object-contain" />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.16em] text-white">{asset.symbol}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {asset.name} - {asset.network}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {asset.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="rounded-full border border-gray-700 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={asset.enabledByDefault}
                  disabled={activeAssetId === asset.id}
                  onClick={() => void handleToggle(asset.id)}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                    asset.enabledByDefault ? 'bg-primary' : 'bg-gray-700'
                  } ${activeAssetId === asset.id ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      asset.enabledByDefault ? 'translate-x-8' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}

            {filteredAssets.length === 0 && (
              <div className="rounded-[1.75rem] border border-dashed border-gray-800 bg-dark-800/40 p-8 text-center text-sm text-gray-500">
                No active assets matched that search.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Bolt size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Dashboard Rules</p>
                <p className="text-sm text-gray-500">Your visible coins define the dashboard portfolio total.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {[
                `${visibleCount} asset${visibleCount === 1 ? '' : 's'} currently contribute to your dashboard portfolio`,
                'Hidden assets stay active in the wallet, but they no longer appear on the main dashboard table',
                'Live prices continue updating for all active assets the admin keeps enabled',
              ].map((detail) => (
                <div key={detail} className="rounded-[1.5rem] border border-gray-800 bg-dark-800/70 p-4 text-sm text-gray-400">
                  {detail}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-success" size={18} />
              <div>
                <p className="text-sm font-bold text-white">Visibility Only</p>
                <p className="mt-1 text-sm text-gray-400">
                  Toggling an asset here does not remove the wallet itself. It only controls whether that coin shows on
                  your dashboard and counts toward the dashboard portfolio summary.
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};
