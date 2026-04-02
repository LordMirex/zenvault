import { useState, type FormEvent } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import { AdminButton, AdminCard, AdminPageHeading, AdminTextInput } from '../../components/admin/AdminUi';

export const AdminUserPasswordPage = () => {
  const { id } = useParams();
  const { adminUsers } = useAuth();
  const user = id ? adminUsers.find((u) => String(u.id) === String(id)) : undefined;
  const [password, setPassword] = useState('12345678');
  const [passcode, setPasscode] = useState('123456');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  if (!user) {
    return <Navigate to="/admin/users" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setFeedback('');
    setError('');

    try {
      await apiRequest(`/api/admin/users/${user.id}/password`, {
        method: 'PUT',
        body: JSON.stringify({ password, passcode }),
      });
      setFeedback('User credentials updated.');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to update credentials.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link to={`/admin/users/${user.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900">
        <ChevronLeft className="h-4 w-4" />
        Back to user overview
      </Link>

      <AdminPageHeading
        title={`Reset ${user.name} Credentials`}
        description={`Update the login password and 6-digit passcode for ${user.email}.`}
      />

      {feedback && <AdminCard className="border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">{feedback}</AdminCard>}
      {error && <AdminCard className="border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</AdminCard>}

      <form className="max-w-2xl space-y-6" onSubmit={handleSubmit}>
        <AdminCard className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminTextInput
              label="New Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="12345678"
            />
            <AdminTextInput
              label="New Passcode"
              value={passcode}
              onChange={(event) => setPasscode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
            />
          </div>
          <div className="mt-5 flex justify-end">
            <AdminButton type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Update Credentials'}
            </AdminButton>
          </div>
        </AdminCard>
      </form>
    </div>
  );
};
