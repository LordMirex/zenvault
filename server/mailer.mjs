import nodemailer from 'nodemailer';
import { config } from './config.mjs';
import { queryOne } from './db.mjs';
import { normalizeGeneralSettings, resolveSiteOrigin } from './settings.mjs';

const parseJson = (value, fallback = {}) => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const getSetting = async (key, fallback = {}) => {
  const row = await queryOne('SELECT setting_value FROM settings WHERE setting_key = :key', { key });
  return row ? parseJson(row.setting_value, fallback) : fallback;
};

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (character) => {
    if (character === '&') {
      return '&amp;';
    }
    if (character === '<') {
      return '&lt;';
    }
    if (character === '>') {
      return '&gt;';
    }
    if (character === '"') {
      return '&quot;';
    }
    return '&#39;';
  });

const normalizeEmail = (value) => String(value ?? '').trim().toLowerCase();

const formatAddress = (name, address) => {
  if (!name) {
    return address;
  }

  return `"${String(name).replace(/"/g, '\\"')}" <${address}>`;
};

const splitParagraphs = (value) =>
  String(value ?? '')
    .split(/\r?\n\r?\n/)
    .map((item) => item.replace(/\r?\n/g, ' ').trim())
    .filter(Boolean);

const buildTextBody = ({ greeting, paragraphs, highlights, ctaLabel, ctaUrl, footerLines, signatureLines }) => {
  const segments = [greeting, '', ...paragraphs];

  if (highlights.length) {
    segments.push('', 'Details');
    segments.push(...highlights.map((item) => `- ${item}`));
  }

  if (ctaLabel && ctaUrl) {
    segments.push('', `${ctaLabel}: ${ctaUrl}`);
  }

  if (signatureLines.length) {
    segments.push('', ...signatureLines);
  }

  if (footerLines.length) {
    segments.push('', '---', ...footerLines);
  }

  return segments.join('\n');
};

export const sanitizeEmailSettings = (settings = {}) => {
  const sanitized = { ...settings };
  const password = String(settings.mailPassword ?? '').trim();

  delete sanitized.mailPassword;

  if (password) {
    sanitized.mailPasswordMasked = String(settings.mailPasswordMasked ?? '********');
  } else {
    delete sanitized.mailPasswordMasked;
  }

  return sanitized;
};

export const createMailClient = async () => {
  const generalSettings = normalizeGeneralSettings(await getSetting('general', {}));
  const storedEmailSettings = await getSetting('email', {});

  const mailDriver = String(storedEmailSettings.mailDriver ?? 'SMTP').trim();
  const mailHost = String(storedEmailSettings.mailHost ?? '').trim();
  const mailPort = Number(storedEmailSettings.mailPort ?? 465);
  const mailUsername = String(storedEmailSettings.mailUsername ?? '').trim();
  const mailPassword = String(storedEmailSettings.mailPassword ?? '').trim();
  const mailEncryption = String(storedEmailSettings.mailEncryption ?? 'SSL').trim().toLowerCase();
  const fromName = String(
    storedEmailSettings.fromName ??
      generalSettings.companyName ??
      generalSettings.siteName ??
      'Wallet Operations',
  ).trim();
  const fromAddress = normalizeEmail(
    storedEmailSettings.fromAddress ??
      generalSettings.companyEmail ??
      '',
  );
  const replyToAddress = normalizeEmail(
    storedEmailSettings.replyToAddress ??
      generalSettings.companyEmail ??
      fromAddress,
  );

  if (mailDriver && mailDriver.toLowerCase() !== 'smtp') {
    throw new Error('Only SMTP delivery is supported by this server.');
  }

  const missingFields = [];
  if (!mailHost) {
    missingFields.push('mail host');
  }
  if (!fromAddress) {
    missingFields.push('sender email');
  }
  if ((mailUsername && !mailPassword) || (!mailUsername && mailPassword)) {
    missingFields.push('mail username and password');
  }

  if (missingFields.length) {
    throw new Error(`Email delivery is not configured. Add ${missingFields.join(', ')} in Email Settings.`);
  }

  const secure = mailEncryption.includes('ssl') || mailPort === 465;
  const requireTLS = !secure && mailEncryption.includes('tls');
  const transport = {
    host: mailHost,
    port: Number.isFinite(mailPort) ? mailPort : 465,
    secure,
    requireTLS,
  };

  if (mailUsername || mailPassword) {
    transport.auth = {
      user: mailUsername,
      pass: mailPassword,
    };
  }

  return {
    transporter: nodemailer.createTransport(transport),
    defaults: {
      siteName: String((generalSettings.siteName ?? fromName) || 'Operations Desk').trim(),
      logoUrl: String(generalSettings.logoUrl ?? '').trim(),
      siteUrl: resolveSiteOrigin(generalSettings) || config.clientOrigin,
      from: formatAddress(fromName, fromAddress),
      fromAddress,
      fromName,
      replyTo: replyToAddress || fromAddress,
      clientOrigin: resolveSiteOrigin(generalSettings) || config.clientOrigin,
      sanitizedEmailSettings: sanitizeEmailSettings(storedEmailSettings),
    },
  };
};

