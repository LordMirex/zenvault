import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../../components/common/BrandLogo';

export const PasscodePage = () => {
  const navigate = useNavigate();
  const { user, verifyPasscode } = useAuth();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (passcode.length !== 6) {
      setError('Enter your 6-digit passcode.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const sessionUser = await verifyPasscode(passcode);
      navigate(sessionUser.role === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Passcode verification failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f3ee] px-4 py-8 text-slate-900 lg:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center justify-center rounded-[2.25rem] border border-slate-200 bg-white p-6 shadow-2xl md:p-10">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-4 text-center">
            <div className="mx-auto mb-2 flex justify-center">
              <BrandLogo size="lg" variant="icon" />
            </div>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-amber-600">
              <LockKeyhole className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-600">Security Check</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Enter passcode</h1>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {user ? `Complete sign-in for ${user.email}` : 'Complete your sign-in with the 6-digit wallet passcode.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">6-digit passcode</span>
              <input
                value={passcode}
                onChange={(event) => {
                  setPasscode(event.target.value.replace(/\D/g, '').slice(0, 6));
                  setError('');
                }}
                inputMode="numeric"
                placeholder="123456"
                className="w-full rounded-[1.3rem] border border-slate-200 bg-[#f8f6f1] px-4 py-4 text-center text-xl tracking-[0.55em] text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
              />
            </label>

            <div className="rounded-[1.3rem] border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <p className="text-sm font-semibold text-slate-800">Second-factor wallet access</p>
              </div>
            </div>

            {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-[1.3rem] bg-slate-950 px-5 py-4 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Verifying...' : 'Verify Passcode'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
