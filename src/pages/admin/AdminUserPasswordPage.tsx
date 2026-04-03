import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import { AdminButton, AdminCard, AdminNotice, AdminPageHeading } from '../../components/admin/AdminUi';

export const AdminUserPasswordPage = () => {
  const { id } = useParams();
  const { adminUsers } = useAuth();
  const user = id ? adminUsers.find((entry) => String(entry.id) === String(id)) : undefined;
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');

  if (!user) {
    return <Navigate to="/admin/users" replace />;
  }

  const handleReset = async () => {
    setSaving(true);
    setFeedback('');
    setError('');
    setTemporaryPassword('');

    try {
      const payload = await apiRequest<{ temporaryPassword: string }>(`/api/admin/users/${user.id}/password`, {
        method: 'PUT',
        body: JSON.stringify({}),
      });
      setTemporaryPassword(payload.temporaryPassword);
      setFeedback('Password reset completed and the user has been emailed the new temporary password.');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to reset the password.');
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
        title={`Reset ${user.name} Password`}
        description={`Generate a new temporary password for ${user.email}. Previous sessions will be signed out automatically.`}
      />

      {feedback && <AdminNotice tone="success">{feedback}</AdminNotice>}
      {error && <AdminNotice tone="danger">{error}</AdminNotice>}

      <AdminCard className="max-w-2xl p-6">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600">
            Use this action when the admin needs an immediate reset. The system generates the password, emails the user,
            and also shows the temporary password here so the admin can copy it if needed.
          </div>

          <div className="flex justify-end">
            <AdminButton onClick={() => void handleReset()} disabled={saving}>
              {saving ? 'Resetting...' : 'Reset Password'}
            </AdminButton>
          </div>
        </div>
      </AdminCard>

      {temporaryPassword && (
        <AdminCard className="max-w-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Temporary Password</p>
          <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 font-mono text-xl font-bold tracking-[0.22em] text-slate-900">
            {temporaryPassword}
          </p>
        </AdminCard>
      )}
    </div>
  );
};
