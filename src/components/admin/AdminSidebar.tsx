import { Link, NavLink } from 'react-router-dom';
import {
  ArrowLeftRight,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Settings,
  ShieldCheck,
  UserCircle2,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const groups = [
  {
    items: [{ label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Users', to: '/admin/users', icon: Users },
      { label: 'KYC Verification', to: '/admin/kyc', icon: ShieldCheck },
      { label: 'Transactions', to: '/admin/transactions', icon: ArrowLeftRight },
      { label: 'Broadcasts', to: '/admin/broadcasts', icon: Megaphone },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { label: 'General Settings', to: '/admin/settings/general', icon: Settings },
      { label: 'Email Settings', to: '/admin/settings/email', icon: Megaphone },
      { label: 'Wallet Settings', to: '/admin/settings/wallets', icon: Wallet },
      { label: 'Profile', to: '/admin/profile', icon: UserCircle2 },
    ],
  },
];

export const AdminSidebar = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <div
        className={cn('fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm md:hidden', !open && 'hidden')}
        onClick={onClose}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto bg-slate-900 p-4 text-white transition-transform md:static md:z-auto md:h-screen md:w-64 md:shrink-0 md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-5">
          <Link to="/admin/dashboard">
            <BrandLogo size="lg" variant="icon" stretch invertFallback />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav groups */}
        <nav className="mt-6 flex-1 space-y-6 overflow-y-auto">
          {groups.map((group) => (
            <div key={group.title ?? group.items[0]?.label}>
              {group.title && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  {group.title}
                </p>
              )}
              <div className={cn('space-y-0.5', group.title ? 'mt-2' : 'mt-0')}>
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom links */}
        <div className="space-y-1 border-t border-slate-700/60 pt-4">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Public site →
          </Link>
          <Link
            to="/app"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Trader portal →
          </Link>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};
