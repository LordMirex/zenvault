import cors from 'cors';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, extname, join } from 'path';
import { existsSync } from 'fs';
import multer from 'multer';
import { compareSecret, createAccessToken, hashSecret, verifyToken } from './auth.mjs';
import { config } from './config.mjs';
import { closeDb, query, queryOne } from './db.mjs';
import { initSchema } from './schema.mjs';
import {
  buildBrandedEmail,
  createMailClient,
  messageToParagraphs,
  sanitizeEmailSettings,
  sendMailWithClient,
} from './mailer.mjs';
import {
  createSessionId,
  findActiveSession,
  issueSession,
  revokeOtherSessions,
  revokeSession,
} from './session-utils.mjs';
import { normalizeGeneralSettings, resolveSiteOrigin } from './settings.mjs';
import {
  buildAdminAssetCatalog,
  buildUserWalletAssets,
  normalizeActivityRecords,
  normalizeWalletSettings,
  sumVisiblePortfolioValue,
  sumWalletValue,
  upsertWalletHolding,
} from './assets.mjs';
import { priceFeed } from './price-feed.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.disable('x-powered-by');
const allowedOrigins = new Set(
  [
    config.clientOrigin,
    process.env.RENDER_EXTERNAL_URL || null,
    ...(config.isProduction
      ? []
      : [
        'http://localhost:4173',
        'http://127.0.0.1:4173',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null,
      ]),
  ].filter(Boolean),
);

const isReplitOrigin = (origin) =>
  !config.isProduction && typeof origin === 'string' && origin.endsWith('.replit.dev');


const isRenderOrigin = (origin) =>
  config.isRender && typeof origin === 'string' && origin.endsWith('.onrender.com');

const rateLimitState = new Map();

const createRateLimitMiddleware = ({ windowMs, max, message, keyBuilder }) => (req, res, next) => {
  const now = Date.now();
  const key = `${req.path}:${keyBuilder(req)}`;
  const current = rateLimitState.get(key);

  if (rateLimitState.size > 1000) {
    for (const [entryKey, entryValue] of rateLimitState.entries()) {
      if (entryValue.expiresAt <= now) {
        rateLimitState.delete(entryKey);
      }
    }
  }

  if (!current || current.expiresAt <= now) {
    rateLimitState.set(key, { count: 1, expiresAt: now + windowMs });
    return next();
  }

  if (current.count >= max) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.expiresAt - now) / 1000));
    res.setHeader('Retry-After', String(retryAfterSeconds));
    return res.status(429).json({ message });
  }

  current.count += 1;
  rateLimitState.set(key, current);
  return next();
};

const loginLimiter = createRateLimitMiddleware({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please wait 10 minutes and try again.',
  keyBuilder: (req) => `${req.ip}:${String(req.body.email ?? '').trim().toLowerCase() || 'unknown-email'}`,
});

const signupLimiter = createRateLimitMiddleware({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many signup attempts. Please wait one hour and try again.',
  keyBuilder: (req) => `${req.ip}:${String(req.body.email ?? '').trim().toLowerCase() || 'unknown-email'}`,
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin) || isReplitOrigin(origin) || isRenderOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origin not allowed by CORS.'));
    },
    credentials: false,
  }),
);
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  return next();
});
app.use(express.json({ limit: '1mb' }));
app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  return next();
});

// Serve the compiled React frontend — robust path resolution for VPS
const distCandidates = [
  join(__dirname, '../dist'),
  join(process.cwd(), 'dist'),
];
const distDir = distCandidates.find(p => existsSync(join(p, 'index.html'))) || distCandidates[0];
const distIndexExists = existsSync(join(distDir, 'index.html'));
console.log('[boot] __dirname     :', __dirname);
console.log('[boot] process.cwd() :', process.cwd());
console.log('[boot] dist resolved :', distDir);
console.log('[boot] dist exists   :', distIndexExists);
if (!distIndexExists) {
  console.error('[boot] ERROR: dist/index.html not found. Run "npm run build" before starting the server in production.');
  console.error('[boot] Tip: use "npm run start:prod" which builds automatically, or run "npm run build && npm start" manually.');
}
app.use(express.static(distDir, { maxAge: '1d', etag: true }));

// Multer configuration — memory storage (files saved to PostgreSQL, not disk)
const uploadStorage = multer.memoryStorage();
const kycUploadStorage = multer.memoryStorage();

const uploadFilter = (_req, file, cb) => {
  const allowed = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.ico', '.gif'];
  const ext = extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    return cb(null, true);
  }
  return cb(new Error('Only image files (PNG, JPG, SVG, WebP, ICO, GIF) are allowed.'));
};

const kycUploadFilter = (_req, file, cb) => {
  const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.pdf'];
  const ext = extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    return cb(null, true);
  }
  return cb(new Error('Only PNG, JPG, WebP, or PDF files are allowed for KYC uploads.'));
};

const logoUpload = multer({ storage: uploadStorage, fileFilter: uploadFilter, limits: { fileSize: 2 * 1024 * 1024 } });
const faviconUpload = multer({ storage: uploadStorage, fileFilter: uploadFilter, limits: { fileSize: 512 * 1024 } });
const kycUpload = multer({
  storage: kycUploadStorage,
  fileFilter: kycUploadFilter,
  limits: { fileSize: 8 * 1024 * 1024, files: 3 },
});

const parseJson = (value, fallback = []) => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const kycDocumentLabels = {
  governmentId: 'Government ID',
  proofOfAddress: 'Proof of Address',
  sourceOfFunds: 'Source of Funds',
};

const kycDocumentFields = Object.keys(kycDocumentLabels);

const sanitizeFileName = (value, fallback = 'document') => {
  const sanitized = String(value ?? '')
    .trim()
    .replace(/[^\w.\- ]+/g, '_')
    .slice(0, 120);
  return sanitized || fallback;
};

const inferLegacyKycDocumentFields = (kycCase) => {
  const haystack = `${kycCase?.document_type ?? ''} ${kycCase?.note ?? ''}`.toLowerCase();
  const inferred = [];

  if (/(passport|government id|national id|driver|identity)/.test(haystack)) {
    inferred.push('governmentId');
  }

  if (/(utility|proof of address|address|residence)/.test(haystack)) {
    inferred.push('proofOfAddress');
  }

  if (/(source of funds|source of wealth|statement|treasury|bank)/.test(haystack)) {
    inferred.push('sourceOfFunds');
  }

  return [...new Set(inferred)];
};

const buildLegacyKycDocuments = (kycCase) =>
  inferLegacyKycDocumentFields(kycCase).map((fieldName) => ({
    id: `legacy-${fieldName}`,
    fieldName,
    label: kycDocumentLabels[fieldName],
    originalName: `${kycDocumentLabels[fieldName]} (legacy record)`,
    storedName: '',
    mimeType: '',
    sizeBytes: 0,
    uploadedAt: kycCase?.submitted_at_label ?? '',
  }));

const readKycDocuments = (kycCase) => {
  const storedDocuments = parseJson(kycCase?.documents_json, []);
  const documents = storedDocuments.length ? storedDocuments : buildLegacyKycDocuments(kycCase);

  return documents.map((document) => ({
    id: String(document.id ?? createPrefixedId('kyc-doc')),
    fieldName: String(document.fieldName ?? '').trim(),
    label: String(document.label ?? '').trim() || kycDocumentLabels[document.fieldName] || 'Supporting Document',
    originalName: String(document.originalName ?? document.fileName ?? 'Document').trim(),
    storedName: String(document.storedName ?? '').trim(),
    mimeType: String(document.mimeType ?? '').trim(),
    sizeBytes: Number(document.sizeBytes ?? 0),
    uploadedAt: String(document.uploadedAt ?? kycCase?.submitted_at_label ?? '').trim(),
  }));
};

const mapKycCase = (kycCase) => {
  const documents = readKycDocuments(kycCase).map((document) => ({
    ...document,
    downloadPath: document.storedName
      ? `/api/kyc/cases/${kycCase.id}/documents/${document.id}`
      : '',
  }));

  return {
    id: String(kycCase.id),
    userId: String(kycCase.user_id),
    documentType: kycCase.document_type,
    submittedAt: kycCase.submitted_at_label,
    country: kycCase.country,
    riskLevel: kycCase.risk_level,
    status: kycCase.status,
    note: kycCase.note ?? '',
    documents,
  };
};

const buildKycChecklist = ({ documents = [], status = 'Pending', reviewNote = '' }) => {
  const documentsByField = new Map(
    documents
      .filter((document) => document.fieldName)
      .map((document) => [document.fieldName, document]),
  );

  return [
    {
      id: 'kyc-1',
      title: 'Government ID',
      detail: documentsByField.has('governmentId')
        ? status === 'Approved'
          ? 'Government ID accepted and cleared for compliance review.'
          : status === 'Needs review'
            ? reviewNote || 'Government ID needs another upload or manual clarification.'
            : 'Government ID received and queued for review.'
        : 'Upload a passport, national ID card, or driver license.',
      status: documentsByField.has('governmentId')
        ? status === 'Approved'
          ? 'Completed'
          : status === 'Needs review'
            ? 'Review'
            : 'Pending'
        : 'Required',
    },
    {
      id: 'kyc-2',
      title: 'Proof of Address',
      detail: documentsByField.has('proofOfAddress')
        ? status === 'Approved'
          ? 'Proof of address accepted and matched to the account record.'
          : status === 'Needs review'
            ? reviewNote || 'Proof of address needs a clearer or newer document.'
            : 'Proof of address received and queued for review.'
        : 'Upload a utility bill, bank statement, or similar document from the last 90 days.',
      status: documentsByField.has('proofOfAddress')
        ? status === 'Approved'
          ? 'Completed'
          : status === 'Needs review'
            ? 'Review'
            : 'Pending'
        : 'Required',
    },
    {
      id: 'kyc-3',
      title: 'Source of Funds',
      detail: documentsByField.has('sourceOfFunds')
        ? status === 'Approved'
          ? 'Source-of-funds evidence accepted for this review cycle.'
          : status === 'Needs review'
            ? reviewNote || 'Source-of-funds evidence needs additional clarification.'
            : 'Source-of-funds evidence received and queued if compliance requests it.'
        : 'Optional unless the compliance desk asks for it on a higher-limit review.',
      status: documentsByField.has('sourceOfFunds')
        ? status === 'Approved'
          ? 'Completed'
          : status === 'Needs review'
            ? 'Review'
            : 'Pending'
        : 'Optional',
    },
  ];
};

const buildKycDocumentType = (documents) =>
  documents.map((document) => document.label).join(' + ') || 'Document submission';

// ─── File upload helpers (PostgreSQL-backed, survives Render redeploys) ───────

const storeFile = async (id, buffer, mimeType, originalName) => {
  await query(
    `INSERT INTO file_uploads (id, original_name, mime_type, size_bytes, data)
     VALUES (:id, :originalName, :mimeType, :sizeBytes, :data)
     ON CONFLICT (id) DO UPDATE
       SET original_name = EXCLUDED.original_name,
           mime_type     = EXCLUDED.mime_type,
           size_bytes    = EXCLUDED.size_bytes,
           data          = EXCLUDED.data,
           uploaded_at   = NOW()`,
    { id, originalName: originalName ?? '', mimeType: mimeType ?? 'application/octet-stream', sizeBytes: buffer.length, data: buffer },
  );
};

const deleteStoredFile = async (id) => {
  if (!id) return;
  await query('DELETE FROM file_uploads WHERE id = :id', { id });
};

const serveStoredFile = async (id, res) => {
  const row = await queryOne('SELECT original_name, mime_type, size_bytes, data FROM file_uploads WHERE id = :id', { id });
  if (!row || !row.data) {
    return res.status(404).json({ message: 'File not found.' });
  }
  res.setHeader('Content-Type', row.mime_type || 'application/octet-stream');
  res.setHeader('Content-Length', String(row.size_bytes || row.data.length));
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.setHeader('Content-Disposition', `inline; filename="${sanitizeFileName(row.original_name, 'file')}"`);
  return res.end(row.data);
};

// GET /api/files/:id — public file serving (logos, favicons, any DB-stored asset)
app.get('/api/files/:id', async (req, res) => {
  const id = String(req.params.id ?? '').trim();
  if (!id) return res.status(400).json({ message: 'File ID is required.' });
  return serveStoredFile(id, res);
});

// ─── KYC document helpers ─────────────────────────────────────────────────────

