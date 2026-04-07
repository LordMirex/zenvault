import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { COUNTRIES } from '../../lib/countries';
import {
  AdminButton,
  AdminCard,
  AdminNotice,
  AdminPageHeading,
  AdminSelect,
  AdminTextArea,
  AdminTextInput,
} from '../../components/admin/AdminUi';

export const AdminUserCreatePage = () => {
  const { createAdminUser } = useAuth();
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    passcode: '',
    country: '',
    tier: 'Tier 1',
    status: 'Active',
    riskLevel: 'Medium',
    note: '',
    requireKyc: true,
    sendEmail: true,
  });

  const updateField = (field: keyof typeof form, value: string | boolean) => {
    setSaved(false);
    setError('');
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm((current) => ({
      ...current,
      name: '',
      email: '',
      password: '',
      passcode: '',
      note: '',
      requireKyc: true,
      sendEmail: true,
    }));
  };

  return (
    <div className="space-y-6">
      <Link to="/admin/users" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900">
        <ChevronLeft className="h-4 w-4" />
        Back to users
      </Link>

      <AdminPageHeading
        title="Create User"
        description="Create a new client account. A wallet ID is automatically generated and assigned to the account."
      />

      {saved && <AdminNotice tone="success">User created successfully. The account is now active in the user list.</AdminNotice>}
      {error && <AdminNotice tone="danger">{error}</AdminNotice>}

      <form
        className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]"
        onSubmit={async (event) => {
          event.preventDefault();
          setError('');

          if (!form.name.trim()) { setError('Full name is required.'); return; }
          if (!form.email.trim()) { setError('Email address is required.'); return; }
          if (form.password && form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
          if (form.passcode && !/^\d{6}$/.test(form.passcode)) { setError('Passcode must be exactly 6 digits.'); return; }

          setSubmitting(true);
          try {
            await createAdminUser({
              ...form,
              kycStatus: form.requireKyc ? 'Pending' : 'Approved',
            });
            setSaved(true);
            resetForm();
          } catch (caughtError) {
            setError(caughtError instanceof Error ? caughtError.message : 'Unable to create user. Please try again.');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <AdminCard className="p-6">
          <h3 className="text-lg font-semibold text-slate-900">Profile Information</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <AdminTextInput
              label="Full Name *"
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="John Doe"
            />
            <AdminTextInput
              label="Email Address *"
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="john.doe@example.com"
            />
            <AdminSelect
              label="Country"
              value={form.country}
              onChange={(event) => updateField('country', event.target.value)}
            >
              <option value="">— Select country —</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </AdminSelect>

            <AdminSelect label="Tier" value={form.tier} onChange={(event) => updateField('tier', event.target.value)}>
              <option>Tier 1</option>
              <option>Tier 2</option>
              <option>Tier 3</option>
            </AdminSelect>
            <AdminTextInput
              label="Temporary Password"
              type="password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              placeholder="Leave blank to auto-generate (min. 8 chars)"
            />
            <AdminTextInput
              label="Security Passcode (6 digits)"
              value={form.passcode}
              onChange={(event) => updateField('passcode', event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Leave blank to use 000000 default"
              inputMode="numeric"
              maxLength={6}
            />
          </div>

          <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            The wallet ID (e.g. USR-0042-8731) is automatically generated and assigned to this account. It will appear on the user's profile.
          </p>
        </AdminCard>

        <div className="space-y-6">
          <AdminCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900">Risk and Verification</h3>
            <div className="mt-5 grid gap-4">
              <AdminSelect
                label="Account Status"
                value={form.status}
                onChange={(event) => updateField('status', event.target.value)}
              >
                <option>Active</option>
                <option>Review</option>
                <option>Suspended</option>
              </AdminSelect>
              <AdminSelect
                label="Risk Level"
                value={form.riskLevel}
                onChange={(event) => updateField('riskLevel', event.target.value)}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </AdminSelect>
              <label className="flex items-start gap-3 rounded-lg border border-slate-300 bg-white px-3 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.requireKyc}
                  onChange={(event) => updateField('requireKyc', event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                <span>
                  <span className="block text-sm font-medium text-slate-700">Require KYC Verification</span>
                  <span className="mt-1 block text-sm text-slate-500">
                    Account starts pending until documents are reviewed.
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-lg border border-slate-300 bg-white px-3 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.sendEmail}
                  onChange={(event) => updateField('sendEmail', event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                <span>
                  <span className="block text-sm font-medium text-slate-700">Send Welcome Email</span>
                  <span className="mt-1 block text-sm text-slate-500">
                    Email the user their login credentials and passcode after account creation.
                  </span>
                </span>
              </label>
              <AdminTextArea
                label="Internal Note"
                rows={3}
                value={form.note}
                onChange={(event) => updateField('note', event.target.value)}
                placeholder="Operator notes about this account..."
              />
            </div>
          </AdminCard>

          <AdminButton type="submit" disabled={submitting} className="w-full mt-2">
            {submitting ? 'Creating account...' : 'Create User Account'}
          </AdminButton>
        </div>
      </form>
    </div>
  );
};
