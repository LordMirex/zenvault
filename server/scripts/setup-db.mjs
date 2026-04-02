import 'dotenv/config';
import Database from 'better-sqlite3';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { hashSecret } from '../auth.mjs';
import {
  seedKycCases,
  seedSettings,
  seedTransactions,
  seedUsers,
} from '../data/seed.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = process.env.SQLITE_DB_PATH
  ? resolve(process.env.SQLITE_DB_PATH)
  : resolve(__dirname, '../data/qfs_wallet.db');

const stringify = (value) => JSON.stringify(value ?? []);

const setup = async () => {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    DROP TABLE IF EXISTS settings;
    DROP TABLE IF EXISTS kyc_cases;
    DROP TABLE IF EXISTS transactions;
    DROP TABLE IF EXISTS users;

    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      role TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT DEFAULT '',
      city TEXT DEFAULT '',
      uuid TEXT DEFAULT '',
      country TEXT DEFAULT '',
      desk_label TEXT DEFAULT '',
      tier TEXT DEFAULT '',
      status TEXT DEFAULT '',
      kyc_status TEXT DEFAULT '',
      risk_level TEXT DEFAULT '',
      portfolio_usd REAL DEFAULT 0,
      available_usd REAL DEFAULT 0,
      portfolio_change_usd REAL DEFAULT 0,
      portfolio_change_pct REAL DEFAULT 0,
      wallet_connected INTEGER DEFAULT 1,
      plan_name TEXT DEFAULT '',
      last_seen TEXT DEFAULT '',
      note TEXT,
      password_hash TEXT NOT NULL,
      passcode_hash TEXT NOT NULL,
      holdings_json TEXT NOT NULL,
      cards_json TEXT NOT NULL,
      deposit_activity_json TEXT NOT NULL,
      withdrawal_activity_json TEXT NOT NULL,
      notifications_json TEXT NOT NULL,
      address_book_json TEXT NOT NULL,
      referrals_json TEXT NOT NULL,
      sessions_json TEXT NOT NULL,
      kyc_checklist_json TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE transactions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      asset TEXT NOT NULL,
      amount TEXT NOT NULL,
      channel TEXT DEFAULT '',
      destination TEXT DEFAULT '',
      status TEXT NOT NULL,
      created_at_label TEXT DEFAULT '',
      from_asset TEXT DEFAULT '',
      to_asset TEXT DEFAULT '',
      which_crypto TEXT DEFAULT '',
      network_fee TEXT DEFAULT '',
      rate TEXT DEFAULT ''
    );

    CREATE TABLE kyc_cases (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      document_type TEXT NOT NULL,
      submitted_at_label TEXT DEFAULT '',
      country TEXT DEFAULT '',
      risk_level TEXT DEFAULT '',
      status TEXT DEFAULT '',
      note TEXT
    );

    CREATE TABLE settings (
      setting_key TEXT PRIMARY KEY,
      setting_value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TRIGGER settings_updated_at
    AFTER UPDATE ON settings
    BEGIN
      UPDATE settings SET updated_at = datetime('now') WHERE setting_key = NEW.setting_key;
    END;
  `);

  const insertUser = db.prepare(`
    INSERT INTO users (
      id, role, name, email, phone, city, uuid, country, desk_label, tier, status, kyc_status, risk_level,
      portfolio_usd, available_usd, portfolio_change_usd, portfolio_change_pct, wallet_connected, plan_name,
      last_seen, note, password_hash, passcode_hash, holdings_json, cards_json, deposit_activity_json,
      withdrawal_activity_json, notifications_json, address_book_json, referrals_json, sessions_json, kyc_checklist_json
    ) VALUES (
      @id, @role, @name, @email, @phone, @city, @uuid, @country, @desk_label, @tier, @status, @kyc_status, @risk_level,
      @portfolio_usd, @available_usd, @portfolio_change_usd, @portfolio_change_pct, @wallet_connected, @plan_name,
      @last_seen, @note, @password_hash, @passcode_hash, @holdings_json, @cards_json, @deposit_activity_json,
      @withdrawal_activity_json, @notifications_json, @address_book_json, @referrals_json, @sessions_json, @kyc_checklist_json
    )
  `);

  for (const user of seedUsers) {
    insertUser.run({
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city,
      uuid: user.uuid,
      country: user.country,
      desk_label: user.deskLabel,
      tier: user.tier,
      status: user.status,
      kyc_status: user.kycStatus,
      risk_level: user.riskLevel,
      portfolio_usd: user.portfolioUsd,
      available_usd: user.availableUsd,
      portfolio_change_usd: user.portfolioChangeUsd,
      portfolio_change_pct: user.portfolioChangePct,
      wallet_connected: user.walletConnected ? 1 : 0,
      plan_name: user.plan,
      last_seen: user.lastSeen,
      note: user.note,
      password_hash: await hashSecret(user.password),
      passcode_hash: await hashSecret(user.passcode),
      holdings_json: stringify(user.holdings),
      cards_json: stringify(user.cards),
      deposit_activity_json: stringify(user.depositActivity),
      withdrawal_activity_json: stringify(user.withdrawalActivity),
      notifications_json: stringify(user.notifications),
      address_book_json: stringify(user.addressBook),
      referrals_json: stringify(user.referrals),
      sessions_json: stringify(user.recentSessions),
      kyc_checklist_json: stringify(user.kycChecklist),
    });
  }

  const insertTxn = db.prepare(`
    INSERT INTO transactions (id, user_id, type, asset, amount, channel, destination, status, created_at_label, from_asset, to_asset, which_crypto, network_fee, rate)
    VALUES (@id, @user_id, @type, @asset, @amount, @channel, @destination, @status, @created_at_label, @from_asset, @to_asset, @which_crypto, @network_fee, @rate)
  `);

  for (const t of seedTransactions) {
    insertTxn.run({
      id: t.id,
      user_id: t.userId,
      type: t.type,
      asset: t.asset,
      amount: t.amount,
      channel: t.channel,
      destination: t.destination,
      status: t.status,
      created_at_label: t.createdAt,
      from_asset: t.fromAsset,
      to_asset: t.toAsset,
      which_crypto: t.whichCrypto,
      network_fee: t.networkFee,
      rate: t.rate,
    });
  }

  const insertKyc = db.prepare(`
    INSERT INTO kyc_cases (id, user_id, document_type, submitted_at_label, country, risk_level, status, note)
    VALUES (@id, @user_id, @document_type, @submitted_at_label, @country, @risk_level, @status, @note)
  `);

  for (const item of seedKycCases) {
    insertKyc.run({
      id: item.id,
      user_id: item.userId,
      document_type: item.documentType,
      submitted_at_label: item.submittedAt,
      country: item.country,
      risk_level: item.riskLevel,
      status: item.status,
      note: item.note,
    });
  }

  const insertSetting = db.prepare(`
    INSERT INTO settings (setting_key, setting_value) VALUES (@setting_key, @setting_value)
  `);

  for (const [key, value] of Object.entries(seedSettings)) {
    insertSetting.run({ setting_key: key, setting_value: JSON.stringify(value) });
  }

  db.close();
  console.log('Database created and seeded successfully.');
};

setup().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