const buildStoredKycDocuments = (files, uploadedAt) =>
  files.map((file) => {
    const id = createPrefixedId('kyc-doc');
    return {
      id,
      storedName: id,
      fieldName: file.fieldname,
      label: kycDocumentLabels[file.fieldname] ?? sanitizeFileName(file.fieldname, 'Supporting Document'),
      originalName: sanitizeFileName(file.originalname, 'document'),
      mimeType: file.mimetype,
      sizeBytes: Number(file.size ?? 0),
      uploadedAt,
    };
  });

const saveKycFilesToDb = async (files, documents) => {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const doc = documents[i];
    if (file.buffer && doc?.id) {
      await storeFile(doc.id, file.buffer, file.mimetype, sanitizeFileName(file.originalname, 'document'));
    }
  }
};

const deleteKycStoredFiles = async (documents = []) => {
  for (const document of documents) {
    if (document?.id) {
      await deleteStoredFile(document.id);
    }
  }
};

const requireAuth = async (req, res, next) => {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const payload = verifyToken(token);

    if (payload.type !== 'access' || !payload.sessionId) {
      return res.status(401).json({ message: 'Invalid access token.' });
    }

    const user = await queryOne('SELECT * FROM users WHERE id = :id', { id: payload.userId });

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    if (!findActiveSession(user.sessions_json, payload.sessionId)) {
      return res.status(401).json({ message: 'Session expired. Please sign in again.' });
    }

    req.auth = payload;
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'Session expired. Please sign in again.' });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ message: 'You do not have permission to access this resource.' });
  }

  return next();
};

const mapSessionUser = (user) => ({
  id: String(user.id),
  role: user.role,
  name: user.name,
  email: user.email,
  uuid: user.uuid,
  kycStatus: user.kyc_status,
  status: user.status,
});

const buildAdminHoldings = (user, { walletSettings = {}, marketAssets = [] } = {}) =>
  buildUserWalletAssets({
    user,
    holdings: parseJson(user.holdings_json, []),
    marketAssets,
    walletSettings,
  }).map((holding) => ({
    id: holding.id,
    symbol: holding.symbol,
    name: holding.name,
    network: holding.network,
    icon: holding.icon,
    balance: Number(holding.balance ?? 0),
    valueUsd: Number(holding.valueUsd ?? 0),
    address: String(holding.address ?? '').trim(),
    status: holding.status ?? (holding.enabledByDefault ? 'Enabled' : 'Paused'),
  }));

const mapAdminCard = (card) => ({
  id: String(card.id ?? ''),
  label: String(card.label ?? '').trim() || 'Card Record',
  brand: String(card.brand ?? '').trim() === 'Mastercard' ? 'Mastercard' : 'Visa',
  last4: String(card.last4 ?? '0000').trim() || '0000',
  status: card.status === 'Active' ? 'Active' : card.status === 'Frozen' ? 'Frozen' : 'Review',
  spendLimitUsd: Number(card.spendLimitUsd ?? 0),
  utilizationUsd: Number(card.utilizationUsd ?? 0),
  issuedAt: String(card.issuedAt ?? '').trim(),
  requestOnly: Boolean(card.requestOnly),
  requestedAt: String(card.requestedAt ?? '').trim(),
  holderName: String(card.holderName ?? '').trim(),
  applicationFeeUsd: Number(card.applicationFeeUsd ?? 0),
});

const mapAdminUser = (user, options = {}) => {
  const cards = parseJson(user.cards_json, []).map((card) => mapAdminCard(card));

  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    uuid: user.uuid,
    country: user.country,
    deskLabel: user.desk_label,
    tier: user.tier,
    status: user.status,
    kycStatus: user.kyc_status,
    riskLevel: user.risk_level,
    portfolioUsd: Number(user.portfolio_usd),
    availableUsd: Number(user.available_usd),
    plan: user.plan_name,
    lastSeen: user.last_seen,
    note: user.note,
    openCards: cards.filter((card) => !card.requestOnly).length,
    holdings: buildAdminHoldings(user, options),
    cards,
  };
};

const getSetting = async (key, fallback = null) => {
  const row = await queryOne('SELECT setting_value FROM settings WHERE setting_key = :key', { key });
  return row ? parseJson(row.setting_value, fallback) : fallback;
};

const upsertSetting = async (key, value) => {
  await query(
    `INSERT INTO settings (setting_key, setting_value) VALUES (:key, :value)
     ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value`,
    { key, value: JSON.stringify(value ?? {}) },
  );
};

const getGeneralSettings = async () => normalizeGeneralSettings(await getSetting('general', {}));

const toClientUrl = async (path = '') => `${resolveSiteOrigin(await getGeneralSettings())}${path}`;

const deliverBrandedEmail = async (
  client,
  { to, subject, title, preheader, intro, recipientName, paragraphs = [], highlights = [], ctaLabel, ctaUrl, signatureName, signatureRole },
) => {
  const rendered = buildBrandedEmail({
    brand: client.defaults,
    title,
    preheader,
    intro,
    recipientName,
    paragraphs,
    highlights,
    ctaLabel,
    ctaUrl,
    signatureName,
    signatureRole,
  });

  await sendMailWithClient(client, {
    to,
    subject,
    html: rendered.html,
    text: rendered.text,
  });
};

const sendSystemEmailSafely = async ({ logContext = 'system email', ...payload }) => {
  try {
    const client = await createMailClient();
    await deliverBrandedEmail(client, payload);
    return true;
  } catch (error) {
    console.error(`${logContext} failed`, error);
    return false;
  }
};

const createTimestampLabel = () => {
  const value = new Date();
  const month = value.toLocaleString('en-US', { month: 'short' });
  const day = String(value.getDate()).padStart(2, '0');
  const year = value.getFullYear();
  const hours = String(value.getHours()).padStart(2, '0');
  const minutes = String(value.getMinutes()).padStart(2, '0');
  return `${month} ${day}, ${year} ${hours}:${minutes}`;
};

const getRequestIp = (req) => req.ip ?? req.socket.remoteAddress ?? '';

const createAuthenticatedSession = async (user, req) => {
  const sessionId = createSessionId();
  const sessionTimestamp = createTimestampLabel();
  const nextSessions = issueSession(parseJson(user.sessions_json, []), {
    sessionId,
    userAgent: req.headers['user-agent'] ?? '',
    ipAddress: getRequestIp(req),
    lastSeen: sessionTimestamp,
  });

  await query(
    'UPDATE users SET sessions_json = :sessions, last_seen = :lastSeen WHERE id = :id',
    {
      id: user.id,
      sessions: JSON.stringify(nextSessions),
      lastSeen: 'Active now',
    },
  );

  return { sessionId, sessions: nextSessions };
};

const revokeCurrentSession = async (user, sessionId, reason) => {
  const { found, sessions } = revokeSession(parseJson(user.sessions_json, []), sessionId, reason);

  if (!found) {
    return false;
  }

  await query('UPDATE users SET sessions_json = :sessions WHERE id = :id', {
    id: user.id,
    sessions: JSON.stringify(sessions),
  });

  return true;
};

const createPrefixedId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

const createTemporaryPassword = (length = 12) => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
};

const createUserNotification = ({ title, message, tone = 'info', category = 'Security' }) => ({
  id: createPrefixedId('notif'),
  title,
  message,
  category,
  time: createTimestampLabel(),
  unread: true,
  tone,
});

const appendAdminTimelineEntry = async (title, detail) => {
  const dashboardMeta = await getSetting('adminDashboard', { alerts: [], timeline: [] });
  const nextTimeline = [
    {
      id: createPrefixedId('timeline'),
      title,
      detail,
      time: createTimestampLabel(),
    },
    ...(dashboardMeta.timeline ?? []),
  ].slice(0, 6);

  await upsertSetting('adminDashboard', {
    ...dashboardMeta,
    timeline: nextTimeline,
  });
};

const pickAllowedValue = (input, allowed, fallback) => {
  const normalized = String(input ?? '').trim().toLowerCase();
  return allowed.find((value) => value.toLowerCase() === normalized) ?? fallback;
};

const adminTransactionStatuses = ['Completed', 'Pending', 'Review'];
const adminKycStatuses = ['Approved', 'Pending', 'Needs review'];
const adminHoldingStatuses = ['Enabled', 'Watch', 'Paused'];

const formatAmountLabel = (amount) =>
  Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 8 });

const getAdminProfileState = async (user) => {
  const defaults = {
    fullName: user.name,
    email: user.email,
    role: 'Super Operator',
    timezone: 'Africa/Lagos',
    profileNote: 'Primary support and oversight account for the operations dashboard.',
  };

  return {
    ...defaults,
    ...(await getSetting('adminProfile', {})),
  };
};

const getBrandName = async () => {
  const generalSettings = await getGeneralSettings();
  return String(generalSettings.siteName).trim();
};

const getClientBootstrap = async (userId) => {
  const user = await queryOne('SELECT * FROM users WHERE id = :id', { id: userId });
  const kycCases = await query(
    'SELECT * FROM kyc_cases WHERE user_id = :userId ORDER BY created_at DESC',
    { userId },
  );
  const referralMilestones = await getSetting('referralMilestones', []);
  const recentReferrals = parseJson(user.referrals_json, []);
  const rawHoldings = parseJson(user.holdings_json, []);
  const marketAssets = priceFeed.getMarketAssets();
  const settingsWallets = normalizeWalletSettings(await getSetting('wallets', {}), marketAssets);
  const effectiveAssets = buildUserWalletAssets({
    user,
    holdings: rawHoldings,
    marketAssets,
    walletSettings: settingsWallets,
  });
  const visiblePortfolioUsd = Number(sumVisiblePortfolioValue(effectiveAssets).toFixed(2));
  const totalWalletUsd = Number(sumWalletValue(effectiveAssets).toFixed(2));
  const changeUsd = Number(
    effectiveAssets
      .filter((asset) => asset.enabledByDefault)
      .reduce((total, asset) => {
        const multiplier = 1 + Number(asset.change ?? 0) / 100;
        if (!Number.isFinite(multiplier) || multiplier === 0) {
          return total;
        }

        const previousValue = Number(asset.valueUsd ?? 0) / multiplier;
        return total + (Number(asset.valueUsd ?? 0) - previousValue);
      }, 0)
      .toFixed(2),
  );
  const previousPortfolioUsd = visiblePortfolioUsd - changeUsd;
  const changePct = visiblePortfolioUsd > 0 && previousPortfolioUsd !== 0
    ? Number(((changeUsd / previousPortfolioUsd) * 100).toFixed(2))
    : 0;
  const cards = parseJson(user.cards_json, []).map((card) => mapAdminCard(card));

  return {
    profile: {
      id: String(user.id),
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city,
      uuid: user.uuid,
      country: user.country,
      plan: user.plan_name,
      tier: user.tier,
      kycStatus: user.kyc_status,
    },
    summary: {
      portfolioUsd: visiblePortfolioUsd,
      availableUsd: totalWalletUsd,
      changeUsd,
      changePct,
      walletConnected: Boolean(user.wallet_connected),
    },
    walletAssets: effectiveAssets,
    marketAssets: buildAdminAssetCatalog(marketAssets, settingsWallets),
    depositActivity: normalizeActivityRecords(parseJson(user.deposit_activity_json, []), rawHoldings),
    withdrawalActivity: normalizeActivityRecords(parseJson(user.withdrawal_activity_json, []), rawHoldings),
    notificationItems: parseJson(user.notifications_json, []),
    addressBookEntries: parseJson(user.address_book_json, []),
    recentSessions: parseJson(user.sessions_json, []),
    kycChecklist: parseJson(user.kyc_checklist_json, []),
    kycCases: kycCases.map((item) => mapKycCase(item)),
    referralMilestones,
    recentReferrals,
    cards: cards.filter((card) => !card.requestOnly),
    cardRequests: cards.filter((card) => card.requestOnly),
    cardApplicationFeeUsd: settingsWallets.cardApplicationFeeUsd,
  };
};

