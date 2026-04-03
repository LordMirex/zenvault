import { Link, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Mail,
  Settings,
  ShieldCheck,
  UserCircle2,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { useBranding } from '../../context/BrandingContext';
import { BrandLogo } from '../common/BrandLogo';

const groups = [
  {
    items: [{ label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Users', to: '/admin/users', icon: Users },
      { label: 'KYC Verification', to: '/admin/kyc', icon: ShieldCheck },
      { label: 'Transactions', to: '/admin/transactions', icon: Wallet },
      { label: 'Email', to: '/admin/email', icon: Mail },
    ],
  },
  {
    title: 'Settings',
    items: [
      { label: 'General Settings', to: '/admin/settings/general', icon: Settings },
      { label: 'Email Settings', to: '/admin/settings/email', icon: Mail },
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
  const { branding } = useBranding();

  return (
  <>
    <div
      className={cn('fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm md:hidden', !open && 'hidden')}
      onClick={onClose}
    />
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto bg-slate-800 p-4 text-white transition-transform md:static md:z-auto md:h-screen md:w-64 md:shrink-0 md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-700 pb-5">
        <Link to="/admin/dashboard" className="flex items-center gap-3">
          <BrandLogo size="lg" variant="full" invertFallback textClassName="text-xl font-black text-white" />
          <div className="min-w-0">
            <p className="truncate text-sm text-slate-400">{branding.siteName} operations dashboard</p>
          </div>
        </Link>
        <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 md:hidden">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="mt-6 flex-1 space-y-6 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.title ?? group.items[0]?.label}>
            {group.title && (
              <p className="px-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{group.title}</p>
            )}
            <div className={cn('mt-2 space-y-1', !group.title && 'mt-0')}>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive ? 'bg-violet-600 text-white' : 'text-slate-200 hover:bg-slate-700',
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-3 border-t border-slate-700 pt-4">
        <Link to="/" className="block rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700">
          View public site
        </Link>
        <Link to="/app" className="block rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700">
          Open trader app
        </Link>
      </div>
    </aside>
  </>
  );
};
