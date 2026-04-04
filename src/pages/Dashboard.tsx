import {
  TrendingUp,
  TrendingDown,
  Copy,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  ChevronRight,
  ArrowLeftRight,
  Download,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../context/AuthContext';
import { formatCompactUsd, formatPercent, formatUsd } from '../lib/format';
import { getWalletAssetPath } from '../lib/walletRoutes';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Dashboard = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { clientProfile, clientSummary, user, clientWalletAssets, clientNotificationItems } = useAuth();
  const featuredAssets = clientWalletAssets.filter((asset) => asset.enabledByDefault);
  const dashboardAssets = featuredAssets.slice(0, 6);
  const accountId = clientProfile?.uuid ?? user?.uuid ?? 'Wallet ID unavailable';
  const unreadCount = clientNotificationItems.filter((n) => n.unread).length;

  const isPositiveChange = (clientSummary?.changeUsd ?? 0) >= 0;

  const copyAccountId = async () => {
    try {
      await navigator.clipboard.writeText(accountId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Portfolio hero card */}
      <section className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-br from-dark-800 via-dark-850 to-dark-900 p-6 shadow-2xl md:p-8">
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute left-1/3 bottom-0 h-32 w-32 rounded-full bg-blue-500/5 blur-2xl" />

        <div className="relative z-10">
          {/* Top row: label + account ID */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-sm font-medium tracking-wide">Account Portfolio</span>
              <button
                type="button"
                onClick={() => setShowBalance((v) => !v)}
                className="rounded p-0.5 transition-colors hover:text-white"
                title={showBalance ? 'Hide balance' : 'Show balance'}
              >
                {showBalance ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
            </div>

            <button
              type="button"
              onClick={() => void copyAccountId()}
              className="flex items-center gap-2 rounded-full border border-gray-800 bg-dark-900/60 px-3 py-1.5 transition-colors hover:border-primary/40"
              title="Copy wallet ID"
            >
              {copied ? (
                <CheckCircle2 size={12} className="text-success" />
              ) : (
                <Copy size={12} className="text-gray-500" />
              )}
              <span className="font-mono text-xs text-gray-300 max-w-[160px] truncate">{accountId}</span>
            </button>
          </div>

          {/* Balance */}
          <div className="mt-5 space-y-2">
            <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              {showBalance ? formatUsd(clientSummary?.portfolioUsd ?? 0) : '$\u00a0*,***.**'}
            </h2>

            {clientSummary && (
              <div className={cn('flex items-center gap-2', isPositiveChange ? 'text-success' : 'text-danger')}>
                {isPositiveChange ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="text-sm font-semibold">
                  {isPositiveChange ? '+' : ''}{formatUsd(clientSummary.changeUsd)}{' '}
                  ({formatPercent(clientSummary.changePct)})
                </span>
                <span className="text-xs text-gray-500 ml-1">past 24h</span>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="mt-5 flex flex-wrap gap-4 border-t border-gray-800/60 pt-5">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Available</p>
              <p className="mt-1 text-sm font-bold text-white">
                {showBalance ? formatCompactUsd(clientSummary?.availableUsd ?? 0) : '****'}
              </p>
            </div>
            <div className="border-l border-gray-800 pl-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest">Assets</p>
              <p className="mt-1 text-sm font-bold text-white">{clientWalletAssets.length}</p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => navigate('/app/notifications')}
                className="ml-auto flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
              >
                <Bell size={13} />
                {unreadCount} new {unreadCount === 1 ? 'notification' : 'notifications'}
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <button
              type="button"
              onClick={() => navigate('/app/send')}
              className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-dark-900 transition-all hover:bg-yellow-400 active:scale-95"
            >
              <ArrowUpRight size={18} />
              Send
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/receive')}
              className="flex items-center justify-center gap-2 rounded-2xl border border-gray-800 bg-dark-800 py-3 text-sm font-bold text-white transition-all hover:bg-dark-700 active:scale-95"
            >
              <ArrowDownLeft size={18} />
              Receive
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/buy')}
              className="flex items-center justify-center gap-2 rounded-2xl border border-gray-800 bg-dark-800 py-3 text-sm font-bold text-white transition-all hover:bg-dark-700 active:scale-95"
            >
              <Plus size={18} />
              Buy
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/swap')}
              className="flex items-center justify-center gap-2 rounded-2xl border border-gray-800 bg-dark-800 py-3 text-sm font-bold text-white transition-all hover:bg-dark-700 active:scale-95"
            >
              <ArrowLeftRight size={18} />
              Swap
            </button>
          </div>
        </div>
      </section>

      {/* Asset table */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">My Portfolio</h3>
          <button
            type="button"
            onClick={() => navigate('/app/crypto-manage')}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Manage assets <ChevronRight size={14} />
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-800 bg-dark-900 shadow-lg">
          {/* Table header — desktop only */}
          <div className="hidden grid-cols-5 border-b border-gray-800 px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-600 md:grid">
            <div className="col-span-2">Asset</div>
            <div className="text-right">Price</div>
            <div className="text-right">24h</div>
            <div className="text-right">Holdings</div>
          </div>

          <div className="divide-y divide-gray-800/50">
            {dashboardAssets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => navigate(getWalletAssetPath(asset))}
                className="group grid w-full cursor-pointer grid-cols-2 px-4 py-4 text-left transition-colors hover:bg-dark-800/40 md:grid-cols-5 md:px-6"
              >
                <div className="col-span-1 flex items-center gap-3 md:col-span-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-700 bg-dark-800 p-1.5 transition-colors group-hover:border-primary/40">
                    <img src={asset.icon} alt={asset.name} className="h-6 w-6 object-contain" />
                  </div>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-1 font-bold text-white text-sm">
                      {asset.symbol}
                      <span className="rounded bg-dark-700 px-1.5 py-0.5 text-[10px] leading-none text-gray-500">
                        {asset.network}
                      </span>
                    </p>
                    <p className="truncate text-xs text-gray-500">{asset.name}</p>
                  </div>
                </div>

                <div className="hidden flex-col justify-center text-right md:flex">
                  <p className="text-sm font-mono text-white">{formatUsd(asset.price)}</p>
                </div>

                <div className="hidden flex-col justify-center text-right md:flex">
                  <p className={cn('text-sm font-semibold', asset.change > 0 ? 'text-success' : asset.change < 0 ? 'text-danger' : 'text-gray-500')}>
                    {formatPercent(asset.change)}
                  </p>
                </div>

                <div className="flex flex-col justify-center text-right">
                  <p className="text-sm font-bold text-white">
                    {asset.balance.toLocaleString()} <span className="text-gray-500 text-xs font-medium">{asset.symbol}</span>
                  </p>
                  <p className="text-xs text-gray-500">{formatCompactUsd(asset.valueUsd)}</p>
                </div>
              </button>
            ))}

            {dashboardAssets.length === 0 && (
              <div className="px-6 py-14 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-gray-800 bg-dark-800 text-gray-600">
                  <Plus size={24} />
                </div>
                <p className="text-base font-semibold text-white">No assets on your dashboard</p>
                <p className="mt-1 text-sm text-gray-500">
                  Visit Manage Assets to pin your preferred coins here.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/app/crypto-manage')}
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-dark-900 transition-colors hover:bg-yellow-400"
                >
                  Choose assets
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bottom quick-access row */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => navigate('/app/deposit')}
          className="flex flex-col items-center gap-2 rounded-2xl border border-gray-800 bg-dark-800/60 p-4 text-center text-sm font-semibold text-gray-300 transition-colors hover:border-primary/30 hover:bg-dark-800 hover:text-white"
        >
          <Download size={20} className="text-primary" />
          Deposit
        </button>
        <button
          type="button"
          onClick={() => navigate('/app/withdraw')}
          className="flex flex-col items-center gap-2 rounded-2xl border border-gray-800 bg-dark-800/60 p-4 text-center text-sm font-semibold text-gray-300 transition-colors hover:border-primary/30 hover:bg-dark-800 hover:text-white"
        >
          <ArrowUpRight size={20} className="text-gray-400" />
          Withdraw
        </button>
        <button
          type="button"
          onClick={() => navigate('/app/cards')}
          className="flex flex-col items-center gap-2 rounded-2xl border border-gray-800 bg-dark-800/60 p-4 text-center text-sm font-semibold text-gray-300 transition-colors hover:border-primary/30 hover:bg-dark-800 hover:text-white"
        >
          <span className="text-xl">💳</span>
          Cards
        </button>
        <button
          type="button"
          onClick={() => navigate('/app/notifications')}
          className="relative flex flex-col items-center gap-2 rounded-2xl border border-gray-800 bg-dark-800/60 p-4 text-center text-sm font-semibold text-gray-300 transition-colors hover:border-primary/30 hover:bg-dark-800 hover:text-white"
        >
          <Bell size={20} className="text-gray-400" />
          {unreadCount > 0 && (
            <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
          Inbox
        </button>
      </section>
    </div>
  );
};
