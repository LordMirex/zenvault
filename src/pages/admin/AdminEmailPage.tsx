import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminNotice,
  AdminPageHeading,
  AdminSelect,
  AdminTextArea,
  AdminTextInput,
} from '../../components/admin/AdminUi';

const buildPreviewHtml = ({
  siteName,
  fromName,
  subject,
  message,
  recipientName,
}: {
  siteName: string;
  fromName: string;
  subject: string;
  message: string;
  recipientName: string;
}) => {
  const paragraphs = message
    .split(/\r?\n\r?\n/)
    .map((p) => p.replace(/\r?\n/g, ' ').trim())
    .filter(Boolean);

  const greeting = recipientName ? `Hello ${recipientName},` : 'Hello,';
  const intro = paragraphs[0] ?? '';
  const rest = paragraphs.slice(1);

  const paragraphMarkup = rest
    .map((p) => `<p style="margin:0 0 16px;color:#334155;font-size:16px;line-height:1.7;">${p}</p>`)
    .join('');

  const signatureMarkup = fromName
    ? `<p style="margin:24px 0 0;color:#334155;font-size:15px;line-height:1.7;">${fromName}<br />${siteName} Operations</p>`
    : '';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${subject || 'Email Preview'}</title>
  </head>
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:24px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;">
            <tr>
              <td style="padding:28px 32px;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);">
                <p style="margin:0 0 8px;color:#cbd5e1;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">${siteName || 'Your Company'}</p>
                <h1 style="margin:0;color:#ffffff;font-size:26px;line-height:1.25;">${subject || '(no subject)'}</h1>
                <p style="margin:12px 0 0;color:#cbd5e1;font-size:14px;line-height:1.6;">${intro}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 16px;color:#0f172a;font-size:17px;font-weight:700;">${greeting}</p>
                ${paragraphMarkup}
                ${signatureMarkup}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
                <p style="margin:0;color:#64748b;font-size:12px;line-height:1.8;">${siteName || 'Your Company'}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

export const AdminEmailPage = () => {
  const { adminSettings, adminEmailTemplates, adminUsers, sendAdminEmail } = useAuth();

  const [compose, setCompose] = useState({
    scope: 'all' as 'all' | 'user',
    userId: String(adminUsers[0]?.id ?? ''),
    subject: '',
    message: '',
  });
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'compose' | 'templates' | 'preview'>('compose');

  const siteName = String(adminSettings?.general?.siteName ?? adminSettings?.email?.fromName ?? 'Wallet');
  const fromName = String(adminSettings?.email?.fromName ?? '');
  const fromAddress = String(adminSettings?.email?.fromAddress ?? '');

  const selectedUser = adminUsers.find((u) => String(u.id) === compose.userId) ?? null;
  const recipientCount = compose.scope === 'all' ? adminUsers.length : selectedUser ? 1 : 0;
  const previewRecipient = compose.scope === 'user' ? (selectedUser?.name ?? 'Client') : 'Client';

  const previewHtml = buildPreviewHtml({
    siteName,
    fromName,
    subject: compose.subject || 'Subject preview',
    message: compose.message || 'Your message body will appear here.\n\nThis is a second paragraph.',
    recipientName: previewRecipient,
  });

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback('');
    setError('');
    setSending(true);
    try {
      const result = await sendAdminEmail({
        scope: compose.scope,
        userId: compose.scope === 'user' ? compose.userId : undefined,
        subject: compose.subject,
        message: compose.message,
      });
      setFeedback(
        result.failedCount
          ? `${result.sentCount} email(s) sent. ${result.failedCount} failed.`
          : `${result.sentCount} email(s) sent successfully.`,
      );
      setCompose((c) => ({ ...c, subject: '', message: '' }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send the email.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeading
        title="Email"
        description="Send branded messages to users and manage email templates."
      />

      <div className="flex gap-2 border-b border-slate-200">
        {(['compose', 'preview', 'templates'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'compose' ? 'Compose' : tab === 'preview' ? 'Template Preview' : 'Templates'}
          </button>
        ))}
      </div>

      {feedback && <AdminNotice tone="success">{feedback}</AdminNotice>}
      {error && <AdminNotice tone="danger">{error}</AdminNotice>}

      {activeTab === 'compose' && (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <AdminCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900">Compose Message</h3>
            <p className="mt-1 text-sm text-slate-500">
              Write a message that will be delivered inside the branded email template.
            </p>

            <form className="mt-5 grid gap-4" onSubmit={handleSend}>
              <div className="grid gap-4 md:grid-cols-2">
                <AdminSelect
                  label="Audience"
                  value={compose.scope}
                  onChange={(e) =>
                    setCompose((c) => ({
                      ...c,
                      scope: e.target.value as 'all' | 'user',
                      userId: e.target.value === 'user' ? c.userId || String(adminUsers[0]?.id ?? '') : c.userId,
                    }))
                  }
                >
                  <option value="all">All Users</option>
                  <option value="user">Specific User</option>
                </AdminSelect>

                <AdminSelect
                  label="Recipient"
                  value={compose.userId}
                  disabled={compose.scope !== 'user'}
                  onChange={(e) => setCompose((c) => ({ ...c, userId: e.target.value }))}
                >
                  {adminUsers.map((u) => (
                    <option key={u.id} value={String(u.id)}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </AdminSelect>
              </div>

              <AdminTextInput
                label="Subject"
                value={compose.subject}
                onChange={(e) => setCompose((c) => ({ ...c, subject: e.target.value }))}
                placeholder="Service update from the operations desk"
              />

              <AdminTextArea
                label="Message"
                rows={10}
                value={compose.message}
                onChange={(e) => setCompose((c) => ({ ...c, message: e.target.value }))}
                placeholder={`Write your message here.\n\nSeparate paragraphs with a blank line. The first paragraph becomes the intro shown at the top of the email.`}
              />

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-slate-500">
                  {compose.scope === 'all'
                    ? `Sending to ${recipientCount} active client account(s).`
                    : selectedUser
                      ? `Sending to ${selectedUser.name} — ${selectedUser.email}.`
                      : 'Select a user before sending.'}
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Preview template
                  </button>
                  <AdminButton type="submit" disabled={sending || !compose.subject || !compose.message}>
                    {sending ? 'Sending…' : 'Send Email'}
                  </AdminButton>
                </div>
              </div>
            </form>
          </AdminCard>

          <div className="space-y-4">
            <AdminCard className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">From</p>
              <p className="mt-3 text-base font-semibold text-slate-900">{fromName || siteName}</p>
              <p className="mt-1 text-sm text-slate-500">
                {fromAddress || (
                  <span className="text-amber-600">
                    No sender email — configure in Email Settings first.
                  </span>
                )}
              </p>
            </AdminCard>

            <AdminCard className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Delivery Notes</p>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
                <li>Messages are wrapped in your branded template before delivery.</li>
                <li>SMTP credentials must be configured in <span className="font-semibold text-slate-800">Settings → Email Settings</span> for delivery to work.</li>
                <li>Each paragraph should be separated by a blank line.</li>
                <li>The first paragraph appears as the header intro in the email.</li>
              </ul>
            </AdminCard>
          </div>
        </div>
      )}

      {activeTab === 'preview' && (
        <AdminCard className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Email Template Preview</h3>
              <p className="mt-0.5 text-sm text-slate-500">
                This is how your emails appear in the recipient's inbox. Fill in the compose form to see your content reflected here.
              </p>
            </div>
          </div>
          <iframe
            srcDoc={previewHtml}
            title="Email template preview"
            className="h-[700px] w-full border-0 bg-[#f1f5f9]"
            sandbox="allow-same-origin"
          />
        </AdminCard>
      )}

      {activeTab === 'templates' && (
        <AdminCard className="p-6">
          <h3 className="text-lg font-semibold text-slate-900">Email Templates</h3>
          <p className="mt-1 text-sm text-slate-500">
            Automatic system emails use the branded template below. These are triggered by signup, KYC approval, and admin actions.
          </p>
          <div className="mt-5 space-y-3">
            {adminEmailTemplates.length === 0 && (
              <p className="text-sm text-slate-400">No templates configured.</p>
            )}
            {adminEmailTemplates.map((template) => (
              <div
                key={template.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">{template.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{template.subject}</p>
                </div>
                <div className="flex items-center gap-3">
                  <AdminBadge value={template.status} />
                  <span className="text-sm text-slate-400">{template.updatedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      )}
    </div>
  );
};
