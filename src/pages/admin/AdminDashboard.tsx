import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Coins, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatCompactUsd, formatUsd } from '../../lib/format';
import {
  AdminActionBar,
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminIconAction,
  AdminMetricCard,
  AdminNotice,
  AdminPageHeading,
  AdminSelect,
  AdminTableWrap,
  AdminTextArea,
  AdminTextInput,
} from '../../components/admin/AdminUi';

export const AdminDashboard = () => {
  const {
    adminSettings,
    adminAlerts,
    adminMetrics,
    adminTimeline,
    adminTransactions,
    adminUsers,
    sendAdminEmail,
  } = useAuth();
  const totalCards = adminUsers.reduce((count, user) => count + user.cards.length, 0);
  const totalCryptoValue = adminUsers.reduce(
    (total, user) => total + user.holdings.reduce((subTotal, holding) => subTotal + holding.valueUsd, 0),
    0,
  );
  const [compose, setCompose] = useState({
    scope: 'all' as 'all' | 'user',
    userId: adminUsers[0]?.id ?? '',
    subject: '',
    message: '',
  });
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const selectedUser = adminUsers.find((user) => user.id === compose.userId) ?? null;
  const senderName = String(adminSettings?.email?.fromName ?? adminSettings?.general?.companyName ?? adminSettings?.general?.siteName ?? 'Wallet Operations');
  const senderAddress = String(adminSettings?.email?.fromAddress ?? adminSettings?.general?.companyEmail ?? '').trim();
  const recipientCount = compose.scope === 'all' ? adminUsers.length : selectedUser ? 1 : 0;

  return (
    <div className="space-y-6">
      <AdminPageHeading
        title="Admin Dashboard"
        description="Operational metrics, alerts, users, and transactions are now driven by the MySQL-backed admin API."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Total Users" value={String(adminUsers.length)} detail="React view of onboarded accounts" accent="text-violet-600" />
        <AdminMetricCard label="Total Transactions" value={String(adminTransactions.length)} detail="Recent transaction records synced from the backend" accent="text-sky-600" />
        <AdminMetricCard label="Active Cards" value={String(totalCards)} detail="Client cards currently visible in stored user records" accent="text-emerald-600" />
        <AdminMetricCard label="Total Crypto Value" value={formatCompactUsd(totalCryptoValue)} detail="Aggregated holdings from admin-visible wallets" accent="text-amber-600" />
      </div>

      {feedback && <AdminNotice tone="success">{feedback}</AdminNotice>}
      {error && <AdminNotice tone="danger">{error}</AdminNotice>}

      <AdminCard className="p-6">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Send Email Message</h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
              Send a branded system email to every client account or target one user directly from the admin dashboard.
            </p>

            <form
              className="mt-5 grid gap-4"
              onSubmit={async (event) => {
                event.preventDefault();
                setFeedback('');
                setError('');
                setSending(true);

                try {
                  const result = await sendAdminEmail({
                    scope: compose.scope,
                    userId: compose.scope === 'user' ? compose.userId : undefined,
                    subject: compose.subject,
                    message: compose.message,
                  });
                  setFeedback(
                    result.failedCount
                      ? `${result.sentCount} email(s) sent. ${result.failedCount} delivery attempt(s) failed.`
                      : `${result.sentCount} email(s) sent successfully.`,
                  );
                  setCompose((current) => ({ ...current, subject: '', message: '' }));
                } catch (caughtError) {
                  setError(caughtError instanceof Error ? caughtError.message : 'Unable to send the email message.');
                } finally {
                  setSending(false);
                }
              }}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <AdminSelect
                  label="Audience"
                  value={compose.scope}
                  onChange={(event) =>
                    setCompose((current) => ({
                      ...current,
                      scope: event.target.value as 'all' | 'user',
                      userId: event.target.value === 'user' ? current.userId || adminUsers[0]?.id || '' : current.userId,
                    }))
                  }
                >
                  <option value="all">All Users</option>
                  <option value="user">Specific User</option>
                </AdminSelect>

                <AdminSelect
                  label="Recipient"
                  value={compose.userId}
                  disabled={compose.scope !== 'user'}
                  onChange={(event) => setCompose((current) => ({ ...current, userId: event.target.value }))}
                >
                  {adminUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </AdminSelect>
              </div>

              <AdminTextInput
                label="Subject"
                value={compose.subject}
                onChange={(event) => setCompose((current) => ({ ...current, subject: event.target.value }))}
                placeholder="Service update from the operations desk"
              />

              <AdminTextArea
                label="Message"
                rows={8}
                value={compose.message}
                onChange={(event) => setCompose((current) => ({ ...current, message: event.target.value }))}
                placeholder="Write the email message exactly as you want clients to receive it. Separate paragraphs with a blank line."
              />

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-slate-500">
                  {compose.scope === 'all'
                    ? `This send will address ${recipientCount} client account(s) one by one.`
                    : selectedUser
                      ? `This send will go to ${selectedUser.name} at ${selectedUser.email}.`
                      : 'Select a user before sending.'}
                </p>
                <AdminButton type="submit" disabled={sending}>
                  {sending ? 'Sending...' : 'Send Email'}
                </AdminButton>
              </div>
            </form>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Sender</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">{senderName}</p>
              <p className="mt-1 text-sm text-slate-600">{senderAddress || 'Sender email is not configured yet.'}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Delivery Notes</p>
              <div className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
                <p>Messages are wrapped in the system email template before delivery.</p>
                <p>SMTP host, sender email, and credentials must be saved in Email Settings before any send will work.</p>
                <p>Automatic signup, KYC, withdrawal, and admin-created-account emails now use the same layout.</p>
              </div>
            </div>
          </div>
        </div>
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
            <div className="mt-4 space-y-3">
              {adminAlerts.map((alert) => (
                <div key={alert} className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
                  {alert}
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
          <div>
            <p className="text-sm font-medium text-slate-500">Recovered clone fidelity</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              Layout, hierarchy, and operational tables follow the recovered admin pages while remaining fully editable in React.
            </p>
          </div>
          <p className="text-sm font-semibold text-slate-500">{formatUsd(totalCryptoValue)} across visible wallet records</p>
        </div>
      </AdminCard>
    </div>
  );
};
