import type { FormEvent, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import { consumeAuthNotice } from '../../lib/api';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { branding } = useBranding();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const notice = consumeAuthNotice();
    if (notice) {
      setError(notice);
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const result = await login(email, password);
      navigate(result.requiresPasscode ? '/passcode' : result.user.role === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f3ee] px-4 py-8 text-slate-900 lg:h-screen lg:overflow-hidden lg:p-6">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2.25rem] border border-slate-200 bg-white shadow-2xl lg:h-full lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="max-w-full">
            <BrandLogo size="xl" variant="full" invertFallback textClassName="text-3xl font-black tracking-tight text-white" />
            <h1 className="mt-6 text-5xl font-black tracking-tight">{branding.authHeadline}</h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-slate-300">
              {branding.authDescription}
            </p>
          </div>

          <div className="space-y-4">
            {[
              'Secure account access with password verification.',
              'Second-step passcode confirmation before entry.',
              'Protected access to wallet activity and account controls.',
            ].map((item) => (
              <div key={item} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </aside>

        <main className="flex items-center justify-center p-6 md:p-10 lg:h-full lg:p-8">
          <div className="w-full max-w-lg">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900">
              Back to public site
            </Link>

            <div className="mt-8">
              <div className="mb-5 lg:hidden">
                <BrandLogo size="xl" variant="full" textClassName="text-2xl font-black tracking-tight text-slate-900" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--vb-orange)]">Login</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Welcome back</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">Enter your account credentials to continue to secure verification.</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <Field label="Email address">
                <input
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError('');
                  }}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-[1.3rem] border border-slate-200 bg-[#f8f6f1] px-4 py-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                />
              </Field>

              <Field label="Password">
                <div className="relative">
                  <input
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError('');
                    }}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    className="w-full rounded-[1.3rem] border border-slate-200 bg-[#f8f6f1] px-4 py-4 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-800"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </Field>

              <div className="flex items-center justify-between gap-4 rounded-[1.3rem] border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-[var(--vb-orange)]" />
                  <p className="text-sm font-semibold text-slate-800">Protected login flow</p>
                </div>
                <p className="text-xs font-medium text-slate-500">Password plus passcode verification</p>
              </div>

              {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[1.3rem] bg-slate-950 px-5 py-4 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Signing in...' : 'Continue to portal'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-500">
              Need an account?{' '}
              <Link to="/signup" className="font-bold text-slate-900">
                Create one here
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

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
