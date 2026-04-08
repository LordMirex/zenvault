import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  AdminButton,
  AdminCard,
  AdminNotice,
  AdminPageHeading,
  AdminSelect,
  AdminTextArea,
  AdminTextInput,
} from '../../components/admin/AdminUi';

const escapeHtml = (value: string) =>
  String(value ?? '').replace(/[&<>"']/g, (character) => {
    if (character === '&') return '&amp;';
    if (character === '<') return '&lt;';
    if (character === '>') return '&gt;';
    if (character === '"') return '&quot;';
    return '&#39;';
  });

const resolveAssetUrl = (siteUrl: string, assetPath: string) => {
  const normalized = String(assetPath ?? '').trim();
  if (!normalized) return '';
  if (/^https?:\/\//i.test(normalized)) return normalized;
  const base = String(siteUrl ?? '').replace(/\/$/, '');
  if (!base) return normalized;
  return normalized.startsWith('/') ? `${base}${normalized}` : `${base}/${normalized}`;
};

const buildPreviewHtml = ({
  siteName,
  siteUrl,
  logoUrl,
  footerSummary,
  companyAddress,
  companyPhone,
  companyEmail,
  fromName,
  subject,
  message,
  recipientName,
}: {
  siteName: string;
  siteUrl: string;
  logoUrl: string;
  footerSummary: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  fromName: string;
  subject: string;
  message: string;
  recipientName: string;
}) => {
  const paragraphs = message
    .split(/\r?\n\r?\n/)
    .map((item) => item.replace(/\r?\n/g, ' ').trim())
    .filter(Boolean);

  const intro = paragraphs[0] ?? 'Your message preview appears here.';
  const bodyParagraphs = paragraphs.slice(1);
  const greeting = recipientName ? `Hello ${recipientName},` : 'Hello,';
  const safeLogoUrl = resolveAssetUrl(siteUrl, logoUrl);
  const footerLines = [footerSummary, companyAddress, companyPhone, companyEmail, siteUrl].filter(Boolean);
  const signature = [fromName || siteName, `${siteName} Operations`]
    .filter(Boolean)
    .map((line) => escapeHtml(line))
    .join('<br />');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(subject || 'Email Preview')}</title>
  </head>
  <body style="margin:0;padding:0;background:#f6efe5;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      ${escapeHtml(intro)}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6efe5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border-radius:30px;overflow:hidden;border:1px solid rgba(17,17,17,0.08);box-shadow:0 18px 70px rgba(17,17,17,0.08);">
            <tr>
              <td style="padding:32px 36px;background:linear-gradient(135deg,#111111 0%,#24211b 100%);">
                <div style="display:inline-flex;align-items:center;gap:10px;padding:8px 12px;border-radius:999px;background:rgba(247,147,26,0.14);border:1px solid rgba(247,147,26,0.24);">
                  <span style="display:inline-block;width:8px;height:8px;border-radius:999px;background:#f7931a;"></span>
                  <span style="color:#f8dfb5;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">${escapeHtml(siteName || 'Operations')}</span>
                </div>
                ${safeLogoUrl ? `<div style="margin:18px 0 0;"><img src="${escapeHtml(safeLogoUrl)}" alt="${escapeHtml(siteName)}" style="max-height:44px;width:auto;display:block;" /></div>` : ''}
                <h1 style="margin:20px 0 0;color:#ffffff;font-size:32px;line-height:1.15;">${escapeHtml(subject || 'Email Preview')}</h1>
                <p style="margin:14px 0 0;color:#e8dccb;font-size:15px;line-height:1.7;">${escapeHtml(intro)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:36px;">
                <p style="margin:0 0 16px;color:#111111;font-size:17px;font-weight:700;">${escapeHtml(greeting)}</p>
                ${bodyParagraphs.map((paragraph) => `<p style="margin:0 0 16px;color:#3f3a31;font-size:16px;line-height:1.78;">${escapeHtml(paragraph)}</p>`).join('')}
                <p style="margin:24px 0 0;color:#3f3a31;font-size:15px;line-height:1.72;">${signature}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 36px;background:#fffaf2;border-top:1px solid rgba(17,17,17,0.08);">
                <p style="margin:0;color:#6d6558;font-size:13px;line-height:1.8;">${footerLines.map((line) => escapeHtml(line)).join('<br />')}</p>
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
  const { adminSettings, adminUsers, sendAdminEmail } = useAuth();
  const [compose, setCompose] = useState({
    scope: 'all' as 'all' | 'user',
    userId: String(adminUsers[0]?.id ?? ''),
    subject: '',
    message: '',
  });
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'compose' | 'preview'>('compose');

  const general = adminSettings?.general ?? {};
  const email = adminSettings?.email ?? {};
  const siteName = String(general.siteName ?? email.fromName ?? 'Wallet');
  const siteUrl = String(general.siteUrl ?? window.location.origin);
  const logoUrl = String(general.logoUrl ?? '');
  const footerSummary = String(general.footerSummary ?? '');
  const companyAddress = String(general.companyAddress ?? '');
  const companyPhone = String(general.companyPhone ?? '');
  const companyEmail = String(general.companyEmail ?? email.fromAddress ?? '');
  const fromName = String(email.fromName ?? '');
  const fromAddress = String(email.fromAddress ?? '');

  const selectedUser = adminUsers.find((user) => String(user.id) === compose.userId) ?? null;
  const recipientCount = compose.scope === 'all' ? adminUsers.length : selectedUser ? 1 : 0;
  const previewRecipient = compose.scope === 'user' ? (selectedUser?.name ?? 'Client') : (adminUsers[0]?.name ?? 'Client');
  const previewEmail = compose.scope === 'user' ? (selectedUser?.email ?? 'client@example.com') : (adminUsers[0]?.email ?? 'client@example.com');

  const applyPreviewPlaceholders = (text: string) => {
    const firstName = previewRecipient.split(' ')[0];
    return text
      .replace(/\{\{name\}\}/gi, previewRecipient)
      .replace(/\{name\}/gi, previewRecipient)
      .replace(/\$user/gi, previewRecipient)
      .replace(/\$name/gi, previewRecipient)
      .replace(/\{\{first_name\}\}/gi, firstName)
      .replace(/\{first_name\}/gi, firstName)
      .replace(/\$first_name/gi, firstName)
      .replace(/\{\{email\}\}/gi, previewEmail)
      .replace(/\{email\}/gi, previewEmail)
      .replace(/\$email/gi, previewEmail);
  };

  useEffect(() => {
    if (!adminUsers.length) return;
    if (!adminUsers.some((user) => String(user.id) === compose.userId)) {
      setCompose((current) => ({ ...current, userId: String(adminUsers[0]?.id ?? '') }));
    }
  }, [adminUsers, compose.userId]);

  const rawSubject = compose.subject || 'Subject preview';
  const rawMessage = compose.message || 'Your message appears here.\n\nAdd a second paragraph to see the body layout.';

  const previewHtml = buildPreviewHtml({
    siteName,
    siteUrl,
    logoUrl,
    footerSummary,
    companyAddress,
    companyPhone,
    companyEmail,
    fromName,
    subject: applyPreviewPlaceholders(rawSubject),
    message: applyPreviewPlaceholders(rawMessage),
    recipientName: previewRecipient,
  });

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback('');
    setError('');

    if (compose.scope === 'user' && !selectedUser) {
      setError('Select a user before sending.');
      return;
    }

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
      setCompose((current) => ({ ...current, subject: '', message: '' }));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to send the email.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeading
        title="Broadcasts"
        description="Send branded messages and preview the live delivery layout used for account, KYC, and operational email."
      />

      <div className="flex gap-2 border-b border-slate-200">
        {(['compose', 'preview'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold capitalize transition-colors ${
              activeTab === tab
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {feedback && <AdminNotice tone="success">{feedback}</AdminNotice>}
      {error && <AdminNotice tone="danger">{error}</AdminNotice>}

      {activeTab === 'compose' && (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <AdminCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900">Compose Message</h3>
            <p className="mt-1 text-sm text-slate-500">
              Messages are sent inside the same branded layout used for signup, KYC, and operational notices.
            </p>

            <form className="mt-5 grid gap-4" onSubmit={handleSend}>
              <div className="grid gap-4 md:grid-cols-2">
                <AdminSelect
                  label="Audience"
                  value={compose.scope}
                  onChange={(event) =>
                    setCompose((current) => ({
                      ...current,
                      scope: event.target.value as 'all' | 'user',
                      userId: event.target.value === 'user' ? current.userId || String(adminUsers[0]?.id ?? '') : current.userId,
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
                  onChange={(event) => setCompose((current) => ({ ...current, userId: event.target.value }))}
                >
                  {adminUsers.map((user) => (
                    <option key={user.id} value={String(user.id)}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </AdminSelect>
              </div>

              <AdminTextInput
                label="Subject"
                value={compose.subject}
                onChange={(event) => setCompose((current) => ({ ...current, subject: event.target.value }))}
                placeholder="Operations update from the desk"
              />

              <div>
                <AdminTextArea
                  label="Message"
                  rows={10}
                  value={compose.message}
                  onChange={(event) => setCompose((current) => ({ ...current, message: event.target.value }))}
                  placeholder={`Write your message here.\n\nSeparate paragraphs with a blank line. The first paragraph becomes the top intro in the branded email.`}
                />
                <p className="mt-1.5 text-xs text-slate-400">
                  Placeholders replaced per recipient: <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-slate-600">$user</code> or <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-slate-600">{'{name}'}</code> → full name &middot; <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-slate-600">$email</code> → email address
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-slate-500">
                  {compose.scope === 'all'
                    ? `Sending to ${recipientCount} active client account(s).`
                    : selectedUser
                      ? `Sending to ${selectedUser.name} (${selectedUser.email}).`
                      : 'Select a user before sending.'}
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Preview Layout
                  </button>
                  <AdminButton
                    type="submit"
                    disabled={sending || !compose.subject || !compose.message || (compose.scope === 'user' && !selectedUser)}
                  >
                    {sending ? 'Sending...' : 'Send Message'}
                  </AdminButton>
                </div>
              </div>
            </form>
          </AdminCard>

          <div className="space-y-4">
            <AdminCard className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Sender</p>
              <p className="mt-3 text-base font-semibold text-slate-900">{fromName || siteName}</p>
              <p className="mt-1 text-sm text-slate-500">
                {fromAddress || <span className="text-amber-600">No sender email configured yet.</span>}
              </p>
            </AdminCard>

            <AdminCard className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Automatic Flows</p>
              <div className="mt-4 space-y-3">
                {[
                  'Welcome and account creation emails',
                  'KYC submission and approval notices',
                  'Operational messages sent from this page',
                ].map((item) => (
                  <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </AdminCard>

            <AdminCard className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Delivery Notes</p>
              <div className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                <p>SMTP credentials still live in Settings / Email Settings.</p>
                <p>The same branded layout is reused everywhere so the experience stays consistent.</p>
                <p>Branding is pulled from your live site identity and footer settings.</p>
              </div>
            </AdminCard>
          </div>
        </div>
      )}

      {activeTab === 'preview' && (
        <AdminCard className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Live Email Preview</h3>
              <p className="mt-0.5 text-sm text-slate-500">
                This preview mirrors the branded email shell used by the server for real delivery.
              </p>
            </div>
          </div>
          <iframe
            srcDoc={previewHtml}
            title="Email preview"
            className="h-[760px] w-full border-0 bg-[#f6efe5]"
            sandbox="allow-same-origin"
          />
        </AdminCard>
      )}
    </div>
  );
};
