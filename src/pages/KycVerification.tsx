import { useMemo, useState } from 'react';
import { AlertTriangle, BadgeCheck, CheckCircle2, Clock3, ExternalLink, FileText, ShieldCheck, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE, apiRequest, getAccessToken } from '../lib/api';

type UploadFieldKey = 'governmentId' | 'proofOfAddress' | 'sourceOfFunds';

const uploadFields: { key: UploadFieldKey; title: string; detail: string; required: boolean }[] = [
  { key: 'governmentId', title: 'Government ID', detail: 'Passport, national ID card, or driver license.', required: true },
  { key: 'proofOfAddress', title: 'Proof of Address', detail: 'Utility bill, bank statement, or residence document from the last 90 days.', required: true },
  { key: 'sourceOfFunds', title: 'Source of Funds', detail: 'Optional unless compliance asks for higher-limit evidence.', required: false },
];

const emptyFiles: Record<UploadFieldKey, File | null> = {
  governmentId: null,
  proofOfAddress: null,
  sourceOfFunds: null,
};

const fallbackChecklist = [
  { id: 'kyc-1', title: 'Government ID', detail: 'Upload a passport, national ID card, or driver license.', status: 'Required' },
  { id: 'kyc-2', title: 'Proof of Address', detail: 'Upload a recent utility bill, bank statement, or similar residence document.', status: 'Required' },
  { id: 'kyc-3', title: 'Source of Funds', detail: 'Optional unless the compliance desk asks for a higher-limit review.', status: 'Optional' },
];

const statusTone = (value: string) => {
  const normalized = value.toLowerCase();

  if (normalized.includes('approved') || normalized.includes('completed')) {
    return 'border-success/20 bg-success/10 text-success';
  }

  if (normalized.includes('review') || normalized.includes('required')) {
    return 'border-amber-400/20 bg-amber-400/10 text-amber-300';
  }

  if (normalized.includes('optional')) {
    return 'border-gray-700 bg-dark-800/80 text-gray-400';
  }

  return 'border-primary/20 bg-primary/10 text-primary';
};

