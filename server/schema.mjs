import { getPool } from './db.mjs';
import { seedUsers, seedTransactions, seedKycCases, seedSettings } from './data/seed.mjs';
import { hashSecret } from './auth.mjs';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'user',
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  uuid TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT '',
  kyc_status TEXT NOT NULL DEFAULT '',
  portfolio_usd NUMERIC(20,2) NOT NULL DEFAULT 0,
  available_usd NUMERIC(20,2) NOT NULL DEFAULT 0,
  portfolio_change_usd NUMERIC(20,2) NOT NULL DEFAULT 0,
  portfolio_change_pct NUMERIC(10,4) NOT NULL DEFAULT 0,
  last_seen TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  passcode_hash TEXT NOT NULL,
  holdings_json TEXT NOT NULL DEFAULT '[]',
  cards_json TEXT NOT NULL DEFAULT '[]',
  deposit_activity_json TEXT NOT NULL DEFAULT '[]',
  withdrawal_activity_json TEXT NOT NULL DEFAULT '[]',
  notifications_json TEXT NOT NULL DEFAULT '[]',
  address_book_json TEXT NOT NULL DEFAULT '[]',
  sessions_json TEXT NOT NULL DEFAULT '[]',
  kyc_checklist_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  asset TEXT NOT NULL,
  amount TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT '',
  destination TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL,
  created_at_label TEXT NOT NULL DEFAULT '',
  from_asset TEXT NOT NULL DEFAULT '',
  to_asset TEXT NOT NULL DEFAULT '',
  which_crypto TEXT NOT NULL DEFAULT '',
  network_fee TEXT NOT NULL DEFAULT '',
  rate TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS kyc_cases (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  document_type TEXT NOT NULL,
  submitted_at_label TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT '',
  note TEXT,
  documents_json TEXT NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS file_uploads (
  id TEXT PRIMARY KEY,
  original_name TEXT NOT NULL DEFAULT '',
  mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  size_bytes INTEGER NOT NULL DEFAULT 0,
  data BYTEA NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

const seedDatabase = async (pool) => {
  // Seed users if table is empty
  const { rows: userCheck } = await pool.query('SELECT COUNT(*) AS count FROM users');
  if (parseInt(userCheck[0].count, 10) === 0) {
    console.log('[schema] Seeding users...');
    for (const user of seedUsers) {
      const passwordHash = await hashSecret(user.password);
      const passcodeHash = await hashSecret(user.passcode);
      await pool.query(
        `INSERT INTO users (
          id, role, name, email, uuid, country,
          status, kyc_status, portfolio_usd, available_usd,
          portfolio_change_usd, portfolio_change_pct,
          last_seen, password_hash, passcode_hash,
          holdings_json, cards_json, deposit_activity_json, withdrawal_activity_json,
          notifications_json, address_book_json, sessions_json, kyc_checklist_json
        ) VALUES (
          $1,$2,$3,$4,$5,$6,
          $7,$8,$9,$10,
          $11,$12,
          $13,$14,$15,
          $16,$17,$18,$19,
          $20,$21,$22,$23
        ) ON CONFLICT (id) DO NOTHING`,
        [
          user.id, user.role, user.name, user.email,
          user.uuid ?? '', user.country ?? '',
          user.status ?? '', user.kycStatus ?? '',
          user.portfolioUsd ?? 0, user.availableUsd ?? 0,
          user.portfolioChangeUsd ?? 0, user.portfolioChangePct ?? 0,
          user.lastSeen ?? '', passwordHash, passcodeHash,
          JSON.stringify(user.holdings ?? []),
          JSON.stringify(user.cards ?? []),
          JSON.stringify(user.depositActivity ?? []),
          JSON.stringify(user.withdrawalActivity ?? []),
          JSON.stringify(user.notifications ?? []),
          JSON.stringify(user.addressBook ?? []),
          JSON.stringify(user.recentSessions ?? []),
          JSON.stringify(user.kycChecklist ?? []),
        ]
      );
    }
    // Reset the sequence so new users get IDs after the seeded ones
    const maxId = Math.max(...seedUsers.map((u) => u.id));
    await pool.query(`SELECT setval('users_id_seq', $1)`, [maxId]);
    console.log(`[schema] ${seedUsers.length} users seeded. Sequence reset to ${maxId}.`);
  }

  // Seed transactions if empty
  const { rows: txnCheck } = await pool.query('SELECT COUNT(*) AS count FROM transactions');
  if (parseInt(txnCheck[0].count, 10) === 0) {
    console.log('[schema] Seeding transactions...');
    for (const txn of seedTransactions) {
      await pool.query(
        `INSERT INTO transactions (id, user_id, type, asset, amount, channel, destination, status, created_at_label, from_asset, to_asset, which_crypto, network_fee, rate)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) ON CONFLICT (id) DO NOTHING`,
        [
          txn.id, txn.userId, txn.type, txn.asset, txn.amount,
          txn.channel ?? '', txn.destination ?? '', txn.status,
          txn.createdAt ?? '', txn.fromAsset ?? '', txn.toAsset ?? '',
          txn.whichCrypto ?? '', txn.networkFee ?? '', txn.rate ?? '',
        ]
      );
    }
    console.log(`[schema] ${seedTransactions.length} transactions seeded.`);
  }

  // Seed KYC cases if empty
  const { rows: kycCheck } = await pool.query('SELECT COUNT(*) AS count FROM kyc_cases');
  if (parseInt(kycCheck[0].count, 10) === 0) {
    console.log('[schema] Seeding KYC cases...');
    for (const kyc of seedKycCases) {
      await pool.query(
        `INSERT INTO kyc_cases (id, user_id, document_type, submitted_at_label, country, status, note, documents_json)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO NOTHING`,
        [kyc.id, kyc.userId, kyc.documentType, kyc.submittedAt ?? '', kyc.country ?? '', kyc.status ?? '', kyc.note ?? null, '[]']
      );
    }
    console.log(`[schema] ${seedKycCases.length} KYC cases seeded.`);
  }

  // Seed settings if empty
  const { rows: settingsCheck } = await pool.query('SELECT COUNT(*) AS count FROM settings');
  if (parseInt(settingsCheck[0].count, 10) === 0) {
    console.log('[schema] Seeding settings...');
    for (const [key, value] of Object.entries(seedSettings)) {
      await pool.query(
        `INSERT INTO settings (setting_key, setting_value) VALUES ($1, $2) ON CONFLICT (setting_key) DO NOTHING`,
        [key, JSON.stringify(value)]
      );
    }
    console.log('[schema] Settings seeded.');
  }
};

export const initSchema = async () => {
  const pool = getPool();
  console.log('[schema] Initializing database schema...');
  await pool.query(SCHEMA_SQL);

  // Migrations: add columns that may be missing from pre-existing tables
  await pool.query(`
    ALTER TABLE kyc_cases
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  `);

  // Migrations: remove deprecated columns from pre-existing tables
  await pool.query(`ALTER TABLE users DROP COLUMN IF EXISTS city`);
  await pool.query(`ALTER TABLE users DROP COLUMN IF EXISTS tier`);
  await pool.query(`ALTER TABLE users DROP COLUMN IF EXISTS risk_level`);
  await pool.query(`ALTER TABLE users DROP COLUMN IF EXISTS referrals_json`);
  await pool.query(`ALTER TABLE kyc_cases DROP COLUMN IF EXISTS risk_level`);
  await pool.query(`ALTER TABLE users DROP COLUMN IF EXISTS phone`);
  await pool.query(`ALTER TABLE users DROP COLUMN IF EXISTS note`);

  console.log('[schema] Schema ready.');
  await seedDatabase(pool);
};
