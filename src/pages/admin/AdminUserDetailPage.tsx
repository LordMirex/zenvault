import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ChevronLeft, Coins, CreditCard, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import { formatCompactUsd } from '../../lib/format';
import {
  AdminActionBar,
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminIconAction,
  AdminNotice,
  AdminPageHeading,
  AdminSelect,
  AdminTextArea,
  AdminTextInput,
} from '../../components/admin/AdminUi';

export const AdminUserDetailPage = () => {
  const { id } = useParams();
  const { adminUsers, adminTransactions, refreshBootstrap } = useAuth();
  const user = id ? adminUsers.find((u) => String(u.id) === String(id)) : undefined;

  const [editForm, setEditForm] = useState<Record<string, string> | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  if (!user) {
    return <Navigate to="/admin/users" replace />;
  }

  const userTransactions = adminTransactions.filter((transaction) => transaction.userId === user.id).slice(0, 5);

  const startEdit = () => {
    setEditForm({
      name: user.name,
      email: user.email,
      country: user.country,
      deskLabel: user.deskLabel,
      tier: user.tier,
      status: user.status,
      kycStatus: user.kycStatus,
      riskLevel: user.riskLevel,
      plan: user.plan,
      note: user.note,
    });
    setFeedback('');
    setError('');
  };

  const cancelEdit = () => {
    setEditForm(null);
    setFeedback('');
    setError('');
  };

  const handleSave = async () => {
    if (!editForm) return;
    setSaving(true);
    setFeedback('');
    setError('');

    try {
      await apiRequest(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      await refreshBootstrap();
      setEditForm(null);
      setFeedback('User profile updated successfully.');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to save user profile.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setEditForm((current) => (current ? { ...current, [field]: value } : current));
  };

  return (
    <div className="space-y-6">
      <Link to="/admin/users" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900">
        <ChevronLeft className="h-4 w-4" />
        Back to users
      </Link>

      <AdminPageHeading
        title={`${user.name} Overview`}
        description={`${user.email} - ${user.country} - ${user.uuid}`}
        actions={
          <AdminActionBar>
            {!editForm && (
              <AdminButton variant="secondary" onClick={startEdit}>
                Edit Profile
              </AdminButton>
            )}
            <AdminIconAction icon={KeyRound} label={`Reset ${user.name} credentials`} tone="amber" to={`/admin/users/${user.id}/password`} />
            <AdminIconAction icon={Coins} label={`Open ${user.name} crypto records`} tone="blue" to={`/admin/users/${user.id}/crypto`} />
            <AdminIconAction icon={CreditCard} label={`Open ${user.name} card records`} tone="emerald" to={`/admin/users/${user.id}/cards`} />
          </AdminActionBar>
        }
      />

      {feedback && <AdminNotice tone="success">{feedback}</AdminNotice>}
      {error && <AdminNotice tone="danger">{error}</AdminNotice>}

      <div className="grid gap-4 md:grid-cols-4">
        <InfoTile label="Portfolio" value={formatCompactUsd(user.portfolioUsd)} />
        <InfoTile label="Available" value={formatCompactUsd(user.availableUsd)} />
        <InfoTile label="Plan" value={user.plan} />
        <InfoTile label="Risk" value={user.riskLevel} />
      </div>

      {editForm ? (
        <AdminCard className="p-6">
          <h3 className="text-lg font-semibold text-slate-900">Edit User Profile</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <AdminTextInput label="Full Name" value={editForm.name} onChange={(e) => updateField('name', e.target.value)} />
            <AdminTextInput label="Email" type="email" value={editForm.email} onChange={(e) => updateField('email', e.target.value)} />
            <AdminTextInput label="Country" value={editForm.country} onChange={(e) => updateField('country', e.target.value)} />
            <AdminTextInput label="Desk Label" value={editForm.deskLabel} onChange={(e) => updateField('deskLabel', e.target.value)} />
            <AdminSelect label="Tier" value={editForm.tier} onChange={(e) => updateField('tier', e.target.value)}>
              <option>Tier 1</option>
              <option>Tier 2</option>
              <option>Tier 3</option>
              <option>VIP</option>
            </AdminSelect>
            <AdminSelect label="Status" value={editForm.status} onChange={(e) => updateField('status', e.target.value)}>
              <option>Active</option>
              <option>Suspended</option>
              <option>Pending</option>
              <option>Blocked</option>
            </AdminSelect>
            <AdminSelect label="KYC Status" value={editForm.kycStatus} onChange={(e) => updateField('kycStatus', e.target.value)}>
              <option>Approved</option>
              <option>Pending</option>
              <option>Needs review</option>
            </AdminSelect>
            <AdminSelect label="Risk Level" value={editForm.riskLevel} onChange={(e) => updateField('riskLevel', e.target.value)}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </AdminSelect>
            <AdminTextInput label="Plan" value={editForm.plan} onChange={(e) => updateField('plan', e.target.value)} />
            <div className="md:col-span-2">
              <AdminTextArea label="Internal Note" rows={4} value={editForm.note} onChange={(e) => updateField('note', e.target.value)} />
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <AdminButton onClick={() => void handleSave()} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </AdminButton>
            <AdminButton variant="secondary" onClick={cancelEdit} disabled={saving}>
              Cancel
            </AdminButton>
          </div>
        </AdminCard>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <AdminCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900">Account State</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <InfoTile label="Desk" value={user.deskLabel} />
              <InfoTile label="Tier" value={user.tier} />
              <InfoTile label="Country" value={user.country} />
              <InfoTile label="Last Seen" value={user.lastSeen} />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <AdminBadge value={user.status} />
              <AdminBadge value={user.kycStatus} />
            </div>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600">
              {user.note}
            </div>
          </AdminCard>

          <AdminCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900">Wallet And Card Scope</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <InfoTile label="Holdings" value={String(user.holdings.length)} />
              <InfoTile label="Cards" value={String(user.cards.length)} />
            </div>
            <div className="mt-5 grid gap-3">
              {user.holdings.slice(0, 3).map((holding) => (
                <div key={holding.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="font-semibold text-slate-900">{holding.symbol}</p>
                    <p className="text-xs text-slate-500">{holding.network}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{holding.balance.toLocaleString()}</p>
                    <AdminBadge value={holding.status} className="mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        </div>
      )}

      <AdminCard className="p-6">
        <h3 className="text-lg font-semibold text-slate-900">Recent Transactions</h3>
        <div className="mt-5 space-y-3">
          {userTransactions.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              No related transaction records yet.
            </div>
          )}
          {userTransactions.map((transaction) => (
            <div key={transaction.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">
                    {transaction.type} - {transaction.amount}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {transaction.channel} to {transaction.destination}
                  </p>
                </div>
                <div className="text-right">
                  <AdminBadge value={transaction.status} />
                  <p className="mt-2 text-xs text-slate-500">{transaction.createdAt}</p>
                </div>
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
