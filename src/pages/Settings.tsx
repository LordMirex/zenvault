import {
  BadgeCheck,
  Bell,
  BookUser,
  ChevronRight,
  Globe,
  LogOut,
  Moon,
  Shield,
  Smartphone,
  Sun,
  User,
  Users,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { useTheme } from '../context/ThemeContext';

const formatStatus = (value?: string) =>
  value
    ? value
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase())
    : 'Not Started';

type SettingsLinkItem = {
  name: string;
  icon: LucideIcon;
  value: string;
  tone: string;
  href: string;
};

type SettingsToggleItem = {
  name: string;
  icon: LucideIcon;
  value: string;
  tone: string;
  type: 'theme-toggle';
};

type SettingsItem = SettingsLinkItem | SettingsToggleItem;

export const Settings = () => {
  const navigate = useNavigate();
  const { logout, clientProfile, clientSummary, user } = useAuth();
  const { branding } = useBranding();
  const { theme, toggleTheme, isLightTheme } = useTheme();

  const heroClasses = isLightTheme
    ? 'border-[#e7d8bf] bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.24),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.14),transparent_36%),linear-gradient(135deg,#fff8eb_0%,#f9fbff_54%,#eef2ff_100%)] shadow-[0_34px_90px_rgba(15,23,42,0.08)]'
    : 'border-[#232833] bg-[radial-gradient(circle_at_top_right,rgba(240,185,11,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.14),transparent_30%),linear-gradient(135deg,#121926_0%,#0b1220_48%,#020617_100%)] shadow-[0_34px_100px_rgba(0,0,0,0.45)]';
  const panelClasses = isLightTheme
    ? 'border-slate-200/80 bg-white/90 shadow-[0_24px_60px_rgba(15,23,42,0.08)]'
    : 'border-white/10 bg-[#0b1120]/88 shadow-[0_24px_60px_rgba(0,0,0,0.42)]';
  const insetClasses = isLightTheme ? 'border-slate-200/80 bg-slate-50/80' : 'border-white/10 bg-white/[0.03]';
  const titleClasses = isLightTheme ? 'text-slate-950' : 'text-white';
  const bodyClasses = isLightTheme ? 'text-slate-600' : 'text-slate-300/78';
  const labelClasses = isLightTheme ? 'text-slate-500' : 'text-slate-400';
  const hoverClasses = isLightTheme ? 'hover:border-slate-300 hover:bg-white' : 'hover:border-white/20 hover:bg-white/[0.05]';

  const settingsSections: { title: string; subtitle: string; items: SettingsItem[] }[] = [
    {
      title: 'Account Control',
      subtitle: 'Profile, security, and identity checks.',
      items: [
        {
          name: 'Profile Information',
          icon: User,
          value: clientProfile?.name ?? user?.name ?? 'Update your account details',
          tone: isLightTheme ? 'bg-sky-100 text-sky-700' : 'bg-sky-500/12 text-sky-300',
          href: '/app/profile',
        },
        {
          name: 'Security & Privacy',
          icon: Shield,
          value: 'Passcode + password protection',
          tone: isLightTheme ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/12 text-emerald-300',
          href: '/app/profile',
        },
        {
          name: 'KYC Verification',
          icon: BadgeCheck,
          value: formatStatus(clientProfile?.kycStatus),
          tone: isLightTheme ? 'bg-amber-100 text-amber-700' : 'bg-primary/12 text-primary',
          href: '/app/kyc',
        },
      ],
    },
    {
      title: 'Wallet Desk',
      subtitle: 'Assets, deposit rails, and referral activity.',
      items: [
        {
          name: 'Manage Assets',
          icon: WalletCards,
          value: clientSummary?.walletConnected ? 'Wallet connection active' : 'Wallet connection pending',
          tone: isLightTheme ? 'bg-violet-100 text-violet-700' : 'bg-violet-500/12 text-violet-300',
          href: '/app/crypto-manage',
        },
        {
          name: 'Wallet Addresses',
          icon: BookUser,
          value: 'Deposit rails and trusted contacts',
          tone: isLightTheme ? 'bg-cyan-100 text-cyan-700' : 'bg-cyan-500/12 text-cyan-300',
          href: '/app/crypto-address',
        },
        {
          name: 'Referral Program',
          icon: Users,
          value: 'Track invites and reward activity',
          tone: isLightTheme ? 'bg-pink-100 text-pink-700' : 'bg-pink-500/12 text-pink-300',
          href: '/app/referral',
        },
      ],
    },
    {
      title: 'Workspace Preferences',
      subtitle: 'Theme, language, and alerting defaults.',
      items: [
        {
          name: 'Notifications',
          icon: Bell,
          value: 'Review wallet and login alerts',
          tone: isLightTheme ? 'bg-orange-100 text-orange-700' : 'bg-orange-500/12 text-orange-300',
          href: '/app/notifications',
        },
        {
          name: 'Language',
          icon: Globe,
          value: 'English',
          tone: isLightTheme ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-slate-300',
          href: '/app/settings',
        },
        {
          name: 'Display Theme',
          icon: Smartphone,
          value: theme === 'light' ? 'Light interface active' : 'Dark interface active',
          tone: isLightTheme ? 'bg-amber-100 text-amber-700' : 'bg-primary/12 text-primary',
          type: 'theme-toggle',
        },
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <section className={`relative overflow-hidden rounded-[2.4rem] border px-6 py-6 md:px-8 md:py-8 ${heroClasses}`}>
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_55%)]" />
        <div className="relative grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] ${
                  isLightTheme ? 'border-amber-300/60 bg-white/70 text-amber-700' : 'border-primary/25 bg-primary/10 text-primary'
                }`}
              >
                <Shield size={16} />
                Settings
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] ${
                  isLightTheme ? 'border-slate-200/80 bg-white/60 text-slate-600' : 'border-white/10 bg-white/[0.04] text-slate-300'
                }`}
              >
                {clientProfile?.plan ?? 'Workspace'} plan
              </span>
            </div>

            <div className="space-y-4">
              <h2 className={`wallet-display max-w-3xl text-[clamp(2.5rem,6vw,4.6rem)] font-semibold leading-[0.95] ${titleClasses}`}>
                Rebuild the account area so it feels deliberate, not generated.
              </h2>
              <p className={`max-w-2xl text-base leading-7 md:text-lg ${bodyClasses}`}>
                The settings area now uses bigger type, stronger grouping, and clearer action cards. Important account tools
                should read like control surfaces, not recycled list rows.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Account tier', value: clientProfile?.tier ?? 'Tier pending' },
                { label: 'KYC status', value: formatStatus(clientProfile?.kycStatus) },
                { label: 'Theme mode', value: theme === 'light' ? 'Light' : 'Dark' },
              ].map((item) => (
                <div key={item.label} className={`rounded-[1.6rem] border p-4 ${insetClasses}`}>
                  <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${labelClasses}`}>{item.label}</p>
                  <p className={`mt-3 text-lg font-semibold ${titleClasses}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className={`sm:col-span-2 rounded-[2rem] border p-5 md:p-6 ${panelClasses}`}>
              <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${labelClasses}`}>Workspace summary</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className={`text-2xl font-semibold ${titleClasses}`}>{branding.siteName}</p>
                  <p className={`mt-2 text-sm leading-6 ${bodyClasses}`}>
                    Active workspace for {clientProfile?.name ?? user?.name ?? 'this account'} with security, wallet, and notification controls.
                  </p>
                </div>
                <div className="grid gap-3">
                  {[
                    { label: 'Wallet connection', value: clientSummary?.walletConnected ? 'Connected' : 'Pending' },
                    { label: 'Quick access', value: 'Security + notifications live' },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-[1.4rem] border p-4 ${insetClasses}`}>
                      <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${labelClasses}`}>{item.label}</p>
                      <p className={`mt-2 text-sm font-semibold ${titleClasses}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`rounded-[1.8rem] border p-5 ${panelClasses}`}>
              <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${labelClasses}`}>Theme</p>
              <p className={`mt-3 text-2xl font-semibold ${titleClasses}`}>{theme === 'light' ? 'Light mode' : 'Dark mode'}</p>
              <p className={`mt-2 text-sm leading-6 ${bodyClasses}`}>Toggle the workspace palette without digging through nested menus.</p>
            </div>

            <div className={`rounded-[1.8rem] border p-5 ${panelClasses}`}>
              <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${labelClasses}`}>Security</p>
              <p className={`mt-3 text-2xl font-semibold ${titleClasses}`}>Protected</p>
              <p className={`mt-2 text-sm leading-6 ${bodyClasses}`}>Passcode verification remains attached to sensitive actions.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        {settingsSections.map((section) => (
          <section key={section.title} className={`rounded-[2.2rem] border p-6 md:p-7 ${panelClasses}`}>
            <div>
              <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${labelClasses}`}>{section.title}</p>
              <p className={`mt-3 text-xl font-semibold ${titleClasses}`}>{section.subtitle}</p>
            </div>

            <div className="mt-6 space-y-3">
              {section.items.map((item) =>
                'type' in item ? (
                  <button
                    key={item.name}
                    type="button"
                    onClick={toggleTheme}
                    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                    aria-pressed={theme === 'light'}
                    className={`w-full rounded-[1.6rem] border p-4 text-left transition-colors ${insetClasses} ${hoverClasses}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.tone}`}>
                          <item.icon size={18} />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${titleClasses}`}>{item.name}</p>
                          <p className={`mt-1 text-sm leading-6 ${bodyClasses}`}>{item.value}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                            theme === 'light'
                              ? isLightTheme
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-primary/15 text-primary'
                              : isLightTheme
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-white/10 text-slate-300'
                          }`}
                        >
                          {theme === 'light' ? 'Light' : 'Dark'}
                        </span>
                        <span
                          className={`flex h-7 w-12 items-center rounded-full border px-1 transition-colors ${
                            theme === 'light'
                              ? isLightTheme
                                ? 'justify-end border-amber-300 bg-amber-100'
                                : 'justify-end border-primary/30 bg-primary/15'
                              : isLightTheme
                                ? 'justify-start border-slate-300 bg-white'
                                : 'justify-start border-white/10 bg-white/[0.04]'
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full ${
                              theme === 'light'
                                ? 'bg-primary text-slate-950'
                                : isLightTheme
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-slate-200 text-slate-950'
                            }`}
                          >
                            {theme === 'light' ? <Sun size={12} /> : <Moon size={12} />}
                          </span>
                        </span>
                      </div>
                    </div>
                  </button>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block rounded-[1.6rem] border p-4 transition-colors ${insetClasses} ${hoverClasses}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.tone}`}>
                          <item.icon size={18} />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${titleClasses}`}>{item.name}</p>
                          <p className={`mt-1 text-sm leading-6 ${bodyClasses}`}>{item.value}</p>
                        </div>
                      </div>
                      <ChevronRight className={`mt-1 h-5 w-5 ${labelClasses}`} />
                    </div>
                  </Link>
                ),
              )}
            </div>
          </section>
        ))}
      </div>

      <button
        type="button"
        onClick={async () => {
          await logout();
          navigate('/login', { replace: true });
        }}
        className={`flex w-full items-center justify-center gap-3 rounded-[2rem] border p-5 text-sm font-bold transition-colors ${
          isLightTheme
            ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
            : 'border-rose-500/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/15 hover:text-white'
        }`}
      >
        <LogOut size={18} />
        Sign Out {clientProfile?.email ?? user?.email ? `(${clientProfile?.email ?? user?.email})` : 'of This Session'}
      </button>

      <div className="pt-4 text-center">
        <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${labelClasses}`}>{branding.siteName} workspace control panel</p>
      </div>
    </div>
  );
};