const getAdminBootstrap = async () => {
  const users = await query('SELECT * FROM users WHERE role = :role ORDER BY id ASC', { role: 'user' });
  const transactions = await query('SELECT * FROM transactions ORDER BY created_at_label DESC');
  const kycCases = await query('SELECT * FROM kyc_cases ORDER BY created_at DESC');
  const marketAssets = priceFeed.getMarketAssets();

  const settingsGeneral = await getGeneralSettings();
  const settingsEmail = await getSetting('email', {});
  const settingsWallets = normalizeWalletSettings(await getSetting('wallets', {}), marketAssets);
  const adminUsers = users.map((user) => mapAdminUser(user, { walletSettings: settingsWallets, marketAssets }));
  const dashboardMeta = await getSetting('adminDashboard', { alerts: [], timeline: [] });
  const sanitizedEmailSettings = sanitizeEmailSettings(settingsEmail);
  const adminAssetCatalog = buildAdminAssetCatalog(marketAssets, settingsWallets);

  const totalCryptoValue = adminUsers.reduce(
    (total, user) => total + user.holdings.reduce((subTotal, holding) => subTotal + holding.valueUsd, 0),
    0,
  );

  return {
    adminUsers,
    adminMetrics: [
      { id: 'users', label: 'Users', value: String(adminUsers.length), change: `${kycCases.filter((item) => item.status === 'Pending').length} pending KYC`, tone: 'blue', detail: 'Total client accounts available to operations.' },
      { id: 'transactions', label: 'Transactions', value: String(transactions.length), change: `${transactions.filter((item) => item.status === 'Pending').length} pending`, tone: 'emerald', detail: 'Combined funding, transfer, and withdrawal records.' },
      { id: 'aum', label: 'Total Crypto Value', value: `$${totalCryptoValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: 'Live assets', tone: 'rose', detail: 'Aggregated holdings from admin-visible wallet records.' },
    ],
    adminKycCases: kycCases.map((item) => mapKycCase(item)),
    adminTransactions: transactions.map((transaction) => ({ id: String(transaction.id), userId: String(transaction.user_id), type: transaction.type, asset: transaction.asset, amount: transaction.amount, channel: transaction.channel, destination: transaction.destination, status: transaction.status, createdAt: transaction.created_at_label, fromAsset: transaction.from_asset, toAsset: transaction.to_asset, whichCrypto: transaction.which_crypto, networkFee: transaction.network_fee, rate: transaction.rate })),
    adminAssetCatalog,
    adminEmailTemplates: [],
    adminAlerts: dashboardMeta.alerts ?? [],
    adminTimeline: dashboardMeta.timeline ?? [],
    adminSettings: { general: settingsGeneral, email: sanitizedEmailSettings, wallets: settingsWallets },
  };
};

app.get('/api/health', async (_req, res) => {
  try {
    await query('SELECT 1 AS ok');
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false, message: 'Database connection failed.' });
  }
});

// GET /api/prices — public live price feed (no auth required)
app.get('/api/prices', (_req, res) => {
  const prices = priceFeed.getAllPrices();
  const updatedAt = priceFeed.lastUpdatedAt;
  const marketAssets = priceFeed.getMarketAssets();
  return res.json({ prices, updatedAt, marketAssets });
});

app.get('/api/public/settings', async (_req, res) => {
  return res.json({
    branding: await getGeneralSettings(),
  });
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const email = String(req.body.email ?? '').trim().toLowerCase();
  const password = String(req.body.password ?? '');

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await queryOne('SELECT * FROM users WHERE email = :email', { email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid login credentials.' });
  }

  const matches = await compareSecret(password, user.password_hash);
  if (!matches) {
    return res.status(401).json({ message: 'Invalid login credentials.' });
  }

  const { sessionId } = await createAuthenticatedSession(user, req);

  return res.json({
    accessToken: createAccessToken(user, sessionId),
    user: mapSessionUser(user),
  });
});

app.post('/api/auth/signup', signupLimiter, async (req, res) => {
  const fullName = String(req.body.fullName ?? '').trim();
  const email = String(req.body.email ?? '').trim().toLowerCase();
  const phone = String(req.body.phone ?? '').trim();
  const city = String(req.body.city ?? '').trim();
  const password = String(req.body.password ?? '');

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'Full name, email, and password are required.' });
  }

  const existing = await queryOne('SELECT id FROM users WHERE email = :email', { email });
  if (existing) {
    return res.status(409).json({ message: 'An account with that email already exists.' });
  }

  const nextIdRow = await queryOne("SELECT nextval('users_id_seq') AS nextId");
  const nextId = Number(nextIdRow?.nextId ?? 100);
  const uuid = `USR-${String(nextId).padStart(4, '0')}-${Date.now().toString().slice(-4)}`;

  await query(
    `INSERT INTO users (
      id, role, name, email, phone, city, uuid, country, desk_label, tier, status, kyc_status, risk_level,
      portfolio_usd, available_usd, portfolio_change_usd, portfolio_change_pct, wallet_connected, plan_name, last_seen, note,
      password_hash, passcode_hash, holdings_json, cards_json, deposit_activity_json, withdrawal_activity_json,
      notifications_json, address_book_json, referrals_json, sessions_json, kyc_checklist_json
    ) VALUES (
      :id, 'user', :name, :email, :phone, :city, :uuid, 'Nigeria', 'New Account', 'Tier 1', 'Active', 'Pending', 'Medium',
      0, 0, 0, 0, 1, 'Starter', 'Just created', 'New signup awaiting funding.',
      :passwordHash, :passcodeHash, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]'
    )`,
    {
      id: nextId,
      name: fullName,
      email,
      phone,
      city,
      uuid,
      passwordHash: await hashSecret(password),
      passcodeHash: await hashSecret('000000'),
    },
  );

  const emailSettings = await getSetting('email', {});

  if (emailSettings.notifyOnUserRegistration !== false) {
    const brandName = await getBrandName();
    await sendSystemEmailSafely({
      logContext: `welcome email to ${email}`,
      to: email,
      subject: `Welcome to ${brandName}`,
      title: 'Your account is ready',
      preheader: `Your ${brandName} account has been created successfully.`,
      intro: `Your ${brandName} account is live and ready for sign in.`,
      recipientName: fullName,
      paragraphs: [
        'Your wallet profile has been created successfully. You can sign in from the client portal and complete any remaining verification steps from your dashboard.',
        'If you did not request this account, reply to this email immediately so the operations desk can investigate.',
      ],
      highlights: [`Login email: ${email}`, 'Default passcode: 000000', 'Account status: Active', 'KYC status: Pending review'],
      ctaLabel: 'Open the client portal',
      ctaUrl: await toClientUrl('/login'),
      signatureRole: 'Client Operations',
    });
  }

  return res.status(201).json({ message: 'Account created successfully. Please sign in.' });
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  return res.json({ user: mapSessionUser(req.user) });
});

app.post('/api/auth/logout', requireAuth, async (req, res) => {
  await revokeCurrentSession(req.user, req.auth.sessionId, `Signed out ${createTimestampLabel()}`);
  return res.json({ ok: true });
});

// FIX: was missing closing });
app.get('/api/client/bootstrap', requireAuth, requireRole('user'), async (req, res) => {
  return res.json(await getClientBootstrap(req.user.id));
});

app.post('/api/client/kyc/submit', requireAuth, requireRole('user'), (req, res) => {
  kycUpload.fields(kycDocumentFields.map((fieldName) => ({ name: fieldName, maxCount: 1 })))(req, res, async (err) => {
    if (err) {
      const message = err instanceof multer.MulterError
        ? (err.code === 'LIMIT_FILE_SIZE' ? 'Each KYC document must be under 8 MB.' : err.message)
        : err.message || 'KYC upload failed.';
      return res.status(400).json({ message });
    }

    const uploadedFiles = Object.values(req.files ?? {}).flat();
    if (!uploadedFiles.length) {
      return res.status(400).json({ message: 'Upload at least your government ID and proof of address.' });
    }

    const submittedAt = createTimestampLabel();
    const documents = buildStoredKycDocuments(uploadedFiles, submittedAt);
    const hasGovernmentId = documents.some((document) => document.fieldName === 'governmentId');
    const hasProofOfAddress = documents.some((document) => document.fieldName === 'proofOfAddress');

    if (!hasGovernmentId || !hasProofOfAddress) {
      await deleteKycStoredFiles(documents);
      return res.status(400).json({ message: 'Government ID and proof of address are both required.' });
    }

    // Save files to PostgreSQL before persisting document metadata
    await saveKycFilesToDb(uploadedFiles, documents);

    const documentType = buildKycDocumentType(documents);
    const noteInput = String(req.body.note ?? '').trim();
    const note = noteInput || 'Documents submitted from the client dashboard and queued for manual review.';
    const currentCase = await queryOne(
      'SELECT * FROM kyc_cases WHERE user_id = :userId AND status != :approved LIMIT 1',
      { userId: req.user.id, approved: 'Approved' },
    );

    if (currentCase) {
      await deleteKycStoredFiles(readKycDocuments(currentCase));
      await query(
        `UPDATE kyc_cases
         SET document_type = :documentType,
             submitted_at_label = :submittedAt,
             country = :country,
             risk_level = :riskLevel,
             status = 'Pending',
             note = :note,
             documents_json = :documents
         WHERE id = :id`,
        {
          id: currentCase.id,
          documentType,
          submittedAt,
          country: req.user.country,
          riskLevel: req.user.risk_level,
          note,
          documents: JSON.stringify(documents),
        },
      );
    } else {
      await query(
        `INSERT INTO kyc_cases (
          id, user_id, document_type, submitted_at_label, country, risk_level, status, note, documents_json
        ) VALUES (
          :id, :userId, :documentType, :submittedAt, :country, :riskLevel, 'Pending', :note, :documents
        )`,
        {
          id: createPrefixedId(`kyc-${req.user.id}`),
          userId: req.user.id,
          documentType,
          submittedAt,
          country: req.user.country,
          riskLevel: req.user.risk_level,
          note,
          documents: JSON.stringify(documents),
        },
      );
    }

    const nextNotifications = [
      createUserNotification({
        title: 'KYC documents received',
        message: `${documentType} was submitted and is now pending compliance review.`,
        tone: 'info',
      }),
      ...parseJson(req.user.notifications_json, []),
    ].slice(0, 20);

    await query(
      `UPDATE users
       SET kyc_status = 'Pending',
           kyc_checklist_json = :checklist,
           notifications_json = :notifications,
           last_seen = :lastSeen
       WHERE id = :id`,
      {
        id: req.user.id,
        checklist: JSON.stringify(buildKycChecklist({ documents, status: 'Pending' })),
        notifications: JSON.stringify(nextNotifications),
        lastSeen: `Updated ${submittedAt}`,
      },
    );

    const emailSettings = await getSetting('email', {});
    if (emailSettings.notifyOnKycSubmission !== false) {
      const brandName = await getBrandName();
      await sendSystemEmailSafely({
        logContext: `kyc submission email to ${req.user.email}`,
        to: req.user.email,
        subject: `${brandName} received your KYC documents`,
        title: 'Documents received',
        preheader: 'Your verification documents are now in the review queue.',
        intro: 'We received your document upload and forwarded it to the compliance review queue.',
        recipientName: req.user.name,
        paragraphs: [
          'Your submission is now attached to your account and will remain visible from the KYC page while the review is open.',
          'If the review team needs clearer files or more supporting evidence, the KYC page and your notifications feed will reflect that.',
        ],
        highlights: [
          `Documents: ${documentType}`,
          `Submitted: ${submittedAt}`,
          'Current status: Pending',
        ],
        ctaLabel: 'Open KYC center',
        ctaUrl: await toClientUrl('/app/kyc'),
        signatureRole: 'Compliance Desk',
      });
    }

    await appendAdminTimelineEntry(
      `${req.user.name} submitted KYC documents`,
      `${documentType} was uploaded from the client dashboard.`,
    );

    return res.status(201).json({ ok: true, message: 'KYC documents submitted successfully.' });
  });
});

// FIX: was missing closing });
app.patch('/api/client/notifications/read-all', requireAuth, requireRole('user'), async (req, res) => {
  const notifications = parseJson(req.user.notifications_json).map((item) => ({ ...item, unread: false }));
  await query('UPDATE users SET notifications_json = :payload WHERE id = :id', { payload: JSON.stringify(notifications), id: req.user.id });
  return res.json({ notificationItems: notifications });
});

// FIX: was missing closing });
app.patch('/api/client/assets/:assetId/toggle', requireAuth, requireRole('user'), async (req, res) => {
  const assetId = String(req.params.assetId ?? '').trim();
  const holdings = parseJson(req.user.holdings_json, []);
  const marketAssets = priceFeed.getMarketAssets();
  const walletSettings = normalizeWalletSettings(await getSetting('wallets', {}), marketAssets);
  const walletAssets = buildUserWalletAssets({
    user: req.user,
    holdings,
    marketAssets,
    walletSettings,
  });
  const asset = walletAssets.find((item) => item.id === assetId);

  if (!asset) {
    return res.status(404).json({ message: 'Asset not available in this wallet.' });
  }

  const nextEnabled = !asset.enabledByDefault;
  const updatedHoldings = upsertWalletHolding(holdings, {
    ...asset,
    enabledByDefault: nextEnabled,
    status: asset.status === 'Watch' ? 'Watch' : nextEnabled ? 'Enabled' : 'Paused',
  });

  await query('UPDATE users SET holdings_json = :payload WHERE id = :id', {
    payload: JSON.stringify(updatedHoldings),
    id: req.user.id,
  });

  return res.json({ ok: true });
});

app.put('/api/client/security', requireAuth, requireRole('user'), async (req, res) => {
  const currentPassword = String(req.body.currentPassword ?? '');
  const newPassword = String(req.body.newPassword ?? '');
  const passcode = String(req.body.passcode ?? '');
  const newPasscode = String(req.body.newPasscode ?? '').replace(/\D/g, '').slice(0, 6);

  if (!currentPassword || !newPassword || !passcode) {
    return res.status(400).json({ message: 'Current password, new password, and passcode are required.' });
  }

  if (newPasscode && newPasscode.length !== 6) {
    return res.status(400).json({ message: 'New passcode must be exactly 6 digits.' });
  }

  const currentMatches = await compareSecret(currentPassword, req.user.password_hash);
  const passcodeMatches = await compareSecret(passcode, req.user.passcode_hash);
  if (!currentMatches || !passcodeMatches) {
    return res.status(400).json({ message: 'Current password or passcode is incorrect.' });
  }

  const nextSessions = revokeOtherSessions(parseJson(req.user.sessions_json, []), req.auth.sessionId, `Password updated ${createTimestampLabel()}`);

  if (newPasscode) {
    await query(
      'UPDATE users SET password_hash = :passwordHash, passcode_hash = :passcodeHash, sessions_json = :sessions WHERE id = :id',
      {
        passwordHash: await hashSecret(newPassword),
        passcodeHash: await hashSecret(newPasscode),
        sessions: JSON.stringify(nextSessions),
        id: req.user.id,
      },
    );
  } else {
    await query(
      'UPDATE users SET password_hash = :passwordHash, sessions_json = :sessions WHERE id = :id',
      {
        passwordHash: await hashSecret(newPassword),
        sessions: JSON.stringify(nextSessions),
        id: req.user.id,
      },
    );
  }

  return res.json({ ok: true, message: 'Security details updated successfully.' });
});

app.post('/api/client/cards/apply', requireAuth, requireRole('user'), async (req, res) => {
  const holderName = String(req.body.holderName ?? req.user.name).trim() || req.user.name;
  const brand = String(req.body.brand ?? 'Visa').trim() === 'Mastercard' ? 'Mastercard' : 'Visa';
  const note = String(req.body.note ?? '').trim();
  const cards = parseJson(req.user.cards_json, []);

  if (cards.some((card) => Boolean(card?.requestOnly))) {
    return res.status(400).json({ message: 'A card request is already pending for this account.' });
  }

  const marketAssets = priceFeed.getMarketAssets();
  const walletSettings = normalizeWalletSettings(await getSetting('wallets', {}), marketAssets);
  const walletAssets = buildUserWalletAssets({
    user: req.user,
    holdings: parseJson(req.user.holdings_json, []),
    marketAssets,
    walletSettings,
  });
  const applicationFeeUsd = Number(walletSettings.cardApplicationFeeUsd ?? 0);
  const rankedFundingAssets = [...walletAssets]
    .filter((asset) => Number(asset.balance ?? 0) > 0 && Number(asset.price ?? 0) > 0)
    .sort((left, right) => {
      const stableRank = (asset) => (asset.symbol === 'USDT' || asset.symbol === 'USDC' ? 1 : 0);
      if (stableRank(left) !== stableRank(right)) {
        return stableRank(right) - stableRank(left);
      }
      return Number(right.valueUsd ?? 0) - Number(left.valueUsd ?? 0);
    });

  const fundingAsset = rankedFundingAssets.find((asset) => Number(asset.valueUsd ?? 0) >= applicationFeeUsd);
  if (applicationFeeUsd > 0 && !fundingAsset) {
    return res.status(400).json({ message: 'Insufficient wallet value to cover the card application fee.' });
  }

  const feeAssetAmount =
    applicationFeeUsd > 0 && fundingAsset
      ? Number((applicationFeeUsd / Number(fundingAsset.price ?? 1)).toFixed(8))
      : 0;

  if (fundingAsset && feeAssetAmount > Number(fundingAsset.balance ?? 0)) {
    return res.status(400).json({ message: 'The selected wallet cannot cover the card application fee.' });
  }

  const updatedFundingAsset = fundingAsset
    ? {
      ...fundingAsset,
      balance: Number((Number(fundingAsset.balance ?? 0) - feeAssetAmount).toFixed(8)),
      valueUsd: Number((Math.max(Number(fundingAsset.valueUsd ?? 0) - applicationFeeUsd, 0)).toFixed(2)),
    }
    : null;

  const updatedHoldings = updatedFundingAsset
    ? upsertWalletHolding(parseJson(req.user.holdings_json, []), updatedFundingAsset)
    : parseJson(req.user.holdings_json, []);
  const updatedWalletAssets = updatedFundingAsset
    ? walletAssets.map((asset) => (asset.id === updatedFundingAsset.id ? updatedFundingAsset : asset))
    : walletAssets;
  const nextTotalWalletUsd = Number(sumWalletValue(updatedWalletAssets).toFixed(2));
  const requestedAt = createTimestampLabel();
  const requestCard = {
    id: createPrefixedId('card-req'),
    label: `${brand} card request`,
    brand,
    holderName,
    last4: '0000',
    status: 'Review',
    spendLimitUsd: 0,
    utilizationUsd: 0,
    issuedAt: '',
    requestedAt,
    requestOnly: true,
    applicationFeeUsd,
    note,
  };
  const nextCards = [requestCard, ...cards];
  const nextNotifications = [
    createUserNotification({
      title: 'Card request submitted',
      message:
        applicationFeeUsd > 0 && fundingAsset
          ? `${brand} card request submitted. ${formatAmountLabel(feeAssetAmount)} ${fundingAsset.symbol} covered the application fee.`
          : `${brand} card request submitted and is now pending review.`,
      tone: 'info',
      category: 'Transfers',
    }),
    ...parseJson(req.user.notifications_json, []),
  ].slice(0, 20);

  await query(
    `UPDATE users
     SET holdings_json = :holdings,
         cards_json = :cards,
         notifications_json = :notifications,
         portfolio_usd = :portfolioUsd,
         available_usd = :availableUsd,
         last_seen = :lastSeen
     WHERE id = :id`,
    {
      id: req.user.id,
      holdings: JSON.stringify(updatedHoldings),
      cards: JSON.stringify(nextCards),
      notifications: JSON.stringify(nextNotifications),
      portfolioUsd: nextTotalWalletUsd,
      availableUsd: nextTotalWalletUsd,
      lastSeen: `Updated ${requestedAt}`,
    },
  );

  await query(
    `INSERT INTO transactions (
      id, user_id, type, asset, amount, channel, destination, status, created_at_label,
      from_asset, to_asset, which_crypto, network_fee, rate
    ) VALUES (
      :id, :userId, 'Transfer', :asset, :amount, :channel, :destination, 'Pending', :createdAt,
      :fromAsset, '', :whichCrypto, :networkFee, :rate
    )`,
    {
      id: createPrefixedId('txn'),
      userId: req.user.id,
      asset: fundingAsset?.symbol ?? 'USD',
      amount:
        fundingAsset && applicationFeeUsd > 0
          ? `${formatAmountLabel(feeAssetAmount)} ${fundingAsset.symbol}`
          : '$0.00',
      channel: 'Card Application',
      destination: `${brand} card request`,
      createdAt: requestedAt,
      fromAsset: fundingAsset?.symbol ?? '',
      whichCrypto: fundingAsset?.symbol ?? '',
      networkFee: '0',
      rate: String(fundingAsset?.price ?? 0),
    },
  );

  await sendSystemEmailSafely({
    logContext: `card request email to ${req.user.email}`,
    to: req.user.email,
    subject: `${brand} card request received`,
    title: 'Card request received',
    preheader: 'Your card application is now pending operations review.',
    intro: 'We received your card request and queued it for operator review.',
    recipientName: req.user.name,
    paragraphs: [
      'The request will remain pending until an administrator reviews it and issues the card record.',
      applicationFeeUsd > 0 && fundingAsset
        ? `${formatAmountLabel(feeAssetAmount)} ${fundingAsset.symbol} was applied as the card application fee.`
        : 'No application fee was charged for this request.',
    ],
    highlights: [
      `Requested card: ${brand}`,
      `Requested at: ${requestedAt}`,
      `Application fee: $${applicationFeeUsd.toFixed(2)}`,
    ],
    ctaLabel: 'Open cards',
    ctaUrl: await toClientUrl('/app/cards'),
    signatureRole: 'Card Services Desk',
  });

  await appendAdminTimelineEntry(
    `${req.user.name} submitted a ${brand} card request`,
    applicationFeeUsd > 0 && fundingAsset
      ? `${formatAmountLabel(feeAssetAmount)} ${fundingAsset.symbol} was charged as the application fee.`
      : 'Card request submitted with no application fee.',
  );

  return res.status(201).json({ ok: true, message: 'Card request submitted successfully.' });
});

app.get('/api/kyc/cases/:caseId/documents/:documentId', requireAuth, async (req, res) => {
  const caseId = String(req.params.caseId ?? '').trim();
  const documentId = String(req.params.documentId ?? '').trim();

  if (!caseId || !documentId) {
    return res.status(400).json({ message: 'Case ID and document ID are required.' });
  }

  const kycCase = await queryOne('SELECT * FROM kyc_cases WHERE id = :id', { id: caseId });
  if (!kycCase) {
    return res.status(404).json({ message: 'KYC case not found.' });
  }

  if (req.user.role !== 'admin' && Number(kycCase.user_id) !== Number(req.user.id)) {
    return res.status(403).json({ message: 'You do not have permission to view this document.' });
  }

  const document = readKycDocuments(kycCase).find((item) => item.id === documentId);
  if (!document) {
    return res.status(404).json({ message: 'KYC document not found.' });
  }

  return serveStoredFile(document.id, res);
});

app.post('/api/client/withdrawals', requireAuth, requireRole('user'), async (req, res) => {
  const assetId = String(req.body.assetId ?? '').trim();
  const method = String(req.body.method ?? 'external').trim().toLowerCase();
  const recipient = String(req.body.recipient ?? '').trim();
  const passcode = String(req.body.passcode ?? '').trim();
  const amount = Number(req.body.amount ?? 0);

  if (!assetId || !recipient || !passcode || !Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: 'Asset, recipient, amount, and passcode are required.' });
  }

  if (!['external', 'payid'].includes(method)) {
    return res.status(400).json({ message: 'Unsupported withdrawal method.' });
  }

  if (passcode.length !== 6) {
    return res.status(400).json({ message: 'Passcode must be 6 digits.' });
  }

  const passcodeMatches = await compareSecret(passcode, req.user.passcode_hash);
  if (!passcodeMatches) {
    return res.status(400).json({ message: 'Incorrect passcode.' });
  }

  const holdings = parseJson(req.user.holdings_json, []);
  const marketAssets = priceFeed.getMarketAssets();
  const walletSettings = normalizeWalletSettings(await getSetting('wallets', {}), marketAssets);
  const walletAssets = buildUserWalletAssets({
    user: req.user,
    holdings,
    marketAssets,
    walletSettings,
  });
  const asset = walletAssets.find((item) => item.id === assetId);

  if (!asset) {
    return res.status(404).json({ message: 'Asset not found in this wallet.' });
  }

  const feeAmount = method === 'external' ? Number(asset.withdrawFee ?? 0) : 0;
  const totalDebit = amount + feeAmount;

  if (amount < Number(asset.minimumWithdrawal ?? 0)) {
    return res.status(400).json({ message: `Minimum withdrawal is ${asset.minimumWithdrawal} ${asset.symbol}.` });
  }

  if (totalDebit > Number(asset.balance ?? 0)) {
    return res.status(400).json({ message: 'Insufficient balance for amount plus fee.' });
  }

  const updatedAsset = {
    ...asset,
    balance: Number((Number(asset.balance ?? 0) - totalDebit).toFixed(8)),
    valueUsd: Number(((Number(asset.balance ?? 0) - totalDebit) * Number(asset.price ?? 0)).toFixed(2)),
  };
  const updatedHoldings = upsertWalletHolding(holdings, updatedAsset);
  const updatedWalletAssets = walletAssets.map((item) => (item.id === assetId ? updatedAsset : item));

  const nextPortfolioUsd = Number(sumWalletValue(updatedWalletAssets).toFixed(2));
  const nextAvailableUsd = nextPortfolioUsd;
  const createdAt = createTimestampLabel();
  const transactionId = createPrefixedId('txn');

  const nextWithdrawalActivity = [
    {
      id: createPrefixedId('wd'),
      assetId,
      amount: `${formatAmountLabel(amount)} ${asset.symbol}`,
      method: method === 'external' ? 'External Wallet' : 'Internal Transfer',
      destination: recipient,
      status: 'Pending',
      time: createdAt,
    },
    ...parseJson(req.user.withdrawal_activity_json, []),
  ].slice(0, 12);

  const nextNotifications = [
    {
      id: createPrefixedId('notif'),
      title: 'Withdrawal submitted',
      message: `${formatAmountLabel(amount)} ${asset.symbol} was added to the transfer queue for ${recipient}.`,
      category: 'Transfers',
      time: createdAt,
      unread: true,
      tone: 'warning',
    },
    ...parseJson(req.user.notifications_json, []),
  ].slice(0, 20);

  await query(
    `UPDATE users
     SET holdings_json = :holdings,
         withdrawal_activity_json = :withdrawals,
         notifications_json = :notifications,
         portfolio_usd = :portfolioUsd,
         available_usd = :availableUsd,
         last_seen = :lastSeen
     WHERE id = :id`,
    {
      holdings: JSON.stringify(updatedHoldings),
      withdrawals: JSON.stringify(nextWithdrawalActivity),
      notifications: JSON.stringify(nextNotifications),
      portfolioUsd: nextPortfolioUsd,
      availableUsd: nextAvailableUsd,
      lastSeen: `Updated ${createdAt}`,
      id: req.user.id,
    },
  );

  await query(
    `INSERT INTO transactions (
      id, user_id, type, asset, amount, channel, destination, status, created_at_label,
      from_asset, to_asset, which_crypto, network_fee, rate
    ) VALUES (
      :id, :userId, 'Withdrawal', :asset, :amountLabel, :channel, :destination, 'Pending', :createdAt,
      :fromAsset, '', :whichCrypto, :networkFee, :rate
    )`,
    {
      id: transactionId,
      userId: req.user.id,
      asset: asset.symbol,
      amountLabel: `${formatAmountLabel(amount)} ${asset.symbol}`,
      channel: method === 'external' ? 'External Wallet' : 'Internal Transfer',
      destination: recipient,
      createdAt,
      fromAsset: asset.symbol,
      whichCrypto: asset.symbol,
      networkFee: String(feeAmount),
      rate: String(asset.price ?? 0),
    },
  );

  // FIX: sendSystemEmailSafely was missing closing });
  await sendSystemEmailSafely({
    logContext: `withdrawal email to ${req.user.email}`,
    to: req.user.email,
    subject: 'Withdrawal request received',
    title: 'Your withdrawal is now under review',
    preheader: `${formatAmountLabel(amount)} ${asset.symbol} was added to the transfer queue.`,
    intro: 'We received your withdrawal request and queued it for review.',
    recipientName: req.user.name,
    paragraphs: [
      'The transfer has been recorded and will remain in pending status until the operations team completes the required checks.',
      'You can monitor the request from your wallet notifications and recent activity feed.',
    ],
    highlights: [
      `Amount: ${formatAmountLabel(amount)} ${asset.symbol}`,
      `Destination: ${recipient}`,
      `Transfer method: ${method === 'external' ? 'External Wallet' : 'Internal Transfer'}`,
      `Network fee: ${formatAmountLabel(feeAmount)} ${asset.symbol}`,
      'Current status: Pending',
    ],
    ctaLabel: 'Review wallet activity',
    ctaUrl: await toClientUrl('/app/withdraw'),
    signatureRole: 'Risk and Transfers Desk',
  });

  // Notify admin of new pending withdrawal
  const adminUser = await queryOne("SELECT email, name FROM users WHERE role = 'admin' LIMIT 1");
  if (adminUser?.email) {
    await sendSystemEmailSafely({
      logContext: `admin withdrawal alert to ${adminUser.email}`,
      to: adminUser.email,
      subject: `Action required: withdrawal pending — ${req.user.name}`,
      title: 'New withdrawal request pending your review',
      preheader: `${req.user.name} submitted a ${formatAmountLabel(amount)} ${asset.symbol} withdrawal.`,
      intro: 'A user has submitted a withdrawal request. It is currently pending and requires your approval before it is processed.',
      recipientName: adminUser.name || 'Admin',
      paragraphs: [
        'Log in to the admin dashboard and navigate to Transactions to approve or decline this request.',
      ],
      highlights: [
        `User: ${req.user.name} (${req.user.email})`,
        `Amount: ${formatAmountLabel(amount)} ${asset.symbol}`,
        `Destination: ${recipient}`,
        `Method: ${method === 'external' ? 'External Wallet' : 'Internal Transfer'}`,
        `Network fee: ${formatAmountLabel(feeAmount)} ${asset.symbol}`,
        `Transaction ID: ${transactionId}`,
        'Status: Pending',
      ],
      ctaLabel: 'Review in admin dashboard',
      ctaUrl: await toClientUrl('/admin/transactions'),
      signatureRole: 'Automated Alert System',
    });
  }

  return res.status(201).json({
    ok: true,
    transactionId,
    message: 'Withdrawal submitted successfully.',
  });
});

app.post('/api/client/passcode/verify', requireAuth, requireRole('user'), async (req, res) => {
  const passcode = String(req.body.passcode ?? '').trim();

  if (passcode.length !== 6) {
    return res.status(400).json({ message: 'Passcode must be 6 digits.' });
  }

  const matches = await compareSecret(passcode, req.user.passcode_hash);
  if (!matches) {
    return res.status(400).json({ message: 'Incorrect passcode.' });
  }

  return res.json({ ok: true });
});

// FIX: was missing closing });
app.get('/api/admin/bootstrap', requireAuth, requireRole('admin'), async (_req, res) => {
  return res.json(await getAdminBootstrap());
});

// FIX: sendSystemEmailSafely was missing }); and route itself was missing });
app.post('/api/admin/users', requireAuth, requireRole('admin'), async (req, res) => {
  const name = String(req.body.name ?? '').trim();
  const email = String(req.body.email ?? '').trim().toLowerCase();
  const password = String(req.body.password ?? '12345678');
  const country = String(req.body.country ?? 'Nigeria');
  const tier = String(req.body.tier ?? 'Tier 1');
  const status = String(req.body.status ?? 'Active');
  const kycStatus = String(req.body.kycStatus ?? 'Pending');
  const riskLevel = String(req.body.riskLevel ?? 'Medium');
  const plan = String(req.body.plan ?? 'Starter');

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required.' });
  }

  const existing = await queryOne('SELECT id FROM users WHERE email = :email', { email });
  if (existing) {
    return res.status(409).json({ message: 'A user with that email already exists.' });
  }

  const nextIdRow = await queryOne("SELECT nextval('users_id_seq') AS nextId");
  const nextId = Number(nextIdRow?.nextId ?? 100);
  const uuid = req.body.uuid ? String(req.body.uuid) : `USR-${String(nextId).padStart(4, '0')}-${Date.now().toString().slice(-4)}`;

  await query(
    `INSERT INTO users (
      id, role, name, email, phone, city, uuid, country, desk_label, tier, status, kyc_status, risk_level,
      portfolio_usd, available_usd, portfolio_change_usd, portfolio_change_pct, wallet_connected, plan_name, last_seen, note,
      password_hash, passcode_hash, holdings_json, cards_json, deposit_activity_json, withdrawal_activity_json,
      notifications_json, address_book_json, referrals_json, sessions_json, kyc_checklist_json
    ) VALUES (
      :id, 'user', :name, :email, '', '', :uuid, :country, :deskLabel, :tier, :status, :kycStatus, :riskLevel,
      0, 0, 0, 0, 1, :plan, 'Just created', :note,
      :passwordHash, :passcodeHash, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]'
    )`,
    {
      id: nextId,
      name,
      email,
      uuid,
      country,
      deskLabel: String(req.body.deskLabel ?? 'New Desk'),
      tier,
      status,
      kycStatus,
      riskLevel,
      plan,
      note: String(req.body.note ?? 'Created from admin panel.'),
      passwordHash: await hashSecret(password),
      passcodeHash: await hashSecret('000000'),
    },
  );

  const emailSettings = await getSetting('email', {});

  if (emailSettings.notifyOnUserRegistration !== false) {
    const brandName = await getBrandName();
    await sendSystemEmailSafely({
      logContext: `admin-created account email to ${email}`,
      to: email,
      subject: `Your ${brandName} account has been created`,
      title: `You have been added to ${brandName}`,
      preheader: 'An administrator created your account and shared your sign-in details.',
      intro: `A ${brandName} administrator created a client account for you.`,
      recipientName: name,
      paragraphs: [
        'Use the temporary credentials below to sign in. For security, change your password and passcode after your first login.',
        'If you were not expecting this account, reply to this email before using the credentials.',
      ],
      highlights: [
        `Login email: ${email}`,
        `Temporary password: ${password}`,
        'Default passcode: 000000',
        `Plan: ${plan}`,
      ],
      ctaLabel: 'Sign in now',
      ctaUrl: await toClientUrl('/login'),
      signatureName: req.user.name,
      signatureRole: 'Operations Desk',
    });
  }

  await appendAdminTimelineEntry(
    `${req.user.name} created ${name}'s account`,
    `A new client profile was added for ${email} from the admin dashboard.`,
  );

  return res.status(201).json({ ok: true, id: String(nextId) });
});

