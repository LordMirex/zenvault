import cors from 'cors';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, extname, join } from 'path';
import multer from 'multer';
import { compareSecret, createAccessToken, createPendingToken, hashSecret, verifyToken } from './auth.mjs';
import { config } from './config.mjs';
import { query, queryOne } from './db.mjs';
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
  generateRecoveryCodes,
  issueSession,
  normalizeTwoFactorState,
  revokeOtherSessions,
  revokeSession,
} from './session-utils.mjs';
import { normalizeGeneralSettings, resolveSiteOrigin } from './settings.mjs';
import {
  buildEffectiveWalletAssets,
  buildWalletRailFallbacksFromHoldings,
  collectWalletRails,
  updateWalletRailPresets,
} from './wallets.mjs';
import { priceFeed } from './price-feed.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.disable('x-powered-by');
const allowedOrigins = new Set(
  [
    config.clientOrigin,
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

const passcodeLimiter = createRateLimitMiddleware({
  windowMs: 10 * 60 * 1000,
  max: 8,
  message: 'Too many passcode attempts. Please wait 10 minutes and try again.',
  keyBuilder: (req) => `${req.ip}:${String(req.body.pendingToken ?? '').slice(0, 24) || 'pending-session'}`,
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
      if (!origin || allowedOrigins.has(origin) || isReplitOrigin(origin)) {
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

// Serve uploaded files (logos, favicons) as static assets
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Serve the compiled React frontend directly configured for robust VPS deployments
app.use(express.static(join(__dirname, '../dist')));

// Multer configuration for logo/favicon uploads
const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, join(__dirname, 'uploads')),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = extname(file.originalname).toLowerCase() || '.png';
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const uploadFilter = (_req, file, cb) => {
  const allowed = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.ico', '.gif'];
  const ext = extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    return cb(null, true);
  }
  return cb(new Error('Only image files (PNG, JPG, SVG, WebP, ICO, GIF) are allowed.'));
};

const logoUpload = multer({ storage: uploadStorage, fileFilter: uploadFilter, limits: { fileSize: 2 * 1024 * 1024 } });
const faviconUpload = multer({ storage: uploadStorage, fileFilter: uploadFilter, limits: { fileSize: 512 * 1024 } });

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

const mapAdminUser = (user) => ({
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
  openCards: parseJson(user.cards_json).length,
  holdings: parseJson(user.holdings_json).map((holding) => ({
    id: holding.id,
    symbol: holding.symbol,
    name: holding.name,
    network: holding.network,
    icon: holding.icon,
    balance: holding.balance,
    valueUsd: holding.valueUsd,
    address: holding.address,
    status: holding.status ?? (holding.enabledByDefault ? 'Enabled' : 'Paused'),
  })),
  cards: parseJson(user.cards_json).map((card) => ({
    id: card.id,
    label: card.label,
    brand: card.brand,
    last4: card.last4,
    status: card.status === 'Active' ? 'Active' : card.status === 'Frozen' ? 'Frozen' : 'Review',
    spendLimitUsd: card.spendLimitUsd,
    utilizationUsd: card.utilizationUsd,
    issuedAt: card.issuedAt,
  })),
});

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

const getHoldingPrice = (holding) => {
  const explicitPrice = Number(holding.price ?? 0);
  if (explicitPrice > 0) {
    return explicitPrice;
  }

  const balance = Number(holding.balance ?? 0);
  if (balance <= 0) {
    return 0;
  }

  return Number(holding.valueUsd ?? 0) / balance;
};

const sumHoldingValue = (holdings = []) =>
  holdings.reduce((total, holding) => total + Number(holding.valueUsd ?? 0), 0);



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

const getAdminTwoFactorState = async () => {
  return normalizeTwoFactorState(await getSetting('adminTwoFactor', {}));
};

const getBrandName = async () => {
  const generalSettings = await getGeneralSettings();
  return String(generalSettings.siteName).trim();
};

const getClientBootstrap = async (userId) => {
  const user = await queryOne('SELECT * FROM users WHERE id = :id', { id: userId });
  const referralMilestones = await getSetting('referralMilestones', []);
  const recentReferrals = parseJson(user.referrals_json, []);
  
  const settingsWallets = await getSetting('wallets', {});
  const rails = collectWalletRails(settingsWallets, buildWalletRailFallbacksFromHoldings([parseJson(user.holdings_json)]));
  const rawAssets = buildEffectiveWalletAssets({ 
    user, 
    holdings: parseJson(user.holdings_json), 
    rails, 
    includeLegacyHoldings: true 
  });

  const livePrices = priceFeed.getAllPrices();
  const effectiveAssets = rawAssets.map((asset) => {
    const live = livePrices[asset.symbol];
    if (!live) return asset;
    const livePrice = live.price ?? asset.price;
    return {
      ...asset,
      price: livePrice,
      change: live.change ?? asset.change,
      valueUsd: Number((asset.balance * livePrice).toFixed(2)),
    };
  });

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
      portfolioUsd: Number(user.portfolio_usd),
      availableUsd: Number(user.available_usd),
      changeUsd: Number(user.portfolio_change_usd),
      changePct: Number(user.portfolio_change_pct),
      walletConnected: Boolean(user.wallet_connected),
    },
    walletAssets: effectiveAssets,
    depositActivity: parseJson(user.deposit_activity_json, []),
    withdrawalActivity: parseJson(user.withdrawal_activity_json, []),
    notificationItems: parseJson(user.notifications_json, []),
    addressBookEntries: parseJson(user.address_book_json, []),
    recentSessions: parseJson(user.sessions_json, []),
    kycChecklist: parseJson(user.kyc_checklist_json, []),
    referralMilestones,
    recentReferrals,
  };
};

const getAdminBootstrap = async () => {
  const users = await query('SELECT * FROM users WHERE role = :role ORDER BY id ASC', { role: 'user' });
  const transactions = await query('SELECT * FROM transactions ORDER BY created_at_label DESC');
  const kycCases = await query('SELECT * FROM kyc_cases ORDER BY id ASC');

  const adminUsers = users.map((user) => mapAdminUser(user));
  const settingsGeneral = await getGeneralSettings();
  const settingsEmail = await getSetting('email', {});
  const settingsWallets = await getSetting('wallets', {});
  const dashboardMeta = await getSetting('adminDashboard', { alerts: [], timeline: [] });
  const sanitizedEmailSettings = sanitizeEmailSettings(settingsEmail);

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
    adminKycCases: kycCases.map((item) => ({ id: String(item.id), userId: String(item.user_id), documentType: item.document_type, submittedAt: item.submitted_at_label, country: item.country, riskLevel: item.risk_level, status: item.status, note: item.note })),
    adminTransactions: transactions.map((transaction) => ({ id: String(transaction.id), userId: String(transaction.user_id), type: transaction.type, asset: transaction.asset, amount: transaction.amount, channel: transaction.channel, destination: transaction.destination, status: transaction.status, createdAt: transaction.created_at_label, fromAsset: transaction.from_asset, toAsset: transaction.to_asset, whichCrypto: transaction.which_crypto, networkFee: transaction.network_fee, rate: transaction.rate })),
    adminWalletRails: settingsWallets.rails ?? [],
    adminEmailTemplates: sanitizedEmailSettings.templates ?? [],
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
  return res.json({ prices, updatedAt });
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

  return res.json({
    pendingToken: createPendingToken(user),
    role: user.role,
    user: mapSessionUser(user),
    requiresPasscode: true,
  });
});

