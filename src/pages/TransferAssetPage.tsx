import { useMemo, useState } from 'react';
import { ArrowRightLeft, CheckCircle2, Copy, QrCode, Share2 } from 'lucide-react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { apiRequest } from '../lib/api';
import { formatNumber, formatUsd, truncateMiddle } from '../lib/format';
import { findWalletAssetByRoute } from '../lib/walletRoutes';


export const TransferAssetPage = () => {
  const { symbol, network } = useParams();
  const location = useLocation();
  const { refreshBootstrap, clientWalletAssets } = useAuth();
  const { branding } = useBranding();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [passcode, setPasscode] = useState('');
  const [note, setNote] = useState('');
  const [copiedValue, setCopiedValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const asset = symbol && network ? findWalletAssetByRoute(symbol, network, clientWalletAssets) : undefined;
  const method = location.pathname.includes('/payid/') ? 'payid' : 'external';
  const mode = location.pathname.includes('/receive/') ? 'receive' : 'send';

  const feeAmount = method === 'external' ? Number(asset?.withdrawFee ?? 0) : 0;
  const amountNumber = Number.parseFloat(amount) || 0;
  const maxAmount = Math.max(Number(asset?.balance ?? 0) - feeAmount, 0);
  const totalDebit = amountNumber > 0 ? amountNumber + feeAmount : 0;
  const previewUsd = totalDebit * Number(asset?.price ?? 0);

  const quickPercents = useMemo(() => [25, 50, 75, 100], []);

  if (!asset) {
    return <Navigate to={mode === 'send' ? `/app/send/${method}` : `/app/receive/${method}`} replace />;
  }

  const copyValue = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedValue(value);
    window.setTimeout(() => {
      setCopiedValue((current) => (current === value ? '' : current));
    }, 1800);
  };

  const handleSend = async () => {
    setError('');
    setSuccess('');

    if (!recipient.trim() || amountNumber < asset.minimumWithdrawal || passcode.length !== 6) {
      setError('Recipient, amount, and a 6-digit passcode are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = await apiRequest<{ message: string }>('/api/client/withdrawals', {
        method: 'POST',
        body: JSON.stringify({
          assetId: asset.id,
          method,
          recipient,
          amount: amountNumber,
          passcode,
          note,
        }),
      });

      await refreshBootstrap();
      setSuccess(payload.message);
      setRecipient('');
      setAmount('');
      setPasscode('');
      setNote('');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to submit the transfer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (mode === 'receive') {
    const destination = method === 'external' ? asset.address : asset.payId;

    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <section className="rounded-[2rem] border border-gray-800 bg-gradient-to-br from-dark-800 via-dark-900 to-dark-900 p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Receive {asset.symbol}</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
            {method === 'external' ? `Receive ${asset.symbol} on ${asset.network}` : `Receive ${asset.symbol} via PayID`}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">
            Copy the active destination, share it with your sender, and use the correct settlement rail.
          </p>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
            <div className="flex min-h-[320px] items-center justify-center rounded-[1.75rem] border border-dashed border-gray-700 bg-dark-800">
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                  <QrCode className="h-8 w-8" />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Scan To Receive</p>
                <p className="text-lg font-black text-white">{asset.symbol}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-gray-700 bg-dark-800">
                  <img src={asset.icon} alt={asset.name} className="h-9 w-9 object-contain" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
                    {method === 'external' ? 'Wallet Address' : 'PayID Alias'}
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-white">{asset.name}</h3>
                  <p className="mt-1 text-sm text-gray-400">{asset.network} settlement rail</p>
                </div>
              </div>

              <div className="mt-6 rounded-[1.75rem] border border-gray-800 bg-dark-800/70 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Active Destination</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void copyValue(destination)}
                      className="rounded-full border border-gray-700 p-2 text-gray-400 transition-colors hover:text-white"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void copyValue(destination)}
                      className="rounded-full border border-gray-700 p-2 text-gray-400 transition-colors hover:text-white"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-4 break-all font-mono text-sm leading-7 text-white">{destination}</p>
                <p className="mt-2 text-xs text-gray-500">
                  {method === 'external'
                    ? truncateMiddle(destination)
                    : `Only verified ${branding.siteName} accounts should use this PayID alias.`}
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-gray-800 bg-dark-800/60 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Minimum Deposit</p>
                  <p className="mt-2 text-lg font-black text-white">
                    {formatNumber(asset.minimumDeposit, 8)} {asset.symbol}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-gray-800 bg-dark-800/60 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Confirmations</p>
                  <p className="mt-2 text-lg font-black text-white">{asset.confirmations}</p>
                </div>
              </div>

              {copiedValue && (
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-success">
                  Destination copied to clipboard
                </p>
              )}
            </section>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <section className="rounded-[2rem] border border-gray-800 bg-gradient-to-br from-dark-800 via-dark-900 to-dark-900 p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Send {asset.symbol}</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
          {method === 'external' ? `Send ${asset.symbol} to External Wallet` : `Send ${asset.symbol} via PayID`}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">
          Confirm the destination, choose the amount, and review the final debit before the transfer is queued.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-gray-700 bg-dark-800">
              <img src={asset.icon} alt={asset.name} className="h-9 w-9 object-contain" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Transfer Form</p>
              <h3 className="mt-1 text-2xl font-black text-white">
                {asset.name} ({asset.symbol})
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                {asset.network} - Available {asset.balance.toLocaleString()} {asset.symbol}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
                {method === 'external' ? 'Destination Address' : 'Recipient PayID'}
              </span>
              <input
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
                placeholder={method === 'external' ? `Enter ${asset.network} address` : 'recipient@wallet'}
                className="w-full rounded-2xl border border-gray-800 bg-dark-800 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-primary/50 focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Amount</span>
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                type="number"
                step="any"
                min={asset.minimumWithdrawal}
                placeholder="0.00"
                className="w-full rounded-2xl border border-gray-800 bg-dark-800 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-primary/50 focus:outline-none"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {quickPercents.map((percent) => (
                <button
                  key={percent}
                  type="button"
                  onClick={() => setAmount(((maxAmount * percent) / 100).toFixed(8))}
                  className="rounded-full border border-gray-700 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-gray-300 transition-colors hover:border-primary/40 hover:text-white"
                >
                  {percent}%
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount(maxAmount.toFixed(8))}
                className="rounded-full border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary"
              >
                Max
              </button>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-gray-500">6-Digit Passcode</span>
              <input
                value={passcode}
                onChange={(event) => setPasscode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                placeholder="123456"
                className="w-full rounded-2xl border border-gray-800 bg-dark-800 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-primary/50 focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Internal Note</span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                placeholder="Add a memo for the transfer queue"
                className="w-full rounded-2xl border border-gray-800 bg-dark-800 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-primary/50 focus:outline-none"
              />
            </label>
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Transfer Preview</h3>
              <ArrowRightLeft className="h-5 w-5 text-primary" />
            </div>

            <div className="mt-5 space-y-4 rounded-[1.75rem] border border-gray-800 bg-dark-800/60 p-5">
              <InfoRow label="Recipient" value={recipient || 'Not entered yet'} />
              <InfoRow label="Amount" value={`${formatNumber(amountNumber, 8)} ${asset.symbol}`} />
              <InfoRow label="Transfer Fee" value={`${formatNumber(feeAmount, 8)} ${asset.symbol}`} />
              <InfoRow label="Total Debit" value={`${formatNumber(totalDebit, 8)} ${asset.symbol}`} />
              <InfoRow label="Estimated USD" value={formatUsd(previewUsd)} />
            </div>

            {success && (
              <div className="mt-4 flex items-center gap-3 rounded-[1.5rem] border border-success/20 bg-success/10 p-4 text-success">
                <CheckCircle2 className="h-5 w-5" />
                <p className="text-sm font-semibold">{success}</p>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-[1.5rem] border border-danger/20 bg-danger/10 p-4 text-sm font-semibold text-danger">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => void handleSend()}
              className="mt-6 inline-flex w-full items-center justify-center rounded-[1.5rem] bg-primary px-5 py-4 text-sm font-black text-dark-900 transition-colors hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Submitting Transfer...' : 'Submit Transfer'}
            </button>
          </section>
        </div>
      </section>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4 border-b border-gray-800 pb-3 text-sm last:border-b-0 last:pb-0">
    <span className="text-gray-500">{label}</span>
    <span className="text-right font-semibold text-white">{value}</span>
  </div>
);