// FIX: queryOne call was missing }); and route itself was missing });
app.put('/api/admin/users/:userId/password', requireAuth, requireRole('admin'), async (req, res) => {
  const userId = Number(req.params.userId ?? 0);
  const existing = await queryOne('SELECT id, name, email FROM users WHERE id = :id AND role = :role', {
    id: userId,
    role: 'user',
  });

  if (!existing) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const password = String(req.body.password ?? '').trim() || createTemporaryPassword();
  const resetPasscode = req.body.resetPasscode !== false;

  const updateFields = resetPasscode
    ? 'UPDATE users SET password_hash = :passwordHash, passcode_hash = :passcodeHash, sessions_json = :sessions WHERE id = :id'
    : 'UPDATE users SET password_hash = :passwordHash, sessions_json = :sessions WHERE id = :id';

  await query(updateFields, {
    id: userId,
    passwordHash: await hashSecret(password),
    ...(resetPasscode ? { passcodeHash: await hashSecret('000000') } : {}),
    sessions: '[]',
  });

  await appendAdminTimelineEntry(
    `${req.user.name} reset ${existing.name}'s password`,
    `Temporary password generated for ${existing.email}.${resetPasscode ? ' Passcode also reset to 000000.' : ''}`,
  );

  await sendSystemEmailSafely({
    logContext: `password reset email to ${existing.email}`,
    to: existing.email,
    subject: 'Your password has been reset',
    title: 'Temporary password generated',
    preheader: 'A new temporary password was created for your account.',
    intro: 'An administrator reset your account password and signed out previous sessions.',
    recipientName: existing.name,
    paragraphs: [
      'Use the temporary password below to sign back in and change it immediately from your security settings.',
      'If you did not expect this reset, contact support before using the new credentials.',
    ],
    highlights: [
      `Temporary password: ${password}`,
      ...(resetPasscode ? ['Passcode reset to: 000000'] : []),
      'All previous sessions were signed out',
    ],
    ctaLabel: 'Open login',
    ctaUrl: await toClientUrl('/login'),
    signatureName: req.user.name,
    signatureRole: 'Operations Desk',
  });

  return res.json({ ok: true, temporaryPassword: password });
});

