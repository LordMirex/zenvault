import { useState } from 'react';
import { ArrowUpRight, CheckCircle2, Search, ShieldCheck, Wallet } from 'lucide-react';
import { walletAssets, withdrawalActivity } from '../data/wallet';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { formatNumber, formatUsd } from '../lib/format';
import { apiRequest } from '../lib/api';

type WithdrawalMethod = 'external' | 'payid';

const statusClasses: Record<'Completed' | 'Pending' | 'Review', string> = {
  Completed: 'border-success/20 bg-success/10 text-success',
  Pending: 'border-primary/20 bg-primary/10 text-primary',
  Review: 'border-danger/20 bg-danger/10 text-danger',
};

export const Withdraw = () => {
  const { refreshBootstrap } = useAuth();
  const { branding } = useBranding();
  const [query, setQuery] = useState('');
  const [method, setMethod] = useState<WithdrawalMethod>('external');
  const [selectedAssetId, setSelectedAssetId] = useState(walletAssets[0]!.id);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [passcode, setPasscode] = useState('');
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const filteredAssets = walletAssets.filter((asset) => {
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
    walletAssets[0]!;

  const amountNumber = Number.parseFloat(amount) || 0;
  const feeAmount = method === 'external' ? selectedAsset.withdrawFee : 0;
  const totalDebit = amountNumber > 0 ? amountNumber + feeAmount : 0;
  const totalUsd = totalDebit * selectedAsset.price;
  const canSubmit =
    recipient.trim().length > 0 &&
    amountNumber >= selectedAsset.minimumWithdrawal &&
    totalDebit <= selectedAsset.balance &&
    passcode.length === 6;

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setError('');
    setSuccessMessage('');
    setIsProcessing(true);

    try {
      const response = await apiRequest<{ message: string }>('/api/client/withdrawals', {
        method: 'POST',
        body: JSON.stringify({
          assetId: selectedAsset.id,
          method,
          recipient,
          amount: amountNumber,
          passcode,
          note,
        }),
      });

      await refreshBootstrap();
      setIsProcessing(false);
      setSuccessMessage(response.message);
      setAmount('');
      setRecipient('');
      setPasscode('');
      setNote('');
    } catch (caughtError) {
      setIsProcessing(false);
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to submit transfer.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="rounded-[2rem] border border-gray-800 bg-gradient-to-br from-dark-800 via-dark-900 to-dark-900 p-6 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Withdraw Assets</p>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                Route outbound transfers with passcode, fee preview, and destination checks
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-gray-400 md:text-base">
                Choose an asset, select the payout rail, and confirm the final debit before broadcast.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              { id: 'external', label: 'External Wallet', detail: 'Blockchain transfer' },
              { id: 'payid', label: `${branding.siteName} PayID`, detail: 'Internal instant payout' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMethod(item.id as WithdrawalMethod)}
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
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-gray-800 bg-dark-900 p-5 md:p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Find an asset to send"
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
                    <p className="mt-1 text-xs text-gray-500">Min send {formatNumber(asset.minimumWithdrawal, 8)}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-gray-700 bg-dark-800">
                <img src={selectedAsset.icon} alt={selectedAsset.name} className="h-9 w-9 object-contain" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Transfer Form</p>
                <h3 className="mt-1 text-2xl font-black text-white">
                  {selectedAsset.name} ({selectedAsset.symbol})
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  {method === 'external' ? 'Broadcast to an on-chain address' : `Send instantly to a verified ${branding.siteName} PayID`}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
                  {method === 'external' ? 'Destination Address' : 'Recipient PayID'}
                </label>
                <input
                  value={recipient}
                  onChange={(event) => setRecipient(event.target.value)}
                  placeholder={method === 'external' ? `Enter ${selectedAsset.network} address` : 'recipient@wallet'}
                  className="w-full rounded-2xl border border-gray-800 bg-dark-800 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-primary/50 focus:outline-none"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Amount</label>
                  <input
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    type="number"
                    min={selectedAsset.minimumWithdrawal}
                    step="any"
                    placeholder="0.00"
                    className="w-full rounded-2xl border border-gray-800 bg-dark-800 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-primary/50 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setAmount(Math.max(selectedAsset.balance - feeAmount, 0).toString())}
                  className="mt-6 rounded-2xl border border-gray-800 bg-dark-800 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-primary transition-colors hover:bg-dark-800/60"
                >
                  Max Balance
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">6-digit Passcode</label>
                <input
                  value={passcode}
                  onChange={(event) => setPasscode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                  placeholder="Enter passcode"
                  className="w-full rounded-2xl border border-gray-800 bg-dark-800 px-4 py-3 text-sm tracking-[0.35em] text-white placeholder:text-gray-500 focus:border-primary/50 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Desk Note</label>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={3}
                  placeholder="Optional internal reference"
                  className="w-full rounded-2xl border border-gray-800 bg-dark-800 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-primary/50 focus:outline-none"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white">Transfer Preview</h3>
              <Wallet className="text-primary" size={18} />
            </div>

            <div className="mt-5 space-y-4 rounded-[1.75rem] border border-gray-800 bg-dark-800/70 p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Sending</span>
                <span className="font-bold text-white">
                  {amountNumber > 0 ? `${formatNumber(amountNumber, 8)} ${selectedAsset.symbol}` : `0 ${selectedAsset.symbol}`}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Transfer Fee</span>
                <span className="font-bold text-white">
                  {feeAmount > 0 ? `${formatNumber(feeAmount, 8)} ${selectedAsset.symbol}` : 'Free'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Destination</span>
                <span className="max-w-[220px] text-right font-mono text-xs text-white">
                  {recipient || 'No recipient entered'}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-800 pt-4 text-sm">
                <span className="text-gray-500">Estimated Debit</span>
                <span className="text-lg font-black text-white">
                  {totalDebit > 0 ? `${formatNumber(totalDebit, 8)} ${selectedAsset.symbol}` : `0 ${selectedAsset.symbol}`}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">USD Equivalent</span>
                <span className="font-bold text-primary">{formatUsd(totalUsd)}</span>
              </div>
            </div>

            <div className="mt-5 flex gap-3 rounded-[1.5rem] border border-success/20 bg-success/10 p-4">
              <ShieldCheck className="mt-0.5 shrink-0 text-success" size={18} />
              <div>
                <p className="text-sm font-bold text-white">Policy Check</p>
                <p className="mt-1 text-sm text-gray-400">
                  Transfers above the configured desk threshold are automatically queued for manual approval.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || isProcessing}
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-[1.5rem] px-5 py-4 text-sm font-black uppercase tracking-[0.16em] transition-colors ${
                !canSubmit || isProcessing
                  ? 'cursor-not-allowed border border-gray-800 bg-dark-800 text-gray-500'
                  : 'bg-primary text-dark-900 hover:bg-yellow-400'
              }`}
            >
              {isProcessing ? 'Authorizing Transfer...' : 'Submit Transfer'}
              {!isProcessing && <ArrowUpRight size={18} />}
            </button>

            {successMessage && (
              <div className="mt-4 flex gap-3 rounded-[1.5rem] border border-success/20 bg-success/10 p-4">
                <CheckCircle2 className="mt-0.5 shrink-0 text-success" size={18} />
                <div>
                  <p className="text-sm font-bold text-white">Transfer queued successfully</p>
                  <p className="mt-1 text-sm text-gray-400">{successMessage}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-[1.5rem] border border-danger/20 bg-danger/10 p-4 text-sm text-danger">
                {error}
              </div>
            )}
          </section>

          <section className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white">Recent Outgoing Activity</h3>
              <span className="text-xs text-gray-500">Today</span>
            </div>
            <div className="mt-4 space-y-3">
              {withdrawalActivity.map((item) => (
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
