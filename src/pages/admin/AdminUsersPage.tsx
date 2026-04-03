import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, KeyRound, Coins } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatCompactUsd } from '../../lib/format';
import {
  AdminActionBar,
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminIconAction,
  AdminPageHeading,
  AdminSelect,
  AdminTableWrap,
  AdminTextInput,
} from '../../components/admin/AdminUi';

export const AdminUsersPage = () => {
  const { adminUsers } = useAuth();
  const [search, setSearch] = useState('');
  const [kycFilter, setKycFilter] = useState('all');

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
        description="Recovered user-table flow with direct routes into overview, credentials, crypto records, and card records."
        actions={
          <Link to="/admin/users/create">
            <AdminButton>Create User</AdminButton>
          </Link>
        }
      />

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
              <th className="px-5 py-3 font-semibold">Tier</th>
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
                <td className="px-5 py-4 text-slate-700">{user.tier}</td>
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
                    <AdminIconAction icon={KeyRound} label={`Update ${user.name} credentials`} tone="amber" to={`/admin/users/${user.id}/password`} />
                    <AdminIconAction icon={Coins} label={`Open ${user.name} crypto records`} tone="blue" to={`/admin/users/${user.id}/crypto`} />
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
