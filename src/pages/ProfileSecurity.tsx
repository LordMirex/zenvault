import {
  BadgeCheck,
  Check,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { useState } from 'react';
import { recentSessions } from '../data/wallet';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

type VisibilityMap = {
  passcode: boolean;
  currentPassword: boolean;
  newPassword: boolean;
  confirmPassword: boolean;
};

export const ProfileSecurity = () => {
  const { updateClientSecurity } = useAuth();
  const { isLightTheme } = useTheme();
  const [form, setForm] = useState({
    passcode: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [visibility, setVisibility] = useState<VisibilityMap>({
    passcode: false,
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const passwordsMatch = form.newPassword.length > 0 && form.newPassword === form.confirmPassword;
  const canSave = form.passcode.length === 6 && form.currentPassword.length > 0 && passwordsMatch;
  const passwordChecks = [
    { label: '12+ characters', passed: form.newPassword.length >= 12 },
    { label: 'Upper and lower case', passed: /[a-z]/.test(form.newPassword) && /[A-Z]/.test(form.newPassword) },
    { label: 'Number included', passed: /\d/.test(form.newPassword) },
    { label: 'Special character', passed: /[^A-Za-z0-9]/.test(form.newPassword) },
  ];
  const completedChecks = passwordChecks.filter((item) => item.passed).length;
  const trustedSessions = recentSessions.filter((session) => session.status !== 'Revoked').length;
  const currentSession = recentSessions.find((session) => session.status === 'Current session') ?? recentSessions[0] ?? null;

  const heroClasses = isLightTheme
    ? 'border-[#e6dac4] bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.26),transparent_33%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.18),transparent_34%),linear-gradient(135deg,#fff9ec_0%,#f8fbff_58%,#eef2ff_100%)] shadow-[0_34px_90px_rgba(15,23,42,0.08)]'
    : 'border-[#232833] bg-[radial-gradient(circle_at_top_right,rgba(240,185,11,0.18),transparent_29%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.18),transparent_31%),linear-gradient(135deg,#121926_0%,#0b1220_52%,#020617_100%)] shadow-[0_34px_100px_rgba(0,0,0,0.45)]';
  const panelClasses = isLightTheme
    ? 'border-slate-200/80 bg-white/88 shadow-[0_24px_60px_rgba(15,23,42,0.08)]'
    : 'border-white/10 bg-[#0b1120]/88 shadow-[0_24px_60px_rgba(0,0,0,0.42)]';
  const insetClasses = isLightTheme ? 'border-slate-200/80 bg-slate-50/80' : 'border-white/10 bg-white/[0.03]';
  const titleClasses = isLightTheme ? 'text-slate-950' : 'text-white';
  const bodyClasses = isLightTheme ? 'text-slate-600' : 'text-slate-300/78';
  const labelClasses = isLightTheme ? 'text-slate-500' : 'text-slate-400';
  const dividerClasses = isLightTheme ? 'border-slate-200/80' : 'border-white/10';
  const actionClasses = canSave
    ? 'bg-primary text-slate-950 hover:bg-[#ffd04d]'
    : isLightTheme
      ? 'cursor-not-allowed bg-slate-200 text-slate-400'
      : 'cursor-not-allowed border border-white/10 bg-white/[0.04] text-slate-500';

  const updateField = (field: keyof typeof form, value: string) => {
    setSaved(false);
    setError('');
    setForm((current) => ({
      ...current,
      [field]: field === 'passcode' ? value.replace(/\D/g, '').slice(0, 6) : value,
    }));
  };

  const toggleVisibility = (field: keyof VisibilityMap) => {
    setVisibility((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  const handleSave = async () => {
    if (!canSave) {
      return;
    }

    try {
      await updateClientSecurity({
        passcode: form.passcode,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSaved(true);
      setForm({
        passcode: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to update security settings.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <section className={`relative overflow-hidden rounded-[2.4rem] border px-6 py-6 md:px-8 md:py-8 ${heroClasses}`}>
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.10),transparent_55%)]" />
        <div className="relative grid gap-6 xl:grid-cols-[1.12fr_0.88fr] xl:items-end">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] ${
                  isLightTheme ? 'border-amber-300/60 bg-white/70 text-amber-700' : 'border-primary/25 bg-primary/10 text-primary'
                }`}
              >
                <ShieldCheck size={16} />
                Security Settings
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] ${
                  isLightTheme ? 'border-slate-200/80 bg-white/60 text-slate-600' : 'border-white/10 bg-white/[0.04] text-slate-300'
                }`}
              >
                Rotation window 30 days
              </span>
            </div>

            <div className="space-y-4">
              <h2 className={`wallet-display max-w-3xl text-[clamp(2.6rem,6vw,4.85rem)] font-semibold leading-[0.94] ${titleClasses}`}>
                Lock down passcodes, passwords, and every device touching your wallet.
              </h2>
              <p className={`max-w-2xl text-base leading-7 md:text-lg ${bodyClasses}`}>
                This screen now reads like a control room instead of a form dump. Rotate credentials, check session trust,
                and see the protection layers without squinting through tiny labels.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Last rotation', value: '11 days ago' },
                { label: 'Breach watch', value: 'Low risk' },
                { label: 'Trusted sessions', value: `${trustedSessions} active` },
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
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${labelClasses}`}>Security posture</p>
                  <div className="mt-3 flex items-end gap-3">
                    <p className={`wallet-display text-6xl font-semibold leading-none ${titleClasses}`}>94</p>
                    <div className="pb-2">
                      <p className="text-sm font-semibold text-emerald-500">Excellent coverage</p>
                      <p className={`mt-1 text-sm ${bodyClasses}`}>Passcode and trusted sessions are fully active.</p>
                    </div>
                  </div>
                </div>

                <div className="grid min-w-[220px] gap-3">
                  {[
                    { label: 'Credential hygiene', value: '94%' },
                    { label: 'Session trust', value: '88%' },
                    { label: 'Recovery readiness', value: '72%' },
                  ].map((item, index) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-xs">
                        <span className={labelClasses}>{item.label}</span>
                        <span className={`font-semibold ${titleClasses}`}>{item.value}</span>
                      </div>
                      <div className={`mt-2 h-2 rounded-full ${isLightTheme ? 'bg-slate-200' : 'bg-white/10'}`}>
                        <div
                          className={`h-full rounded-full ${index === 2 ? 'bg-sky-400' : 'bg-primary'}`}
                          style={{ width: item.value }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`rounded-[1.8rem] border p-5 ${panelClasses}`}>
              <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${labelClasses}`}>2FA</p>
              <p className={`mt-3 text-2xl font-semibold ${titleClasses}`}>Enabled</p>
              <p className={`mt-2 text-sm leading-6 ${bodyClasses}`}>Triggered outside trusted locations and on sensitive withdrawals.</p>
            </div>

            <div className={`rounded-[1.8rem] border p-5 ${panelClasses}`}>
              <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${labelClasses}`}>Trusted devices</p>
              <p className={`mt-3 text-2xl font-semibold ${titleClasses}`}>{trustedSessions}</p>
              <p className={`mt-2 text-sm leading-6 ${bodyClasses}`}>Desktop and mobile sessions cleared for faster approvals.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className={`overflow-hidden rounded-[2.2rem] border ${panelClasses}`}>
          <div className={`border-b px-6 py-6 md:px-7 ${dividerClasses}`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${labelClasses}`}>Credential vault</p>
                <h3 className={`mt-3 text-2xl font-semibold md:text-3xl ${titleClasses}`}>Refresh the keys without the visual clutter.</h3>
                <p className={`mt-2 max-w-2xl text-sm leading-6 ${bodyClasses}`}>
                  Bigger fields, cleaner spacing, and clearer state. You should be able to update sensitive details quickly
                  instead of hunting through four lookalike boxes.
                </p>
              </div>
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                  isLightTheme ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                }`}
              >
                <LockKeyhole size={16} />
                Save flow protected
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6 md:p-7">
            <div className="grid gap-4 md:grid-cols-2">
              <SecurityField
                label="Your 6-digit passcode"
                caption={`${form.passcode.length}/6`}
                value={form.passcode}
                type={visibility.passcode ? 'text' : 'password'}
                placeholder="Enter passcode"
                onChange={(value) => updateField('passcode', value)}
                onToggle={() => toggleVisibility('passcode')}
                visible={visibility.passcode}
                inputMode="numeric"
                isLightTheme={isLightTheme}
              />
              <SecurityField
                label="Current password"
                caption="Required"
                value={form.currentPassword}
                type={visibility.currentPassword ? 'text' : 'password'}
                placeholder="Enter current password"
                onChange={(value) => updateField('currentPassword', value)}
                onToggle={() => toggleVisibility('currentPassword')}
                visible={visibility.currentPassword}
                isLightTheme={isLightTheme}
              />
              <SecurityField
                label="New password"
                caption="Fresh secret"
                value={form.newPassword}
                type={visibility.newPassword ? 'text' : 'password'}
                placeholder="Create a new password"
                onChange={(value) => updateField('newPassword', value)}
                onToggle={() => toggleVisibility('newPassword')}
                visible={visibility.newPassword}
                isLightTheme={isLightTheme}
              />
              <SecurityField
                label="Confirm new password"
                caption={passwordsMatch ? 'Matched' : 'Check again'}
                value={form.confirmPassword}
                type={visibility.confirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                onChange={(value) => updateField('confirmPassword', value)}
                onToggle={() => toggleVisibility('confirmPassword')}
                visible={visibility.confirmPassword}
                isLightTheme={isLightTheme}
              />
            </div>

            <div className={`rounded-[1.9rem] border p-5 md:p-6 ${insetClasses}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${labelClasses}`}>Password policy</p>
                  <p className={`mt-2 text-lg font-semibold ${titleClasses}`}>Use a stronger password than your last desk login.</p>
                </div>
                <div
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${
                    completedChecks >= 3
                      ? isLightTheme
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                      : isLightTheme
                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                        : 'border-primary/25 bg-primary/10 text-primary'
                  }`}
                >
                  <BadgeCheck size={16} />
                  Strength {completedChecks}/4
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {passwordChecks.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-3 rounded-[1.2rem] border px-4 py-3 ${
                      item.passed
                        ? isLightTheme
                          ? 'border-emerald-200 bg-emerald-50/80'
                          : 'border-emerald-500/15 bg-emerald-500/10'
                        : isLightTheme
                          ? 'border-slate-200 bg-white'
                          : 'border-white/10 bg-white/[0.03]'
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full ${
                        item.passed
                          ? isLightTheme
                            ? 'bg-emerald-500 text-white'
                            : 'bg-emerald-500/20 text-emerald-300'
                          : isLightTheme
                            ? 'bg-slate-100 text-slate-400'
                            : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      <Check size={14} />
                    </span>
                    <span className={`text-sm font-medium ${item.passed ? titleClasses : bodyClasses}`}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {!passwordsMatch && form.confirmPassword.length > 0 && (
              <div
                className={`rounded-[1.5rem] border px-4 py-3 text-sm ${
                  isLightTheme ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-rose-500/20 bg-rose-500/10 text-rose-300'
                }`}
              >
                The new password and confirmation do not match yet.
              </div>
            )}

            {error && (
              <div
                className={`rounded-[1.5rem] border px-4 py-3 text-sm ${
                  isLightTheme ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-rose-500/20 bg-rose-500/10 text-rose-300'
                }`}
              >
                {error}
              </div>
            )}

            {saved && (
              <div
                className={`rounded-[1.5rem] border px-4 py-3 text-sm ${
                  isLightTheme ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                }`}
              >
                Security details updated successfully. New credentials will be required on the next sign-in.
              </div>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className={`max-w-xl text-sm leading-6 ${bodyClasses}`}>
                Saving here rotates the current password while keeping your passcode validation step intact for future sign-ins.
              </p>
              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave}
                className={`inline-flex min-w-[220px] items-center justify-center rounded-full px-6 py-4 text-sm font-black uppercase tracking-[0.18em] transition-colors ${actionClasses}`}
              >
                Update Security
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <section className={`rounded-[2.2rem] border p-6 md:p-7 ${panelClasses}`}>
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-[1.3rem] ${
                  isLightTheme ? 'bg-amber-100 text-amber-700' : 'bg-primary/12 text-primary'
                }`}
              >
                <KeyRound size={20} />
              </div>
              <div>
                <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${labelClasses}`}>Protection stack</p>
                <h3 className={`mt-1 text-xl font-semibold ${titleClasses}`}>Every layer is visible at a glance.</h3>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {[
                {
                  title: 'Passcode gate',
                  detail: 'Every outbound approval still requires a six-digit wallet passcode.',
                  status: 'Live',
                  icon: KeyRound,
                },
                {
                  title: 'Device trust',
                  detail: 'Known browsers skip friction, but foreign locations still trigger review.',
                  status: 'Watching',
                  icon: Fingerprint,
                },
                {
                  title: 'Recovery controls',
                  detail: 'Recovery phrases stay offline and never surface in the app workspace.',
                  status: 'Offline',
                  icon: ShieldCheck,
                },
              ].map((layer) => (
                <div key={layer.title} className={`rounded-[1.5rem] border p-4 ${insetClasses}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div
                        className={`mt-1 flex h-10 w-10 items-center justify-center rounded-2xl ${
                          isLightTheme ? 'bg-white text-slate-700' : 'bg-white/6 text-white'
                        }`}
                      >
                        <layer.icon size={18} />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${titleClasses}`}>{layer.title}</p>
                        <p className={`mt-1 text-sm leading-6 ${bodyClasses}`}>{layer.detail}</p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                        layer.status === 'Live'
                          ? isLightTheme
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                          : layer.status === 'Watching'
                            ? isLightTheme
                              ? 'border-amber-200 bg-amber-50 text-amber-700'
                              : 'border-primary/25 bg-primary/10 text-primary'
                            : isLightTheme
                              ? 'border-slate-200 bg-white text-slate-600'
                              : 'border-white/10 bg-white/[0.04] text-slate-300'
                      }`}
                    >
                      {layer.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={`rounded-[2.2rem] border p-6 md:p-7 ${panelClasses}`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-[1.3rem] ${
                    isLightTheme ? 'bg-sky-100 text-sky-700' : 'bg-sky-500/12 text-sky-300'
                  }`}
                >
                  <Smartphone size={20} />
                </div>
                <div>
                  <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${labelClasses}`}>Session perimeter</p>
                  <h3 className={`mt-1 text-xl font-semibold ${titleClasses}`}>Trusted hardware, current location, revoked history.</h3>
                </div>
              </div>
              <span
                className={`hidden rounded-full border px-3 py-2 text-xs font-semibold md:inline-flex ${
                  isLightTheme ? 'border-slate-200 bg-white text-slate-600' : 'border-white/10 bg-white/[0.04] text-slate-300'
                }`}
              >
                {trustedSessions} trusted
              </span>
            </div>

            <div className={`mt-6 rounded-[1.6rem] border p-4 ${insetClasses}`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${labelClasses}`}>Current perimeter</p>
                  <p className={`mt-2 text-lg font-semibold ${titleClasses}`}>
                    {currentSession ? `${currentSession.device} is active` : 'Session tracking is active'}
                  </p>
                  <p className={`mt-2 text-sm ${bodyClasses}`}>
                    {currentSession ? `${currentSession.location} - ${currentSession.lastSeen}` : 'New sign-ins are now recorded and revocable.'}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isLightTheme ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/10 text-emerald-300'
                  }`}
                >
                  {currentSession?.status === 'Revoked' ? 'Revoked' : 'Live now'}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {recentSessions.map((session) => (
                <div key={session.id} className={`rounded-[1.5rem] border p-4 ${insetClasses}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div
                        className={`mt-1 flex h-11 w-11 items-center justify-center rounded-2xl ${
                          session.status === 'Revoked'
                            ? isLightTheme
                              ? 'bg-rose-100 text-rose-600'
                              : 'bg-rose-500/10 text-rose-300'
                            : isLightTheme
                              ? 'bg-slate-950 text-white'
                              : 'bg-white/8 text-white'
                        }`}
                      >
                        <Fingerprint size={18} />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${titleClasses}`}>{session.device}</p>
                        <p className={`mt-1 text-sm ${bodyClasses}`}>{session.location}</p>
                        <p className={`mt-2 text-xs ${labelClasses}`}>{session.lastSeen}</p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                        session.status === 'Revoked'
                          ? isLightTheme
                            ? 'border-rose-200 bg-rose-50 text-rose-600'
                            : 'border-rose-500/20 bg-rose-500/10 text-rose-300'
                          : session.status === 'Current session'
                            ? isLightTheme
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                            : isLightTheme
                              ? 'border-slate-200 bg-white text-slate-600'
                              : 'border-white/10 bg-white/[0.04] text-slate-300'
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};

type SecurityFieldProps = {
  label: string;
  caption: string;
  value: string;
  type: string;
  placeholder: string;
  visible: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
  inputMode?: 'text' | 'numeric';
  isLightTheme: boolean;
};

const SecurityField = ({
  label,
  caption,
  value,
  type,
  placeholder,
  visible,
  onChange,
  onToggle,
  inputMode,
  isLightTheme,
}: SecurityFieldProps) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between gap-3">
      <label className={`${isLightTheme ? 'text-slate-500' : 'text-slate-400'} text-[11px] font-bold uppercase tracking-[0.22em]`}>
        {label}
      </label>
      <span className={`${isLightTheme ? 'text-slate-400' : 'text-slate-500'} text-[11px] font-medium uppercase tracking-[0.18em]`}>
        {caption}
      </span>
    </div>
    <div
      className={`relative overflow-hidden rounded-[1.5rem] border ${
        isLightTheme ? 'border-slate-200 bg-white shadow-[0_12px_24px_rgba(15,23,42,0.04)]' : 'border-white/10 bg-white/[0.04]'
      }`}
    >
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        className={`w-full bg-transparent px-5 py-4 pr-14 text-base font-medium focus:outline-none ${
          isLightTheme ? 'text-slate-950 placeholder:text-slate-400' : 'text-white placeholder:text-slate-500'
        }`}
      />
      <button
        type="button"
        onClick={onToggle}
        className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
          isLightTheme ? 'text-slate-400 hover:text-slate-950' : 'text-slate-500 hover:text-white'
        }`}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
);