// FIX: holdings.map callback was missing closing } and }); and route itself was missing });
app.put('/api/admin/users/:userId/assets/:assetId', requireAuth, requireRole('admin'), async (req, res) => {
  const userId = Number(req.params.userId ?? 0);
  const assetId = String(req.params.assetId ?? '').trim();
  const user = await queryOne('SELECT * FROM users WHERE id = :id AND role = :role', { id: userId, role: 'user' });

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const holdings = parseJson(user.holdings_json, []);
  const marketAssets = priceFeed.getMarketAssets();
  const settingsWallets = normalizeWalletSettings(await getSetting('wallets', {}), marketAssets);
  const effectiveAssets = buildUserWalletAssets({
    user,
    holdings,
    marketAssets,
    walletSettings: settingsWallets,
  });
  const current = effectiveAssets.find((item) => item.id === assetId);

  if (!current) {
    return res.status(404).json({ message: 'Asset record not found.' });
  }

  const action = String(req.body.action ?? '').trim().toLowerCase();
  const amount = Number(req.body.amount ?? 0);
  const nextStatus = req.body.status
    ? pickAllowedValue(req.body.status, adminHoldingStatuses, '')
    : '';
  const hasAddressUpdate = req.body.address !== undefined;
  const nextAddress = hasAddressUpdate ? String(req.body.address ?? '').trim() : String(current.address ?? '').trim();

  if (action && (!['add', 'subtract'].includes(action) || !Number.isFinite(amount) || amount <= 0)) {
    return res.status(400).json({ message: 'A valid adjustment action and amount are required.' });
  }

  let invalidAdjustment = false;
  const updatedAssets = effectiveAssets.map((item) => {
    if (item.id !== assetId) {
      return item;
    }

    const nextItem = { ...item };

    if (nextStatus) {
      nextItem.status = nextStatus;
      nextItem.enabledByDefault = nextStatus !== 'Paused';
    }

    if (hasAddressUpdate) {
      nextItem.address = nextAddress;
    }

    if (action) {
      const currentBalance = Number(nextItem.balance ?? 0);
      const price = Number(nextItem.price ?? 0);
      const nextBalance = action === 'add' ? currentBalance + amount : currentBalance - amount;

      if (nextBalance < 0) {
        invalidAdjustment = true;
        return nextItem;
      }

      nextItem.balance = Number(nextBalance.toFixed(8));
      nextItem.valueUsd = Number((nextItem.balance * price).toFixed(2));
    }

    return nextItem;
  });

  if (invalidAdjustment) {
    return res.status(400).json({ message: 'Adjustment would reduce the balance below zero.' });
  }

  const updatedAsset = updatedAssets.find((item) => item.id === assetId);
  const updatedHoldings = upsertWalletHolding(holdings, updatedAsset);
  const nextTotal = Number(sumWalletValue(updatedAssets).toFixed(2));
  const updatedAt = createTimestampLabel();
  const nextNotifications = action
    ? [
      createUserNotification({
        title: action === 'add' ? 'Wallet credited' : 'Wallet debited',
        message:
          action === 'add'
            ? `${formatAmountLabel(amount)} ${current.symbol} was credited to your wallet by the admin team.`
            : `${formatAmountLabel(amount)} ${current.symbol} was removed from your wallet by the admin team.`,
        tone: action === 'add' ? 'success' : 'warning',
        category: 'Transfers',
      }),
      ...parseJson(user.notifications_json, []),
    ].slice(0, 20)
    : parseJson(user.notifications_json, []);

  await query(
    `UPDATE users
     SET holdings_json = :holdings,
         notifications_json = :notifications,
         portfolio_usd = :portfolioUsd,
         available_usd = :availableUsd,
         last_seen = :lastSeen
     WHERE id = :id`,
    {
      id: userId,
      holdings: JSON.stringify(updatedHoldings),
      notifications: JSON.stringify(nextNotifications),
      portfolioUsd: nextTotal,
      availableUsd: nextTotal,
      lastSeen: `Updated ${updatedAt}`,
    },
  );

  const updateSummary = [];
  if (nextStatus && nextStatus !== String(current.status ?? '').trim()) {
    updateSummary.push(`status set to ${nextStatus}`);
  }
  if (hasAddressUpdate && nextAddress !== String(current.address ?? '').trim()) {
    updateSummary.push(nextAddress ? 'deposit address updated' : 'deposit address cleared');
  }
  if (action) {
    updateSummary.push(`${action === 'add' ? 'added' : 'subtracted'} ${formatAmountLabel(amount)} ${current.symbol}`);
  }

  if (action) {
    await query(
      `INSERT INTO transactions (
        id, user_id, type, asset, amount, channel, destination, status, created_at_label,
        from_asset, to_asset, which_crypto, network_fee, rate
      ) VALUES (
        :id, :userId, :type, :asset, :amount, :channel, :destination, 'Completed', :createdAt,
        :fromAsset, '', :whichCrypto, '0', :rate
      )`,
      {
        id: createPrefixedId('txn'),
        userId,
        type: action === 'add' ? 'Deposit' : 'Withdrawal',
        asset: current.symbol,
        amount: `${formatAmountLabel(amount)} ${current.symbol}`,
        channel: 'Admin Wallet Funding',
        destination: action === 'add' ? 'User wallet credit' : 'User wallet debit',
        createdAt: updatedAt,
        fromAsset: current.symbol,
        whichCrypto: current.symbol,
        rate: String(current.price ?? 0),
      },
    );

    await sendSystemEmailSafely({
      logContext: `admin wallet update email to ${user.email}`,
      to: user.email,
      subject: action === 'add' ? `${current.symbol} credited to your wallet` : `${current.symbol} removed from your wallet`,
      title: action === 'add' ? 'Wallet credit completed' : 'Wallet debit completed',
      preheader: `${formatAmountLabel(amount)} ${current.symbol} was ${action === 'add' ? 'credited' : 'debited'} by the admin team.`,
      intro:
        action === 'add'
          ? 'An administrator credited your wallet and the transaction is now complete.'
          : 'An administrator debited your wallet and the transaction is now complete.',
      recipientName: user.name,
      paragraphs: [
        'The updated wallet balance is reflected in your account immediately.',
        'If you need the transaction reviewed, contact support and reference the wallet activity timestamp shown in your dashboard.',
      ],
      highlights: [
        `Asset: ${current.symbol}`,
        `Amount: ${formatAmountLabel(amount)} ${current.symbol}`,
        `Updated balance: ${formatAmountLabel(updatedAsset.balance)} ${current.symbol}`,
        `Processed at: ${updatedAt}`,
      ],
      ctaLabel: 'Open wallet',
      ctaUrl: await toClientUrl('/app'),
      signatureName: req.user.name,
      signatureRole: 'Wallet Operations',
    });
  }

  await appendAdminTimelineEntry(
    `${req.user.name} updated ${user.name}'s ${current.symbol} wallet`,
    updateSummary.length > 0
      ? `Asset ${current.symbol} on ${current.network}: ${updateSummary.join('; ')}.`
      : `Asset ${current.symbol} on ${current.network} was updated from the admin wallet controls.`,
  );

  return res.json({ ok: true });
});

