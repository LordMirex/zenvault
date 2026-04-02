import { Copy, Gift, Share2, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import { recentReferrals, referralMilestones } from '../data/wallet';

const referralLink = 'https://qfs-wallet.example/ref/QFS-529384';

export const Referral = () => {
  const [copied, setCopied] = useState(false);

  const copyReferralLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="rounded-[2rem] border border-gray-800 bg-gradient-to-br from-dark-800 via-dark-900 to-dark-900 p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Referral Program</p>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                Invite verified traders and earn treasury-backed rewards
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-gray-400 md:text-base">
                Share your referral link, monitor conversion, and track the bonuses credited to your wallet.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-gray-800 bg-dark-900/80 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Total Referrals</p>
              <p className="mt-2 text-2xl font-black text-primary">1</p>
            </div>
            <div className="rounded-3xl border border-gray-800 bg-dark-900/80 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">This Month</p>
              <p className="mt-2 text-2xl font-black text-white">0</p>
            </div>
            <div className="rounded-3xl border border-gray-800 bg-dark-900/80 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Paid Rewards</p>
              <p className="mt-2 text-2xl font-black text-success">250 USDT</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white">Your Referral Link</h3>
              <Share2 className="text-primary" size={18} />
            </div>

            <div className="mt-4 rounded-[1.75rem] border border-gray-800 bg-dark-800/70 p-5">
              <p className="font-mono text-sm leading-relaxed text-white">{referralLink}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={copyReferralLink}
                  className="flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-dark-900 transition-colors hover:bg-yellow-400"
                >
                  <Copy size={16} />
                  Copy Link
                </button>
                <button
                  type="button"
                  onClick={copyReferralLink}
                  className="flex items-center gap-2 rounded-2xl border border-gray-800 bg-dark-900 px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-gray-300 transition-colors hover:text-white"
                >
                  <Share2 size={16} />
                  Share Invite
                </button>
              </div>
              {copied && <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-success">Link copied to clipboard</p>}
            </div>
          </section>

          <section className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white">Recent Referrals</h3>
              <Users className="text-primary" size={18} />
            </div>

            <div className="mt-4 space-y-3">
              {recentReferrals.map((referral) => (
                <div key={referral.id} className="rounded-[1.5rem] border border-gray-800 bg-dark-800/70 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-white">{referral.name}</p>
                      <p className="mt-1 text-sm text-gray-500">{referral.joinedAt}</p>
                    </div>
                    <div className="text-right">
                      <span className="rounded-full border border-success/20 bg-success/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-success">
                        {referral.status}
                      </span>
                      <p className="mt-2 text-sm font-bold text-primary">{referral.reward}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white">Reward Milestones</h3>
              <Gift className="text-primary" size={18} />
            </div>

            <div className="mt-4 space-y-3">
              {referralMilestones.map((milestone) => (
                <div key={milestone.label} className="rounded-[1.5rem] border border-gray-800 bg-dark-800/70 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-white">{milestone.label}</p>
                      <p className="mt-1 text-sm text-gray-500">{milestone.requirement}</p>
                    </div>
                    <span className="text-sm font-black text-primary">{milestone.reward}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Referral Performance</p>
                <p className="text-sm text-gray-500">Your invite conversion is above the current desk average.</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-gray-800 bg-dark-800/70 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Conversion Rate</p>
                <p className="mt-2 text-2xl font-black text-white">100%</p>
              </div>
              <div className="rounded-3xl border border-gray-800 bg-dark-800/70 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Next Reward</p>
                <p className="mt-2 text-2xl font-black text-primary">4 Invites</p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};