const formatFileSize = (sizeBytes: number) => {
  if (sizeBytes <= 0) return 'Historical record';
  if (sizeBytes < 1024 * 1024) return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const KycVerification = () => {
  const { clientProfile, clientKycChecklist, clientKycCases, refreshBootstrap } = useAuth();
  const [files, setFiles] = useState<Record<UploadFieldKey, File | null>>(emptyFiles);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [openingDocumentId, setOpeningDocumentId] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const activeCase = clientKycCases[0] ?? null;
  const documentsByField = useMemo(
    () => new Map((activeCase?.documents ?? []).map((document) => [document.fieldName, document])),
    [activeCase?.documents],
  );
  const normalizedStatus = (activeCase?.status ?? clientProfile?.kycStatus ?? '').toLowerCase();
  const isApproved = normalizedStatus === 'approved';
  const needsReview = normalizedStatus === 'needs review';
  const checklist = clientKycChecklist.length ? clientKycChecklist : fallbackChecklist;

  const handleSubmit = async () => {
    if (!files.governmentId || !files.proofOfAddress) {
      setError('Government ID and proof of address are both required.');
      return;
    }

    setSubmitting(true);
    setFeedback('');
    setError('');

    try {
      const formData = new FormData();
      formData.append('governmentId', files.governmentId);
      formData.append('proofOfAddress', files.proofOfAddress);
      if (files.sourceOfFunds) formData.append('sourceOfFunds', files.sourceOfFunds);
      if (note.trim()) formData.append('note', note.trim());

      const payload = await apiRequest<{ message: string }>('/api/client/kyc/submit', {
        method: 'POST',
        body: formData,
      });

      setFiles(emptyFiles);
      setNote('');
      setFeedback(payload.message || 'KYC documents submitted successfully.');
      await refreshBootstrap();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to submit the KYC documents.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDocument = async (documentId: string, downloadPath: string, fileName: string) => {
    if (!downloadPath) {
      setError('This historical record has no file attached in the current storage layer.');
      return;
    }

    setOpeningDocumentId(documentId);

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className={`rounded-[2rem] border p-6 md:p-8 ${
        isApproved
          ? 'border-success/20 bg-gradient-to-br from-success/10 via-dark-900 to-dark-900'
          : needsReview
            ? 'border-amber-400/20 bg-gradient-to-br from-amber-400/10 via-dark-900 to-dark-900'
            : 'border-primary/20 bg-gradient-to-br from-primary/10 via-dark-900 to-dark-900'
      }`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className={`text-xs font-bold uppercase tracking-[0.22em] ${isApproved ? 'text-success' : needsReview ? 'text-amber-300' : 'text-primary'}`}>
              {isApproved ? 'Verification approved' : needsReview ? 'Action required' : activeCase?.documents.length ? 'Submission in queue' : 'KYC not started'}
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
              {isApproved
                ? 'Your compliance file is complete'
                : needsReview
                  ? 'Compliance needs an updated document set'
                  : activeCase?.documents.length
                    ? 'Your KYC documents are under review'
                    : 'Upload your documents to unlock the real verification flow'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-400 md:text-base">
              {activeCase?.note || 'Government ID and proof of address are required before higher transfer limits and review completion can happen.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <InfoTile label="Status" value={activeCase?.status || 'Not submitted'} />
            <InfoTile label="Last Submission" value={activeCase?.submittedAt || 'Not submitted'} />
            <InfoTile label="Documents On File" value={String(activeCase?.documents.length ?? 0)} />
          </div>
        </div>
      </section>

      {feedback && <section className="rounded-[1.75rem] border border-success/20 bg-success/10 px-5 py-4 text-sm text-success">{feedback}</section>}
      {error && <section className="rounded-[1.75rem] border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-300">{error}</section>}

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Upload size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Upload Center</p>
                <p className="text-sm text-gray-500">PNG, JPG, WebP, or PDF. Max 8 MB per file.</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {uploadFields.map((field) => (
                <div key={field.key} className="rounded-[1.5rem] border border-gray-800 bg-dark-800/70 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white">{field.title}</p>
                        {field.required && <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Required</span>}
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{field.detail}</p>
                      <p className="mt-2 text-xs text-gray-400">
                        {files[field.key]?.name || documentsByField.get(field.key)?.originalName || 'No file selected yet.'}
                      </p>
                    </div>

                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-gray-700 bg-dark-900 px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-gray-200 transition-colors hover:border-primary/30 hover:text-white">
                      <Upload size={16} />
                      {files[field.key] ? 'Replace File' : 'Choose File'}
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.webp,.pdf"
                        className="hidden"
                        onChange={(event) => setFiles((current) => ({ ...current, [field.key]: event.target.files?.[0] ?? null }))}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-bold text-white">Compliance note</span>
              <textarea
                rows={4}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add anything the review desk should know about these documents."
                className="w-full rounded-[1.5rem] border border-gray-800 bg-dark-800/70 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
            </label>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-6 text-gray-500">Required uploads replace the current open case while approved history stays visible below.</p>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-dark-900 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ShieldCheck size={16} />
                {submitting ? 'Submitting...' : 'Submit KYC'}
              </button>
            </div>
          </section>

          <section className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
            <div className="flex items-center gap-3">
              <BadgeCheck className="text-success" size={18} />
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white">Verification Checklist</h3>
            </div>

            <div className="mt-5 space-y-3">
              {checklist.map((item) => (
                <div key={item.id} className="rounded-[1.5rem] border border-gray-800 bg-dark-800/70 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-gray-500">{item.detail}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${statusTone(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
            <div className="flex items-start gap-3">
              {isApproved ? <CheckCircle2 className="mt-0.5 text-success" size={18} /> : needsReview ? <AlertTriangle className="mt-0.5 text-amber-300" size={18} /> : <Clock3 className="mt-0.5 text-primary" size={18} />}
              <div>
                <p className="text-sm font-bold text-white">Current Review State</p>
                <p className="mt-1 text-sm text-gray-400">{activeCase?.note || 'No review note has been attached to this account yet.'}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
            <div className="flex items-center gap-3">
              <FileText className="text-primary" size={18} />
              <div>
                <p className="text-sm font-bold text-white">Latest Submission</p>
                <p className="text-sm text-gray-500">{activeCase ? `${activeCase.documentType} • ${activeCase.submittedAt || 'Awaiting review'}` : 'No KYC case has been created yet.'}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {(activeCase?.documents ?? []).map((document) => (
                <div key={document.id} className="rounded-[1.5rem] border border-gray-800 bg-dark-800/70 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">{document.label}</p>
                      <p className="mt-1 text-sm text-gray-500">{document.originalName}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-gray-500">
                        {formatFileSize(document.sizeBytes)} {document.uploadedAt ? `• ${document.uploadedAt}` : ''}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleOpenDocument(document.id, document.downloadPath, document.originalName)}
                      disabled={openingDocumentId === document.id}
                      className="inline-flex items-center gap-2 rounded-2xl border border-gray-700 bg-dark-900 px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-gray-200 transition-colors hover:border-primary/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <ExternalLink size={16} />
                      {openingDocumentId === document.id ? 'Opening...' : document.downloadPath ? 'Open File' : 'Record Only'}
                    </button>
                  </div>
                </div>
              ))}
              {!activeCase?.documents.length && (
                <div className="rounded-[1.5rem] border border-dashed border-gray-800 bg-dark-800/40 p-5 text-sm text-gray-500">
                  No files have been attached to this account yet.
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};

const InfoTile = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-3xl border border-gray-800 bg-dark-900/80 p-4">
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">{label}</p>
    <p className="mt-2 text-lg font-black text-white">{value}</p>
  </div>
);
