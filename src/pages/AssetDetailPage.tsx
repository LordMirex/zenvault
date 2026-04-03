import { useMemo, useState, type ReactNode } from 'react';
import { ArrowDownLeft, ArrowUpRight, LockKeyhole, Plus, ShieldCheck } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import { formatNumber, formatPercent, formatUsd } from '../lib/format';
import {
  findWalletAssetByRoute,
  getReceiveAssetPath,
  getSendAssetPath,
  getWalletAssetPath,
  isSensitiveAsset,
} from '../lib/walletRoutes';

const unlockKey = (assetId: string) => `qfs-asset-unlock:${assetId}`;

export const AssetDetailPage = () => {
  const navigate = useNavigate();
  const { symbol, network } = useParams();
  const { clientWalletAssets, clientDepositActivity, clientWithdrawalActivity } = useAuth();
  const asset = symbol && network ? findWalletAssetByRoute(symbol, network, clientWalletAssets) : undefined;
  const [passcode, setPasscode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [unlocked, setUnlocked] = useState(() => (asset ? window.sessionStorage.getItem(unlockKey(asset.id)) === '1' : false));

  const history = useMemo(() => {
    if (!asset) {
      return [];
    }

    return [
      ...clientDepositActivity.filter((entry) => entry.assetId === asset.id).map((entry) => ({ ...entry, kind: 'Receive' as const })),
      ...clientWithdrawalActivity.filter((entry) => entry.assetId === asset.id).map((entry) => ({ ...entry, kind: 'Send' as const })),
    ].sort((left, right) => right.time.localeCompare(left.time));
  }, [asset, clientDepositActivity, clientWithdrawalActivity]);

  if (!asset) {
    return <Navigate to="/app" replace />;
  }

  const requiresPasscode = isSensitiveAsset(asset);

  const verifyPasscode = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      await apiRequest('/api/client/passcode/verify', {
        method: 'POST',
        body: JSON.stringify({ passcode }),
      });
      window.sessionStorage.setItem(unlockKey(asset.id), '1');
      setUnlocked(true);
      setPasscode('');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Passcode verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (requiresPasscode && !unlocked) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="w-full max-w-md rounded-[2rem] border border-gray-800 bg-dark-900 p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <LockKeyhole className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-black text-white">Security Check</h2>
          <p className="mt-3 text-center text-sm leading-7 text-gray-400">
            Please enter your 6-digit passcode before opening this asset detail screen.
          </p>

          <input
            value={passcode}
            onChange={(event) => setPasscode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            placeholder="123456"
            className="mt-6 w-full rounded-2xl border border-gray-800 bg-dark-800 px-4 py-4 text-center text-xl tracking-[0.55em] text-white placeholder:text-gray-500 focus:border-primary/50 focus:outline-none"
          />

          {error && <p className="mt-4 text-sm font-semibold text-danger">{error}</p>}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => void verifyPasscode()}
            className="mt-6 inline-flex w-full items-center justify-center rounded-[1.5rem] bg-primary px-5 py-4 text-sm font-black text-dark-900 transition-colors hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Verifying...' : 'Unlock Asset'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <section className="rounded-[2rem] border border-gray-800 bg-gradient-to-br from-dark-800 via-dark-900 to-dark-900 p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-gray-700 bg-dark-800">
              <img src={asset.icon} alt={asset.name} className="h-10 w-10 object-contain" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">{asset.network}</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
                {asset.name} ({asset.symbol})
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Balance {formatNumber(asset.balance, 8)} {asset.symbol} - {formatUsd(asset.valueUsd)}
              </p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-success/20 bg-success/10 px-4 py-3 text-success">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-sm font-semibold">Asset detail unlocked</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <ActionCard title="Send" icon={<ArrowUpRight className="h-5 w-5" />} onClick={() => navigate(getSendAssetPath(asset, 'external'))} />
        <ActionCard title="Receive" icon={<ArrowDownLeft className="h-5 w-5" />} onClick={() => navigate(getReceiveAssetPath(asset, 'external'))} />
        <ActionCard title="Buy" icon={<Plus className="h-5 w-5" />} onClick={() => navigate('/app/buy')} />
        <ActionCard title="Swap" icon={<Plus className="h-5 w-5" />} onClick={() => navigate('/app/swap')} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
          <h3 className="text-lg font-semibold text-white">Asset Overview</h3>
          <div className="mt-5 grid gap-3">
            <InfoTile label="Spot Price" value={formatUsd(asset.price)} />
            <InfoTile label="24H Change" value={formatPercent(asset.change)} />
            <InfoTile label="Wallet Address" value={asset.address} />
            <InfoTile label="PayID Alias" value={asset.payId} />
            <InfoTile label="Quick Path" value={getWalletAssetPath(asset)} />
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-800 bg-dark-900 p-6">
          <h3 className="text-lg font-semibold text-white">Transaction History</h3>
          <div className="mt-5 space-y-3">
            {history.length === 0 && (
              <div className="rounded-[1.5rem] border border-gray-800 bg-dark-800/60 p-4 text-sm text-gray-400">
                No asset-specific history yet.
              </div>
            )}
            {history.map((item) => (
              <div key={`${item.kind}-${item.id}`} className="rounded-[1.5rem] border border-gray-800 bg-dark-800/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white">
                      {item.kind} - {item.amount}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{item.destination}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{item.status}</p>
                    <p className="mt-1 text-xs text-gray-500">{item.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const ActionCard = ({ title, icon, onClick }: { title: string; icon: ReactNode; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center justify-between rounded-[1.75rem] border border-gray-800 bg-dark-900 p-5 text-left transition-colors hover:border-gray-700 hover:bg-dark-800"
  >
    <span className="text-lg font-bold text-white">{title}</span>
    <span className="text-primary">{icon}</span>
  </button>
);

const InfoTile = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-[1.5rem] border border-gray-800 bg-dark-800/60 p-4">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">{label}</p>
    <p className="mt-2 break-all text-sm font-semibold text-white">{value}</p>
  </div>
);
