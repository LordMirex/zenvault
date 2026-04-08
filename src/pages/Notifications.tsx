import { Bell, Gift, Shield, Trash2, TrendingUp, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { NotificationItem } from '../data/wallet';
import { useAuth } from '../context/AuthContext';

type NotificationFilter = 'All' | 'Unread' | NotificationItem['category'];

const toneClasses: Record<NotificationItem['tone'], string> = {
  success: 'border-success/20 bg-success/10 text-success',
  warning: 'border-primary/20 bg-primary/10 text-primary',
  info: 'border-blue-400/20 bg-blue-400/10 text-blue-400',
};

const filterOptions: NotificationFilter[] = ['All', 'Unread', 'Transfers', 'Security', 'Market', 'Rewards'];

const categoryIcons: Record<NotificationItem['category'], typeof Wallet> = {
  Transfers: Wallet,
  Security: Shield,
  Market: TrendingUp,
  Rewards: Gift,
};

export const Notifications = () => {
  const { clientNotificationItems, markAllNotificationsRead } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>(clientNotificationItems);
  const [filter, setFilter] = useState<NotificationFilter>('All');

  useEffect(() => {
    setItems(clientNotificationItems);
  }, [clientNotificationItems]);

  const filteredItems = items.filter((item) => {
    if (filter === 'All') {
      return true;
    }

    if (filter === 'Unread') {
      return item.unread;
    }

    return item.category === filter;
  });

  const unreadCount = items.filter((item) => item.unread).length;

  const markAllRead = async () => {
    setItems((current) => current.map((item) => ({ ...item, unread: false })));
    await markAllNotificationsRead();
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="rounded-[2rem] border border-gray-800 bg-gradient-to-br from-dark-800 via-dark-900 to-dark-900 p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Notifications</p>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                Keep up with wallet security, transfers, rewards, and market alerts
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-gray-400 md:text-base">
                Every operational event is surfaced here so the desk can respond quickly.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-3xl border border-gray-800 bg-dark-900/80 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Unread</p>
              <p className="mt-1 text-2xl font-black text-primary">{unreadCount}</p>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              className="rounded-[1.5rem] border border-gray-800 bg-dark-900/80 px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-gray-300 transition-colors hover:text-white"
            >
              Mark All Read
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-gray-800 bg-dark-900 p-5 md:p-6">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
                filter === option
                  ? 'border-primary/30 bg-primary text-dark-900'
                  : 'border-gray-800 bg-dark-800 text-gray-400 hover:text-white'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {filteredItems.map((item) => {
            const Icon = categoryIcons[item.category];

            return (
              <div key={item.id} className="rounded-[1.75rem] border border-gray-800 bg-dark-800/70 p-4">
                <div className="flex items-start justify-between gap-4 min-w-0">
                  <div className="flex gap-4 min-w-0 flex-1">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${toneClasses[item.tone]}`}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-white">{item.title}</p>
                        {item.unread && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <p className="mt-1 text-sm text-gray-400 break-words overflow-hidden">{item.message}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-gray-600">
                        {item.category} - {item.time}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="rounded-full border border-gray-800 p-2 text-gray-500 transition-colors hover:text-white"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="rounded-[1.75rem] border border-dashed border-gray-800 bg-dark-800/40 p-8 text-center">
              <Bell className="mx-auto h-8 w-8 text-gray-600" />
              <p className="mt-3 text-sm text-gray-500">No notifications match this filter right now.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