// POST /api/admin/users/:userId/cards — issue a card for a user
app.post('/api/admin/users/:userId/cards', requireAuth, requireRole('admin'), async (req, res) => {
  const userId = Number(req.params.userId ?? 0);
  const user = await queryOne('SELECT * FROM users WHERE id = :id AND role = :role', { id: userId, role: 'user' });

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const holderName = String(req.body.holderName ?? user.name).trim();
  const brand = String(req.body.brand ?? 'Visa').trim() === 'Mastercard' ? 'Mastercard' : 'Visa';
  const last4 = String(req.body.last4 ?? '').replace(/\D/g, '').slice(-4);
  const initialBalance = Number(req.body.initialBalance ?? 0);
  const expiryMonth = String(req.body.expiryMonth ?? '').trim();
  const expiryYear = String(req.body.expiryYear ?? '').trim();
  const billingAddress = String(req.body.billingAddress ?? '').trim();
  const zipCode = String(req.body.zipCode ?? '').trim();
  const cvv = String(req.body.cvv ?? '').replace(/\D/g, '').slice(0, 4);

  if (last4.length !== 4) {
    return res.status(400).json({ message: 'Card last 4 digits are required.' });
  }

  if (!Number.isFinite(initialBalance) || initialBalance < 0) {
    return res.status(400).json({ message: 'Initial balance must be a valid positive amount.' });
  }

  const requestId = String(req.body.requestId ?? '').trim();
  const cards = parseJson(user.cards_json, []);
  const requestCard = requestId ? cards.find((card) => String(card.id) === requestId && Boolean(card.requestOnly)) : null;

  if (requestId && !requestCard) {
    return res.status(404).json({ message: 'Card request not found.' });
  }

  const cardId = createPrefixedId('card');
  const createdAt = createTimestampLabel();
  const nextCard = {
    id: cardId,
    label: `${holderName || user.name} ${brand}`.trim(),
    brand,
    last4,
    status: 'Review',
    spendLimitUsd: Number(initialBalance.toFixed(2)),
    utilizationUsd: 0,
    issuedAt: `Issued ${createdAt}`,
    expiry: expiryMonth && expiryYear ? `${expiryMonth}/${expiryYear}` : '',
    billingAddress,
    zipCode,
    cvv,
  };
  const remainingCards = requestId ? cards.filter((card) => String(card.id) !== requestId) : cards;

  await query(
    'UPDATE users SET cards_json = :cards, last_seen = :lastSeen WHERE id = :id',
    {
      id: userId,
      cards: JSON.stringify([nextCard, ...remainingCards]),
      lastSeen: `Updated ${createdAt}`,
    },
  );

  await appendAdminTimelineEntry(
    `${req.user.name} issued a new card for ${user.name}`,
    requestCard
      ? `${brand} card ending in ${last4} was issued from a pending application.`
      : `${brand} card ending in ${last4} was added from the admin dashboard.`,
  );

  await sendSystemEmailSafely({
    logContext: `card issued email to ${user.email}`,
    to: user.email,
    subject: `${brand} card issued`,
    title: 'Your card has been issued',
    preheader: `${brand} card ending in ${last4} is now active in your account records.`,
    intro: 'Your card request has been processed and the card record is now available.',
    recipientName: user.name,
    paragraphs: [
      'Card details are now attached to your account and visible from the wallet workspace.',
      'If funding was applied during issuance, the spend limit already reflects the approved amount.',
    ],
    highlights: [
      `Card brand: ${brand}`,
      `Card ending: ${last4}`,
      `Issued at: ${createdAt}`,
      `Spend limit: $${initialBalance.toFixed(2)}`,
    ],
    ctaLabel: 'Open cards',
    ctaUrl: await toClientUrl('/app/cards'),
    signatureName: req.user.name,
    signatureRole: 'Card Services Desk',
  });

  return res.status(201).json({ ok: true, cardId });
});

app.put('/api/admin/users/:userId/cards/:cardId', requireAuth, requireRole('admin'), async (req, res) => {
  const userId = Number(req.params.userId ?? 0);
  const cardId = String(req.params.cardId ?? '').trim();
  const user = await queryOne('SELECT * FROM users WHERE id = :id AND role = :role', { id: userId, role: 'user' });

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const cards = parseJson(user.cards_json, []);
  const current = cards.find((item) => item.id === cardId);

  if (!current) {
    return res.status(404).json({ message: 'Card record not found.' });
  }

  if (current.requestOnly) {
    return res.status(400).json({ message: 'This card request must be issued before it can be managed.' });
  }

  const action = String(req.body.action ?? '').trim().toLowerCase();
  const amount = Number(req.body.amount ?? 0);

  if (!['add-funds', 'subtract-funds', 'activate', 'freeze', 'review'].includes(action)) {
    return res.status(400).json({ message: 'A valid card action is required.' });
  }

  if (['add-funds', 'subtract-funds'].includes(action) && (!Number.isFinite(amount) || amount <= 0)) {
    return res.status(400).json({ message: 'A valid funding amount is required.' });
  }

  let updatedCard = current;
  const nextCards = cards.map((item) => {
    if (item.id !== cardId) {
      return item;
    }

    const nextItem = { ...item };

    if (action === 'add-funds') {
      nextItem.spendLimitUsd = Number((Number(nextItem.spendLimitUsd ?? 0) + amount).toFixed(2));
    }

    if (action === 'subtract-funds') {
      const nextAmount = Number(nextItem.spendLimitUsd ?? 0) - amount;
      if (nextAmount < 0) {
        return nextItem;
      }
      nextItem.spendLimitUsd = Number(nextAmount.toFixed(2));
    }

    if (action === 'activate') {
      nextItem.status = 'Active';
    }

    if (action === 'freeze') {
      nextItem.status = 'Frozen';
    }

    if (action === 'review') {
      nextItem.status = 'Review';
    }

    updatedCard = nextItem;
    return nextItem;
  });

  if (action === 'subtract-funds' && Number(updatedCard.spendLimitUsd ?? 0) === Number(current.spendLimitUsd ?? 0)) {
    return res.status(400).json({ message: 'Funding adjustment would reduce the card below zero.' });
  }

  await query(
    'UPDATE users SET cards_json = :cards, last_seen = :lastSeen WHERE id = :id',
    {
      id: userId,
      cards: JSON.stringify(nextCards),
      lastSeen: `Updated ${createTimestampLabel()}`,
    },
  );

  await appendAdminTimelineEntry(
    `${req.user.name} updated ${user.name}'s card`,
    `${current.brand} card ending in ${current.last4} was updated from the admin dashboard.`,
  );

  return res.json({ ok: true });
});

