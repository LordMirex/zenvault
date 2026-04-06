import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  AdminButton,
  AdminCard,
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
    uuid: '',
    country: '',
    deskLabel: '',
    tier: 'Tier 1',
    status: 'Active',
    riskLevel: 'Medium',
    note: '',
    plan: 'Starter',
    requireKyc: true,
  });

  const updateField = (field: keyof typeof form, value: string) => {
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
      uuid: '',
      note: '',
      requireKyc: true,
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
        description="Create a new client account from the admin console. The user will receive an email with their login credentials."
      />

      {saved && (
        <AdminCard className="border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          User created successfully. The account is now available in the user list and a welcome email has been sent to the address provided.
        </AdminCard>
      )}

      {error && (
        <AdminCard className="border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
          {error}
        </AdminCard>
      )}

      <form
        className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]"
        onSubmit={async (event) => {
          event.preventDefault();
          setError('');

          if (!form.name.trim()) {
            setError('Full name is required.');
            return;
          }
          if (!form.email.trim()) {
            setError('Email address is required.');
            return;
          }
          if (form.password && form.password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
          }

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
            <AdminTextInput
              label="UUID / Reference ID"
              value={form.uuid}
              onChange={(event) => updateField('uuid', event.target.value)}
              placeholder="e.g. QFS-0000-0000 (optional)"
            />
            <AdminTextInput
              label="Country"
              value={form.country}
              onChange={(event) => updateField('country', event.target.value)}
              placeholder="e.g. United States"
            />
            <AdminTextInput
              label="Desk Label"
              value={form.deskLabel}
              onChange={(event) => updateField('deskLabel', event.target.value)}
              placeholder="e.g. Prime Treasury Desk"
            />
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
          </div>
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
              <label className="flex items-start gap-3 rounded-lg border border-slate-300 bg-white px-3 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.requireKyc}
                  onChange={(event) => {
                    setSaved(false);
                    setError('');
                    setForm((current) => ({ ...current, requireKyc: event.target.checked }));
                  }}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                <span>
                  <span className="block text-sm font-medium text-slate-700">Require KYC Verification</span>
                  <span className="mt-1 block text-sm text-slate-500">
                    User will start in a pending verification state until documents are reviewed.
                  </span>
                </span>
              </label>
              <AdminSelect
                label="Risk Level"
                value={form.riskLevel}
                onChange={(event) => updateField('riskLevel', event.target.value)}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </AdminSelect>
              <AdminTextArea
                label="Internal Note"
                rows={4}
                value={form.note}
                onChange={(event) => updateField('note', event.target.value)}
                placeholder="Operator notes about this account..."
              />
            </div>
          </AdminCard>

          <AdminCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900">Plan and Access</h3>
            <div className="mt-5 grid gap-4">
              <AdminTextInput
                label="Plan Name"
                value={form.plan}
                onChange={(event) => updateField('plan', event.target.value)}
                placeholder="e.g. Starter, Growth, Premium"
              />
              <AdminButton type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Creating account...' : 'Create User Account'}
              </AdminButton>
            </div>
          </AdminCard>
        </div>
      </form>
    </div>
  );
};
