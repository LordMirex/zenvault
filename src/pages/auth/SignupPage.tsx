import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../../components/common/BrandLogo';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    password: '',
    passcode: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [nextStepsOpen, setNextStepsOpen] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: field === 'passcode' ? value.replace(/\D/g, '').slice(0, 6) : value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

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
            <BrandLogo size="xl" variant="icon" stretch />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--vb-orange)]">Signup</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">Open your account in minutes</h1>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Create your account once, then continue into funding, wallet setup, verification, and transaction history from one place.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-4 md:grid-cols-2">
            <Field label="Full name">
              <input
                value={form.fullName}
                onChange={(event) => updateField('fullName', event.target.value)}
                placeholder="John Doe"
                className="w-full rounded-[1.3rem] border border-slate-200 bg-[#f8f6f1] px-4 py-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
              />
            </Field>
            <Field label="Email address">
              <input
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-[1.3rem] border border-slate-200 bg-[#f8f6f1] px-4 py-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
              />
            </Field>
            <Field label="Phone number">
              <input
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                placeholder="+1 000 000 0000"
                className="w-full rounded-[1.3rem] border border-slate-200 bg-[#f8f6f1] px-4 py-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
              />
            </Field>
            <Field label="City">
              <input
                value={form.city}
                onChange={(event) => updateField('city', event.target.value)}
                placeholder="Your city"
                className="w-full rounded-[1.3rem] border border-slate-200 bg-[#f8f6f1] px-4 py-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Password">
                <input
                  value={form.password}
                  onChange={(event) => updateField('password', event.target.value)}
                  type="password"
                  placeholder="Create a strong password"
                  className="w-full rounded-[1.3rem] border border-slate-200 bg-[#f8f6f1] px-4 py-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="6-digit passcode">
                <input
                  value={form.passcode}
                  onChange={(event) => updateField('passcode', event.target.value)}
                  inputMode="numeric"
                  placeholder="123456"
                  className="w-full rounded-[1.3rem] border border-slate-200 bg-[#f8f6f1] px-4 py-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                />
              </Field>
            </div>

            <div className="md:col-span-2 rounded-[1.5rem] border border-slate-200 bg-[#f8f6f1] p-2">
              <button
                type="button"
                onClick={() => setNextStepsOpen((current) => !current)}
                className="flex w-full items-center justify-between rounded-[1.1rem] px-4 py-3 text-left"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">What happens next</p>
                  <p className="mt-1 text-xs text-slate-500">See what opens after account creation</p>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-slate-500 transition-transform ${nextStepsOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {nextStepsOpen && (
                <div className="grid gap-3 px-3 pb-3 pt-1 md:grid-cols-3">
                  {[
                    'Your account opens directly into the client dashboard.',
                    'Verification, wallet setup, and funding tools become available in your workspace.',
                    'Support and review teams can help when extra approval or guidance is needed.',
                  ].map((item) => (
                    <div key={item} className="rounded-[1.25rem] bg-white p-4 text-sm leading-7 text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="md:col-span-2 text-sm font-medium text-rose-600">{error}</p>}

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[1.3rem] bg-slate-950 px-5 py-4 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Creating account...' : 'Create account'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-slate-900">
              Login here
            </Link>
          </p>
        </main>

        <aside className="hidden bg-emerald-500 p-10 text-slate-950 lg:flex lg:h-full lg:flex-col lg:justify-between lg:overflow-hidden">
          <div>
            <BrandLogo size="xl" variant="icon" stretch />
            <h2 className="mt-6 text-5xl font-black tracking-tight">A clearer start for first-time buyers and repeat clients</h2>
            <p className="mt-5 max-w-lg text-base leading-8 text-emerald-950/80">
              The signup flow is built to reduce hesitation, explain what comes next, and move clients into a secure dashboard without friction.
            </p>
          </div>

          <div className="space-y-4">
            {[
              'Clear expectations before a user creates an account.',
              'A mobile-friendly form that does not feel like a throwaway prototype.',
              'One entry point into funding, wallet, verification, and support workflows.',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-[1.5rem] border border-emerald-950/10 bg-white/60 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5" />
                <p className="text-sm leading-7 text-emerald-950/80">{item}</p>
              </div>
            ))}
          </div>
        </aside>
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
