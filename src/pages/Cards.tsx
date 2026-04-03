import { useState } from 'react';
import { Clock3, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatUsd } from '../lib/format';

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
                Apply for a card and track every active card request in one place
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-gray-400 md:text-base">
                Card applications stay simple. Submit the request, the application fee is charged from your wallet, and
                the admin issues the card when approved.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:w-[480px]">
            <MetricTile label="Application Fee" value={formatUsd(clientCardApplicationFeeUsd)} accent="text-primary" />
            <MetricTile label="Issued Cards" value={String(clientCards.length)} accent="text-white" />
            <MetricTile label="Pending Requests" value={String(clientCardRequests.length)} accent="text-success" />
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

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Apply for a Card</h3>
              <p className="mt-1 text-sm text-gray-500">
                One request at a time. The admin sets the fee and approves the final issue.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Holder Name</span>
              <input
                value={holderName}
                onChange={(event) => setHolderName(event.target.value)}
                placeholder="Card holder name"
                className="w-full rounded-2xl border border-gray-800 bg-dark-800 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-primary/50 focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Brand</span>
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
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Fee Source</p>
              <p className="mt-2 text-lg font-black text-white">{formatUsd(clientCardApplicationFeeUsd)}</p>
              <p className="mt-1 text-sm text-gray-500">
                {fundingAsset ? `Charged from your ${fundingAsset.symbol} wallet.` : 'An active funded asset is required.'}
              </p>
            </div>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Note</span>
              <textarea
                rows={4}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Optional note for the admin desk"
                className="w-full rounded-2xl border border-gray-800 bg-dark-800 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-primary/50 focus:outline-none"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-4 rounded-[1.5rem] border border-success/20 bg-success/10 p-4 md:flex-row md:items-start">
            <ShieldCheck className="mt-0.5 shrink-0 text-success" size={18} />
            <div>
              <p className="text-sm font-bold text-white">Application Flow</p>
              <p className="mt-1 text-sm text-gray-400">
                The request is created instantly, a receipt email is sent, and the admin can issue the final card from the
                user management screen.
              </p>
            </div>
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
            {isSubmitting ? 'Submitting Request...' : hasPendingRequest ? 'Pending Request In Review' : 'Apply For Card'}
          </button>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
            <div className="flex items-center gap-3">
              <Clock3 className="text-primary" size={18} />
              <div>
                <h3 className="text-lg font-semibold text-white">Pending Requests</h3>
                <p className="mt-1 text-sm text-gray-500">Requests waiting for admin approval or card issuance.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {clientCardRequests.length === 0 && (
                <div className="rounded-[1.5rem] border border-gray-800 bg-dark-800/60 p-4 text-sm text-gray-500">
                  No pending card requests right now.
                </div>
              )}

              {clientCardRequests.map((request) => (
                <div key={request.id} className="rounded-[1.5rem] border border-gray-800 bg-dark-800/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-white">{request.brand} application</p>
                      <p className="mt-1 text-sm text-gray-500">{request.holderName || holderName}</p>
                    </div>
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                      Pending
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <InfoTile label="Requested" value={request.requestedAt || 'Awaiting review'} />
                    <InfoTile label="Fee" value={formatUsd(request.applicationFeeUsd ?? clientCardApplicationFeeUsd)} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
            <h3 className="text-lg font-semibold text-white">Issued Cards</h3>
            <p className="mt-1 text-sm text-gray-500">Cards already issued to this account.</p>

            <div className="mt-5 space-y-3">
              {clientCards.length === 0 && (
                <div className="rounded-[1.5rem] border border-gray-800 bg-dark-800/60 p-4 text-sm text-gray-500">
                  No cards have been issued yet.
                </div>
              )}

              {clientCards.map((card) => (
                <div key={card.id} className="rounded-[1.6rem] border border-gray-800 bg-gradient-to-br from-dark-800 to-dark-900 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-white">{card.label}</p>
                      <p className="mt-1 text-sm text-gray-500">
                        {card.brand} ending in {card.last4}
                      </p>
                    </div>
                    <span className="rounded-full border border-gray-700 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                      {card.status}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <InfoTile label="Spend Limit" value={formatUsd(card.spendLimitUsd)} />
                    <InfoTile label="Utilization" value={formatUsd(card.utilizationUsd)} />
                    <InfoTile label="Issued" value={card.issuedAt || 'Awaiting update'} />
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

const MetricTile = ({ label, value, accent }: { label: string; value: string; accent: string }) => (
  <div className="rounded-3xl border border-gray-800 bg-dark-900/80 p-4">
    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">{label}</p>
    <p className={`mt-2 text-xl font-black ${accent}`}>{value}</p>
  </div>
);

const InfoTile = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-[1.2rem] border border-gray-800 bg-dark-900/70 p-4">
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">{label}</p>
    <p className="mt-2 text-sm font-semibold text-white">{value}</p>
  </div>
);
