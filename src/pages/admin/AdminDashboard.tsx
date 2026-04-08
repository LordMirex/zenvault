import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Coins,
  CreditCard,
  Megaphone,
  ShieldCheck,
  Users,
  TrendingUp,
  ArrowUpRight,
  X,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import { formatCompactUsd } from '../../lib/format';
import {
  AdminActionBar,
  AdminBadge,
  AdminCard,
  AdminIconAction,
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
    adminKycCases,
    refreshBootstrap,
  } = useAuth();

  const [alertText, setAlertText] = useState('');
  const [alertBusy, setAlertBusy] = useState(false);
  const [alertError, setAlertError] = useState('');

  const totalCards = adminUsers.reduce((count, user) => count + user.cards.length, 0);
  const totalCryptoValue = adminUsers.reduce(
    (total, user) => total + user.holdings.reduce((sub, h) => sub + h.valueUsd, 0),
    0,
  );
  const pendingKyc = adminKycCases?.filter((c) => c.status === 'Pending' || c.status === 'Needs review').length ?? 0;
  const approvedKyc = adminKycCases?.filter((c) => c.status === 'Approved').length ?? 0;
  const recentTransactions = adminTransactions.slice(0, 8);

  const handleAddAlert = async () => {
    const text = alertText.trim();
    if (!text) return;
    setAlertBusy(true);
    setAlertError('');
    try {
      await apiRequest('/api/admin/alerts', { method: 'POST', body: JSON.stringify({ text }) });
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
    try {
      await apiRequest(`/api/admin/alerts/${index}`, { method: 'DELETE' });
      await refreshBootstrap();
    } catch (err) {
      setAlertError(err instanceof Error ? err.message : 'Failed to dismiss alert.');
    } finally {
      setAlertBusy(false);
    }
  };

  const hasRightSidebarContent = adminMetrics.length > 0 || adminTimeline.length > 0;

  return (
    <div className="space-y-6">
      <AdminPageHeading
        title="Overview"
        description="Platform health, active alerts, recent transactions, and quick navigation."
      />

      {alertError && <AdminNotice tone="danger">{alertError}</AdminNotice>}

      {/* Key metrics — 5 cards including KYC */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <MetricCard
          icon={Users}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
          label="Total Users"
          value={String(adminUsers.length)}
          detail="Registered accounts"
          linkTo="/admin/users"
        />
        <MetricCard
          icon={TrendingUp}
          iconColor="text-sky-600"
          iconBg="bg-sky-50"
          label="Transactions"
          value={String(adminTransactions.length)}
          detail="All transaction records"
          linkTo="/admin/transactions"
        />
        <MetricCard
          icon={CreditCard}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          label="Active Cards"
          value={String(totalCards)}
          detail="Cards issued across accounts"
        />
        <MetricCard
          icon={Coins}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          label="Wallet Value"
          value={formatCompactUsd(totalCryptoValue)}
          detail="Total holdings under management"
        />
        <MetricCard
          icon={pendingKyc > 0 ? AlertTriangle : CheckCircle}
          iconColor={pendingKyc > 0 ? 'text-orange-600' : 'text-green-600'}
          iconBg={pendingKyc > 0 ? 'bg-orange-50' : 'bg-green-50'}
          label="KYC Pending"
          value={String(pendingKyc)}
          detail={`${approvedKyc} approved · ${pendingKyc} need review`}
          linkTo="/admin/kyc"
          urgent={pendingKyc > 0}
        />
      </div>

      {/* Quick actions row */}
      <div className="grid gap-3 grid-cols-1 min-[480px]:grid-cols-3">
        <Link
          to="/admin/broadcasts"
          className="flex items-center gap-4 rounded-xl border border-violet-100 bg-violet-50 p-4 transition-colors hover:bg-violet-100 group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white">
            <Megaphone className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-violet-900">Broadcasts</p>
            <p className="text-xs text-violet-600">Send messages to all clients</p>
          </div>
          <ArrowUpRight className="ml-auto h-4 w-4 text-violet-400 group-hover:text-violet-700" />
        </Link>

        <Link
          to="/admin/kyc"
          className="flex items-center gap-4 rounded-xl border border-amber-100 bg-amber-50 p-4 transition-colors hover:bg-amber-100 group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-amber-900">KYC Reviews</p>
            <p className="text-xs text-amber-600">
              {pendingKyc > 0 ? `${pendingKyc} case${pendingKyc !== 1 ? 's' : ''} need attention` : 'All cases up to date'}
            </p>
          </div>
          {pendingKyc > 0 && (
            <span className="shrink-0 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">{pendingKyc}</span>
          )}
        </Link>

        <Link
          to="/admin/users"
          className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-slate-100 group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700 text-white">
            <Users className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900">Users</p>
            <p className="text-xs text-slate-500">Manage accounts &amp; wallets</p>
          </div>
          <ArrowUpRight className="ml-auto h-4 w-4 text-slate-400 group-hover:text-slate-700" />
        </Link>
      </div>

      {/* Main content: transactions table + sidebar */}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px] min-w-0">
        {/* Recent transactions */}
        <AdminTableWrap>
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h3 className="text-base font-semibold text-slate-900">Recent Transactions</h3>
            <Link to="/admin/transactions" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
              View all →
            </Link>
          </div>
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">User</th>
                <th className="px-5 py-3 font-semibold">Type · Asset</th>
                <th className="px-5 py-3 font-semibold text-right">Amount</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <Activity className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">No transactions yet</p>
                    <p className="mt-1 text-xs text-slate-400">Transactions will appear here as users deposit and withdraw.</p>
                  </td>
                </tr>
              )}
              {recentTransactions.map((transaction) => {
                const txUser = adminUsers.find((u) => u.id === transaction.userId);
                return (
                  <tr key={transaction.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-900 leading-tight">{txUser?.name ?? 'Unknown'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{txUser?.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800">{transaction.type}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{transaction.asset}</p>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <p className="font-bold text-slate-900 tabular-nums">{transaction.amount}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{transaction.createdAt}</p>
                    </td>
                    <td className="px-5 py-3">
                      <AdminBadge value={transaction.status} />
                    </td>
                    <td className="px-5 py-3">
                      <AdminActionBar>
                        <AdminIconAction
                          icon={Coins}
                          label={`${txUser?.name ?? 'User'} crypto wallet`}
                          tone="blue"
                          to={txUser ? `/admin/users/${txUser.id}/crypto` : undefined}
                          disabled={!txUser}
                        />
                        <AdminIconAction
                          icon={CreditCard}
                          label={`${txUser?.name ?? 'User'} cards`}
                          tone="emerald"
                          to={txUser ? `/admin/users/${txUser.id}/cards` : undefined}
                          disabled={!txUser}
                        />
                      </AdminActionBar>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </AdminTableWrap>

        {/* Right column */}
        <div className="space-y-5 min-w-0">
          {/* Admin Alerts */}
          <AdminCard className="p-5">
            <h3 className="text-sm font-semibold text-slate-900">Internal Alerts</h3>
            <p className="mt-1 text-xs text-slate-500">Pinned notes visible only to admins on this dashboard.</p>

            <div className="mt-4 flex gap-2">
              <AdminTextInput
                label=""
                value={alertText}
                onChange={(e) => setAlertText(e.target.value)}
                placeholder="Type a note and press Enter..."
                onKeyDown={(e) => { if (e.key === 'Enter') void handleAddAlert(); }}
              />
              <div className="flex items-end">
                <AdminButton
                  variant="secondary"
                  onClick={() => void handleAddAlert()}
                  disabled={alertBusy || !alertText.trim()}
                >
                  Add
                </AdminButton>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {adminAlerts.length === 0 && (
                <p className="py-3 text-center text-xs text-slate-400">No active alerts.</p>
              )}
              {adminAlerts.map((alert, index) => (
                <div
                  key={`${alert}-${index}`}
                  className="flex items-start justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 min-w-0 overflow-hidden"
                >
                  <p className="text-sm leading-6 text-amber-900 break-words min-w-0 overflow-hidden">{alert}</p>
                  <button
                    type="button"
                    disabled={alertBusy}
                    onClick={() => void handleDismissAlert(index)}
                    className="shrink-0 rounded p-0.5 text-amber-500 hover:bg-amber-100 hover:text-amber-800 disabled:opacity-40"
                    title="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </AdminCard>

          {/* Operational metrics */}
          {adminMetrics.length > 0 && (
            <AdminCard className="p-5">
              <h3 className="text-sm font-semibold text-slate-900">Operational Snapshot</h3>
              <div className="mt-4 space-y-3">
                {adminMetrics.map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-600">{metric.label}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-400">{metric.detail}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-black text-slate-900">{metric.value}</p>
                      <p className="text-xs text-slate-500">{metric.change}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>
          )}

          {/* Activity timeline */}
          {adminTimeline.length > 0 && (
            <AdminCard className="p-5">
              <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
              <div className="mt-4 space-y-3">
                {adminTimeline.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 leading-tight">{item.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500 leading-5">{item.detail}</p>
                      <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>
          )}

          {/* Platform summary — shown when metrics/timeline are empty */}
          {!hasRightSidebarContent && (
            <AdminCard className="p-5">
              <h3 className="text-sm font-semibold text-slate-900">Platform Summary</h3>
              <div className="mt-4 space-y-3">
                <SummaryRow label="Total users" value={String(adminUsers.length)} />
                <SummaryRow label="Total transactions" value={String(adminTransactions.length)} />
                <SummaryRow label="Cards issued" value={String(totalCards)} />
                <SummaryRow label="KYC approved" value={String(approvedKyc)} />
                <SummaryRow
                  label="KYC pending review"
                  value={String(pendingKyc)}
                  urgent={pendingKyc > 0}
                />
                <SummaryRow label="Total wallet value" value={formatCompactUsd(totalCryptoValue)} />
              </div>
            </AdminCard>
          )}
        </div>
      </div>
    </div>
  );
};

const SummaryRow = ({
  label,
  value,
  urgent,
}: {
  label: string;
  value: string;
  urgent?: boolean;
}) => (
  <div className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 px-4 py-2.5">
    <p className="text-xs font-medium text-slate-500">{label}</p>
    <p className={`text-sm font-black ${urgent ? 'text-orange-600' : 'text-slate-900'}`}>{value}</p>
  </div>
);

const MetricCard = ({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
  detail,
  linkTo,
  urgent,
}: {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  detail: string;
  linkTo?: string;
  urgent?: boolean;
}) => {
  const inner = (
    <div className={`rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md h-full ${urgent ? 'border-orange-200 bg-orange-50/50' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        {linkTo && <ArrowUpRight className="h-4 w-4 text-slate-300" />}
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 truncate">{label}</p>
      <p className={`mt-1 text-2xl font-black leading-none ${urgent ? 'text-orange-700' : 'text-slate-900'}`}>{value}</p>
      <p className="mt-1.5 text-[11px] text-slate-400 leading-relaxed truncate">{detail}</p>
    </div>
  );

  return linkTo ? <Link to={linkTo} className="block">{inner}</Link> : <div>{inner}</div>;
};
