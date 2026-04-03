import { Bell, ChevronDown, LogOut, Moon, Settings, Sun } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
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
  const { user, clientProfile, clientWalletAssets, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const routeTitles = [
    { path: '/app', title: 'Dashboard', exact: true },
    { path: '/app/buy', title: 'Buy Crypto' },
    { path: '/app/send', title: 'Send Assets' },
    { path: '/app/receive', title: 'Receive Assets' },
    { path: '/app/deposit', title: 'Deposit Assets' },
    { path: '/app/withdraw', title: 'Withdraw Assets' },
    { path: '/app/settings', title: 'Settings' },
    { path: '/app/profile', title: 'Security Settings' },
    { path: '/app/kyc', title: 'KYC Verification' },
    { path: '/app/crypto-manage', title: 'Manage Assets' },
    { path: '/app/crypto-address', title: 'Wallet Addresses' },
    { path: '/app/crypto/details', title: 'Asset Detail' },
    { path: '/app/notifications', title: 'Notifications' },
  ];

  const currentTitle =
    routeTitles.find((entry) =>
      entry.exact ? location.pathname === entry.path : location.pathname.startsWith(entry.path),
    )?.title || 'Dashboard';

  const displayName = clientProfile?.name ?? user?.name ?? 'Wallet Account';
  const accountLabel = clientProfile?.uuid ?? user?.uuid ?? user?.email ?? 'Signed-in member';
  const initials = getInitials(displayName);
  const isLightTheme = theme === 'light';
  const liveAssets = clientWalletAssets.filter((asset) => asset.enabledByDefault && asset.price > 0).slice(0, 3);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const themeActionLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

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

  const headerClasses = isLightTheme
    ? 'border-slate-200/90 bg-white/90'
    : 'border-gray-800 bg-dark-900/80';
  const titleClasses = isLightTheme ? 'text-slate-900' : 'text-white';
  const metaClasses = isLightTheme ? 'text-slate-500' : 'text-gray-500';
  const marketShellClasses = isLightTheme
    ? 'border-slate-200 bg-white/95 shadow-[0_12px_36px_rgba(148,163,184,0.18)]'
    : 'border-gray-800 bg-dark-800/70';
  const marketChipClasses = isLightTheme
    ? 'border-primary/30 bg-primary/10'
    : 'border-primary/20 bg-primary/10';
  const marketCardClasses = isLightTheme
    ? 'border-slate-200 bg-slate-50'
    : 'border-gray-800 bg-dark-900/60';
  const marketNameClasses = isLightTheme ? 'text-slate-900' : 'text-white';
  const marketSubtextClasses = isLightTheme ? 'text-slate-500' : 'text-gray-500';
  const marketPriceClasses = isLightTheme ? 'text-slate-700' : 'text-gray-300';
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
    <header className={`sticky top-0 z-40 shrink-0 border-b px-4 py-4 backdrop-blur-md md:px-8 ${headerClasses}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-4">
          {/* Desktop sidebar already shows the logo — on mobile just show the page title, clean and prominent */}
          <div className="min-w-0 max-w-[16rem]">
            <h1 className={`truncate text-lg font-bold md:text-xl ${titleClasses}`}>{currentTitle}</h1>
            <p className={`hidden truncate text-xs sm:block ${metaClasses}`}>{accountLabel}</p>
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 items-center justify-center md:flex">
          <div className={`flex w-full max-w-3xl items-center gap-2 rounded-[1.4rem] border px-2.5 py-1.5 ${marketShellClasses}`}>
            <div className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 ${marketChipClasses}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">Live</span>
            </div>

            {liveAssets.length === 0 ? (
              <div className={`flex flex-1 items-center justify-center rounded-[1rem] border border-dashed px-3 py-2 text-xs ${marketSubtextClasses}`}>
                Market feed unavailable
              </div>
            ) : (
              <div className="flex min-w-0 flex-1 gap-1.5">
                {liveAssets.map((asset) => {
                  const changePositive = asset.change > 0;
                  const changeNegative = asset.change < 0;
                  const changeBadgeClass = changePositive
                    ? isLightTheme ? 'bg-emerald-50 text-emerald-600' : 'bg-success/10 text-success'
                    : changeNegative
                      ? isLightTheme ? 'bg-rose-50 text-rose-600' : 'bg-danger/10 text-danger'
                      : isLightTheme ? 'bg-slate-100 text-slate-500' : 'bg-dark-800 text-gray-400';
                  return (
                    <div key={asset.id} className={`flex min-w-0 flex-1 items-center gap-2 rounded-[1rem] border px-2 py-1.5 ${marketCardClasses}`}>
                      <img src={asset.icon} alt={asset.name} className="h-6 w-6 shrink-0 object-contain" />
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="flex items-center gap-1">
                          <p className={`shrink-0 text-[10px] font-black uppercase tracking-[0.14em] ${marketNameClasses}`}>{asset.symbol}</p>
                          <span className={`ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold hidden lg:inline-block ${changeBadgeClass}`}>
                            {formatPercent(asset.change)}
                          </span>
                        </div>
                        <p className={`truncate text-[10px] font-semibold ${marketPriceClasses}`}>{formatUsd(asset.price)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={themeActionLabel}
            aria-pressed={theme === 'light'}
            title={themeActionLabel}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
              isLightTheme
                ? 'border-primary/30 bg-primary/10 text-dark-900 hover:border-primary/50 hover:bg-primary/20'
                : 'border-gray-800 bg-dark-900/60 text-gray-300 hover:border-primary/40 hover:bg-dark-800/70 hover:text-primary'
            }`}
          >
            {isLightTheme ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="hidden lg:inline">{isLightTheme ? 'Light' : 'Dark'}</span>
          </button>

          <Link
            to="/app/notifications"
            className={`rounded-full border p-2 transition-colors ${notificationButtonClasses}`}
            aria-label="Open notifications"
          >
            <Bell className="h-5 w-5" />
          </Link>

          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className={`flex items-center gap-2 rounded-full border px-2 py-1.5 transition-colors ${profileButtonClasses}`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary/20">
                <span className="text-xs font-bold text-primary">{initials}</span>
              </div>
              <div className="hidden text-left lg:block">
                <p className={`text-xs font-medium leading-none ${titleClasses}`}>{displayName}</p>
                <p className={`mt-1 text-[10px] leading-none ${metaClasses}`}>{accountLabel}</p>
              </div>
              <ChevronDown className={`hidden h-4 w-4 transition-transform lg:block ${chevronClasses} ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className={`absolute right-0 top-[calc(100%+0.75rem)] z-50 w-64 rounded-[1.4rem] border p-2 backdrop-blur-xl ${dropdownClasses}`}>
                <Link
                  to="/app/profile"
                  className={`flex items-center gap-3 rounded-[1rem] px-3 py-3 transition-colors ${dropdownHoverClasses}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/20">
                    <span className="text-sm font-bold text-primary">{initials}</span>
                  </div>
                  <div className="min-w-0">
                    <p className={`truncate text-sm font-semibold ${dropdownTitleClasses}`}>{displayName}</p>
                    <p className={`mt-1 truncate text-[11px] ${dropdownMetaClasses}`}>{accountLabel}</p>
                  </div>
                </Link>

                <div className={`my-2 border-t ${dividerClasses}`} />

                <Link
                  to="/app/settings"
                  className={`flex items-center gap-3 rounded-[1rem] px-3 py-3 text-sm font-medium transition-colors ${settingsClasses}`}
                >
                  <Settings className="h-4 w-4 text-primary" />
                  Settings
                </Link>

                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className={`mt-1 flex w-full items-center gap-3 rounded-[1rem] px-3 py-3 text-left text-sm font-medium transition-colors ${logoutClasses}`}
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
