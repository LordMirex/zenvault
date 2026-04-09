import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, KeyRound, Coins, CreditCard, LogIn, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest, setImpersonationToken } from '../../lib/api';
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
  AdminTableWrap,
  AdminTextInput,
} from '../../components/admin/AdminUi';

export const AdminUsersPage = () => {
  const { adminUsers, refreshBootstrap } = useAuth();
  const [search, setSearch] = useState('');
  const [kycFilter, setKycFilter] = useState('all');
  const [loginAsError, setLoginAsError] = useState('');
  const [loginAsBusy, setLoginAsBusy] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleLoginAs = async (userId: string, name: string) => {
    setLoginAsBusy(userId);
    setLoginAsError('');
    try {
      const { token } = await apiRequest<{ token: string }>(`/api/admin/impersonate/${userId}`, { method: 'POST' });
      setImpersonationToken(token);
      window.location.href = '/app';
    } catch (err) {
      setLoginAsError(err instanceof Error ? err.message : `Failed to open session for ${name}.`);
      setLoginAsBusy(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    setDeleteError('');
    try {
      await apiRequest(`/api/admin/users/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      await refreshBootstrap();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete user.');
      setDeleteBusy(false);
    }
  };

  const filteredUsers = adminUsers.filter((user) => {
    const matchesSearch =
      search.length === 0 ||
      [user.name, user.email, user.uuid].some((value) => value.toLowerCase().includes(search.toLowerCase()));
    const matchesKyc = kycFilter === 'all' || user.kycStatus.toLowerCase() === kycFilter;
    return matchesSearch && matchesKyc;
  });

  return (
    <div className="space-y-6">
      <AdminPageHeading
        title="Users Management"
        description="Direct access to user overview, reset password, live asset funding, and card records."
        actions={
          <Link to="/admin/users/create">
            <AdminButton>Create User</AdminButton>
          </Link>
        }
      />

      {loginAsError && <AdminNotice tone="danger">{loginAsError}</AdminNotice>}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900">Delete User</h2>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to permanently delete <span className="font-semibold">{deleteTarget.name}</span>?
              This will remove their account, transactions, and KYC records. This cannot be undone.
            </p>
            {deleteError && <p className="mt-3 text-sm font-medium text-rose-600">{deleteError}</p>}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => { setDeleteTarget(null); setDeleteError(''); }}
                disabled={deleteBusy}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={deleteBusy}
                className="flex-1 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {deleteBusy ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminCard className="p-5">
        <div className="grid gap-4 md:grid-cols-4">
          <AdminSelect label="KYC Status" value={kycFilter} onChange={(event) => setKycFilter(event.target.value)}>
            <option value="all">All status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="needs review">Needs review</option>
          </AdminSelect>

          <div className="md:col-span-2">
            <AdminTextInput
              label="Search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, or ID..."
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => { setSearch(''); setKycFilter('all'); }}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              title="Clear all filters"
            >
              {filteredUsers.length} visible — Clear filters
            </button>
          </div>
        </div>
      </AdminCard>

      <AdminTableWrap>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">KYC</th>
              <th className="px-5 py-3 font-semibold">Portfolio</th>
              <th className="px-5 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-slate-50/80">
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{user.uuid}</p>
                </td>
                <td className="px-5 py-4">
                  <AdminBadge value={user.status} />
                </td>
                <td className="px-5 py-4">
                  <AdminBadge value={user.kycStatus} />
                </td>
                <td className="px-5 py-4 font-semibold text-slate-900">{formatCompactUsd(user.portfolioUsd)}</td>
                <td className="px-5 py-4">
                  <AdminActionBar>
                    <AdminIconAction icon={Eye} label={`Inspect ${user.name}`} tone="violet" to={`/admin/users/${user.id}`} />
                    <AdminIconAction icon={KeyRound} label={`Reset ${user.name} password`} tone="amber" to={`/admin/users/${user.id}/password`} />
                    <AdminIconAction icon={Coins} label={`Fund ${user.name} crypto wallet`} tone="blue" to={`/admin/users/${user.id}/crypto`} />
                    <AdminIconAction icon={CreditCard} label={`Manage ${user.name} cards`} tone="emerald" to={`/admin/users/${user.id}/cards`} />
                    <AdminIconAction
                      icon={LogIn}
                      label={`Login as ${user.name}`}
                      tone="slate"
                      onClick={() => void handleLoginAs(user.id, user.name)}
                      disabled={loginAsBusy === user.id}
                    />
                    <AdminIconAction
                      icon={Trash2}
                      label={`Delete ${user.name}`}
                      tone="rose"
                      onClick={() => setDeleteTarget({ id: user.id, name: user.name })}
                    />
                  </AdminActionBar>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableWrap>
    </div>
  );
};