export const sendMailWithClient = async (client, { to, subject, html, text }) => {
  return client.transporter.sendMail({
    from: client.defaults.from,
    to,
    replyTo: client.defaults.replyTo,
    subject,
    html,
    text,
  });
};

export const buildBrandedEmail = ({
  brand,
  title,
  preheader,
  recipientName,
  intro,
  paragraphs = [],
  highlights = [],
  ctaLabel,
  ctaUrl,
  signatureName,
  signatureRole,
}) => {
  const safeParagraphs = paragraphs.filter(Boolean);
  const safeHighlights = highlights.filter(Boolean);
  const greeting = recipientName ? `Hello ${recipientName},` : 'Hello,';
  const signatureLines = [signatureName || brand.fromName || brand.companyName, signatureRole].filter(Boolean);
  const footerLines = [
    brand.siteName,
    brand.companyEmail,
  ].filter(Boolean);

  const paragraphMarkup = safeParagraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;color:#334155;font-size:16px;line-height:1.7;">${escapeHtml(paragraph)}</p>`,
    )
    .join('');

  const highlightMarkup = safeHighlights.length
    ? `
      <div style="margin:24px 0;padding:20px;border-radius:18px;background:#f8fafc;border:1px solid #e2e8f0;">
        <p style="margin:0 0 12px;color:#0f172a;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">Details</p>
        <ul style="margin:0;padding-left:20px;color:#334155;font-size:15px;line-height:1.7;">
          ${safeHighlights.map((item) => `<li style="margin-bottom:8px;">${escapeHtml(item)}</li>`).join('')}
        </ul>
      </div>
    `
    : '';

  const ctaMarkup =
    ctaLabel && ctaUrl
      ? `
        <div style="margin:28px 0 8px;">
          <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;border-radius:999px;background:#7c3aed;color:#ffffff;padding:14px 22px;font-size:14px;font-weight:700;text-decoration:none;">
            ${escapeHtml(ctaLabel)}
          </a>
        </div>
      `
      : '';

  const signatureMarkup = signatureLines.length
    ? `<p style="margin:24px 0 0;color:#334155;font-size:15px;line-height:1.7;">${signatureLines
        .map((line) => escapeHtml(line))
        .join('<br />')}</p>`
    : '';

  const html = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(title)}</title>
      </head>
      <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
          ${escapeHtml(preheader || intro || safeParagraphs[0] || title)}
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border-radius:28px;overflow:hidden;border:1px solid #e2e8f0;">
                <tr>
                  <td style="padding:32px 36px;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);">
                    ${brand.logoUrl
                      ? `<img src="${escapeHtml(brand.siteUrl || brand.clientOrigin)}${escapeHtml(brand.logoUrl)}" alt="${escapeHtml(brand.siteName)}" style="max-height:48px;width:auto;margin-bottom:16px;" />`
                      : `<p style="margin:0 0 10px;color:#cbd5e1;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">
                      ${escapeHtml(brand.siteName)}
                    </p>`
                    }
                    <h1 style="margin:0;color:#ffffff;font-size:30px;line-height:1.2;">${escapeHtml(title)}</h1>
                    <p style="margin:14px 0 0;color:#cbd5e1;font-size:15px;line-height:1.6;">${escapeHtml(intro)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:36px;">
                    <p style="margin:0 0 16px;color:#0f172a;font-size:17px;font-weight:700;">${escapeHtml(greeting)}</p>
                    ${paragraphMarkup}
                    ${highlightMarkup}
                    ${ctaMarkup}
                    ${signatureMarkup}
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 36px;background:#f8fafc;border-top:1px solid #e2e8f0;">
                    <p style="margin:0;color:#64748b;font-size:13px;line-height:1.8;">
                      ${footerLines.map((line) => escapeHtml(line)).join('<br />')}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = buildTextBody({
    greeting,
    paragraphs: safeParagraphs,
    highlights: safeHighlights,
    ctaLabel,
    ctaUrl,
    footerLines,
    signatureLines,
  });

  return { html, text, paragraphs: safeParagraphs };
};

export const messageToParagraphs = splitParagraphs;
