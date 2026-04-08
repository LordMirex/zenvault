import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronDown, ChevronUp, Trash2, X } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import { formatCompactUsd, formatNumber, formatUsd } from '../../lib/format';
import {
  AdminActionBar,
  AdminBadge,
  AdminButton,
  AdminIconAction,
  AdminNotice,
  AdminCard,
  AdminPageHeading,
  AdminSelect,
  AdminTextArea,
  AdminTextInput,
} from '../../components/admin/AdminUi';

type HoldingFormEntry = {
  usdInput: string;
  tokenInput: string;
  activeField: 'usd' | 'token' | null;
};
type HoldingFormState = Record<string, HoldingFormEntry>;
type CardFundingState = Record<string, string>;

export const AdminUserRecordsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { refreshBootstrap, adminUsers, adminTransactions } = useAuth();
  const user = id ? adminUsers.find((entry) => String(entry.id) === String(id)) : undefined;
  const isCardsPage = location.pathname.endsWith('/cards');

  const [holdingForms, setHoldingForms] = useState<HoldingFormState>({});
  const [openHoldingId, setOpenHoldingId] = useState<string>('');
  const [cardFunding, setCardFunding] = useState<CardFundingState>({});
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [cardForm, setCardForm] = useState({
    holderName: '',
    brand: 'Visa',
    last4: '',
    expiryMonth: '',
    expiryYear: '',
    initialBalance: '',
    billingAddress: '',
    zipCode: '',
    cvv: '',
  });
  const [alertForm, setAlertForm] = useState({
    type: 'Deposit',
    asset: '',
    amount: '',
    subject: '',
    message: '',
    createTransaction: true,
  });
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [activeKey, setActiveKey] = useState('');

  useEffect(() => {
    if (!user) return;
    setHoldingForms(
      Object.fromEntries(
        user.holdings.map((h) => [h.id, { usdInput: '', tokenInput: '', activeField: null }]),
      ),
    );
    setCardFunding(
      Object.fromEntries(user.cards.filter((c) => !c.requestOnly).map((c) => [c.id, ''])),
    );
  }, [user]);

  if (!user) return <Navigate to="/admin/users" replace />;

  const userTransactions = adminTransactions
    .filter((t) => t.userId === user.id)
    .slice(0, 8);
  const pendingCardRequests = user.cards.filter((c) => c.requestOnly);
  const issuedCards = user.cards.filter((c) => !c.requestOnly);

  const runAction = async (key: string, action: () => Promise<void>) => {
    setActiveKey(key);
    setFeedback('');
    setError('');
    try {
      await action();
      await refreshBootstrap();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'The requested action failed.');
    } finally {
      setActiveKey('');
    }
  };

  const getLivePrice = (holdingId: string): number => {
    const h = user.holdings.find((x) => x.id === holdingId);
    if (!h || h.balance <= 0 || h.valueUsd <= 0) return 0;
    return h.valueUsd / h.balance;
  };

  const handleUsdChange = (holdingId: string, raw: string) => {
    const livePrice = getLivePrice(holdingId);
    const usdNum = parseFloat(raw);
    const tokenCalc =
      raw && !isNaN(usdNum) && livePrice > 0
        ? (usdNum / livePrice).toFixed(8)
        : '';
    setHoldingForms((cur) => ({
      ...cur,
      [holdingId]: {
        usdInput: raw,
        tokenInput: tokenCalc,
        activeField: raw ? 'usd' : null,
      },
    }));
  };

  const handleTokenChange = (holdingId: string, raw: string) => {
    const livePrice = getLivePrice(holdingId);
    const tokenNum = parseFloat(raw);
    const usdCalc =
      raw && !isNaN(tokenNum) && livePrice > 0
        ? (tokenNum * livePrice).toFixed(2)
        : '';
    setHoldingForms((cur) => ({
      ...cur,
      [holdingId]: {
        tokenInput: raw,
        usdInput: usdCalc,
        activeField: raw ? 'token' : null,
      },
    }));
  };

  const clearHoldingForm = (holdingId: string) => {
    setHoldingForms((cur) => ({
      ...cur,
      [holdingId]: { usdInput: '', tokenInput: '', activeField: null },
    }));
  };

  const handleAssetAdjustment = async (holdingId: string, action: 'add' | 'subtract') => {
    const form = holdingForms[holdingId] ?? { usdInput: '', tokenInput: '', activeField: null };
    const tokenAmount = parseFloat(form.tokenInput || '0');
    if (!tokenAmount || isNaN(tokenAmount) || tokenAmount <= 0) {
      setError('Enter a valid USD or token amount before submitting.');
      return;
    }

    await runAction(`asset-${action}-${holdingId}`, async () => {
      await apiRequest(`/api/admin/users/${user.id}/assets/${holdingId}`, {
        method: 'PUT',
        body: JSON.stringify({ action, amount: tokenAmount }),
      });
      setFeedback(action === 'add' ? 'Wallet funded successfully.' : 'Wallet debited successfully.');
      clearHoldingForm(holdingId);
      setOpenHoldingId('');
    });
  };

  const handleUseRequest = (requestId: string) => {
    const request = pendingCardRequests.find((r) => r.id === requestId);
    if (!request) return;
    setSelectedRequestId(requestId);
    setCardForm((cur) => ({ ...cur, holderName: request.holderName || user.name, brand: request.brand }));
  };

  const resetCardForm = () => {
    setSelectedRequestId('');
    setCardForm({
      holderName: '', brand: 'Visa', last4: '', expiryMonth: '', expiryYear: '',
      initialBalance: '', billingAddress: '', zipCode: '', cvv: '',
    });
  };

  const handleCreateCard = async () => {
    await runAction('card-create', async () => {
      await apiRequest(`/api/admin/users/${user.id}/cards`, {
        method: 'POST',
        body: JSON.stringify({
          ...cardForm,
          requestId: selectedRequestId || undefined,
          initialBalance: Number(cardForm.initialBalance || 0),
        }),
      });
      setFeedback('Card issued successfully.');
      resetCardForm();
    });
  };

  const handleCardAction = async (
    cardId: string,
    action: 'add-funds' | 'subtract-funds' | 'activate' | 'freeze' | 'review',
  ) => {
    await runAction(`card-${action}-${cardId}`, async () => {
      await apiRequest(`/api/admin/users/${user.id}/cards/${cardId}`, {
        method: 'PUT',
        body: JSON.stringify({ action, amount: Number(cardFunding[cardId] || 0) }),
      });
      setFeedback('Card record updated.');
      setCardFunding((cur) => ({ ...cur, [cardId]: '' }));
    });
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!window.confirm('Delete this card record?')) return;
    await runAction(`card-delete-${cardId}`, async () => {
      await apiRequest(`/api/admin/users/${user.id}/cards/${cardId}`, { method: 'DELETE' });
      setFeedback('Card record deleted.');
    });
  };

  const handleSendAlert = async () => {
    if (!alertForm.subject.trim() || !alertForm.message.trim()) {
      setError('Subject and message are required to send an alert.');
      return;
    }
    await runAction('send-alert', async () => {
      await apiRequest(`/api/admin/users/${user.id}/notify`, {
        method: 'POST',
        body: JSON.stringify({
          type: alertForm.type,
          asset: alertForm.asset.trim().toUpperCase(),
          amount: alertForm.amount.trim(),
          subject: alertForm.subject.trim(),
          message: alertForm.message.trim(),
          createTransaction: alertForm.createTransaction,
        }),
      });
      setFeedback('Transaction alert sent and notification delivered.');
      setAlertForm((cur) => ({ ...cur, subject: '', message: '', asset: '', amount: '' }));
    });
  };

  return (
    <div className="space-y-6">
      <Link
        to={`/admin/users/${user.id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to user overview
      </Link>

      <AdminPageHeading
        title={`${user.name} ${isCardsPage ? 'Cards' : 'Wallet Funding'}`}
        description={`${user.email} - ${user.country}`}
      />

      {feedback && <AdminNotice tone="success">{feedback}</AdminNotice>}
      {error && <AdminNotice tone="danger">{error}</AdminNotice>}

      <div className="grid gap-4 md:grid-cols-3">
        <InfoTile label="Portfolio Value" value={formatCompactUsd(user.portfolioUsd)} />
        <InfoTile label="Available Value" value={formatCompactUsd(user.availableUsd)} />
        <InfoTile
          label={isCardsPage ? 'Card Items' : 'Live Active Assets'}
          value={String(isCardsPage ? user.cards.length : user.holdings.length)}
        />
      </div>

      {isCardsPage ? (
        <div className="space-y-6">
          <AdminCard className="p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Issue Card</h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                  Fulfill a pending client application or issue a card directly. The user applies and the fee is automatically
                  deducted from their wallet. Pending applications appear below and can prefill this form.
                </p>
              </div>
              {selectedRequestId && (
                <AdminButton variant="secondary" onClick={resetCardForm}>
                  Clear Request
                </AdminButton>
              )}
            </div>

            {pendingCardRequests.length > 0 && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm font-semibold text-amber-800">
                  {pendingCardRequests.length} pending application{pendingCardRequests.length > 1 ? 's' : ''} awaiting review.
                  Click "Use Request" below to prefill the issuance form from an existing application.
                </p>
              </div>
            )}

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <AdminTextInput label="Holder Name" value={cardForm.holderName} onChange={(e) => setCardForm((c) => ({ ...c, holderName: e.target.value }))} />
              <AdminSelect label="Brand" value={cardForm.brand} onChange={(e) => setCardForm((c) => ({ ...c, brand: e.target.value }))}>
                <option>Visa</option>
                <option>Mastercard</option>
              </AdminSelect>
              <AdminTextInput label="Last 4 Digits (optional)" value={cardForm.last4} onChange={(e) => setCardForm((c) => ({ ...c, last4: e.target.value.replace(/\D/g, '').slice(-4) }))} />
              <AdminTextInput label="Initial Spend Limit (USD)" value={cardForm.initialBalance} onChange={(e) => setCardForm((c) => ({ ...c, initialBalance: e.target.value }))} />
              <AdminTextInput label="Expiry Month (MM)" value={cardForm.expiryMonth} onChange={(e) => setCardForm((c) => ({ ...c, expiryMonth: e.target.value.replace(/\D/g, '').slice(0, 2) }))} />
              <AdminTextInput label="Expiry Year (YYYY)" value={cardForm.expiryYear} onChange={(e) => setCardForm((c) => ({ ...c, expiryYear: e.target.value.replace(/\D/g, '').slice(0, 4) }))} />
            </div>

            <div className="mt-5 flex justify-end">
              <AdminButton onClick={() => void handleCreateCard()} disabled={activeKey === 'card-create'}>
                {activeKey === 'card-create' ? 'Issuing...' : 'Issue Card'}
              </AdminButton>
            </div>
          </AdminCard>

          <AdminCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900">Pending Card Applications</h3>
            <p className="mt-1 text-sm text-slate-500">
              The user applied for a card and the application fee was deducted from their wallet balance automatically.
            </p>
            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              {pendingCardRequests.length === 0 && (
                <p className="text-sm text-slate-500">No pending card requests for this user.</p>
              )}
              {pendingCardRequests.map((request) => (
                <div key={request.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{request.brand} request</p>
                      <p className="mt-1 text-sm text-slate-500">{request.holderName || user.name}</p>
                      <p className="mt-2 text-xs text-slate-500">{request.requestedAt || 'Pending review'}</p>
                    </div>
                    <AdminBadge value="Review" />
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <InfoTile label="Application Fee Paid" value={formatUsd(request.applicationFeeUsd ?? 0)} />
                    <InfoTile label="Request Status" value="Pending" />
                  </div>
                  <div className="mt-5 flex gap-2">
                    <AdminButton variant="secondary" onClick={() => handleUseRequest(request.id)}>
                      Use Request
                    </AdminButton>
                    <AdminIconAction icon={Trash2} label={`Delete ${request.label}`} tone="rose" onClick={() => void handleDeleteCard(request.id)} disabled={activeKey === `card-delete-${request.id}`} />
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>

          <div className="grid gap-5 xl:grid-cols-2">
            {issuedCards.length === 0 && (
              <AdminCard className="p-6">
                <p className="text-sm text-slate-500">No issued cards exist for this user yet.</p>
              </AdminCard>
            )}
            {issuedCards.map((card) => (
              <AdminCard key={card.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{card.label}</p>
                    <p className="mt-1 text-sm text-slate-500">{card.brand} - {card.last4}</p>
                    <p className="mt-1 text-xs text-slate-500">{card.issuedAt}</p>
                  </div>
                  <AdminBadge value={card.status} />
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <InfoTile label="Spend Limit" value={formatUsd(card.spendLimitUsd)} />
                  <InfoTile label="Utilization" value={formatUsd(card.utilizationUsd)} />
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto]">
                  <AdminTextInput
                    label="Funding Adjustment (USD)"
                    value={cardFunding[card.id] ?? ''}
                    onChange={(e) => setCardFunding((c) => ({ ...c, [card.id]: e.target.value }))}
                    placeholder="0.00"
                  />
                  <div className="flex items-end">
                    <AdminActionBar>
                      <AdminButton variant="secondary" onClick={() => void handleCardAction(card.id, 'add-funds')} disabled={activeKey === `card-add-funds-${card.id}`}>Add Funds</AdminButton>
                      <AdminButton variant="secondary" onClick={() => void handleCardAction(card.id, 'subtract-funds')} disabled={activeKey === `card-subtract-funds-${card.id}`}>Subtract</AdminButton>
                    </AdminActionBar>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <AdminButton variant="secondary" onClick={() => void handleCardAction(card.id, 'activate')} disabled={activeKey === `card-activate-${card.id}`}>Activate</AdminButton>
                  <AdminButton variant="secondary" onClick={() => void handleCardAction(card.id, 'freeze')} disabled={activeKey === `card-freeze-${card.id}`}>Freeze</AdminButton>
                  <AdminButton variant="secondary" onClick={() => void handleCardAction(card.id, 'review')} disabled={activeKey === `card-review-${card.id}`}>Review</AdminButton>
                  <AdminIconAction icon={Trash2} label={`Delete ${card.label}`} tone="rose" onClick={() => void handleDeleteCard(card.id)} disabled={activeKey === `card-delete-${card.id}`} />
                </div>
              </AdminCard>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <AdminCard className="overflow-hidden p-0">
            {user.holdings.length === 0 && (
              <p className="px-6 py-5 text-sm text-slate-500">No holdings found for this user.</p>
            )}
            {user.holdings.map((holding, index) => {
              const isOpen = openHoldingId === holding.id;
              const form = holdingForms[holding.id] ?? { usdInput: '', tokenInput: '', activeField: null };
              const livePrice = holding.balance > 0 && holding.valueUsd > 0
                ? holding.valueUsd / holding.balance
                : 0;
              const usdLocked = form.activeField === 'token';
              const tokenLocked = form.activeField === 'usd';
              const hasValue = form.usdInput || form.tokenInput;

              return (
                <div key={holding.id} className={index > 0 ? 'border-t border-slate-100' : ''}>
                  <div className="flex items-center gap-4 px-5 py-4">
                    <img
                      src={holding.icon}
                      alt={holding.name}
                      className="h-10 w-10 flex-shrink-0 rounded-full border border-slate-100 bg-white p-1"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{holding.symbol}</span>
                        <AdminBadge value={holding.status} />
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        {holding.name} &middot; {formatNumber(holding.balance, 8)} &middot; {formatUsd(holding.valueUsd)}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setOpenHoldingId(isOpen ? '' : holding.id);
                        if (!isOpen) clearHoldingForm(holding.id);
                        setFeedback('');
                        setError('');
                      }}
                      className={`flex flex-shrink-0 items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-semibold transition-colors ${
                        isOpen
                          ? 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      Transact
                      {isOpen ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="border-t border-slate-100 bg-slate-50 px-5 py-5">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-700">
                          Fund or debit &mdash; {holding.symbol}
                        </p>
                        <div className="flex items-center gap-3">
                          {livePrice > 0 && (
                            <span className="text-xs text-slate-400">
                              Live: {formatUsd(livePrice)} / {holding.symbol}
                            </span>
                          )}
                          {hasValue && (
                            <button
                              onClick={() => clearHoldingForm(holding.id)}
                              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                            >
                              <X className="h-3 w-3" />
                              Clear
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                            USD Amount
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={form.usdInput}
                            onChange={(e) => handleUsdChange(holding.id, e.target.value)}
                            disabled={usdLocked}
                            placeholder="0.00"
                            className={`w-full rounded-xl border px-4 py-3 text-sm font-medium outline-none transition-colors ${
                              usdLocked
                                ? 'cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400'
                                : 'border-slate-200 bg-white text-slate-900 placeholder-slate-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100'
                            }`}
                          />
                          {usdLocked && (
                            <p className="mt-1 text-xs text-slate-400">Calculated from token amount</p>
                          )}
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                            Token Amount ({holding.symbol})
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={form.tokenInput}
                            onChange={(e) => handleTokenChange(holding.id, e.target.value)}
                            disabled={tokenLocked}
                            placeholder="0.00000000"
                            className={`w-full rounded-xl border px-4 py-3 text-sm font-medium outline-none transition-colors ${
                              tokenLocked
                                ? 'cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400'
                                : 'border-slate-200 bg-white text-slate-900 placeholder-slate-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100'
                            }`}
                          />
                          {tokenLocked && (
                            <p className="mt-1 text-xs text-slate-400">Calculated from USD amount</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => void handleAssetAdjustment(holding.id, 'add')}
                          disabled={activeKey === `asset-add-${holding.id}`}
                          className="flex-1 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {activeKey === `asset-add-${holding.id}` ? 'Crediting...' : 'Credit'}
                        </button>
                        <button
                          onClick={() => void handleAssetAdjustment(holding.id, 'subtract')}
                          disabled={activeKey === `asset-subtract-${holding.id}`}
                          className="flex-1 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {activeKey === `asset-subtract-${holding.id}` ? 'Debiting...' : 'Debit'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </AdminCard>

          <AdminCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900">Send Transaction Alert</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Send a transaction notification and email to the user. Optionally create a transaction record in their history.
              Use this to notify the user of deposits, withdrawals, or any wallet event.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <AdminSelect
                label="Transaction Type"
                value={alertForm.type}
                onChange={(e) => setAlertForm((c) => ({ ...c, type: e.target.value }))}
              >
                <option value="Deposit">Deposit</option>
                <option value="Withdrawal">Withdrawal</option>
                <option value="Transfer">Transfer</option>
                <option value="Swap">Swap</option>
              </AdminSelect>

              <AdminTextInput
                label="Asset Symbol (e.g. BTC, ETH, USDT)"
                value={alertForm.asset}
                onChange={(e) => setAlertForm((c) => ({ ...c, asset: e.target.value.toUpperCase() }))}
                placeholder="BTC"
              />

              <AdminTextInput
                label="Amount (optional)"
                value={alertForm.amount}
                onChange={(e) => setAlertForm((c) => ({ ...c, amount: e.target.value }))}
                placeholder="0.00"
              />

              <AdminTextInput
                label="Email Subject"
                value={alertForm.subject}
                onChange={(e) => setAlertForm((c) => ({ ...c, subject: e.target.value }))}
                placeholder="Transaction confirmed"
              />
            </div>

            <div className="mt-4">
              <AdminTextArea
                label="Message to User"
                rows={4}
                value={alertForm.message}
                onChange={(e) => setAlertForm((c) => ({ ...c, message: e.target.value }))}
                placeholder="Your transaction has been processed and is now reflected in your wallet..."
              />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <input
                type="checkbox"
                id="createTxn"
                checked={alertForm.createTransaction}
                onChange={(e) => setAlertForm((c) => ({ ...c, createTransaction: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-violet-600"
              />
              <label htmlFor="createTxn" className="text-sm text-slate-700">
                Also create a transaction record in the user's history
              </label>
            </div>

            <div className="mt-5 flex justify-end">
              <AdminButton onClick={() => void handleSendAlert()} disabled={activeKey === 'send-alert'}>
                {activeKey === 'send-alert' ? 'Sending...' : 'Send Alert'}
              </AdminButton>
            </div>
          </AdminCard>
        </div>
      )}

      <AdminCard className="p-5">
        <h3 className="text-lg font-semibold text-slate-900">Recent Related Transactions</h3>
        <div className="mt-4 grid gap-3">
          {userTransactions.length === 0 && (
            <p className="text-sm text-slate-500">No related transactions yet.</p>
          )}
          {userTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-semibold text-slate-900">
                  {transaction.type} - {transaction.amount}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {transaction.channel} to {transaction.destination}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <AdminBadge value={transaction.status} />
                <span className="text-sm text-slate-500">{transaction.createdAt}</span>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>
    </div>
  );
};

const InfoTile = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4">
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
    <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
  </div>
);
