import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Coins, CreditCard, Mail, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import { formatCompactUsd, formatUsd } from '../../lib/format';
import {
  AdminActionBar,
  AdminBadge,
  AdminCard,
  AdminIconAction,
  AdminMetricCard,
  AdminNotice,
  AdminPageHeading,
  AdminTableWrap,
  AdminTextInput,
  AdminButton,
} from '../../components/admin/AdminUi';

export const AdminDashboard = () => {
  const {
    adminAlerts,
    adminMetrics,
    adminTimeline,
    adminTransactions,
    adminUsers,
    refreshBootstrap,
  } = useAuth();

  const [alertText, setAlertText] = useState('');
  const [alertBusy, setAlertBusy] = useState(false);
  const [alertError, setAlertError] = useState('');

  const totalCards = adminUsers.reduce((count, user) => count + user.cards.length, 0);
  const totalCryptoValue = adminUsers.reduce(
    (total, user) => total + user.holdings.reduce((subTotal, holding) => subTotal + holding.valueUsd, 0),
    0,
  );

  const handleAddAlert = async () => {
    const text = alertText.trim();
    if (!text) return;
    setAlertBusy(true);
    setAlertError('');
    try {
      await apiRequest('/api/admin/alerts', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      setAlertText('');
      await refreshBootstrap();
    } catch (err) {
      setAlertError(err instanceof Error ? err.message : 'Failed to add alert.');
    } finally {
      setAlertBusy(false);
    }
  };

  const handleDismissAlert = async (index: number) => {
    setAlertBusy(true);
    setAlertError('');
    try {
      await apiRequest(`/api/admin/alerts/${index}`, { method: 'DELETE' });
      await refreshBootstrap();
    } catch (err) {
      setAlertError(err instanceof Error ? err.message : 'Failed to dismiss alert.');
    } finally {
      setAlertBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeading
        title="Admin Dashboard"
        description="Operational metrics, alerts, users, and recent transactions."
      />

      {alertError && <AdminNotice tone="danger">{alertError}</AdminNotice>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Total Users" value={String(adminUsers.length)} detail="Onboarded client accounts" accent="text-violet-600" />
        <AdminMetricCard label="Total Transactions" value={String(adminTransactions.length)} detail="Recent transaction records" accent="text-sky-600" />
        <AdminMetricCard label="Active Cards" value={String(totalCards)} detail="Cards across all client accounts" accent="text-emerald-600" />
        <AdminMetricCard label="Total Crypto Value" value={formatCompactUsd(totalCryptoValue)} detail="Aggregated holdings across wallets" accent="text-amber-600" />
      </div>

      <AdminCard className="flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-semibold text-slate-700">Client Broadcasts</p>
          <p className="mt-1 text-sm text-slate-500">Compose and send branded operational messages to all or specific clients.</p>
        </div>
        <Link
          to="/admin/broadcasts"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          <Mail className="h-4 w-4" />
          Open Broadcasts
        </Link>
      </AdminCard>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminTableWrap>
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h3 className="text-lg font-semibold text-slate-900">Recent Transactions</h3>
            <Link to="/admin/transactions" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
              View all
            </Link>
          </div>
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">User</th>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Asset</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {adminTransactions.map((transaction) => {
                const user = adminUsers.find((item) => item.id === transaction.userId);

                return (
                  <tr key={transaction.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{user?.name ?? 'Unknown user'}</p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{transaction.type}</td>
                    <td className="px-5 py-4 text-slate-700">{transaction.asset}</td>
                    <td className="px-5 py-4 text-slate-700">{transaction.amount}</td>
                    <td className="px-5 py-4">
                      <AdminBadge value={transaction.status} />
                    </td>
                    <td className="px-5 py-4 text-slate-500">{transaction.createdAt}</td>
                    <td className="px-5 py-4">
                      <AdminActionBar>
                        <AdminIconAction
                          icon={Coins}
                          label={`Open ${user?.name ?? 'user'} crypto records`}
                          tone="blue"
                          to={user ? `/admin/users/${user.id}/crypto` : undefined}
                          disabled={!user}
                        />
                        <AdminIconAction
                          icon={CreditCard}
                          label={`Open ${user?.name ?? 'user'} card records`}
                          tone="emerald"
                          to={user ? `/admin/users/${user.id}/cards` : undefined}
                          disabled={!user}
                        />
                      </AdminActionBar>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </AdminTableWrap>

        <div className="space-y-6">
          <AdminCard className="p-5">
            <h3 className="text-lg font-semibold text-slate-900">Operational Snapshot</h3>
            <div className="mt-4 grid gap-4">
              {adminMetrics.map((metric) => (
                <div key={metric.id} className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium text-slate-600">{metric.label}</p>
                    <span className="text-sm font-semibold text-slate-500">{metric.change}</span>
                  </div>
                  <p className="mt-3 text-2xl font-black text-slate-900">{metric.value}</p>
                  <p className="mt-2 text-sm text-slate-500">{metric.detail}</p>
                </div>
              ))}
            </div>
          </AdminCard>

          <AdminCard className="p-5">
            <h3 className="text-lg font-semibold text-slate-900">Admin Alerts</h3>

            <div className="mt-4 flex gap-2">
              <AdminTextInput
                label=""
                value={alertText}
                onChange={(e) => setAlertText(e.target.value)}
                placeholder="Add an alert message..."
                onKeyDown={(e) => { if (e.key === 'Enter') void handleAddAlert(); }}
              />
              <div className="flex items-end">
                <AdminButton variant="secondary" onClick={() => void handleAddAlert()} disabled={alertBusy || !alertText.trim()}>
                  Add
                </AdminButton>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {adminAlerts.length === 0 && (
                <p className="text-sm text-slate-400">No active alerts.</p>
              )}
              {adminAlerts.map((alert, index) => (
                <div key={`${alert}-${index}`} className="flex items-start justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm leading-7 text-amber-900">{alert}</p>
                  <button
                    type="button"
                    disabled={alertBusy}
                    onClick={() => void handleDismissAlert(index)}
                    className="shrink-0 rounded p-1 text-amber-600 hover:bg-amber-100 hover:text-amber-900 disabled:opacity-50"
                    title="Dismiss alert"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </AdminCard>
        </div>
      </div>

      <AdminCard className="p-5">
        <h3 className="text-lg font-semibold text-slate-900">Activity Timeline</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {adminTimeline.map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{item.detail}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.time}</p>
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard className="p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-semibold text-slate-700">{formatUsd(totalCryptoValue)} total crypto value across all visible wallet records.</p>
        </div>
      </AdminCard>
    </div>
  );
};
