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
  AdminCard,
  AdminIconAction,
  AdminNotice,
  AdminPageHeading,
  AdminSelect,
  AdminTextInput,
} from '../../components/admin/AdminUi';

type AssetFormState = Record<string, { status: string; address: string; amount: string }>;
type CardFundingState = Record<string, string>;

export const AdminUserRecordsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { refreshBootstrap, adminUsers, adminTransactions } = useAuth();
  const user = id ? adminUsers.find((u) => String(u.id) === String(id)) : undefined;
  const isCardsPage = location.pathname.endsWith('/cards');
  const userTransactions = user ? adminTransactions.filter((item) => item.userId === user.id) : [];
  const [assetForms, setAssetForms] = useState<AssetFormState>({});
  const [cardFunding, setCardFunding] = useState<CardFundingState>({});
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
      Object.fromEntries(
        user.holdings.map((holding) => [
          holding.id,
          {
            status: holding.status,
            address: holding.address,
            amount: '',
          },
        ]),
      ),
    );
    setCardFunding(
      Object.fromEntries(
        user.cards.map((card) => [card.id, '']),
      ),
    );
  }, [user]);

  if (!user) {
    return <Navigate to="/admin/users" replace />;
  }

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

  const updateAssetForm = (assetId: string, field: 'status' | 'amount' | 'address', value: string) => {
    setAssetForms((current) => ({
      ...current,
      [assetId]: {
        ...(current[assetId] ?? { status: 'Enabled', address: '', amount: '' }),
        [field]: value,
      },
    }));
  };

  const handleAssetSave = async (assetId: string) => {
    const form = assetForms[assetId];
    await runAction(`asset-save-${assetId}`, async () => {
      await apiRequest(`/api/admin/users/${user.id}/assets/${assetId}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: form?.status,
          ...(form?.address ? { address: form.address } : {}),
        }),
      });
      setFeedback('Wallet record updated.');
    });
  };

  const handleAssetAdjustment = async (assetId: string, action: 'add' | 'subtract') => {
    const form = assetForms[assetId];
    await runAction(`asset-${action}-${assetId}`, async () => {
      await apiRequest(`/api/admin/users/${user.id}/assets/${assetId}`, {
        method: 'PUT',
        body: JSON.stringify({
          action,
          amount: Number(form?.amount || 0),
        }),
      });
      setFeedback(`${action === 'add' ? 'Added to' : 'Subtracted from'} wallet balance.`);
      updateAssetForm(assetId, 'amount', '');
    });
  };

  const handleCreateCard = async () => {
    await runAction('card-create', async () => {
      await apiRequest(`/api/admin/users/${user.id}/cards`, {
        method: 'POST',
        body: JSON.stringify({
          ...cardForm,
          initialBalance: Number(cardForm.initialBalance || 0),
        }),
      });
      setFeedback('Card issued successfully.');
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
    });
  };

  const handleCardAction = async (cardId: string, action: 'add-funds' | 'subtract-funds' | 'activate' | 'freeze' | 'review') => {
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
        title={`${user.name} ${isCardsPage ? 'Cards' : 'Crypto Records'}`}
        description={`${user.email} - ${user.country} - ${user.deskLabel}`}
      />

      {feedback && <AdminNotice tone="success">{feedback}</AdminNotice>}
      {error && <AdminNotice tone="danger">{error}</AdminNotice>}

      <div className="grid gap-4 md:grid-cols-3">
        <AdminCard className="p-5">
          <p className="text-sm font-medium text-slate-500">Portfolio Value</p>
          <p className="mt-3 text-3xl font-black text-slate-900">{formatCompactUsd(user.portfolioUsd)}</p>
          <p className="mt-2 text-sm text-slate-500">Available balance {formatCompactUsd(user.availableUsd)}</p>
        </AdminCard>
        <AdminCard className="p-5">
          <p className="text-sm font-medium text-slate-500">Status</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <AdminBadge value={user.status} />
            <AdminBadge value={user.kycStatus} />
          </div>
          <p className="mt-3 text-sm text-slate-500">{user.note}</p>
        </AdminCard>
        <AdminCard className="p-5">
          <p className="text-sm font-medium text-slate-500">Open Items</p>
          <p className="mt-3 text-3xl font-black text-slate-900">{isCardsPage ? user.cards.length : user.holdings.length}</p>
          <p className="mt-2 text-sm text-slate-500">{isCardsPage ? 'Card records visible to admin' : 'Wallet records visible to admin'}</p>
        </AdminCard>
      </div>

      {isCardsPage ? (
        <div className="space-y-6">
          <AdminCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900">Issue New Card</h3>
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

          <div className="grid gap-5 xl:grid-cols-2">
            {user.cards.length === 0 && (
              <AdminCard className="p-6">
                <p className="text-sm text-slate-500">No cards have been issued for this user yet.</p>
              </AdminCard>
            )}
            {user.cards.map((card) => (
              <AdminCard key={card.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{card.label}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {card.brand} -•••• {card.last4}
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
          {user.holdings.map((holding) => {
            const form = assetForms[holding.id] ?? { status: holding.status, address: holding.address, amount: '' };

            return (
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

                <div className="mt-5 grid gap-4">
                  <AdminSelect label="Status" value={form.status} onChange={(event) => updateAssetForm(holding.id, 'status', event.target.value)}>
                    <option>Enabled</option>
                    <option>Watch</option>
                    <option>Paused</option>
                  </AdminSelect>
                  <div>
                    <AdminTextInput
                      label="Deposit Address"
                      value={form.address}
                      onChange={(event) => updateAssetForm(holding.id, 'address', event.target.value)}
                      placeholder={holding.address || 'Enter wallet address for this user'}
                    />
                    {holding.address && (
                      <p className="mt-1.5 truncate font-mono text-xs text-slate-400" title={holding.address}>
                        Current: {holding.address}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <AdminButton variant="secondary" onClick={() => void handleAssetSave(holding.id)} disabled={activeKey === `asset-save-${holding.id}`}>
                      {activeKey === `asset-save-${holding.id}` ? 'Saving...' : 'Save Wallet'}
                    </AdminButton>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto]">
                  <AdminTextInput
                    label="Adjustment Amount"
                    value={form.amount}
                    onChange={(event) => updateAssetForm(holding.id, 'amount', event.target.value)}
                    placeholder="0.00"
                  />
                  <div className="flex items-end">
                    <AdminActionBar>
                      <AdminButton variant="secondary" onClick={() => void handleAssetAdjustment(holding.id, 'add')} disabled={activeKey === `asset-add-${holding.id}`}>
                        Add
                      </AdminButton>
                      <AdminButton variant="secondary" onClick={() => void handleAssetAdjustment(holding.id, 'subtract')} disabled={activeKey === `asset-subtract-${holding.id}`}>
                        Subtract
                      </AdminButton>
                    </AdminActionBar>
                  </div>
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}

      <AdminCard className="p-5">
        <h3 className="text-lg font-semibold text-slate-900">Recent Related Transactions</h3>
        <div className="mt-4 grid gap-3">
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