app.delete('/api/admin/users/:userId/cards/:cardId', requireAuth, requireRole('admin'), async (req, res) => {
  const userId = Number(req.params.userId ?? 0);
  const cardId = String(req.params.cardId ?? '').trim();
  const user = await queryOne('SELECT * FROM users WHERE id = :id AND role = :role', { id: userId, role: 'user' });

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const cards = parseJson(user.cards_json, []);
  const current = cards.find((item) => item.id === cardId);

  if (!current) {
    return res.status(404).json({ message: 'Card record not found.' });
  }

  await query(
    'UPDATE users SET cards_json = :cards, last_seen = :lastSeen WHERE id = :id',
    {
      id: userId,
      cards: JSON.stringify(cards.filter((item) => item.id !== cardId)),
      lastSeen: `Updated ${createTimestampLabel()}`,
    },
  );

  await appendAdminTimelineEntry(
    `${req.user.name} deleted ${user.name}'s card`,
    `${current.brand} card ending in ${current.last4} was removed from the admin dashboard.`,
  );

  return res.json({ ok: true });
});

app.get('/api/admin/users/:userId', requireAuth, requireRole('admin'), async (req, res) => {
  const userId = Number(req.params.userId ?? 0);
  const user = await queryOne('SELECT * FROM users WHERE id = :id AND role = :role', { id: userId, role: 'user' });

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const marketAssets = priceFeed.getMarketAssets();
  const settingsWallets = normalizeWalletSettings(await getSetting('wallets', {}), marketAssets);
  return res.json(mapAdminUser(user, { walletSettings: settingsWallets, marketAssets }));
});

// POST /api/admin/users/:userId/notify -- send a custom transaction alert to a user
app.post('/api/admin/users/:userId/notify', requireAuth, requireRole('admin'), async (req, res) => {
  const userId = Number(req.params.userId ?? 0);
  const user = await queryOne('SELECT * FROM users WHERE id = :id AND role = :role', { id: userId, role: 'user' });
  if (!user) return res.status(404).json({ message: 'User not found.' });

  const type = String(req.body.type ?? 'Transfer').trim();
  const asset = String(req.body.asset ?? '').trim().toUpperCase();
  const amount = String(req.body.amount ?? '').trim();
  const subject = String(req.body.subject ?? '').trim();
  const messageText = String(req.body.message ?? '').trim();
  const createTxn = req.body.createTransaction === true || req.body.createTransaction === 'true';

  if (!subject || !messageText) {
    return res.status(400).json({ message: 'Subject and message are required.' });
  }

  const allowedTypes = ['Deposit', 'Withdrawal', 'Transfer', 'Swap'];
  const resolvedType = allowedTypes.includes(type) ? type : 'Transfer';
  const notifTitle = asset && amount ? (resolvedType + ': ' + amount + ' ' + asset) : subject;

  const nextNotifications = [
    createUserNotification({
      title: notifTitle,
      message: messageText,
      tone: resolvedType === 'Deposit' ? 'success' : resolvedType === 'Withdrawal' ? 'warning' : 'info',
      category: 'Transfers',
    }),
    ...parseJson(user.notifications_json, []),
  ].slice(0, 20);

  const updatedAt = createTimestampLabel();

  if (createTxn && asset && amount) {
    await query(
      `INSERT INTO transactions (
        id, user_id, type, asset, amount, channel, destination, status, created_at_label,
        from_asset, to_asset, which_crypto, network_fee, rate
      ) VALUES (
        :id, :userId, :type, :asset, :amount, :channel, :destination, 'Completed', :createdAt,
        :fromAsset, '', :whichCrypto, '0', '0'
      )`,
      {
        id: createPrefixedId('txn'),
        userId,
        type: resolvedType,
        asset,
        amount: amount + ' ' + asset,
        channel: 'Admin Transaction',
        destination: messageText.slice(0, 80),
        createdAt: updatedAt,
        fromAsset: asset,
        whichCrypto: asset,
      },
    );
  }

  await query('UPDATE users SET notifications_json = :notifications WHERE id = :id', {
    id: userId,
    notifications: JSON.stringify(nextNotifications),
  });

  await sendSystemEmailSafely({
    logContext: 'admin transaction alert to ' + user.email,
    to: user.email,
    subject,
    title: subject,
    preheader: messageText.slice(0, 100),
    intro: messageText,
    recipientName: user.name,
    paragraphs: [
      'This is an official communication from your wallet operations team.',
      'If you have any questions regarding this transaction, please contact support.',
    ],
    highlights: [
      ...(asset && amount ? ['Asset: ' + asset, 'Amount: ' + amount + ' ' + asset] : []),
      'Processed at: ' + updatedAt,
    ],
    ctaLabel: 'Open wallet',
    ctaUrl: await toClientUrl('/app'),
    signatureName: req.user.name,
    signatureRole: 'Wallet Operations',
  });

  await appendAdminTimelineEntry(
    req.user.name + ' sent a transaction alert to ' + user.name,
    'Type: ' + resolvedType + (asset && amount ? ' -- ' + amount + ' ' + asset : '') + '. Subject: "' + subject + '".',
  );

  return res.json({ ok: true });
});

// PUT /api/admin/settings/:section — save general, email, or wallets settings
app.put('/api/admin/settings/:section', requireAuth, requireRole('admin'), async (req, res) => {
  const section = String(req.params.section ?? '').trim().toLowerCase();

  if (!['general', 'email', 'wallets'].includes(section)) {
    return res.status(400).json({ message: 'Invalid settings section.' });
  }

  const current = await getSetting(section, {});

  // For email: preserve the stored password unless a new one is explicitly provided
  if (section === 'email') {
    const incomingPassword = String(req.body.mailPassword ?? '').trim();
    const next = { ...current, ...req.body };
    delete next.templates;

    if (!incomingPassword) {
      // Keep the existing stored password
      next.mailPassword = current.mailPassword ?? '';
    }

    // Never expose the raw password back — only store a masked hint
    if (next.mailPassword) {
      next.mailPasswordMasked = '********';
    } else {
      delete next.mailPasswordMasked;
    }

    await upsertSetting('email', next);
    return res.json({ ok: true });
  }

  if (section === 'wallets') {
    const marketAssets = priceFeed.getMarketAssets();
    const next = normalizeWalletSettings({ ...current, ...req.body }, marketAssets);
    await upsertSetting('wallets', next);
    return res.json({ ok: true });
  }

  await upsertSetting(section, { ...current, ...req.body });
  return res.json({ ok: true });
});

