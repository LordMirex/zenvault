import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { ChevronLeft, Trash2 } from 'lucide-react';

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
  AdminTextInput,
} from '../../components/admin/AdminUi';

type AssetFormState = Record<string, string>;
type CardFundingState = Record<string, string>;

export const AdminUserRecordsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { refreshBootstrap, adminUsers, adminTransactions } = useAuth();
  const user = id ? adminUsers.find((entry) => String(entry.id) === String(id)) : undefined;
  const isCardsPage = location.pathname.endsWith('/cards');
  const [assetForms, setAssetForms] = useState<AssetFormState>({});
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
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [activeKey, setActiveKey] = useState('');

  useEffect(() => {
    if (!user) {
      return;
    }

    setAssetForms(
      Object.fromEntries(user.holdings.map((holding) => [holding.id, ''])),
    );
    setCardFunding(
      Object.fromEntries(
        user.cards
          .filter((card) => !card.requestOnly)
          .map((card) => [card.id, '']),
      ),
    );
  }, [user]);

  if (!user) {
    return <Navigate to="/admin/users" replace />;
  }

  const userTransactions = adminTransactions.filter((transaction) => transaction.userId === user.id).slice(0, 8);
  const pendingCardRequests = user.cards.filter((card) => card.requestOnly);
  const issuedCards = user.cards.filter((card) => !card.requestOnly);

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

  const handleAssetAdjustment = async (assetId: string, action: 'add' | 'subtract') => {
    const amount = Number(assetForms[assetId] || 0);

    await runAction(`asset-${action}-${assetId}`, async () => {
      await apiRequest(`/api/admin/users/${user.id}/assets/${assetId}`, {
        method: 'PUT',
        body: JSON.stringify({
          action,
          amount,
        }),
      });
      setFeedback(action === 'add' ? 'Wallet funded successfully.' : 'Wallet debited successfully.');
      setAssetForms((current) => ({ ...current, [assetId]: '' }));
    });
  };

  const handleUseRequest = (requestId: string) => {
    const request = pendingCardRequests.find((entry) => entry.id === requestId);
    if (!request) {
      return;
    }

    setSelectedRequestId(requestId);
    setCardForm((current) => ({
      ...current,
      holderName: request.holderName || user.name,
      brand: request.brand,
    }));
  };

  const resetCardForm = () => {
    setSelectedRequestId('');
    setCardForm({
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
        body: JSON.stringify({
          action,
          amount: Number(cardFunding[cardId] || 0),
        }),
      });
      setFeedback('Card record updated.');
      setCardFunding((current) => ({ ...current, [cardId]: '' }));
    });
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!window.confirm('Delete this card record?')) {
      return;
    }

    await runAction(`card-delete-${cardId}`, async () => {
      await apiRequest(`/api/admin/users/${user.id}/cards/${cardId}`, {
        method: 'DELETE',
      });
      setFeedback('Card record deleted.');
    });
  };

  return (
    <div className="space-y-6">
      <Link to={`/admin/users/${user.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900">
        <ChevronLeft className="h-4 w-4" />
        Back to user overview
      </Link>

      <AdminPageHeading
        title={`${user.name} ${isCardsPage ? 'Cards' : 'Wallet Funding'}`}
        description={`${user.email} - ${user.country} - ${user.deskLabel}`}
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
                  Issue a card directly or fulfill a pending client application. Pending applications appear below and can
                  prefill this form.
                </p>
              </div>
              {selectedRequestId && (
                <AdminButton variant="secondary" onClick={resetCardForm}>
                  Clear Request
                </AdminButton>
              )}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <AdminTextInput label="Holder Name" value={cardForm.holderName} onChange={(event) => setCardForm((current) => ({ ...current, holderName: event.target.value }))} />
              <AdminSelect label="Brand" value={cardForm.brand} onChange={(event) => setCardForm((current) => ({ ...current, brand: event.target.value }))}>
                <option>Visa</option>
                <option>Mastercard</option>
              </AdminSelect>
              <AdminTextInput label="Last 4 Digits" value={cardForm.last4} onChange={(event) => setCardForm((current) => ({ ...current, last4: event.target.value.replace(/\D/g, '').slice(-4) }))} />
              <AdminTextInput label="Initial Balance (USD)" value={cardForm.initialBalance} onChange={(event) => setCardForm((current) => ({ ...current, initialBalance: event.target.value }))} />
              <AdminTextInput label="Expiry Month" value={cardForm.expiryMonth} onChange={(event) => setCardForm((current) => ({ ...current, expiryMonth: event.target.value }))} />
              <AdminTextInput label="Expiry Year" value={cardForm.expiryYear} onChange={(event) => setCardForm((current) => ({ ...current, expiryYear: event.target.value }))} />
              <AdminTextInput label="Billing Address" value={cardForm.billingAddress} onChange={(event) => setCardForm((current) => ({ ...current, billingAddress: event.target.value }))} />
              <AdminTextInput label="ZIP Code" value={cardForm.zipCode} onChange={(event) => setCardForm((current) => ({ ...current, zipCode: event.target.value }))} />
              <AdminTextInput label="CVV" value={cardForm.cvv} onChange={(event) => setCardForm((current) => ({ ...current, cvv: event.target.value.replace(/\D/g, '').slice(0, 4) }))} />
            </div>

            <div className="mt-5 flex justify-end">
              <AdminButton onClick={() => void handleCreateCard()} disabled={activeKey === 'card-create'}>
                {activeKey === 'card-create' ? 'Issuing...' : 'Issue Card'}
              </AdminButton>
            </div>
          </AdminCard>

          <AdminCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900">Pending Card Applications</h3>
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
                    <InfoTile label="Application Fee" value={formatUsd(request.applicationFeeUsd ?? 0)} />
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
                    <p className="mt-1 text-sm text-slate-500">
                      {card.brand} - {card.last4}
                    </p>
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
                    label="Funding Adjustment"
                    value={cardFunding[card.id] ?? ''}
                    onChange={(event) => setCardFunding((current) => ({ ...current, [card.id]: event.target.value }))}
                    placeholder="0.00"
                  />
                  <div className="flex items-end">
                    <AdminActionBar>
                      <AdminButton variant="secondary" onClick={() => void handleCardAction(card.id, 'add-funds')} disabled={activeKey === `card-add-funds-${card.id}`}>
                        Add Funds
                      </AdminButton>
                      <AdminButton variant="secondary" onClick={() => void handleCardAction(card.id, 'subtract-funds')} disabled={activeKey === `card-subtract-funds-${card.id}`}>
                        Subtract
                      </AdminButton>
                    </AdminActionBar>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <AdminButton variant="secondary" onClick={() => void handleCardAction(card.id, 'activate')} disabled={activeKey === `card-activate-${card.id}`}>
                    Activate
                  </AdminButton>
                  <AdminButton variant="secondary" onClick={() => void handleCardAction(card.id, 'freeze')} disabled={activeKey === `card-freeze-${card.id}`}>
                    Freeze
                  </AdminButton>
                  <AdminButton variant="secondary" onClick={() => void handleCardAction(card.id, 'review')} disabled={activeKey === `card-review-${card.id}`}>
                    Review
                  </AdminButton>
                  <AdminIconAction icon={Trash2} label={`Delete ${card.label}`} tone="rose" onClick={() => void handleDeleteCard(card.id)} disabled={activeKey === `card-delete-${card.id}`} />
                </div>
              </AdminCard>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {user.holdings.map((holding) => (
            <AdminCard key={holding.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={holding.icon} alt={holding.name} className="h-12 w-12 rounded-full border border-slate-200 bg-white p-1.5" />
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{holding.symbol}</p>
                    <p className="text-sm text-slate-500">
                      {holding.name} - {holding.network}
                    </p>
                  </div>
                </div>
                <AdminBadge value={holding.status} />
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <InfoTile label="Balance" value={formatNumber(holding.balance, 8)} />
                <InfoTile label="Value" value={formatUsd(holding.valueUsd)} />
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-500">Fund or debit this wallet</p>
                <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
                  <AdminTextInput
                    label="Amount"
                    value={assetForms[holding.id] ?? ''}
                    onChange={(event) => setAssetForms((current) => ({ ...current, [holding.id]: event.target.value }))}
                    placeholder="0.00"
                  />
                  <div className="flex items-end">
                    <AdminActionBar>
                      <AdminButton variant="secondary" onClick={() => void handleAssetAdjustment(holding.id, 'add')} disabled={activeKey === `asset-add-${holding.id}`}>
                        Send To User
                      </AdminButton>
                      <AdminButton variant="secondary" onClick={() => void handleAssetAdjustment(holding.id, 'subtract')} disabled={activeKey === `asset-subtract-${holding.id}`}>
                        Debit
                      </AdminButton>
                    </AdminActionBar>
                  </div>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      <AdminCard className="p-5">
        <h3 className="text-lg font-semibold text-slate-900">Recent Related Transactions</h3>
        <div className="mt-4 grid gap-3">
          {userTransactions.length === 0 && (
            <p className="text-sm text-slate-500">No related transactions yet.</p>
          )}
          {userTransactions.map((transaction) => (
            <div key={transaction.id} className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
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
