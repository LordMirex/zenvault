import { NavLink } from 'react-router-dom';
import { 
  Home, 
  CircleDollarSign,
  Download, 
  Upload, 
  Settings,
  Bell,
  LayoutGrid,
  BookUser
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Home', href: '/app', icon: Home, end: true },
  { name: 'Buy', href: '/app/buy', icon: CircleDollarSign },
  { name: 'Receive', href: '/app/receive', icon: Download },
  { name: 'Send', href: '/app/send', icon: Upload },
  { name: 'Settings', href: '/app/settings', icon: Settings },
];

const cryptoBaseItems = [
  { name: 'Manage Crypto', href: '/app/crypto-manage', icon: LayoutGrid },
  { name: 'Wallet Addresses', href: '/app/crypto-address', icon: BookUser },
  { name: 'Notifications', href: '/app/notifications', icon: Bell },
];

export const Sidebar = () => {
  const { clientNotificationItems } = useAuth();
  const unreadCount = clientNotificationItems.filter((n) => n.unread).length;

  return (
    <aside className="hidden h-screen w-64 shrink-0 overflow-y-auto overflow-x-hidden border-r border-gray-800 bg-dark-900 md:flex">
      <div className="px-6 py-8">
        <div className="mb-10 px-2">
          <BrandLogo size="lg" variant="icon" stretch invertFallback />
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-xs font-semibold text-primary uppercase tracking-widest px-4 mb-4 opacity-80">
              Menu
            </h2>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.end}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium",
                    isActive 
                      ? "bg-dark-800 text-primary border border-gray-800 shadow-lg" 
                      : "text-gray-400 hover:text-white hover:bg-dark-800/50"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-colors",
                    "group-hover:text-primary"
                  )} />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-primary uppercase tracking-widest px-4 mb-4 opacity-80">
              Crypto
            </h2>
            <nav className="space-y-1">
              {cryptoBaseItems.map((item) => {
                const badge = item.name === 'Notifications' && unreadCount > 0 ? unreadCount : null;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) => cn(
                      "flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium",
                      isActive 
                        ? "bg-dark-800 text-primary border border-gray-800 shadow-lg" 
                        : "text-gray-400 hover:text-white hover:bg-dark-800/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn(
                        "w-5 h-5 transition-colors",
                        "group-hover:text-primary"
                      )} />
                      {item.name}
                    </div>
                    {badge !== null && (
                      <span className="bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
};
