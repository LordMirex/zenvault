import { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { AdminBadge, AdminButton, AdminCard, AdminPageHeading } from '../../components/admin/AdminUi';

type TwoFactorState = {
  enabled: boolean;
  recoveryCodes: string[];
  lastUpdated: string;
};

export const AdminTwoFactorPage = () => {
  const [state, setState] = useState<TwoFactorState>({
    enabled: false,
    recoveryCodes: [],
    lastUpdated: 'Loading...',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadState = async () => {
      try {
        const payload = await apiRequest<{ state: TwoFactorState }>('/api/admin/2fa');
        setState(payload.state);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to load 2FA settings.');
      } finally {
        setLoading(false);
      }
    };

    void loadState();
  }, []);

  const updateEnabled = async (enabled: boolean) => {
    setSaving(true);
    setError('');

    try {
      const payload = await apiRequest<{ state: TwoFactorState }>('/api/admin/2fa', {
        method: 'PUT',
        body: JSON.stringify({ enabled }),
      });
      setState(payload.state);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to update 2FA state.');
    } finally {
      setSaving(false);
    }
  };

  const generateCodes = async () => {
    setSaving(true);
    setError('');

    try {
      const payload = await apiRequest<{ state: TwoFactorState }>('/api/admin/2fa/recovery-codes', {
        method: 'POST',
      });
      setState(payload.state);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to generate recovery codes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeading
        title="2FA Settings"
        description="Authenticator state and recovery codes now persist through the admin security API."
      />

      {error && (
        <AdminCard className="border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
          {error}
        </AdminCard>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <AdminCard className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Authenticator App</h3>
              <p className="mt-2 text-sm leading-7 text-slate-500">
                Toggle operator 2FA on or off. The current state is stored in MySQL and survives reloads.
              </p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Last updated: {state.lastUpdated}
              </p>
            </div>
            <AdminBadge value={state.enabled ? 'Enabled' : 'Disabled'} />
          </div>
          <button
            type="button"
            onClick={() => void updateEnabled(!state.enabled)}
            disabled={loading || saving}
            className={`mt-6 inline-flex h-8 w-14 items-center rounded-full p-1 transition-colors ${
              state.enabled ? 'bg-violet-600' : 'bg-slate-300'
            } ${loading || saving ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <span className={`h-6 w-6 rounded-full bg-white transition-transform ${state.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </AdminCard>

        <AdminCard className="p-6">
          <h3 className="text-lg font-semibold text-slate-900">Recovery Codes</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {state.recoveryCodes.map((code) => (
              <div key={code} className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                {code}
              </div>
            ))}
          </div>
          <div className="mt-6">
            <AdminButton onClick={() => void generateCodes()} disabled={loading || saving}>
              {saving ? 'Updating...' : 'Generate New Codes'}
            </AdminButton>
          </div>
        </AdminCard>
      </div>
    </div>
  );
};
