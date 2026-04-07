import { useEffect, useState } from 'react';
import { ArrowUpDown, Settings, Info, ChevronDown, CheckCircle2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../context/AuthContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Swap = () => {
  const { clientWalletAssets, swapAssets } = useAuth();
  const tokens = clientWalletAssets.slice(0, 6).map((asset) => ({
    id: asset.id,
    symbol: asset.symbol,
    name: asset.name,
    balance: asset.balance.toString(),
    price: asset.price,
    icon: asset.icon,
  }));
  const [fromToken, setFromToken] = useState(tokens[0] ?? null);
  const [toToken, setToToken] = useState(tokens[2] ?? tokens[1] ?? null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [passcode, setPasscode] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (tokens.length >= 2) {
      setFromToken((current) => (current ? (tokens.find((item) => item.id === current.id) ?? tokens[0]!) : tokens[0]!));
      setToToken((current) => (current ? (tokens.find((item) => item.id === current.id) ?? tokens[1]!) : (tokens[2] ?? tokens[1]!)));
    }
  }, [clientWalletAssets]);

  useEffect(() => {
    if (fromToken && toToken && fromAmount && !Number.isNaN(Number.parseFloat(fromAmount))) {
      const output = (Number.parseFloat(fromAmount) * fromToken.price) / toToken.price;
      setToAmount(output.toFixed(6));
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromToken, toToken]);

  const handleSwapOrder = async () => {
    if (!fromAmount || Number.parseFloat(fromAmount) <= 0 || !fromToken || !toToken) return;
    if (passcode.length !== 6) {
      setError('Please enter your 6-digit passcode.');
      return;
    }
    setError('');
    setIsSwapping(true);
    try {
      const result = await swapAssets({
        fromAssetId: fromToken.id,
        toAssetId: toToken.id,
        fromAmount: Number.parseFloat(fromAmount),
        passcode,
      });
      setSuccessMessage(result.message);
      setShowSuccess(true);
      window.setTimeout(() => setShowSuccess(false), 4000);
      setFromAmount('');
      setPasscode('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Swap failed. Please try again.';
      setError(msg);
    } finally {
      setIsSwapping(false);
    }
  };

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount('');
  };

  if (!fromToken || !toToken) {
    return (
      <div className="mx-auto max-w-xl space-y-6 animate-in fade-in duration-500">
        <div className="rounded-[2.5rem] border border-gray-800 bg-dark-800 p-8 text-center text-gray-500">
          Loading swap assets...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-gray-800 bg-dark-800 p-6 shadow-2xl md:p-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Swap Assets</h2>
          <button type="button" className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-dark-700">
            <Settings size={20} />
          </button>
        </div>

        <div className="relative space-y-2">
          <div className="space-y-3 rounded-3xl border border-gray-800 bg-dark-900 p-5 transition-colors focus-within:border-primary/50">
            <div className="flex justify-between text-xs font-medium text-gray-500">
              <span>Pay</span>
              <span>
                Available: <span className="text-gray-300">{fromToken.balance} {fromToken.symbol}</span>
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <input
                type="number"
                placeholder="0.00"
                value={fromAmount}
                onChange={(event) => setFromAmount(event.target.value)}
                className="w-full border-none bg-transparent p-0 text-3xl font-bold text-white placeholder-gray-700 focus:ring-0"
              />
              <button type="button" className="group flex min-w-[120px] items-center gap-2 rounded-2xl border border-gray-700 bg-dark-800 px-3 py-2 transition-all hover:bg-dark-700">
                <img src={fromToken.icon} alt={fromToken.name} className="h-6 w-6 rounded-full" />
                <span className="font-bold text-white">{fromToken.symbol}</span>
                <ChevronDown size={16} className="text-gray-500 transition-colors group-hover:text-primary" />
              </button>
            </div>
          </div>

          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <button
              type="button"
              onClick={switchTokens}
              className="group rounded-2xl border-4 border-dark-800 bg-dark-900 p-3 text-primary shadow-xl transition-all duration-500 hover:rotate-180"
            >
              <ArrowUpDown size={20} className="transition-transform group-active:scale-75" />
            </button>
          </div>

          <div className="space-y-3 rounded-3xl border border-gray-800 bg-dark-900 p-5 transition-colors focus-within:border-primary/50">
            <div className="flex justify-between text-xs font-medium text-gray-500">
              <span>Receive (Estimated)</span>
              <span>
                Available: <span className="text-gray-300">{toToken.balance} {toToken.symbol}</span>
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <input
                type="text"
                readOnly
                placeholder="0.00"
                value={toAmount}
                className="w-full cursor-default border-none bg-transparent p-0 text-3xl font-bold text-white placeholder-gray-700 focus:ring-0"
              />
              <button type="button" className="group flex min-w-[120px] items-center gap-2 rounded-2xl border border-gray-700 bg-dark-800 px-3 py-2 transition-all hover:bg-dark-700">
                <img src={toToken.icon} alt={toToken.name} className="h-6 w-6 rounded-full" />
                <span className="font-bold text-white">{toToken.symbol}</span>
                <ChevronDown size={16} className="text-gray-500 transition-colors group-hover:text-primary" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3 px-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1.5 text-gray-500">
              Price <Info size={14} />
            </span>
            <span className="font-medium tracking-tight text-gray-300">
              1 {fromToken.symbol} ~= {(fromToken.price / toToken.price).toFixed(6)} {toToken.symbol}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Slippage Tolerance</span>
            <span className="font-bold text-primary">0.5%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Network Fee</span>
            <span className="font-medium text-success">Free (Internal)</span>
          </div>
        </div>

        {fromAmount && Number.parseFloat(fromAmount) > 0 && (
          <div className="mt-6 space-y-2 rounded-3xl border border-gray-800 bg-dark-900 p-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <Lock size={12} />
              Security passcode
            </div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter your 6-digit passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full border-none bg-transparent p-0 text-lg font-bold tracking-[0.4em] text-white placeholder-gray-700 focus:ring-0"
            />
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
        )}

        <button
          type="button"
          onClick={handleSwapOrder}
          disabled={isSwapping || !fromAmount}
          className={cn(
            'relative mt-6 w-full overflow-hidden rounded-[2rem] py-5 text-lg font-black transition-all active:scale-[0.98]',
            isSwapping
              ? 'cursor-wait bg-dark-700 text-gray-500'
              : !fromAmount
                ? 'cursor-not-allowed border border-gray-800 bg-dark-800 text-gray-600'
                : 'bg-primary text-dark-900 shadow-[0_0_30px_rgba(240,185,11,0.2)] hover:bg-yellow-400 hover:shadow-[0_0_40px_rgba(240,185,11,0.3)]',
          )}
        >
          {isSwapping ? (
            <div className="flex items-center justify-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-500 border-t-white" />
              Processing...
            </div>
          ) : fromAmount ? 'Confirm Swap' : 'Enter an amount'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-3xl border border-gray-800 bg-dark-800/50 p-4 backdrop-blur-sm">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">Market State</p>
          <div className="flex items-center gap-2 text-success">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
            <span className="truncate text-sm font-bold">Highly Liquid</span>
          </div>
        </div>
        <div className="rounded-3xl border border-gray-800 bg-dark-800/50 p-4 backdrop-blur-sm">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">Price Impact</p>
          <span className="text-sm font-bold text-success">&lt; 0.01%</span>
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-3xl border border-white/20 bg-success px-6 py-4 text-white shadow-2xl"
          >
            <CheckCircle2 size={24} />
            <div className="text-left">
              <p className="text-sm font-bold">Swap completed successfully</p>
              <p className="text-xs opacity-80">{successMessage || 'Balances updated.'}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