app.post('/api/auth/verify-passcode', passcodeLimiter, async (req, res) => {
  const pendingToken = String(req.body.pendingToken ?? '');
  const passcode = String(req.body.passcode ?? '');

  if (!pendingToken || !passcode) {
    return res.status(400).json({ message: 'Pending token and passcode are required.' });
  }

  let payload;

  try {
    payload = verifyToken(pendingToken);
  } catch {
    return res.status(401).json({ message: 'Pending session expired. Please log in again.' });
  }

  if (payload.type !== 'pending') {
    return res.status(401).json({ message: 'Invalid passcode session.' });
  }

  const user = await queryOne('SELECT * FROM users WHERE id = :id', { id: payload.userId });
  if (!user) {
    return res.status(401).json({ message: 'User not found.' });
  }

  const matches = await compareSecret(passcode, user.passcode_hash);
  if (!matches) {
    return res.status(401).json({ message: 'Incorrect passcode.' });
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
  const passcode = String(req.body.passcode ?? '');

  if (!fullName || !email || !password || !passcode) {
    return res.status(400).json({ message: 'Full name, email, password, and passcode are required.' });
  }

  if (passcode.length !== 6) {
    return res.status(400).json({ message: 'Passcode must be 6 digits.' });
  }

  const existing = await queryOne('SELECT id FROM users WHERE email = :email', { email });
  if (existing) {
    return res.status(409).json({ message: 'An account with that email already exists.' });
  }

  const nextIdRow = await queryOne('SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM users');
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
      passcodeHash: await hashSecret(passcode),
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
      highlights: [`Login email: ${email}`, 'Account status: Active', 'KYC status: Pending review'],
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

// FIX: was missing closing });
app.patch('/api/client/notifications/read-all', requireAuth, requireRole('user'), async (req, res) => {
  const notifications = parseJson(req.user.notifications_json).map((item) => ({ ...item, unread: false }));
  await query('UPDATE users SET notifications_json = :payload WHERE id = :id', { payload: JSON.stringify(notifications), id: req.user.id });
  return res.json({ notificationItems: notifications });
});

// FIX: was missing closing });
app.patch('/api/client/assets/:assetId/toggle', requireAuth, requireRole('user'), async (req, res) => {
  const assetId = String(req.params.assetId);
  const holdings = parseJson(req.user.holdings_json).map((asset) => (asset.id === assetId ? { ...asset, enabledByDefault: !asset.enabledByDefault } : asset));
  await query('UPDATE users SET holdings_json = :payload WHERE id = :id', { payload: JSON.stringify(holdings), id: req.user.id });
  return res.json({ walletAssets: holdings });
});

// FIX: was missing closing });
app.put('/api/client/security', requireAuth, requireRole('user'), async (req, res) => {
  const currentPassword = String(req.body.currentPassword ?? '');
  const newPassword = String(req.body.newPassword ?? '');
  const passcode = String(req.body.passcode ?? '');

  if (!currentPassword || !newPassword || !passcode) {
    return res.status(400).json({ message: 'Current password, new password, and passcode are required.' });
  }

  const currentMatches = await compareSecret(currentPassword, req.user.password_hash);
  const passcodeMatches = await compareSecret(passcode, req.user.passcode_hash);
  if (!currentMatches || !passcodeMatches) {
    return res.status(400).json({ message: 'Current password or passcode is incorrect.' });
  }

  const nextSessions = revokeOtherSessions(parseJson(req.user.sessions_json, []), req.auth.sessionId, `Password updated ${createTimestampLabel()}`);
  await query(
    'UPDATE users SET password_hash = :passwordHash, sessions_json = :sessions WHERE id = :id',
    {
      passwordHash: await hashSecret(newPassword),
      sessions: JSON.stringify(nextSessions),
      id: req.user.id,
    },
  );
  return res.json({ ok: true, message: 'Security details updated successfully.' });
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
  const asset = holdings.find((item) => item.id === assetId);

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

  // FIX: map callback was missing closing } and });
  const updatedHoldings = holdings.map((item) => {
    if (item.id !== assetId) {
      return item;
    }

    const nextBalance = Number((Number(item.balance) - totalDebit).toFixed(8));
    const nextValueUsd = Number((nextBalance * Number(item.price ?? 0)).toFixed(2));

    return {
      ...item,
      balance: nextBalance,
      valueUsd: nextValueUsd,
    };
  });

  const totalUsd = Number((totalDebit * Number(asset.price ?? 0)).toFixed(2));
  const nextPortfolioUsd = Math.max(Number(req.user.portfolio_usd) - totalUsd, 0);
  const nextAvailableUsd = Math.max(Number(req.user.available_usd) - totalUsd, 0);
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

  // FIX: res.status(201).json was missing closing }); and route handler was missing closing });
  return res.status(201).json({
    ok: true,
    transactionId,
    message: 'Withdrawal submitted successfully.',
  });
});

// FIX: was missing closing });
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
  const passcode = String(req.body.passcode ?? '123456');
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

  const nextIdRow = await queryOne('SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM users');
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
      passcodeHash: await hashSecret(passcode),
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
        `Temporary passcode: ${passcode}`,
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
  const password = String(req.body.password ?? '').trim();
  const passcode = String(req.body.passcode ?? '').trim();
  const existing = await queryOne('SELECT id, name, email FROM users WHERE id = :id AND role = :role', {
    id: userId,
    role: 'user',
  });

  if (!existing) {
    return res.status(404).json({ message: 'User not found.' });
  }

  if (!password || !passcode || passcode.length !== 6) {
    return res.status(400).json({ message: 'Password and a 6-digit passcode are required.' });
  }

  await query(
    'UPDATE users SET password_hash = :passwordHash, passcode_hash = :passcodeHash, sessions_json = :sessions WHERE id = :id',
    {
      id: userId,
      passwordHash: await hashSecret(password),
      passcodeHash: await hashSecret(passcode),
      sessions: '[]',
    },
  );

  await appendAdminTimelineEntry(
    `${req.user.name} updated ${existing.name}'s credentials`,
    `Password and passcode were refreshed for ${existing.email}.`,
  );

  return res.json({ ok: true });
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
  const current = holdings.find((item) => item.id === assetId);

  if (!current) {
    return res.status(404).json({ message: 'Asset record not found.' });
  }

  const action = String(req.body.action ?? '').trim().toLowerCase();
  const amount = Number(req.body.amount ?? 0);
  const nextStatus = req.body.status
    ? pickAllowedValue(req.body.status, adminHoldingStatuses, '')
    : '';
  const nextAddress = req.body.address ? String(req.body.address).trim() : '';

  if (action && (!['add', 'subtract'].includes(action) || !Number.isFinite(amount) || amount <= 0)) {
    return res.status(400).json({ message: 'A valid adjustment action and amount are required.' });
  }

  const updatedHoldings = holdings.map((item) => {
    if (item.id !== assetId) {
      return item;
    }

    const nextItem = { ...item };

    if (nextStatus) {
      nextItem.status = nextStatus;
      nextItem.enabledByDefault = nextStatus !== 'Paused';
    }

    if (nextAddress) {
      nextItem.address = nextAddress;
    }

    if (action) {
      const currentBalance = Number(nextItem.balance ?? 0);
      const price = getHoldingPrice(nextItem);
      const nextBalance = action === 'add' ? currentBalance + amount : currentBalance - amount;

      if (nextBalance < 0) {
        return nextItem;
      }

      nextItem.balance = Number(nextBalance.toFixed(8));
      nextItem.valueUsd = Number((nextItem.balance * price).toFixed(2));
    }

    return nextItem;
  });

  const nextTotal = sumHoldingValue(updatedHoldings);
  const updatedAsset = updatedHoldings.find((item) => item.id === assetId);

  if (action && Number(updatedAsset?.balance ?? 0) === Number(current.balance ?? 0)) {
    return res.status(400).json({ message: 'Adjustment would reduce the balance below zero.' });
  }

  await query(
    `UPDATE users
     SET holdings_json = :holdings,
         portfolio_usd = :portfolioUsd,
         available_usd = :availableUsd,
         last_seen = :lastSeen
     WHERE id = :id`,
    {
      id: userId,
      holdings: JSON.stringify(updatedHoldings),
      portfolioUsd: nextTotal,
      availableUsd: nextTotal,
      lastSeen: `Updated ${createTimestampLabel()}`,
    },
  );

  await appendAdminTimelineEntry(
    `${req.user.name} updated ${user.name}'s ${current.symbol} wallet`,
    `Asset ${current.symbol} on ${current.network} was adjusted from the admin wallet controls.`,
  );

  return res.json({ ok: true });
});

// GET /api/admin/users/:userId — fetch a single user's full detail
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

  const cards = parseJson(user.cards_json, []);
  const cardId = createPrefixedId('card');
  const nextCard = {
    id: cardId,
    label: `${holderName || user.name} ${brand}`.trim(),
    brand,
    last4,
    status: 'Review',
    spendLimitUsd: Number(initialBalance.toFixed(2)),
    utilizationUsd: 0,
    issuedAt: `Issued ${createTimestampLabel()}`,
    expiry: expiryMonth && expiryYear ? `${expiryMonth}/${expiryYear}` : '',
    billingAddress,
    zipCode,
    cvv,
  };

  await query(
    'UPDATE users SET cards_json = :cards, last_seen = :lastSeen WHERE id = :id',
    {
      id: userId,
      cards: JSON.stringify([nextCard, ...cards]),
      lastSeen: `Updated ${createTimestampLabel()}`,
    },
  );

  await appendAdminTimelineEntry(
    `${req.user.name} issued a new card for ${user.name}`,
    `${brand} card ending in ${last4} was added from the admin dashboard.`,
  );

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

  return res.json(mapAdminUser(user));
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
    const next = { ...current, ...req.body };
    const rails = next.rails && Array.isArray(next.rails) ? next.rails : [];
    await upsertSetting('wallets', { ...current, rails });
    return res.json({ ok: true });
  }

  await upsertSetting(section, { ...current, ...req.body });
  return res.json({ ok: true });
});

