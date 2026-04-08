import { Bell, ChevronDown, LogOut, Moon, Settings, Sun } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';
import { useTheme } from '../../context/ThemeContext';
import { formatPercent, formatUsd } from '../../lib/format';

const getInitials = (value: string) =>
  value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'QF';

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { branding } = useBranding();
  const { user, clientProfile, clientWalletAssets, marketAssets, clientNotificationItems, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = clientNotificationItems.filter((n) => n.unread).length;

  const routeTitles = [
    { path: '/app', title: 'Dashboard', exact: true },
    { path: '/app/buy', title: 'Buy Crypto' },
    { path: '/app/send', title: 'Send Assets' },
    { path: '/app/receive', title: 'Receive Assets' },
    { path: '/app/deposit', title: 'Deposit' },
    { path: '/app/withdraw', title: 'Withdraw' },
    { path: '/app/settings', title: 'Settings' },
    { path: '/app/profile', title: 'Security Settings' },
    { path: '/app/kyc', title: 'KYC Verification' },
    { path: '/app/crypto-manage', title: 'Manage Assets' },
    { path: '/app/crypto-address', title: 'Wallet Addresses' },
    { path: '/app/cards', title: 'Cards' },
    { path: '/app/bots', title: 'Trading Bots' },
    { path: '/app/crypto/details', title: 'Asset Detail' },
    { path: '/app/notifications', title: 'Notifications' },
  ];

  const currentTitle =
    routeTitles.find((entry) =>
      entry.exact ? location.pathname === entry.path : location.pathname.startsWith(entry.path),
    )?.title ?? 'Dashboard';

  const displayName = clientProfile?.name ?? user?.name ?? 'Wallet Account';
  const accountLabel = clientProfile?.uuid ?? user?.uuid ?? user?.email ?? '';
  const initials = getInitials(displayName);
  const isLightTheme = theme === 'light';
  const activeAssetIds = new Set(clientWalletAssets.map((asset) => asset.marketAssetId ?? asset.id));
  const liveAssets = marketAssets.filter((asset) => activeAssetIds.has(asset.id)).slice(0, 5);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const headerClasses = isLightTheme
    ? 'border-slate-200/90 bg-white/90'
    : 'border-gray-800 bg-dark-900/80';
  const titleClasses = isLightTheme ? 'text-slate-900' : 'text-white';
  const metaClasses = isLightTheme ? 'text-slate-500' : 'text-gray-500';
  const marketShellClasses = isLightTheme
    ? 'border-slate-200 bg-white/95 shadow-[0_12px_36px_rgba(148,163,184,0.18)]'
    : 'border-gray-800 bg-dark-800/70';
  const marketDividerClasses = isLightTheme ? 'divide-slate-200' : 'divide-gray-800';
  const marketChipClasses = isLightTheme
    ? 'border-primary/30 bg-primary/10 text-slate-700'
    : 'border-primary/20 bg-primary/10 text-gray-300';
  const notificationButtonClasses = isLightTheme
    ? 'border-slate-200 bg-white/90 text-slate-500 hover:border-primary/40 hover:text-primary'
    : 'border-gray-800 text-gray-400 hover:border-primary/40 hover:text-primary';
  const profileButtonClasses = isLightTheme
    ? 'border-slate-200 bg-white/90 hover:border-primary/40 hover:bg-slate-50'
    : 'border-gray-800 hover:border-primary/40 hover:bg-dark-800/70';
  const chevronClasses = isLightTheme ? 'text-slate-400' : 'text-gray-400';
  const dropdownClasses = isLightTheme
    ? 'border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.16)]'
    : 'border-gray-800 bg-dark-900/95 shadow-2xl';
  const dropdownHoverClasses = isLightTheme ? 'hover:bg-slate-50' : 'hover:bg-dark-800/80';
  const dropdownTitleClasses = isLightTheme ? 'text-slate-900' : 'text-white';
  const dropdownMetaClasses = isLightTheme ? 'text-slate-500' : 'text-gray-500';
  const dividerClasses = isLightTheme ? 'border-slate-200' : 'border-gray-800/70';
  const settingsClasses = isLightTheme
    ? 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
    : 'text-gray-300 hover:bg-dark-800/80 hover:text-white';
  const logoutClasses = isLightTheme
    ? 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
    : 'text-rose-200 hover:bg-rose-500/10 hover:text-white';

  return (
    <header className={`z-40 shrink-0 border-b px-4 py-3 backdrop-blur-md md:px-8 ${headerClasses}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        {/* Left: logo + title */}
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/app" className="shrink-0">
            <BrandLogo size="lg" variant="icon" stretch invertFallback wrapperClassName="shrink-0" />
          </Link>
          <div className="min-w-0">
            <p className={`truncate text-[10px] font-bold uppercase tracking-[0.24em] ${metaClasses}`}>
              {branding.siteName}
            </p>
            <h1 className={`truncate text-sm font-semibold md:text-base ${titleClasses}`}>{currentTitle}</h1>
          </div>
        </div>

        {/* Centre: live market ticker */}
        <div className="hidden min-w-0 flex-1 items-center justify-center md:flex">
          <div className={`flex w-full max-w-3xl items-center overflow-hidden rounded-full border px-2 py-1 ${marketShellClasses}`}>
            <div className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 ${marketChipClasses}`}>
              <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em]">Live</span>
            </div>

            {liveAssets.length === 0 ? (
              <div className={`flex flex-1 items-center justify-center px-4 py-2 text-xs ${metaClasses}`}>
                Fetching market data…
              </div>
            ) : (
              <div className={`ml-2 flex min-w-0 flex-1 divide-x ${marketDividerClasses}`}>
                {liveAssets.map((asset) => (
                  <div key={asset.id} className="flex min-w-0 flex-1 items-center gap-2 px-3 py-1.5">
                    <img src={asset.icon} alt={asset.name} className="h-6 w-6 shrink-0 object-contain" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`truncate text-[11px] font-black uppercase ${titleClasses}`}>{asset.symbol}</p>
                        <span className={`shrink-0 text-[10px] font-semibold ${asset.change >= 0 ? 'text-success' : 'text-danger'}`}>
                          {formatPercent(asset.change)}
                        </span>
                      </div>
                      <p className={`text-xs font-semibold ${titleClasses}`}>{formatUsd(asset.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: theme toggle + bell + profile */}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
              isLightTheme
                ? 'border-primary/30 bg-primary/10 text-dark-900 hover:border-primary/50 hover:bg-primary/20'
                : 'border-gray-800 bg-dark-900/60 text-gray-300 hover:border-primary/40 hover:bg-dark-800/70 hover:text-primary'
            }`}
          >
            {isLightTheme ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="hidden lg:inline">{isLightTheme ? 'Light' : 'Dark'}</span>
          </button>

          {/* Bell with unread badge */}
          <Link
            to="/app/notifications"
            className={`relative rounded-full border p-2 transition-colors ${notificationButtonClasses}`}
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 min-w-[1rem] items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Profile menu */}
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className={`flex items-center gap-2 rounded-full border px-2 py-1.5 transition-colors ${profileButtonClasses}`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary/20">
                <span className="text-xs font-bold text-primary">{initials}</span>
              </div>
              <div className="hidden text-left lg:block">
                <p className={`text-xs font-semibold leading-none ${titleClasses}`}>{displayName}</p>
                {accountLabel && (
                  <p className={`mt-1 max-w-[120px] truncate text-[10px] leading-none ${metaClasses}`}>{accountLabel}</p>
                )}
              </div>
              <ChevronDown className={`hidden h-4 w-4 transition-transform lg:block ${chevronClasses} ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className={`absolute right-0 top-[calc(100%+0.75rem)] z-50 w-60 rounded-[1.4rem] border p-2 backdrop-blur-xl ${dropdownClasses}`}>
                <Link
                  to="/app/profile"
                  className={`flex items-center gap-3 rounded-[1rem] px-3 py-3 transition-colors ${dropdownHoverClasses}`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/20">
                    <span className="text-sm font-bold text-primary">{initials}</span>
                  </div>
                  <div className="min-w-0">
                    <p className={`truncate text-sm font-semibold ${dropdownTitleClasses}`}>{displayName}</p>
                    <p className={`mt-0.5 truncate text-[11px] ${dropdownMetaClasses}`}>View profile</p>
                  </div>
                </Link>

                <div className={`my-2 border-t ${dividerClasses}`} />

                <Link
                  to="/app/settings"
                  className={`flex items-center gap-3 rounded-[1rem] px-3 py-2.5 text-sm font-medium transition-colors ${settingsClasses}`}
                >
                  <Settings className="h-4 w-4 text-primary" />
                  Settings
                </Link>

                <Link
                  to="/app/notifications"
                  className={`flex items-center justify-between gap-3 rounded-[1rem] px-3 py-2.5 text-sm font-medium transition-colors ${settingsClasses}`}
                >
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-primary" />
                    Notifications
                  </div>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <div className={`my-2 border-t ${dividerClasses}`} />

                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className={`mt-1 flex w-full items-center gap-3 rounded-[1rem] px-3 py-2.5 text-left text-sm font-medium transition-colors ${logoutClasses}`}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
