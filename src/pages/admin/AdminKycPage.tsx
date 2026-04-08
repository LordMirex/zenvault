import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, Clock3, Coins, ExternalLink, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE, apiRequest, getAccessToken } from '../../lib/api';
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
  AdminTextArea,
} from '../../components/admin/AdminUi';

const formatFileSize = (sizeBytes: number) => {
  if (sizeBytes <= 0) return 'Historical record';
  if (sizeBytes < 1024 * 1024) return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const AdminKycPage = () => {
  const { refreshBootstrap, adminKycCases, adminUsers } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [openingDocumentId, setOpeningDocumentId] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const cases = adminKycCases.filter((item) =>
    statusFilter === 'all' ? true : item.status.toLowerCase() === statusFilter,
  );
  const selectedCase = selectedCaseId ? adminKycCases.find((item) => item.id === selectedCaseId) ?? null : null;
  const selectedUser = selectedCase ? adminUsers.find((entry) => entry.id === selectedCase.userId) ?? null : null;

  const caseMetrics = useMemo(() => ({
    pending: adminKycCases.filter((item) => item.status === 'Pending').length,
    review: adminKycCases.filter((item) => item.status === 'Needs review').length,
    approved: adminKycCases.filter((item) => item.status === 'Approved').length,
  }), [adminKycCases]);

  useEffect(() => {
    setNoteDraft(selectedCase?.note ?? '');
  }, [selectedCase?.id, selectedCase?.note]);

  const handleCaseUpdate = async (
    caseId: string,
    payload: { status?: 'Approved' | 'Pending' | 'Needs review'; note?: string },
    successMessage: string,
  ) => {
    setFeedback('');
    setError('');
    setActiveCaseId(caseId);

    try {
      await apiRequest(`/api/admin/kyc/${caseId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      await refreshBootstrap();
      setFeedback(successMessage);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to update the KYC case.');
    } finally {
      setActiveCaseId(null);
    }
  };

  const handleOpenDocument = async (documentId: string, downloadPath: string, fileName: string) => {
    if (!downloadPath) {
      setError('This legacy case has no file stored in the current document layer.');
      return;
    }

    setOpeningDocumentId(documentId);
    setError('');

    try {
      const token = getAccessToken();
      const response = await fetch(`${API_BASE}${downloadPath}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(typeof payload?.message === 'string' ? payload.message : 'Unable to open the document.');
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const opened = window.open(objectUrl, '_blank', 'noopener,noreferrer');

      if (!opened) {
        const link = window.document.createElement('a');
        link.href = objectUrl;
        link.download = fileName;
        link.click();
      }

      window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60_000);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to open the document.');
    } finally {
      setOpeningDocumentId('');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeading
        title="KYC Verification"
        description="Uploaded KYC files, review notes, and case decisions now flow through the same admin queue instead of a placeholder screen."
      />

      {feedback && <AdminNotice tone="success">{feedback}</AdminNotice>}
      {error && <AdminNotice tone="danger">{error}</AdminNotice>}

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Pending" value={String(caseMetrics.pending)} tone="blue" />
        <MetricCard label="Needs Review" value={String(caseMetrics.review)} tone="amber" />
        <MetricCard label="Approved" value={String(caseMetrics.approved)} tone="emerald" />
      </div>

      <AdminCard className="p-5">
        <div className="grid gap-4 md:grid-cols-[220px_1fr_auto]">
          <AdminSelect label="Filter Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="needs review">Needs review</option>
          </AdminSelect>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Each case now exposes its uploaded files, operator note, and direct decision actions from this queue.
          </div>
          <div className="flex items-end">
            <AdminButton variant="secondary" className="w-full md:w-auto" onClick={() => void refreshBootstrap()}>
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
              <th className="px-5 py-3 font-semibold">Document Bundle</th>
              <th className="px-5 py-3 font-semibold">Files</th>
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
                    <p className="text-xs text-slate-500">{user?.email ?? item.note}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{item.documentType}</p>
                    <p className="text-xs text-slate-500">{item.country || 'Country unavailable'}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-700">{item.documents.length}</td>
                  <td className="px-5 py-4">
                    <AdminBadge value={item.status} />
                  </td>
                  <td className="px-5 py-4 text-slate-500">{item.submittedAt || 'Awaiting upload'}</td>
                  <td className="px-5 py-4">
                    <AdminActionBar>
                      <AdminIconAction icon={Eye} label={`Inspect ${item.id}`} tone="violet" onClick={() => setSelectedCaseId(item.id)} />
                      <AdminIconAction
                        icon={Check}
                        label={`Approve ${item.id}`}
                        tone="emerald"
                        disabled={item.status === 'Approved' || activeCaseId === item.id}
                        onClick={() => void handleCaseUpdate(item.id, { status: 'Approved' }, 'KYC case approved.')}
                      />
                      <AdminIconAction
                        icon={AlertTriangle}
                        label={`Move ${item.id} to needs review`}
                        tone="amber"
                        disabled={item.status === 'Needs review' || activeCaseId === item.id}
                        onClick={() => void handleCaseUpdate(item.id, { status: 'Needs review' }, 'KYC case moved to needs review.')}
                      />
                      <AdminIconAction
                        icon={Clock3}
                        label={`Move ${item.id} to pending`}
                        tone="blue"
                        disabled={item.status === 'Pending' || activeCaseId === item.id}
                        onClick={() => void handleCaseUpdate(item.id, { status: 'Pending' }, 'KYC case moved to pending.')}
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
        title={selectedCase ? selectedCase.documentType : 'KYC Case'}
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
                <AdminButton
                  variant="secondary"
                  disabled={activeCaseId === selectedCase.id}
                  onClick={() => void handleCaseUpdate(selectedCase.id, { note: noteDraft }, 'KYC note saved.')}
                >
                  Save Note
                </AdminButton>
                <AdminIconAction
                  icon={Check}
                  label={`Approve ${selectedCase.id}`}
                  tone="emerald"
                  disabled={selectedCase.status === 'Approved' || activeCaseId === selectedCase.id}
                  onClick={() => void handleCaseUpdate(selectedCase.id, { status: 'Approved', note: noteDraft }, 'KYC case approved.')}
                />
                <AdminIconAction
                  icon={AlertTriangle}
                  label={`Move ${selectedCase.id} to needs review`}
                  tone="amber"
                  disabled={selectedCase.status === 'Needs review' || activeCaseId === selectedCase.id}
                  onClick={() => void handleCaseUpdate(selectedCase.id, { status: 'Needs review', note: noteDraft }, 'KYC case moved to needs review.')}
                />
                <AdminIconAction
                  icon={Clock3}
                  label={`Move ${selectedCase.id} to pending`}
                  tone="blue"
                  disabled={selectedCase.status === 'Pending' || activeCaseId === selectedCase.id}
                  onClick={() => void handleCaseUpdate(selectedCase.id, { status: 'Pending', note: noteDraft }, 'KYC case moved to pending.')}
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
              <InfoTile label="Country" value={selectedCase.country || 'Unavailable'} />
              <InfoTile label="Status" value={selectedCase.status} />
              <InfoTile label="Submitted" value={selectedCase.submittedAt || 'Awaiting upload'} />
              <InfoTile label="User UUID" value={selectedUser?.uuid ?? 'Unavailable'} />
            </div>

            <AdminTextArea
              label="Operator Note"
              rows={4}
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              placeholder="Add review notes or document deficiencies here."
            />

            <AdminCard className="border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Attached Files</p>

              <div className="mt-4 space-y-3">
                {selectedCase.documents.length ? selectedCase.documents.map((document) => (
                  <div key={document.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{document.label}</p>
                        <p className="mt-1 text-sm text-slate-600">{document.originalName}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                          {formatFileSize(document.sizeBytes)} {document.uploadedAt ? `• ${document.uploadedAt}` : ''}
                        </p>
                      </div>

                      <AdminButton
                        variant="secondary"
                        disabled={openingDocumentId === document.id}
                        onClick={() => void handleOpenDocument(document.id, document.downloadPath, document.originalName)}
                      >
                        <span className="inline-flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          {openingDocumentId === document.id ? 'Opening...' : document.downloadPath ? 'Open File' : 'Record Only'}
                        </span>
                      </AdminButton>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500">
                    No files are attached to this case.
                  </div>
                )}
              </div>
            </AdminCard>
          </div>
        )}
      </AdminModal>
    </div>
  );
};

const MetricCard = ({ label, value, tone }: { label: string; value: string; tone: 'blue' | 'amber' | 'emerald' }) => (
  <AdminCard className="p-5">
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <p className={`mt-3 text-3xl font-black ${
      tone === 'emerald' ? 'text-emerald-600' : tone === 'amber' ? 'text-amber-500' : 'text-blue-600'
    }`}>
      {value}
    </p>
  </AdminCard>
);

const InfoTile = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4">
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
    <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
  </div>
);
