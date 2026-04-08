import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  Bot,
  CircleDollarSign,
  CreditCard,
  Home,
  LayoutGrid,
  Menu,
  Settings,
  ShieldCheck,
  Wallet,
  X,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../../context/AuthContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const primaryItems = [
  { name: 'Home', href: '/app', icon: Home, end: true },
  { name: 'Buy', href: '/app/buy', icon: CircleDollarSign },
  { name: 'Cards', href: '/app/cards', icon: CreditCard },
  { name: 'Send', href: '/app/send', icon: ArrowUpRight },
];

const moreItems = [
  { name: 'Receive', href: '/app/receive', icon: ArrowDownLeft },
  { name: 'Withdraw', href: '/app/withdraw', icon: Wallet },
  { name: 'Notifications', href: '/app/notifications', icon: Bell },
  { name: 'KYC', href: '/app/kyc', icon: ShieldCheck },
  { name: 'Manage Crypto', href: '/app/crypto-manage', icon: LayoutGrid },
  { name: 'Trading Bots', href: '/app/bots', icon: Bot },
  { name: 'Settings', href: '/app/settings', icon: Settings },
];

export const MobileNav = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { clientNotificationItems } = useAuth();
  const unreadCount = clientNotificationItems.filter((n) => n.unread).length;

  return (
    <>
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <div
        className={cn(
          'md:hidden fixed bottom-16 left-0 right-0 z-50 bg-dark-900 border-t border-gray-800 transition-transform duration-300',
          drawerOpen ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <p className="text-sm font-bold text-white uppercase tracking-widest">More</p>
          <button
            onClick={() => setDrawerOpen(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-1 p-3 pb-4">
          {moreItems.map((item) => {
            const hasNotif = item.name === 'Notifications' && unreadCount > 0;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setDrawerOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'relative flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 text-center transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-400 hover:text-white hover:bg-dark-800/60',
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold leading-tight">{item.name}</span>
                {hasNotif && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-danger" />
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-dark-900/95 backdrop-blur-lg border-t border-gray-800 py-2 px-4">
        <div className="flex items-center justify-between gap-1">
          {primaryItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 transition-all duration-200 min-w-[52px] py-1',
                  isActive ? 'text-primary scale-105' : 'text-gray-500',
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </NavLink>
          ))}

          <button
            onClick={() => setDrawerOpen((prev) => !prev)}
            className={cn(
              'relative flex flex-col items-center gap-1 transition-all duration-200 min-w-[52px] py-1',
              drawerOpen ? 'text-primary scale-105' : 'text-gray-500',
            )}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-medium">More</span>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-3 h-2 w-2 rounded-full bg-danger" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
};
