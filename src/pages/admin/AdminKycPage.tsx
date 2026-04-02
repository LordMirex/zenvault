import { useState } from 'react';
import { AlertTriangle, Check, Clock3, Coins, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import {
  AdminActionBar,
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminIconAction,
  AdminModal,
  AdminNotice,
  AdminPageHeading,
  AdminSelect,
  AdminTableWrap,
} from '../../components/admin/AdminUi';

export const AdminKycPage = () => {
  const { refreshBootstrap, adminKycCases, adminUsers } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const cases = adminKycCases.filter((item) =>
    statusFilter === 'all' ? true : item.status.toLowerCase() === statusFilter,
  );
  const selectedCase = selectedCaseId ? adminKycCases.find((item) => item.id === selectedCaseId) ?? null : null;
  const selectedUser = selectedCase ? adminUsers.find((entry) => entry.id === selectedCase.userId) ?? null : null;

  const handleStatusChange = async (caseId: string, status: 'Approved' | 'Pending' | 'Needs review') => {
    setFeedback('');
    setError('');
    setActiveCaseId(caseId);

    try {
      await apiRequest(`/api/admin/kyc/${caseId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      await refreshBootstrap();
      setFeedback(`KYC case moved to ${status}.`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to update the KYC case.');
    } finally {
      setActiveCaseId(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeading
        title="KYC Verification"
        description="Pending, approved, and review-stage compliance cases are presented with the same simple operational feel as the recovered admin page."
      />

      {feedback && <AdminNotice tone="success">{feedback}</AdminNotice>}
      {error && <AdminNotice tone="danger">{error}</AdminNotice>}

      <AdminCard className="p-5">
        <div className="grid gap-4 md:grid-cols-[220px_1fr_auto]">
          <AdminSelect label="Filter Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="needs review">Needs review</option>
          </AdminSelect>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Preview, decisions, uploads, and approval messaging can connect directly to backend compliance workflows later.
          </div>
          <div className="flex items-end">
            <AdminButton variant="secondary" className="w-full md:w-auto">
              Refresh Queue
            </AdminButton>
          </div>
        </div>
      </AdminCard>

      <AdminTableWrap>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Document</th>
              <th className="px-5 py-3 font-semibold">Country</th>
              <th className="px-5 py-3 font-semibold">Risk</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Submitted</th>
              <th className="px-5 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {cases.map((item) => {
              const user = adminUsers.find((entry) => entry.id === item.userId);

              return (
                <tr key={item.id} className="transition-colors hover:bg-slate-50/80">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">{user?.name ?? 'Unknown user'}</p>
                    <p className="text-xs text-slate-500">{item.note}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-700">{item.documentType}</td>
                  <td className="px-5 py-4 text-slate-700">{item.country}</td>
                  <td className="px-5 py-4">
                    <AdminBadge value={item.riskLevel} />
                  </td>
                  <td className="px-5 py-4">
                    <AdminBadge value={item.status} />
                  </td>
                  <td className="px-5 py-4 text-slate-500">{item.submittedAt}</td>
                  <td className="px-5 py-4">
                    <AdminActionBar>
                      <AdminIconAction icon={Eye} label={`Inspect ${item.id}`} tone="violet" onClick={() => setSelectedCaseId(item.id)} />
                      <AdminIconAction
                        icon={Check}
                        label={`Approve ${item.id}`}
                        tone="emerald"
                        disabled={item.status === 'Approved' || activeCaseId === item.id}
                        onClick={() => void handleStatusChange(item.id, 'Approved')}
                      />
                      <AdminIconAction
                        icon={AlertTriangle}
                        label={`Move ${item.id} to needs review`}
                        tone="amber"
                        disabled={item.status === 'Needs review' || activeCaseId === item.id}
                        onClick={() => void handleStatusChange(item.id, 'Needs review')}
                      />
                      <AdminIconAction
                        icon={Clock3}
                        label={`Move ${item.id} to pending`}
                        tone="blue"
                        disabled={item.status === 'Pending' || activeCaseId === item.id}
                        onClick={() => void handleStatusChange(item.id, 'Pending')}
                      />
                    </AdminActionBar>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </AdminTableWrap>

      <AdminModal
        open={Boolean(selectedCase)}
        title={selectedCase ? `${selectedCase.documentType}` : 'KYC Case'}
        description={selectedUser ? `${selectedUser.name} - ${selectedUser.email}` : 'Compliance case'}
        onClose={() => setSelectedCaseId(null)}
        footer={
          selectedCase ? (
            <AdminActionBar className="justify-between">
              <AdminIconAction
                icon={Coins}
                label={`Open ${selectedUser?.name ?? 'user'} crypto records`}
                tone="violet"
                to={selectedUser ? `/admin/users/${selectedUser.id}/crypto` : undefined}
                disabled={!selectedUser}
              />
              <AdminActionBar>
                <AdminIconAction
                  icon={Check}
                  label={`Approve ${selectedCase.id}`}
                  tone="emerald"
                  disabled={selectedCase.status === 'Approved' || activeCaseId === selectedCase.id}
                  onClick={() => void handleStatusChange(selectedCase.id, 'Approved')}
                />
                <AdminIconAction
                  icon={AlertTriangle}
                  label={`Move ${selectedCase.id} to needs review`}
                  tone="amber"
                  disabled={selectedCase.status === 'Needs review' || activeCaseId === selectedCase.id}
                  onClick={() => void handleStatusChange(selectedCase.id, 'Needs review')}
                />
                <AdminIconAction
                  icon={Clock3}
                  label={`Move ${selectedCase.id} to pending`}
                  tone="blue"
                  disabled={selectedCase.status === 'Pending' || activeCaseId === selectedCase.id}
                  onClick={() => void handleStatusChange(selectedCase.id, 'Pending')}
                />
              </AdminActionBar>
            </AdminActionBar>
          ) : null
        }
      >
        {selectedCase && (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <InfoTile label="Case ID" value={selectedCase.id} />
              <InfoTile label="Country" value={selectedCase.country} />
              <InfoTile label="Risk" value={selectedCase.riskLevel} />
              <InfoTile label="Status" value={selectedCase.status} />
              <InfoTile label="Submitted" value={selectedCase.submittedAt || 'Not submitted'} />
              <InfoTile label="User UUID" value={selectedUser?.uuid ?? 'Unavailable'} />
            </div>

            <AdminCard className="border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Compliance Note</p>
              <p className="mt-3 text-sm leading-7 text-slate-700">{selectedCase.note}</p>
            </AdminCard>
          </div>
        )}
      </AdminModal>
    </div>
  );
};

const InfoTile = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4">
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
    <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
  </div>
);
