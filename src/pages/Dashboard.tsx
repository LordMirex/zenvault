import {
  TrendingUp,
  Copy,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  ChevronRight,
  Wallet,
  ArrowLeftRight,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { walletAssets } from '../data/wallet';
import { useAuth } from '../context/AuthContext';
import { formatCompactUsd, formatPercent, formatUsd } from '../lib/format';
import { getWalletAssetPath } from '../lib/walletRoutes';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Dashboard = () => {
  const [showBalance, setShowBalance] = useState(true);
  const navigate = useNavigate();
  const { clientProfile, clientSummary, user } = useAuth();
  const featuredAssets = walletAssets.slice(0, 4);
  const accountId = clientProfile?.uuid ?? user?.uuid ?? 'Wallet ID unavailable';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-br from-dark-800 to-dark-900 p-6 shadow-2xl md:p-8">
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl transition-colors duration-700" />

        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-sm font-medium">Account Portfolio</span>
              <button onClick={() => setShowBalance(!showBalance)} className="transition-colors hover:text-white">
                {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-gray-800 bg-dark-900/50 px-3 py-1.5">
              <span className="text-xs font-mono text-gray-300">{accountId}</span>
              <Copy size={12} className="cursor-pointer text-gray-500 hover:text-primary" />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              {showBalance ? formatUsd(clientSummary?.portfolioUsd ?? 0) : '$ *******.**'}
            </h2>
            <div className="flex items-center gap-2 text-success">
              <TrendingUp size={16} />
              <span className="text-sm font-semibold">
                {clientSummary
                  ? `${clientSummary.changeUsd >= 0 ? '+' : ''}${formatUsd(clientSummary.changeUsd)} (${formatPercent(clientSummary.changePct)})`
                  : '$0.00 (0.00%)'}
              </span>
              <span className="ml-2 text-xs text-gray-500">past 24h</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 md:grid-cols-4">
            <button
              type="button"
              onClick={() => navigate('/app/send')}
              className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 font-bold text-dark-900 transition-all hover:bg-yellow-400 active:scale-95"
            >
              <ArrowUpRight size={20} />
              Send
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/receive')}
              className="flex items-center justify-center gap-2 rounded-2xl border border-gray-800 bg-dark-800 py-3 font-bold text-white transition-all hover:bg-dark-700 active:scale-95"
            >
              <ArrowDownLeft size={20} />
              Receive
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/buy')}
              className="flex items-center justify-center gap-2 rounded-2xl border border-gray-800 bg-dark-800 py-3 font-bold text-white transition-all hover:bg-dark-700 active:scale-95"
            >
              <Plus size={20} />
              Buy
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/swap')}
              className="flex items-center justify-center gap-2 rounded-2xl border border-gray-800 bg-dark-800 py-3 font-bold text-white transition-all hover:bg-dark-700 active:scale-95"
            >
              <ArrowLeftRight size={20} />
              Swap
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Your Assets</h3>
          <button
            type="button"
            onClick={() => navigate('/app/crypto-manage')}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Manage <ChevronRight size={14} />
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-gray-800 bg-dark-900 shadow-xl">
          <div className="hidden grid-cols-5 border-b border-gray-800 px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 md:grid">
            <div className="col-span-2">Asset</div>
            <div className="text-right">Price</div>
            <div className="text-right">24h Change</div>
            <div className="text-right">Balance</div>
          </div>

          <div className="divide-y divide-gray-800/50">
            {featuredAssets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => navigate(getWalletAssetPath(asset))}
                className="grid w-full cursor-pointer grid-cols-2 px-4 py-4 text-left transition-colors group hover:bg-dark-800/30 md:grid-cols-5 md:px-6"
              >
                <div className="col-span-1 flex items-center gap-3 md:col-span-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 bg-dark-800 p-2 transition-colors group-hover:border-primary/50">
                    <img src={asset.icon} alt={asset.name} className="h-6 w-6 object-contain" />
                  </div>
                  <div>
                    <p className="flex items-center gap-1 font-bold text-white">
                      {asset.symbol}
                      <span className="rounded bg-dark-700 px-1.5 py-0.5 text-[10px] leading-none text-gray-400">{asset.network}</span>
                    </p>
                    <p className="text-xs text-gray-500">{asset.name}</p>
                  </div>
                </div>

                <div className="hidden flex-col justify-center text-right md:flex">
                  <p className="text-sm font-mono text-white">{formatUsd(asset.price)}</p>
                </div>

                <div className="hidden flex-col justify-center text-right md:flex">
                  <p className={cn('text-sm font-medium', asset.change > 0 ? 'text-success' : asset.change < 0 ? 'text-danger' : 'text-gray-400')}>
                    {formatPercent(asset.change)}
                  </p>
                </div>

                <div className="flex flex-col justify-center text-right">
                  <p className="font-bold text-white">
                    {asset.balance.toLocaleString()} {asset.symbol}
                  </p>
                  <p className="text-xs text-gray-500">{formatCompactUsd(asset.valueUsd)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-between rounded-2xl border border-success/20 bg-success/10 p-4">
        <div className="flex items-center gap-3 text-success">
          <Wallet size={20} />
          <span className="text-sm font-semibold">
            {clientSummary?.walletConnected ? 'Cold Storage Connected' : 'Cold Storage Disconnected'}
          </span>
        </div>
        <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
      </section>
    </div>
  );
};
