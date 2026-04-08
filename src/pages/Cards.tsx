import { useState } from 'react';
import { Clock3, CreditCard, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatUsd } from '../lib/format';
import type { WalletCardRecord } from '../data/wallet';

export const Cards = () => {
  const {
    clientCards,
    clientCardRequests,
    clientCardApplicationFeeUsd,
    clientProfile,
    clientWalletAssets,
    submitCardApplication,
    user,
  } = useAuth();
  const [holderName, setHolderName] = useState(clientProfile?.name ?? user?.name ?? '');
  const [brand, setBrand] = useState<'Visa' | 'Mastercard'>('Visa');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const hasPendingRequest = clientCardRequests.length > 0;
  const fundingAsset =
    clientWalletAssets.find((asset) => asset.symbol === 'USDT' || asset.symbol === 'USDC') ??
    clientWalletAssets.find((asset) => asset.balance > 0) ??
    clientWalletAssets[0];

  const handleApply = async () => {
    setFeedback('');
    setError('');

    if (!holderName.trim()) {
      setError('Card holder name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const message = await submitCardApplication({
        holderName: holderName.trim(),
        brand,
        note: note.trim(),
      });
      setFeedback(message);
      setNote('');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to submit the card request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="rounded-[2rem] border border-gray-800 bg-gradient-to-br from-dark-800 via-dark-900 to-dark-900 p-6 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <Sparkles size={14} />
              Cards
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                Your Cards
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-gray-400 md:text-base">
                Apply for a Visa or Mastercard, track pending requests, and view your issued card details all in one place.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 xl:w-[400px]">
            <MetricTile label="Application Fee" value={formatUsd(clientCardApplicationFeeUsd)} accent="text-primary" />
            <MetricTile label="Issued Cards" value={String(clientCards.length)} accent="text-white" />
            <MetricTile label="Pending" value={String(clientCardRequests.length)} accent="text-success" />
          </div>
        </div>
      </section>

      {feedback && (
        <section className="rounded-[1.6rem] border border-success/20 bg-success/10 p-4 text-sm font-semibold text-success">
          {feedback}
        </section>
      )}

      {error && (
        <section className="rounded-[1.6rem] border border-danger/20 bg-danger/10 p-4 text-sm font-semibold text-danger">
          {error}
        </section>
      )}

      {clientCards.length > 0 && (
        <section>
          <h3 className="mb-4 text-lg font-bold text-white">Issued Cards</h3>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {clientCards.map((card) => (
              <IssuedCardTile key={card.id} card={card} />
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Apply for a Card</h3>
              <p className="mt-1 text-sm text-gray-500">
                Submit a request below. Our team will review and issue your card.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Holder Name</span>
              <input
                value={holderName}
                onChange={(event) => setHolderName(event.target.value)}
                placeholder="Full name as it appears on the card"
                className="w-full rounded-2xl border border-gray-800 bg-dark-800 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-primary/50 focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Card Network</span>
              <select
                value={brand}
                onChange={(event) => setBrand(event.target.value === 'Mastercard' ? 'Mastercard' : 'Visa')}
                className="w-full rounded-2xl border border-gray-800 bg-dark-800 px-4 py-3 text-sm text-white focus:border-primary/50 focus:outline-none"
              >
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
              </select>
            </label>

            <div className="rounded-[1.5rem] border border-gray-800 bg-dark-800/70 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Application Fee</p>
              <p className="mt-2 text-lg font-black text-white">{formatUsd(clientCardApplicationFeeUsd)}</p>
              <p className="mt-1 text-sm text-gray-500">
                {fundingAsset ? `Charged from your ${fundingAsset.symbol} wallet.` : 'No funded wallet found.'}
              </p>
            </div>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Note (optional)</span>
              <textarea
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Any additional notes (optional)"
                className="w-full rounded-2xl border border-gray-800 bg-dark-800 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-primary/50 focus:outline-none"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-4 rounded-[1.5rem] border border-success/20 bg-success/10 p-4 md:flex-row md:items-start">
            <ShieldCheck className="mt-0.5 shrink-0 text-success" size={18} />
            <p className="text-sm text-gray-400">
              Once submitted, our team will review your application and issue your card. You will receive an email confirmation when it is ready.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleApply()}
            disabled={isSubmitting || hasPendingRequest || !fundingAsset}
            className={`mt-6 flex w-full items-center justify-center rounded-[1.5rem] px-5 py-4 text-sm font-black uppercase tracking-[0.16em] transition-colors ${
              isSubmitting || hasPendingRequest || !fundingAsset
                ? 'cursor-not-allowed border border-gray-800 bg-dark-800 text-gray-500'
                : 'bg-primary text-dark-900 hover:bg-yellow-400'
            }`}
          >
            {isSubmitting
              ? 'Submitting...'
              : hasPendingRequest
              ? 'Request Already In Review'
              : 'Apply For Card'}
          </button>
        </div>

        <div className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
          <div className="flex items-center gap-3 mb-5">
            <Clock3 className="text-primary" size={18} />
            <div>
              <h3 className="text-lg font-semibold text-white">Pending Requests</h3>
              <p className="mt-1 text-sm text-gray-500">Requests currently under review.</p>
            </div>
          </div>

          {clientCardRequests.length === 0 ? (
            <div className="rounded-[1.5rem] border border-gray-800 bg-dark-800/60 p-5 text-sm text-gray-500">
              No pending card requests at this time.
            </div>
          ) : (
            <div className="space-y-3">
              {clientCardRequests.map((request) => (
                <div key={request.id} className="rounded-[1.5rem] border border-gray-800 bg-dark-800/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-white">{request.brand} card</p>
                      <p className="mt-1 text-sm text-gray-500">{request.holderName || holderName || 'Pending holder'}</p>
                    </div>
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                      In Review
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 grid-cols-2">
                    <InfoTile label="Requested" value={request.requestedAt || 'Pending'} />
                    <InfoTile label="Application Fee" value={formatUsd(request.applicationFeeUsd ?? clientCardApplicationFeeUsd)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const IssuedCardTile = ({ card }: { card: WalletCardRecord }) => {
  const [showSensitive, setShowSensitive] = useState(false);
  const hasSensitive = card.expiry || card.cvv;

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-gray-700 bg-gradient-to-br from-gray-800 via-dark-800 to-dark-900 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-bold text-white">{card.label}</p>
          <p className="mt-1 text-sm text-gray-400">{card.brand} •••• {card.last4}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] border ${
          card.status === 'Active'
            ? 'border-success/30 bg-success/10 text-success'
            : card.status === 'Frozen'
            ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
            : 'border-primary/20 bg-primary/10 text-primary'
        }`}>
          {card.status}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <InfoTile label="Spend Limit" value={formatUsd(card.spendLimitUsd)} />
        <InfoTile label="Utilized" value={formatUsd(card.utilizationUsd)} />
        {card.expiry && (
          <InfoTile
            label="Expires"
            value={showSensitive ? card.expiry : '••/••'}
          />
        )}
        {card.cvv && (
          <InfoTile
            label="CVV"
            value={showSensitive ? card.cvv : '•••'}
          />
        )}
        {card.billingAddress && (
          <div className="col-span-2 rounded-[1.2rem] border border-gray-800 bg-dark-900/70 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Billing Address</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {showSensitive ? card.billingAddress : '••••••••'}
              {card.zipCode && showSensitive ? `, ${card.zipCode}` : ''}
            </p>
          </div>
        )}
        {card.issuedAt && (
          <div className="col-span-2">
            <InfoTile label="Issued" value={card.issuedAt} />
          </div>
        )}
      </div>

      {hasSensitive && (
        <button
          type="button"
          onClick={() => setShowSensitive((prev) => !prev)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-[1.3rem] border border-gray-700 bg-dark-800/80 py-2.5 text-xs font-bold text-gray-300 hover:text-white transition-colors"
        >
          {showSensitive ? <EyeOff size={14} /> : <Eye size={14} />}
          {showSensitive ? 'Hide card details' : 'Show card details'}
        </button>
      )}
    </div>
  );
};

const MetricTile = ({ label, value, accent }: { label: string; value: string; accent: string }) => (
  <div className="rounded-3xl border border-gray-800 bg-dark-900/80 p-4">
    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">{label}</p>
    <p className={`mt-2 text-xl font-black ${accent}`}>{value}</p>
  </div>
);

const InfoTile = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-[1.2rem] border border-gray-800 bg-dark-900/70 p-3">
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">{label}</p>
    <p className="mt-1.5 text-sm font-semibold text-white">{value}</p>
  </div>
);
