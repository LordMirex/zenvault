import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Megaphone, Menu, Search } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useAuth } from '../../context/AuthContext';

const routeTitles = [
  { path: '/admin/dashboard', title: 'Admin Dashboard' },
  { path: '/admin/users', title: 'Users Management' },
  { path: '/admin/kyc', title: 'KYC Verification' },
  { path: '/admin/transactions', title: 'Transactions' },
  { path: '/admin/broadcasts', title: 'Broadcasts' },
  { path: '/admin/settings', title: 'Settings' },
  { path: '/admin/profile', title: 'Profile Settings' },
];

export const AdminHeader = ({ onOpenMenu }: { onOpenMenu: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const currentTitle =
    routeTitles.find((route) => location.pathname.startsWith(route.path))?.title ?? 'Admin Dashboard';

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/login', { replace: true });
  };

  const displayName = user?.name ?? 'Administrator';
  const displayRole = user?.email ?? 'Signed-in administrator';
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'AD';

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onOpenMenu} className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold text-slate-900">{currentTitle}</h1>
        </div>

        <div className="hidden w-full max-w-md items-center rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 md:flex">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users, wallets, or IDs..."
            className="w-full bg-transparent px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/broadcasts"
            title="Send Broadcast"
            className={cn(
              'hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors sm:flex',
              location.pathname.startsWith('/admin/broadcasts')
                ? 'bg-violet-100 text-violet-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            )}
          >
            <Megaphone className="h-4 w-4" />
            <span className="hidden lg:inline">Broadcasts</span>
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((current) => !current)}
              className="flex items-center gap-3 rounded-full px-3 py-2 transition-colors hover:bg-slate-100"
            >
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-700">{displayName}</p>
                <p className="text-xs text-slate-500">{displayRole}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-bold text-slate-700">
                {initials}
              </div>
              <ChevronDown className={cn('h-4 w-4 text-slate-500 transition-transform', dropdownOpen && 'rotate-180')} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-14 w-56 rounded-lg border border-slate-200 bg-white py-2 shadow-lg">
                <Link to="/admin/profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  Profile Settings
                </Link>
                <Link to="/admin/broadcasts" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  Broadcasts
                </Link>
                <div className="my-2 border-t border-slate-100" />
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="block w-full px-4 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
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
