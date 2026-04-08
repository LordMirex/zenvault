import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import { COUNTRIES } from '../../lib/countries';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    country: '',
    passcode: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [nextStepsOpen, setNextStepsOpen] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setError('');
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!form.fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!form.email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.passcode && !/^\d{6}$/.test(form.passcode)) {
      setError('Passcode must be exactly 6 digits.');
      return;
    }

    setSubmitting(true);
    try {
      await signup(form);
      navigate('/login', { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f3ee] px-4 py-8 text-slate-900 lg:h-screen lg:overflow-hidden lg:p-6">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2.25rem] border border-slate-200 bg-white shadow-2xl lg:h-full lg:grid-cols-[1.02fr_0.98fr]">
        <main className="p-6 md:p-10 lg:h-full lg:overflow-y-auto lg:p-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900">
            Back to public site
          </Link>

          <div className="mt-6 max-w-2xl lg:mt-4">
            <div className="mb-5">
              <BrandLogo size="lg" variant="icon" stretch />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--vb-orange)]">Create Account</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">Open your account in minutes</h1>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Create your account once, then access your wallet, verification, and transaction history from one dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-4 md:grid-cols-2">
            <Field label="Full name *">
              <input
                value={form.fullName}
                onChange={(event) => updateField('fullName', event.target.value)}
                placeholder="John Doe"
                required
                className={inputCls}
              />
            </Field>
            <Field label="Email address *">
              <input
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                type="email"
                placeholder="you@example.com"
                required
                className={inputCls}
              />
            </Field>
            <Field label="Country">
              <select
                value={form.country}
                onChange={(event) => updateField('country', event.target.value)}
                className={inputCls}
              >
                <option value="">— Select your country —</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Password * (min. 8 characters)">
              <input
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                type="password"
                placeholder="Create a strong password"
                minLength={8}
                required
                className={inputCls}
              />
            </Field>
            <Field label="Security passcode (6 digits, optional)">
              <input
                value={form.passcode}
                onChange={(event) => updateField('passcode', event.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                maxLength={6}
                placeholder="Leave blank to use default 000000"
                className={inputCls}
              />
            </Field>

            <div className="md:col-span-2 rounded-[1.5rem] border border-slate-200 bg-[#f8f6f1] p-2">
              <button
                type="button"
                onClick={() => setNextStepsOpen((current) => !current)}
                className="flex w-full items-center justify-between rounded-[1.1rem] px-4 py-3 text-left"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">What happens after signup?</p>
                  <p className="mt-1 text-xs text-slate-500">See what opens after account creation</p>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-slate-500 transition-transform ${nextStepsOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {nextStepsOpen && (
                <div className="grid gap-3 px-3 pb-3 pt-1 md:grid-cols-3">
                  {[
                    'You will be redirected to sign in with your new credentials.',
                    'Complete your identity verification (KYC) to unlock full wallet access.',
                    'Your wallet ID is auto-generated and visible on your profile — share it to receive internal transfers.',
                  ].map((item) => (
                    <div key={item} className="rounded-[1.25rem] bg-white p-4 text-sm leading-7 text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <p className="md:col-span-2 rounded-[1.2rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
                {error}
              </p>
            )}

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[1.3rem] bg-slate-950 px-5 py-4 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Creating account...' : 'Create my account'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-slate-900">
              Sign in here
            </Link>
          </p>
        </main>

        <aside className="hidden bg-emerald-500 p-10 text-slate-950 lg:flex lg:h-full lg:flex-col lg:justify-between lg:overflow-hidden">
          <div>
            <h2 className="mt-6 text-5xl font-black tracking-tight">A clear, simple start for every client</h2>
            <p className="mt-5 max-w-lg text-base leading-8 text-emerald-950/80">
              Your account is set up in minutes. Once signed in, you have full access to your wallet, KYC verification, card requests, and transaction history.
            </p>
          </div>

          <div className="space-y-4">
            {[
              'Full name and email are all you need to get started.',
              'Your wallet ID is auto-generated — no need to set it up manually.',
              'Complete identity verification at your own pace to unlock all features.',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-[1.5rem] border border-emerald-950/10 bg-white/60 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="text-sm leading-7 text-emerald-950/80">{item}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

const inputCls =
  'w-full rounded-[1.3rem] border border-slate-200 bg-[#f8f6f1] px-4 py-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none';

type FieldProps = {
  label: string;
  children: ReactNode;
};

const Field = ({ label, children }: FieldProps) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
    {children}
  </label>
);
