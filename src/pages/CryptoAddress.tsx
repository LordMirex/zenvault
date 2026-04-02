import { useState } from 'react';
import { Copy, Plus, Search } from 'lucide-react';
import { addressBookEntries, walletAssets } from '../data/wallet';
import { truncateMiddle } from '../lib/format';

type AddressView = 'wallet' | 'contacts';

export const CryptoAddress = () => {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<AddressView>('wallet');
  const [copied, setCopied] = useState<string | null>(null);

  const walletResults = walletAssets.filter((asset) => {
    const search = query.toLowerCase();
    return asset.name.toLowerCase().includes(search) || asset.symbol.toLowerCase().includes(search);
  });

  const contactResults = addressBookEntries.filter((entry) => {
    const search = query.toLowerCase();
    return (
      entry.label.toLowerCase().includes(search) ||
      entry.network.toLowerCase().includes(search) ||
      entry.address.toLowerCase().includes(search)
    );
  });

  const copyValue = async (id: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    window.setTimeout(() => {
      setCopied((current) => (current === id ? null : current));
    }, 1800);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="rounded-[2rem] border border-gray-800 bg-gradient-to-br from-dark-800 via-dark-900 to-dark-900 p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Wallet Addresses</p>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                Review your deposit addresses and trusted withdrawal recipients
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-gray-400 md:text-base">
                Keep address access centralized so operators can copy the correct destination every time.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-[1.5rem] bg-primary px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-dark-900 transition-colors hover:bg-yellow-400"
          >
            <Plus size={18} />
            Add Trusted Contact
          </button>
        </div>
      </section>

      <section className="rounded-[2rem] border border-gray-800 bg-dark-900 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-3">
            {[
              { id: 'wallet', label: 'My Wallet Addresses' },
              { id: 'contacts', label: 'Trusted Contacts' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id as AddressView)}
                className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
                  view === item.id
                    ? 'border-primary/30 bg-primary text-dark-900'
                    : 'border-gray-800 bg-dark-800 text-gray-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search labels, coins, or networks"
              className="w-full rounded-2xl border border-gray-800 bg-dark-800 py-3 pl-11 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-primary/50 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {view === 'wallet' &&
            walletResults.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between gap-4 rounded-[1.75rem] border border-gray-800 bg-dark-800/70 p-4">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gray-700 bg-dark-900">
                    <img src={asset.icon} alt={asset.name} className="h-8 w-8 object-contain" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">
                      {asset.name} ({asset.symbol})
                    </p>
                    <p className="mt-1 truncate font-mono text-xs text-gray-400">{asset.address}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-gray-600">{asset.network}</p>
                  </div>
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => copyValue(asset.id, asset.address)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-800 bg-dark-900 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-gray-300 transition-colors hover:text-white"
                  >
                    <Copy size={14} />
                    Copy
                  </button>
                  {copied === asset.id && <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-success">Copied</p>}
                </div>
              </div>
            ))}

          {view === 'contacts' &&
            contactResults.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-4 rounded-[1.75rem] border border-gray-800 bg-dark-800/70 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">{entry.label}</p>
                  <p className="mt-1 truncate font-mono text-xs text-gray-400">{entry.address}</p>
                  <p className="mt-2 text-xs text-gray-600">
                    {entry.network} - {entry.kind} - {entry.trustedSince}
                  </p>
                </div>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => copyValue(entry.id, entry.address)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-800 bg-dark-900 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-gray-300 transition-colors hover:text-white"
                  >
                    <Copy size={14} />
                    Copy
                  </button>
                  {copied === entry.id && <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-success">Copied</p>}
                </div>
              </div>
            ))}
        </div>

        {((view === 'wallet' && walletResults.length === 0) || (view === 'contacts' && contactResults.length === 0)) && (
          <div className="mt-6 rounded-[1.75rem] border border-dashed border-gray-800 bg-dark-800/40 p-8 text-center">
            <p className="text-sm text-gray-500">
              No {view === 'wallet' ? 'wallet addresses' : 'trusted contacts'} matched {query ? `"${truncateMiddle(query, 14, 0)}"` : 'the current filter'}.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
