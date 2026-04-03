import { useState } from 'react';
import { Copy, QrCode, Search, Share2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatNumber, truncateMiddle } from '../lib/format';
import { useBranding } from '../context/BrandingContext';
import { makeQrCodeUrl } from '../lib/qr';

type DepositMethod = 'external' | 'payid';

const statusClasses: Record<'Completed' | 'Pending' | 'Review', string> = {
  Completed: 'border-success/20 bg-success/10 text-success',
  Pending: 'border-primary/20 bg-primary/10 text-primary',
  Review: 'border-danger/20 bg-danger/10 text-danger',
};

export const Deposit = () => {
  const { branding } = useBranding();
  const { clientWalletAssets, clientDepositActivity } = useAuth();
  const [query, setQuery] = useState('');
  const [method, setMethod] = useState<DepositMethod>('external');
  const [selectedAssetId, setSelectedAssetId] = useState(clientWalletAssets[0]?.id ?? '');
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const filteredAssets = clientWalletAssets.filter((asset) => {
    const search = query.toLowerCase();

    return (
      asset.name.toLowerCase().includes(search) ||
      asset.symbol.toLowerCase().includes(search) ||
      asset.network.toLowerCase().includes(search)
    );
  });

  const selectedAsset =
    filteredAssets.find((asset) => asset.id === selectedAssetId) ??
    filteredAssets[0] ??
    clientWalletAssets[0];

  const destinationValue = method === 'external' ? selectedAsset.address : selectedAsset.payId;
  const qrImageUrl = makeQrCodeUrl(destinationValue);

  const activity = clientDepositActivity
    .map((item) => ({
      ...item,
      asset: clientWalletAssets.find((asset) => asset.id === item.assetId),
    }))
    .filter((item) => item.asset !== undefined);

  const copyValue = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedValue(label);
    window.setTimeout(() => {
      setCopiedValue((current) => (current === label ? null : current));
    }, 1800);
  };

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
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Deposit Assets</p>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                Fund {branding.siteName} from external chains or internal PayID
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-gray-400 md:text-base">
                Pick an asset, confirm the rail, and share the destination details with your counterparty.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
              {[
                { id: 'external', label: 'External Wallet', detail: 'On-chain address' },
                { id: 'payid', label: `${branding.siteName} PayID`, detail: 'Internal instant transfer' },
              ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMethod(item.id as DepositMethod)}
                className={`rounded-[1.5rem] border px-5 py-4 text-left transition-colors ${
                  method === item.id
                    ? 'border-primary/30 bg-primary text-dark-900'
                    : 'border-gray-800 bg-dark-900/80 text-gray-300 hover:text-white'
                }`}
              >
                <p className="text-sm font-black uppercase tracking-[0.16em]">{item.label}</p>
                <p className={`mt-1 text-xs ${method === item.id ? 'text-dark-900/70' : 'text-gray-500'}`}>
                  {item.detail}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-gray-800 bg-dark-900 p-5 md:p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by coin or network"
              className="w-full rounded-2xl border border-gray-800 bg-dark-800 py-3 pl-11 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-primary/50 focus:outline-none"
            />
          </div>

          <div className="mt-6 space-y-3">
            {filteredAssets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => setSelectedAssetId(asset.id)}
                className={`flex w-full items-center justify-between rounded-[1.75rem] border p-4 text-left transition-all ${
                  selectedAsset.id === asset.id
                    ? 'border-primary/30 bg-primary/10'
                    : 'border-gray-800 bg-dark-800/70 hover:border-gray-700'
                }`}
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
                <div className="text-right">
                  <p className="text-sm font-bold text-white">
                    {formatNumber(asset.balance, asset.balance > 1000 ? 2 : 6)} {asset.symbol}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{asset.confirmations}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-gray-700 bg-dark-800">
                <img src={selectedAsset.icon} alt={selectedAsset.name} className="h-9 w-9 object-contain" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                  {method === 'external' ? 'Deposit Address' : 'Internal PayID'}
                </p>
                <h3 className="mt-1 text-2xl font-black text-white">
                  {selectedAsset.name} ({selectedAsset.symbol})
                </h3>
                <p className="mt-1 text-sm text-gray-400">{selectedAsset.network} settlement rail enabled</p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.75rem] border border-gray-800 bg-dark-800/70 p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
                  {method === 'external' ? 'Wallet Address' : 'Receive PayID'}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyValue(method === 'external' ? 'address' : 'payid', destinationValue)}
                    className="rounded-full border border-gray-700 p-2 text-gray-400 transition-colors hover:text-white"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => copyValue('share', destinationValue)}
                    className="rounded-full border border-gray-700 p-2 text-gray-400 transition-colors hover:text-white"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
                <div className="flex min-h-[220px] items-center justify-center rounded-[1.5rem] border border-dashed border-gray-700 bg-dark-900">
                  <div className="space-y-3 text-center">
                    {qrImageUrl ? (
                      <img
                        src={qrImageUrl}
                        alt={`QR code for ${selectedAsset.symbol} ${method === 'external' ? 'address' : 'PayID'}`}
                        loading="lazy"
                        className="mx-auto h-40 w-40 rounded-[1.25rem] object-contain"
                      />
                    ) : (
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                        <QrCode size={32} />
                      </div>
                    )}
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Scan to fund</p>
                    <p className="text-lg font-black text-white">{selectedAsset.symbol}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[1.5rem] border border-gray-800 bg-dark-900/80 p-4">
                    <p className="break-all font-mono text-sm leading-relaxed text-white">
                      {method === 'external' ? selectedAsset.address : selectedAsset.payId}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      {method === 'external'
                        ? truncateMiddle(selectedAsset.address)
                        : `Only ${branding.siteName} PayID senders can settle instantly to this alias.`}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-gray-800 bg-dark-900/80 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Minimum Deposit</p>
                      <p className="mt-2 text-lg font-black text-white">
                        {formatNumber(selectedAsset.minimumDeposit, 8)} {selectedAsset.symbol}
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] border border-gray-800 bg-dark-900/80 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Confirmations</p>
                      <p className="mt-2 text-lg font-black text-white">{selectedAsset.confirmations}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 rounded-[1.5rem] border border-success/20 bg-success/10 p-4">
                    <ShieldCheck className="mt-0.5 shrink-0 text-success" size={18} />
                    <div>
                      <p className="text-sm font-bold text-white">Deposit Safety</p>
                      <p className="mt-1 text-sm text-gray-400">
                        Send only {selectedAsset.symbol} on the {selectedAsset.network} rail to prevent lost funds.
                      </p>
                    </div>
                  </div>

                  {copiedValue && (
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-success">
                      {copiedValue} copied to clipboard
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white">Recent Incoming Activity</h3>
              <span className="text-xs text-gray-500">Last 24 hours</span>
            </div>
            <div className="mt-4 space-y-3">
              {activity.map((item) => (
                <div key={item.id} className="rounded-[1.5rem] border border-gray-800 bg-dark-800/70 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-white">
                        {item.amount} - {item.method}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">{item.destination}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-gray-600">{item.time}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${statusClasses[item.status]}`}>
                      {item.status}
                    </span>
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
