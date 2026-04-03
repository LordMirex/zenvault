import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import { AdminButton, AdminCard, AdminPageHeading, AdminTextArea, AdminTextInput } from '../../components/admin/AdminUi';

type AdminProfileState = {
  fullName: string;
  email: string;
  role: string;
  timezone: string;
  profileNote: string;
};

export const AdminProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState<AdminProfileState>({
    fullName: user?.name ?? '',
    email: user?.email ?? '',
    role: 'Super Operator',
    timezone: 'Africa/Lagos',
    profileNote: 'Primary support and oversight account for the operations dashboard.',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const payload = await apiRequest<{ profile: AdminProfileState }>('/api/admin/profile');
        setForm(payload.profile);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to load admin profile.');
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const updateField = (field: keyof AdminProfileState, value: string) => {
    setSaved('');
    setError('');
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveProfile = async () => {
    setSaving(true);
    setSaved('');
    setError('');

    try {
      const payload = await apiRequest<{ profile: AdminProfileState }>('/api/admin/profile', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      setForm(payload.profile);
      setSaved('Profile saved successfully.');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to save admin profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeading
        title="Profile Settings"
        description="Operator profile details now persist through the admin API and can be updated without leaving the dashboard."
      />

      {saved && (
        <AdminCard className="border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          {saved}
        </AdminCard>
      )}

      {error && (
        <AdminCard className="border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
          {error}
        </AdminCard>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <AdminCard className="p-6">
          <h3 className="text-lg font-semibold text-slate-900">Admin Profile</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <AdminTextInput label="Full Name" value={form.fullName} onChange={(event) => updateField('fullName', event.target.value)} />
            <AdminTextInput label="Email" type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} />
            <AdminTextInput label="Role" value={form.role} onChange={(event) => updateField('role', event.target.value)} />
            <AdminTextInput label="Timezone" value={form.timezone} onChange={(event) => updateField('timezone', event.target.value)} />
            <div className="md:col-span-2">
              <AdminTextArea label="Profile Note" rows={5} value={form.profileNote} onChange={(event) => updateField('profileNote', event.target.value)} />
            </div>
          </div>
        </AdminCard>

        <div className="space-y-6">
          <AdminCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900">Access Summary</h3>
            <div className="mt-5 space-y-3">
              {[
                'Full dashboard visibility across users, KYC, cards, and transactions.',
                'Email, wallet, and general settings remain accessible from this profile.',
                '2FA state is managed separately and stored through the security endpoint.',
              ].map((item) => (
                <div key={item} className="rounded-lg bg-slate-50 p-4 text-sm leading-7 text-slate-600">
                  {item}
                </div>
              ))}
            </div>
          </AdminCard>

          <AdminButton onClick={() => void saveProfile()} disabled={loading || saving}>
            {loading ? 'Loading...' : saving ? 'Saving...' : 'Save Profile'}
          </AdminButton>
        </div>
      </div>
    </div>
  );
};
