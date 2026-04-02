import { BadgeCheck, FileText, ShieldCheck, Sparkles } from 'lucide-react';
import { kycChecklist } from '../data/wallet';
import { useAuth } from '../context/AuthContext';

export const KycVerification = () => {
  const { clientProfile } = useAuth();
  const isApproved = (clientProfile?.kycStatus ?? '').toLowerCase() === 'approved';
  const statusTone = isApproved ? 'text-success' : 'text-primary';
  const statusLabel = clientProfile?.kycStatus ?? 'Pending';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className={`rounded-[2rem] border p-6 md:p-8 ${
        isApproved
          ? 'border-success/20 bg-gradient-to-br from-success/10 via-dark-900 to-dark-900'
          : 'border-primary/20 bg-gradient-to-br from-primary/10 via-dark-900 to-dark-900'
      }`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className={`text-xs font-bold uppercase tracking-[0.22em] ${statusTone}`}>
              {isApproved ? 'KYC Verified' : 'KYC In Review'}
            </p>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                {isApproved
                  ? 'Your account has cleared compliance and treasury review'
                  : 'Your compliance review is still in progress'}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-gray-400 md:text-base">
                {isApproved
                  ? 'Verification is complete and your major wallet rails remain unlocked.'
                  : 'Upload and verification checks are being reviewed before outbound limits expand.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-gray-800 bg-dark-900/80 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Status</p>
              <p className={`mt-2 text-2xl font-black ${statusTone}`}>{statusLabel}</p>
            </div>
            <div className="rounded-3xl border border-gray-800 bg-dark-900/80 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Risk Tier</p>
              <p className="mt-2 text-2xl font-black text-white">{clientProfile?.tier ?? 'Tier 1'}</p>
            </div>
            <div className="rounded-3xl border border-gray-800 bg-dark-900/80 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Daily Limit</p>
              <p className="mt-2 text-2xl font-black text-primary">{isApproved ? '$5M' : '$25K'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
          <div className="flex items-center gap-3">
            <BadgeCheck className="text-success" size={18} />
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white">Verification Checklist</h3>
          </div>

          <div className="mt-5 space-y-3">
            {kycChecklist.map((item) => (
              <div key={item.id} className="rounded-[1.5rem] border border-gray-800 bg-dark-800/70 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-gray-500">{item.detail}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                    item.status === 'Completed'
                      ? 'border-success/20 bg-success/10 text-success'
                      : 'border-primary/20 bg-primary/10 text-primary'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Unlocked Benefits</p>
                <p className="text-sm text-gray-500">
                  {isApproved
                    ? 'The wallet can use higher settlement limits and premium trading modules.'
                    : 'Approval unlocks larger limits, premium modules, and faster settlement routing.'}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
                {(
                  isApproved
                    ? [
                      'High-value deposits and withdrawals above standard retail thresholds',
                      'Immediate access to referral and card management modules',
                      'Reduced compliance friction for internal PayID treasury settlements',
                    ]
                    : [
                      'Pending accounts stay on reduced transfer limits until review is approved.',
                      'Referral and card tools remain available while compliance finalizes the account.',
                      'Large outbound transfers will be held for manual approval until KYC clears.',
                    ]
                ).map((detail) => (
                <div key={detail} className="rounded-[1.5rem] border border-gray-800 bg-dark-800/70 p-4 text-sm text-gray-400">
                  {detail}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 text-success" size={18} />
              <div>
                <p className="text-sm font-bold text-white">Compliance Note</p>
                <p className="mt-1 text-sm text-gray-400">
                  {isApproved
                    ? 'If legal entity details or source-of-funds documents change, update them before the next large transfer window.'
                    : 'Once proof of address and source documents are accepted, this page will switch to an approved compliance state.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-gray-800 bg-dark-800 px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-gray-300 transition-colors hover:text-white"
            >
              <FileText size={16} />
              View Submitted Documents
            </button>
          </section>
        </div>
      </section>
    </div>
  );
};
