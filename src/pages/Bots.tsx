import { useState } from 'react';
import { Bot, FlaskConical, Pause, Play, Plus, TrendingUp, Zap } from 'lucide-react';

type BotStatus = 'Active' | 'Paused' | 'Stopped';

interface TradingBot {
  id: string;
  name: string;
  strategy: string;
  pair: string;
  status: BotStatus;
  profit: number;
  trades: number;
  runtime: string;
}

const statusClasses: Record<BotStatus, string> = {
  Active: 'border-success/20 bg-success/10 text-success',
  Paused: 'border-primary/20 bg-primary/10 text-primary',
  Stopped: 'border-gray-700 bg-gray-800/60 text-gray-500',
};

const demoBots: TradingBot[] = [
  { id: '1', name: 'Alpha Grid', strategy: 'Grid Trading', pair: 'BTC / USDT', status: 'Active', profit: 3.42, trades: 128, runtime: '4d 12h' },
  { id: '2', name: 'DCA Prime', strategy: 'Dollar Cost Average', pair: 'ETH / USDT', status: 'Active', profit: 1.87, trades: 56, runtime: '2d 6h' },
  { id: '3', name: 'Momentum X', strategy: 'Trend Following', pair: 'SOL / USDT', status: 'Paused', profit: -0.54, trades: 34, runtime: '1d 3h' },
  { id: '4', name: 'Scalper V2', strategy: 'Scalping', pair: 'BNB / USDT', status: 'Stopped', profit: 0.0, trades: 0, runtime: '—' },
];

export const Bots = () => {
  const [bots, setBots] = useState<TradingBot[]>(demoBots);

  const toggleBot = (id: string) => {
    setBots((current) =>
      current.map((bot) => {
        if (bot.id !== id) {
          return bot;
        }
        return { ...bot, status: bot.status === 'Active' ? 'Paused' : 'Active' };
      }),
    );
  };

  const activeBots = bots.filter((bot) => bot.status === 'Active').length;
  const totalProfit = bots.reduce((sum, bot) => sum + bot.profit, 0);
  const totalTrades = bots.reduce((sum, bot) => sum + bot.trades, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start gap-3 rounded-[1.5rem] border border-primary/30 bg-primary/5 p-4">
        <div className="mt-0.5 shrink-0 text-primary">
          <FlaskConical size={18} />
        </div>
        <div>
          <p className="text-sm font-black text-primary">Preview Mode — Demo Data</p>
          <p className="mt-1 text-xs leading-relaxed text-gray-400">
            Trading bots are not yet live. The dashboard below shows sample data so you can explore the layout. Live bot execution is coming soon.
          </p>
        </div>
      </div>

      <section className="rounded-[2rem] border border-gray-800 bg-gradient-to-br from-dark-800 via-dark-900 to-dark-900 p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <Zap size={14} />
              Trading Bots
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                Automate your trading strategies
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-gray-400 md:text-base">
                Configure, deploy, and monitor automated bots across your wallet assets with full audit trails.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 lg:w-[360px]">
            <div className="rounded-3xl border border-gray-800 bg-dark-900/80 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Active</p>
              <p className="mt-2 text-2xl font-black text-success">{activeBots}</p>
            </div>
            <div className="rounded-3xl border border-gray-800 bg-dark-900/80 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Total Trades</p>
              <p className="mt-2 text-2xl font-black text-white">{totalTrades}</p>
            </div>
            <div className="rounded-3xl border border-gray-800 bg-dark-900/80 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Net P&L</p>
              <p className={`mt-2 text-2xl font-black ${totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-gray-800 bg-dark-900 p-5 md:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white">Your Bots</h3>
          <button
            type="button"
            title="Coming soon"
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-[1.5rem] bg-primary/40 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-dark-900/60"
          >
            <Plus size={16} />
            New Bot
          </button>
        </div>

        <div className="space-y-3">
          {bots.map((bot) => (
            <div key={bot.id} className="flex flex-col gap-4 rounded-[1.75rem] border border-gray-800 bg-dark-800/70 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Bot size={22} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-black text-white">{bot.name}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${statusClasses[bot.status]}`}>
                      {bot.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{bot.strategy} &middot; {bot.pair}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-5">
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">P&L</p>
                  <p className={`mt-1 text-sm font-black ${bot.profit > 0 ? 'text-success' : bot.profit < 0 ? 'text-danger' : 'text-gray-400'}`}>
                    {bot.profit > 0 ? '+' : ''}{bot.profit.toFixed(2)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Trades</p>
                  <p className="mt-1 text-sm font-black text-white">{bot.trades}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Runtime</p>
                  <p className="mt-1 text-sm font-black text-white">{bot.runtime}</p>
                </div>

                {bot.status !== 'Stopped' && (
                  <button
                    type="button"
                    onClick={() => toggleBot(bot.id)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-700 bg-dark-900 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-gray-300 transition-colors hover:border-gray-600 hover:text-white"
                  >
                    {bot.status === 'Active' ? <Pause size={14} /> : <Play size={14} />}
                    {bot.status === 'Active' ? 'Pause' : 'Resume'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-gray-800 bg-dark-900 p-5 md:p-6">
        <h3 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-white">Available Strategies</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Grid Trading', desc: 'Place buy/sell orders at preset intervals within a price range.', icon: TrendingUp },
            { name: 'DCA (Cost Average)', desc: 'Buy fixed amounts at regular intervals to reduce timing risk.', icon: Bot },
            { name: 'Momentum', desc: 'Follow sustained price trends and ride breakout movements.', icon: Zap },
          ].map((strategy) => (
            <div key={strategy.name} className="rounded-3xl border border-gray-800 bg-dark-800/70 p-5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <strategy.icon size={20} />
              </div>
              <p className="text-sm font-black text-white">{strategy.name}</p>
              <p className="mt-2 text-xs leading-relaxed text-gray-500">{strategy.desc}</p>
              <button
                type="button"
                title="Coming soon"
                className="mt-4 w-full cursor-not-allowed rounded-2xl border border-gray-800 bg-dark-900 py-3 text-xs font-bold uppercase tracking-[0.14em] text-gray-600"
              >
                Coming Soon
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
