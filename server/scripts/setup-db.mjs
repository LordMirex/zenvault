import 'dotenv/config';
import pg from 'pg';
import { hashSecret } from '../auth.mjs';
import {
  seedKycCases,
  seedSettings,
  seedTransactions,
  seedUsers,
} from '../data/seed.mjs';

const { Pool } = pg;
const stringify = (value) => JSON.stringify(value ?? []);

const setup = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  const ddl = [
    'DROP TABLE IF EXISTS settings',
    'DROP TABLE IF EXISTS kyc_cases',
    'DROP TABLE IF EXISTS transactions',
    'DROP TABLE IF EXISTS users',
    `CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      role VARCHAR(16) NOT NULL,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL UNIQUE,
      phone VARCHAR(40) DEFAULT '',
      city VARCHAR(80) DEFAULT '',
      uuid VARCHAR(80) DEFAULT '',
      country VARCHAR(80) DEFAULT '',
      desk_label VARCHAR(120) DEFAULT '',
      tier VARCHAR(40) DEFAULT '',
      status VARCHAR(40) DEFAULT '',
      kyc_status VARCHAR(40) DEFAULT '',
      risk_level VARCHAR(40) DEFAULT '',
      portfolio_usd DECIMAL(18,2) DEFAULT 0,
      available_usd DECIMAL(18,2) DEFAULT 0,
      portfolio_change_usd DECIMAL(18,2) DEFAULT 0,
      portfolio_change_pct DECIMAL(10,2) DEFAULT 0,
      wallet_connected SMALLINT DEFAULT 1,
      plan_name VARCHAR(120) DEFAULT '',
      last_seen VARCHAR(120) DEFAULT '',
      note TEXT,
      password_hash VARCHAR(255) NOT NULL,
      passcode_hash VARCHAR(255) NOT NULL,
      holdings_json TEXT NOT NULL,
      cards_json TEXT NOT NULL,
      deposit_activity_json TEXT NOT NULL,
      withdrawal_activity_json TEXT NOT NULL,
      notifications_json TEXT NOT NULL,
      address_book_json TEXT NOT NULL,
      referrals_json TEXT NOT NULL,
      sessions_json TEXT NOT NULL,
      kyc_checklist_json TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE transactions (
      id VARCHAR(40) PRIMARY KEY,
      user_id INTEGER NOT NULL,
      type VARCHAR(40) NOT NULL,
      asset VARCHAR(80) NOT NULL,
      amount VARCHAR(120) NOT NULL,
      channel VARCHAR(120) DEFAULT '',
      destination VARCHAR(190) DEFAULT '',
      status VARCHAR(40) NOT NULL,
      created_at_label VARCHAR(120) DEFAULT '',
      from_asset VARCHAR(80) DEFAULT '',
      to_asset VARCHAR(80) DEFAULT '',
      which_crypto VARCHAR(80) DEFAULT '',
      network_fee VARCHAR(80) DEFAULT '',
      rate VARCHAR(80) DEFAULT ''
    )`,
    `CREATE TABLE kyc_cases (
      id VARCHAR(40) PRIMARY KEY,
      user_id INTEGER NOT NULL,
      document_type VARCHAR(190) NOT NULL,
      submitted_at_label VARCHAR(120) DEFAULT '',
      country VARCHAR(80) DEFAULT '',
      risk_level VARCHAR(40) DEFAULT '',
      status VARCHAR(40) DEFAULT '',
      note TEXT
    )`,
    `CREATE TABLE settings (
      setting_key VARCHAR(80) PRIMARY KEY,
      setting_value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
  ];

  for (const statement of ddl) {
    await pool.query(statement);
  }

  for (const user of seedUsers) {
    await pool.query(
      `INSERT INTO users (
        id, role, name, email, phone, city, uuid, country, desk_label, tier, status, kyc_status, risk_level,
        portfolio_usd, available_usd, portfolio_change_usd, portfolio_change_pct, wallet_connected, plan_name, last_seen, note,
        password_hash, passcode_hash, holdings_json, cards_json, deposit_activity_json, withdrawal_activity_json,
        notifications_json, address_book_json, referrals_json, sessions_json, kyc_checklist_json
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32)`,
      [
        user.id,
        user.role,
        user.name,
        user.email,
        user.phone,
        user.city,
        user.uuid,
        user.country,
        user.deskLabel,
        user.tier,
        user.status,
        user.kycStatus,
        user.riskLevel,
        user.portfolioUsd,
        user.availableUsd,
        user.portfolioChangeUsd,
        user.portfolioChangePct,
        user.walletConnected ? 1 : 0,
        user.plan,
        user.lastSeen,
        user.note,
        await hashSecret(user.password),
        await hashSecret(user.passcode),
        stringify(user.holdings),
        stringify(user.cards),
        stringify(user.depositActivity),
        stringify(user.withdrawalActivity),
        stringify(user.notifications),
        stringify(user.addressBook),
        stringify(user.referrals),
        stringify(user.recentSessions),
        stringify(user.kycChecklist),
      ],
    );
  }

  for (const transaction of seedTransactions) {
    await pool.query(
      `INSERT INTO transactions (id, user_id, type, asset, amount, channel, destination, status, created_at_label, from_asset, to_asset, which_crypto, network_fee, rate)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [transaction.id, transaction.userId, transaction.type, transaction.asset, transaction.amount, transaction.channel, transaction.destination, transaction.status, transaction.createdAt, transaction.fromAsset, transaction.toAsset, transaction.whichCrypto, transaction.networkFee, transaction.rate],
    );
  }

  for (const item of seedKycCases) {
    await pool.query(
      `INSERT INTO kyc_cases (id, user_id, document_type, submitted_at_label, country, risk_level, status, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [item.id, item.userId, item.documentType, item.submittedAt, item.country, item.riskLevel, item.status, item.note],
    );
  }

  for (const [settingKey, settingValue] of Object.entries(seedSettings)) {
    await pool.query(
      `INSERT INTO settings (setting_key, setting_value) VALUES ($1, $2)`,
      [settingKey, JSON.stringify(settingValue)],
    );
  }

  await pool.end();
  console.log('Database created and seeded successfully.');
};

setup().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