// POST /api/admin/upload/logo — upload a logo image file (stored in PostgreSQL)
app.post('/api/admin/upload/logo', requireAuth, requireRole('admin'), (req, res) => {
  logoUpload.single('logo')(req, res, async (err) => {
    if (err) {
      const message = err instanceof multer.MulterError
        ? (err.code === 'LIMIT_FILE_SIZE' ? 'Logo file must be under 2 MB.' : err.message)
        : err.message || 'Upload failed.';
      return res.status(400).json({ message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file was uploaded.' });
    }

    const id = createPrefixedId('logo');
    await storeFile(id, req.file.buffer, req.file.mimetype, sanitizeFileName(req.file.originalname, 'logo'));
    const url = `/api/files/${id}`;

    const current = await getSetting('general', {});
    await upsertSetting('general', { ...current, logoUrl: url });

    return res.json({ ok: true, url });
  });
});

// POST /api/admin/upload/favicon — upload a favicon image file (stored in PostgreSQL)
app.post('/api/admin/upload/favicon', requireAuth, requireRole('admin'), (req, res) => {
  faviconUpload.single('favicon')(req, res, async (err) => {
    if (err) {
      const message = err instanceof multer.MulterError
        ? (err.code === 'LIMIT_FILE_SIZE' ? 'Favicon file must be under 512 KB.' : err.message)
        : err.message || 'Upload failed.';
      return res.status(400).json({ message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file was uploaded.' });
    }

    const id = createPrefixedId('favicon');
    await storeFile(id, req.file.buffer, req.file.mimetype, sanitizeFileName(req.file.originalname, 'favicon'));
    const url = `/api/files/${id}`;

    const current = await getSetting('general', {});
    await upsertSetting('general', { ...current, faviconUrl: url });

    return res.json({ ok: true, url });
  });
});

// POST /api/admin/email/send — send a bulk or targeted email from admin panel
app.post('/api/admin/email/send', requireAuth, requireRole('admin'), async (req, res) => {
  const scope = String(req.body.scope ?? 'all').trim().toLowerCase();
  const userId = req.body.userId ? Number(req.body.userId) : null;
  const subject = String(req.body.subject ?? '').trim();
  const message = String(req.body.message ?? '').trim();

  if (!subject || !message) {
    return res.status(400).json({ message: 'Subject and message are required.' });
  }

  let recipients = [];

  if (scope === 'user' && userId) {
    const target = await queryOne('SELECT id, name, email FROM users WHERE id = :id AND role = :role', { id: userId, role: 'user' });
    if (!target) {
      return res.status(404).json({ message: 'Target user not found.' });
    }
    recipients = [target];
  } else {
    recipients = await query('SELECT id, name, email FROM users WHERE role = :role AND status != :status', { role: 'user', status: 'Suspended' });
  }

  if (!recipients.length) {
    return res.json({ sentCount: 0, failedCount: 0, totalRecipients: 0, failedRecipients: [] });
  }

  let client;
  try {
    client = await createMailClient();
  } catch (error) {
    return res.status(500).json({ message: `Email delivery is not configured: ${error.message}` });
  }

  const paragraphs = messageToParagraphs(message);
  const brandName = await getBrandName();
  let sentCount = 0;
  let failedCount = 0;
  const failedRecipients = [];

  for (const recipient of recipients) {
    try {
      await deliverBrandedEmail(client, {
        to: recipient.email,
        subject,
        title: subject,
        preheader: paragraphs[0] ?? subject,
        intro: paragraphs[0] ?? '',
        recipientName: recipient.name,
        paragraphs: paragraphs.slice(1),
        signatureName: req.user.name,
        signatureRole: `${brandName} Operations`,
      });
      sentCount++;
    } catch {
      failedCount++;
      failedRecipients.push(recipient.email);
    }
  }

  return res.json({
    sentCount,
    failedCount,
    totalRecipients: recipients.length,
    failedRecipients,
  });
});

// PUT /api/admin/kyc/:caseId — update KYC case status and note
app.put('/api/admin/kyc/:caseId', requireAuth, requireRole('admin'), async (req, res) => {
  const caseId = String(req.params.caseId ?? '').trim();
  const status = req.body.status ? pickAllowedValue(req.body.status, adminKycStatuses, '') : '';
  const note = req.body.note !== undefined ? String(req.body.note).trim() : null;

  if (!caseId) {
    return res.status(400).json({ message: 'Case ID is required.' });
  }

  const existing = await queryOne('SELECT * FROM kyc_cases WHERE id = :id', { id: caseId });
  if (!existing) {
    return res.status(404).json({ message: 'KYC case not found.' });
  }

  const targetUser = await queryOne('SELECT * FROM users WHERE id = :id', { id: existing.user_id });
  const updates = [];
  const params = { id: caseId };
  const nextStatus = status || existing.status;
  const nextNote = note !== null ? note : (existing.note ?? '');

  if (status) {
    updates.push('status = :status');
    params.status = status;
  }

  if (note !== null) {
    updates.push('note = :note');
    params.note = note;
  }

  if (updates.length) {
    await query(`UPDATE kyc_cases SET ${updates.join(', ')} WHERE id = :id`, params);
  }

  if (targetUser) {
    const documents = readKycDocuments(existing);
    const nextChecklist = documents.length
      ? buildKycChecklist({ documents, status: nextStatus, reviewNote: nextNote })
      : parseJson(targetUser.kyc_checklist_json, []);
    const nextNotifications = parseJson(targetUser.notifications_json, []);

    if (status) {
      nextNotifications.unshift(
        createUserNotification({
          title: nextStatus === 'Approved'
            ? 'KYC approved'
            : nextStatus === 'Needs review'
              ? 'KYC needs attention'
              : 'KYC review updated',
          message: nextStatus === 'Approved'
            ? 'Your verification case was approved and the account review is complete.'
            : nextStatus === 'Needs review'
              ? (nextNote || 'Compliance requested clearer documents or more information.')
              : 'Your verification case remains pending manual review.',
          tone: nextStatus === 'Approved' ? 'success' : nextStatus === 'Needs review' ? 'warning' : 'info',
        }),
      );
    }

    await query(
      `UPDATE users
       SET kyc_status = :kycStatus,
           kyc_checklist_json = :checklist,
           notifications_json = :notifications,
           last_seen = :lastSeen
       WHERE id = :id`,
      {
        id: targetUser.id,
        kycStatus: nextStatus,
        checklist: JSON.stringify(nextChecklist),
        notifications: JSON.stringify(nextNotifications.slice(0, 20)),
        lastSeen: `Updated ${createTimestampLabel()}`,
      },
    );

    const emailSettings = await getSetting('email', {});
    if (status === 'Approved' && emailSettings.notifyOnKycApproval !== false) {
      const brandName = await getBrandName();
      await sendSystemEmailSafely({
        logContext: `kyc approval email to ${targetUser.email}`,
        to: targetUser.email,
        subject: `Your ${brandName} verification is approved`,
        title: 'Verification approved',
        preheader: 'Your KYC review is complete and the case is now approved.',
        intro: 'The compliance team approved your verification case.',
        recipientName: targetUser.name,
        paragraphs: [
          'Your account now reflects an approved verification state in the client dashboard.',
          'If legal identity details or source-of-funds documents change later, submit a fresh document set before your next high-limit transfer window.',
        ],
        highlights: [
          `Case ID: ${caseId}`,
          `Approved: ${createTimestampLabel()}`,
          'Current status: Approved',
        ],
        ctaLabel: 'Open KYC center',
        ctaUrl: await toClientUrl('/app/kyc'),
        signatureName: req.user.name,
        signatureRole: 'Compliance Desk',
      });
    }
  }

  await appendAdminTimelineEntry(
    `${req.user.name} updated KYC case ${caseId}`,
    `Status set to ${nextStatus} for case ${caseId}.`,
  );

  return res.json({ ok: true });
});

// PUT /api/admin/transactions/:id — update a transaction status
app.put('/api/admin/transactions/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const transactionId = String(req.params.id ?? '').trim();
  const status = req.body.status ? pickAllowedValue(req.body.status, adminTransactionStatuses, '') : '';

  if (!transactionId || !status) {
    return res.status(400).json({ message: 'Transaction ID and valid status are required.' });
  }

  const existing = await queryOne('SELECT * FROM transactions WHERE id = :id', { id: transactionId });
  if (!existing) {
    return res.status(404).json({ message: 'Transaction not found.' });
  }

  await query('UPDATE transactions SET status = :status WHERE id = :id', { status, id: transactionId });

  await appendAdminTimelineEntry(
    `${req.user.name} updated transaction ${transactionId}`,
    `Status changed to ${status} for ${existing.type} of ${existing.amount}.`,
  );

  return res.json({ ok: true });
});

// GET /api/admin/profile — load admin operator profile
app.get('/api/admin/profile', requireAuth, requireRole('admin'), async (req, res) => {
  const profile = await getAdminProfileState(req.user);
  return res.json({ profile });
});

// PUT /api/admin/profile — save admin operator profile
app.put('/api/admin/profile', requireAuth, requireRole('admin'), async (req, res) => {
  const current = await getAdminProfileState(req.user);
  const next = {
    fullName: String(req.body.fullName ?? current.fullName).trim(),
    email: String(req.body.email ?? current.email).trim(),
    role: String(req.body.role ?? current.role).trim(),
    timezone: String(req.body.timezone ?? current.timezone).trim(),
    profileNote: String(req.body.profileNote ?? current.profileNote).trim(),
  };

  await upsertSetting('adminProfile', next);
  return res.json({ profile: next });
});

// POST /api/admin/transactions — create a new transaction record
app.post('/api/admin/transactions', requireAuth, requireRole('admin'), async (req, res) => {
  const userId = Number(req.body.userId ?? 0);
  const type = String(req.body.type ?? 'Deposit').trim();
  const asset = String(req.body.asset ?? '').trim();
  const amount = String(req.body.amount ?? '').trim();
  const channel = String(req.body.channel ?? '').trim();
  const destination = String(req.body.destination ?? '').trim();
  const status = pickAllowedValue(req.body.status, adminTransactionStatuses, 'Pending');
  const fromAsset = String(req.body.fromAsset ?? '').trim();
  const toAsset = String(req.body.toAsset ?? '').trim();
  const whichCrypto = String(req.body.whichCrypto ?? asset).trim();
  const networkFee = String(req.body.networkFee ?? '').trim();
  const rate = String(req.body.rate ?? '').trim();

  if (!userId || !asset || !amount) {
    return res.status(400).json({ message: 'User, asset, and amount are required.' });
  }

  const targetUser = await queryOne('SELECT id FROM users WHERE id = :id AND role = :role', { id: userId, role: 'user' });
  if (!targetUser) {
    return res.status(404).json({ message: 'Target user not found.' });
  }

  const transactionId = createPrefixedId('txn');
  const createdAt = createTimestampLabel();

  await query(
    `INSERT INTO transactions (
      id, user_id, type, asset, amount, channel, destination, status, created_at_label,
      from_asset, to_asset, which_crypto, network_fee, rate
    ) VALUES (
      :id, :userId, :type, :asset, :amount, :channel, :destination, :status, :createdAt,
      :fromAsset, :toAsset, :whichCrypto, :networkFee, :rate
    )`,
    {
      id: transactionId,
      userId,
      type,
      asset,
      amount,
      channel,
      destination,
      status,
      createdAt,
      fromAsset,
      toAsset,
      whichCrypto,
      networkFee,
      rate,
    },
  );

  await appendAdminTimelineEntry(
    `${req.user.name} created a ${type} transaction`,
    `${amount} ${asset} record added for user #${userId} via the admin console.`,
  );

  return res.status(201).json({ ok: true, transactionId });
});

// DELETE /api/admin/transactions/:id — delete a transaction record
app.delete('/api/admin/transactions/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const transactionId = String(req.params.id ?? '').trim();

  if (!transactionId) {
    return res.status(400).json({ message: 'Transaction ID is required.' });
  }

  const existing = await queryOne('SELECT * FROM transactions WHERE id = :id', { id: transactionId });
  if (!existing) {
    return res.status(404).json({ message: 'Transaction not found.' });
  }

  await query('DELETE FROM transactions WHERE id = :id', { id: transactionId });

  await appendAdminTimelineEntry(
    `${req.user.name} deleted transaction ${transactionId}`,
    `${existing.type} of ${existing.amount} (${existing.asset}) was removed from the ledger.`,
  );

  return res.json({ ok: true });
});

// POST /api/admin/alerts — add a new dashboard alert
app.post('/api/admin/alerts', requireAuth, requireRole('admin'), async (req, res) => {
  const text = String(req.body.text ?? '').trim();
  if (!text) {
    return res.status(400).json({ message: 'Alert text is required.' });
  }
  const dashboardMeta = await getSetting('adminDashboard', { alerts: [], timeline: [] });
  const nextAlerts = [text, ...(dashboardMeta.alerts ?? [])].slice(0, 10);
  await upsertSetting('adminDashboard', { ...dashboardMeta, alerts: nextAlerts });
  return res.json({ ok: true, alerts: nextAlerts });
});

// DELETE /api/admin/alerts/:index — dismiss a dashboard alert by index
app.delete('/api/admin/alerts/:index', requireAuth, requireRole('admin'), async (req, res) => {
  const index = Number(req.params.index ?? -1);
  const dashboardMeta = await getSetting('adminDashboard', { alerts: [], timeline: [] });
  const current = Array.isArray(dashboardMeta.alerts) ? dashboardMeta.alerts : [];
  if (index < 0 || index >= current.length) {
    return res.status(400).json({ message: 'Invalid alert index.' });
  }
  const nextAlerts = current.filter((_, i) => i !== index);
  await upsertSetting('adminDashboard', { ...dashboardMeta, alerts: nextAlerts });
  return res.json({ ok: true, alerts: nextAlerts });
});

// PUT /api/admin/users/:userId — update user profile fields
app.put('/api/admin/users/:userId', requireAuth, requireRole('admin'), async (req, res) => {
  const userId = Number(req.params.userId ?? 0);
  const user = await queryOne('SELECT * FROM users WHERE id = :id AND role = :role', { id: userId, role: 'user' });

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const updates = [];
  const params = { id: userId };

  const allowedFields = {
    name: 'name',
    email: 'email',
    phone: 'phone',
    city: 'city',
    country: 'country',
    deskLabel: 'desk_label',
    tier: 'tier',
    status: 'status',
    kycStatus: 'kyc_status',
    riskLevel: 'risk_level',
    plan: 'plan_name',
    note: 'note',
  };

  for (const [bodyKey, dbColumn] of Object.entries(allowedFields)) {
    if (req.body[bodyKey] !== undefined) {
      const paramKey = bodyKey;
      updates.push(`${dbColumn} = :${paramKey}`);
      params[paramKey] = String(req.body[bodyKey]).trim();
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: 'No valid fields provided.' });
  }

  updates.push('last_seen = :lastSeen');
  params.lastSeen = `Updated ${createTimestampLabel()}`;

  await query(`UPDATE users SET ${updates.join(', ')} WHERE id = :id`, params);

  await appendAdminTimelineEntry(
    `${req.user.name} updated ${user.name}'s profile`,
    `Fields updated: ${Object.keys(allowedFields).filter((key) => req.body[key] !== undefined).join(', ')}.`,
  );

  const updatedUser = await queryOne('SELECT * FROM users WHERE id = :id', { id: userId });
  const marketAssets = priceFeed.getMarketAssets();
  const settingsWallets = normalizeWalletSettings(await getSetting('wallets', {}), marketAssets);
  return res.json(mapAdminUser(updatedUser, { walletSettings: settingsWallets, marketAssets }));
});

app.use((error, _req, res, next) => {
  if (!error) {
    return next();
  }

  if (res.headersSent) {
    return next(error);
  }

  const status = error.message === 'Origin not allowed by CORS.' ? 403 : 400;
  return res.status(status).json({ message: error.message || 'Request failed.' });
});

// Keepalive ping — used by external cron to prevent Render free-tier spin-down
app.get('/ping', (_req, res) => res.status(200).send('pong'));

app.use('/api', (_req, res) => {
  return res.status(404).json({ message: 'API endpoint not found.' });
});

// Fallback to index.html for React Router compatibility (production only)
app.get('{*path}', (_req, res) => {
  res.sendFile(join(distDir, 'index.html'));
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`[shutdown] Received ${signal}. Closing database pool...`);
  try {
    await closeDb();
    console.log('[shutdown] Database pool closed cleanly.');
  } catch (error) {
    console.error('[shutdown] Error closing database:', error);
  }
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Async startup — initialise schema before accepting requests
const startServer = async () => {
  await initSchema();

  app.listen(config.apiPort, () => {
    console.log(`API server running on http://localhost:${config.apiPort}`);

    const runPriceTask = async () => {
      try {
        await priceFeed.update();
      } catch (error) {
        console.error('Price Task failed', error);
      }
    };

    void runPriceTask();
    setInterval(runPriceTask, 60000);
  });
};

startServer().catch((err) => {
  console.error('[startup] Fatal error:', err);
  process.exit(1);
});