// POST /api/admin/upload/logo — upload a logo image file
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

    const url = `/uploads/${req.file.filename}`;

    // Auto-update general settings with the new logo URL
    const current = await getSetting('general', {});
    await upsertSetting('general', { ...current, logoUrl: url });

    return res.json({ ok: true, url });
  });
});

// POST /api/admin/upload/favicon — upload a favicon image file
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

    const url = `/uploads/${req.file.filename}`;

    // Auto-update general settings with the new favicon URL
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

  const updates = [];
  const params = { id: caseId };

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

  await appendAdminTimelineEntry(
    `${req.user.name} updated KYC case ${caseId}`,
    `Status set to ${status || existing.status} for case ${caseId}.`,
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

// GET /api/admin/2fa — load 2FA state
app.get('/api/admin/2fa', requireAuth, requireRole('admin'), async (_req, res) => {
  const state = await getAdminTwoFactorState();
  return res.json({ state });
});

// PUT /api/admin/2fa — toggle 2FA enabled/disabled
app.put('/api/admin/2fa', requireAuth, requireRole('admin'), async (req, res) => {
  const current = await getAdminTwoFactorState();
  const enabled = req.body.enabled === true;
  const next = {
    ...current,
    enabled,
    recoveryCodes: enabled && current.recoveryCodes.length === 0 ? generateRecoveryCodes(6) : current.recoveryCodes,
    lastUpdated: enabled ? createTimestampLabel() : (enabled === false && current.enabled ? createTimestampLabel() : current.lastUpdated),
  };

  await upsertSetting('adminTwoFactor', next);
  return res.json({ state: normalizeTwoFactorState(next) });
});

// POST /api/admin/2fa/recovery-codes — generate fresh recovery codes
app.post('/api/admin/2fa/recovery-codes', requireAuth, requireRole('admin'), async (_req, res) => {
  const current = await getAdminTwoFactorState();
  const next = {
    ...current,
    recoveryCodes: generateRecoveryCodes(6),
    lastUpdated: createTimestampLabel(),
  };

  await upsertSetting('adminTwoFactor', next);
  return res.json({ state: normalizeTwoFactorState(next) });
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
  return res.json(mapAdminUser(updatedUser));
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

app.use('/api', (_req, res) => {
  return res.status(404).json({ message: 'API endpoint not found.' });
});

// Fallback to index.html for React Router compatibility (production only)
app.get('{*path}', (_req, res) => {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  res.sendFile(join(__dirname, '../dist/index.html'));
});

app.listen(config.apiPort, () => {
  console.log(`API server running on http://localhost:${config.apiPort}`);

  // Initialize and start background price feed task
  const runPriceTask = async () => {
    try {
      await priceFeed.update();
      updateWalletRailPresets(priceFeed.getAllPrices());
    } catch (error) {
      console.error('Price Task failed', error);
    }
  };

  void runPriceTask();
  setInterval(runPriceTask, 60000);
});
