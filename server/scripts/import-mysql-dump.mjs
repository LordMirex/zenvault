import { createReadStream } from 'fs';
import { readFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DUMP_FILE = process.argv[2];
if (!DUMP_FILE) {
  console.error('Usage: node import-mysql-dump.mjs <path-to-dump.sql>');
  process.exit(1);
}

const DB_PATH = process.env.SQLITE_DB_PATH
  ? resolve(process.env.SQLITE_DB_PATH)
  : resolve(__dirname, '../data/qfs_wallet.db');

console.log(`Reading dump: ${DUMP_FILE}`);
console.log(`Target DB:    ${DB_PATH}`);

const content = await readFile(DUMP_FILE, 'utf8');

// ── Generic MySQL VALUES row parser ──────────────────────────────────────────
// Splits a multi-row INSERT VALUES block into individual row arrays.
// Handles embedded escaped quotes, JSON blobs, and multi-line values.
function parseInsertValues(block) {
  const rows = [];
  let row = [];
  let field = '';
  let inStr = false;
  let i = 0;

  // Skip leading '(' and trailing ';'
  while (i < block.length && block[i] !== '(') i++;

  while (i < block.length) {
    const ch = block[i];

    if (!inStr) {
      if (ch === '(') {
        // start of new row
        row = [];
        field = '';
        i++;
        continue;
      }
      if (ch === ')') {
        row.push(unescapeMySQL(field));
        rows.push(row);
        field = '';
        i++;
        continue;
      }
      if (ch === ',') {
        // comma between fields OR between rows — distinguish by context
        // if next non-space char is '(' it's between rows, else between fields
        let j = i + 1;
        while (j < block.length && (block[j] === ' ' || block[j] === '\n' || block[j] === '\r')) j++;
        if (block[j] === '(') {
          // between rows — already pushed row above
          i = j;
          continue;
        }
        // between fields
        row.push(unescapeMySQL(field));
        field = '';
        i++;
        continue;
      }
      if (ch === "'") {
        inStr = true;
        i++;
        continue;
      }
      if (ch === 'N' && block.slice(i, i + 4) === 'NULL') {
        field += '\0NULL\0'; // sentinel
        i += 4;
        continue;
      }
      field += ch;
    } else {
      // inside string
      if (ch === '\\' && i + 1 < block.length) {
        field += ch + block[i + 1];
        i += 2;
        continue;
      }
      if (ch === "'") {
        // check for MySQL '' escape (two single-quotes)
        if (block[i + 1] === "'") {
          field += "''";
          i += 2;
          continue;
        }
        inStr = false;
        i++;
        continue;
      }
      field += ch;
    }
    i++;
  }

  return rows;
}

function unescapeMySQL(raw) {
  if (raw === '\0NULL\0') return null;
  // Remove any surrounding whitespace (numeric values)
  const trimmed = raw.trim();
  // Unescape MySQL string escapes
  return trimmed
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\');
}

// ── Extract INSERT block by table name ────────────────────────────────────────
function extractInsertBlock(sql, tableName) {
  const re = new RegExp(
    `INSERT INTO \`${tableName}\` VALUES\\s*\\n([\\s\\S]*?);\\s*\\/\\*`,
    'm'
  );
  const m = sql.match(re);
  if (!m) return null;
  return m[1];
}

// ── Open SQLite ───────────────────────────────────────────────────────────────
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = OFF');

console.log('\n── Importing settings ──────────────────────────────────────');
const settingsBlock = extractInsertBlock(content, 'settings');
if (settingsBlock) {
  const rows = parseInsertValues(settingsBlock);
  const upsert = db.prepare(
    `INSERT INTO settings (setting_key, setting_value)
     VALUES (?, ?)
     ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value`
  );
  const run = db.transaction((rows) => {
    for (const [key, value] of rows) {
      upsert.run(key, value);
      console.log(`  ✓ settings[${key}]`);
    }
  });
  run(rows);
} else {
  console.log('  ✗ No settings block found');
}

console.log('\n── Importing users ─────────────────────────────────────────');
const usersBlock = extractInsertBlock(content, 'users');
if (usersBlock) {
  const rows = parseInsertValues(usersBlock);
  const upsert = db.prepare(
    `INSERT INTO users (
       id, role, name, email, phone, city, uuid, country, desk_label, tier,
       status, kyc_status, risk_level, portfolio_usd, available_usd,
       portfolio_change_usd, portfolio_change_pct, wallet_connected, plan_name,
       last_seen, note, password_hash, passcode_hash, holdings_json, cards_json,
       deposit_activity_json, withdrawal_activity_json, notifications_json,
       address_book_json, referrals_json, sessions_json, kyc_checklist_json
     ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET
       role=excluded.role, name=excluded.name, email=excluded.email,
       phone=excluded.phone, city=excluded.city, uuid=excluded.uuid,
       country=excluded.country, desk_label=excluded.desk_label,
       tier=excluded.tier, status=excluded.status, kyc_status=excluded.kyc_status,
       risk_level=excluded.risk_level, portfolio_usd=excluded.portfolio_usd,
       available_usd=excluded.available_usd,
       portfolio_change_usd=excluded.portfolio_change_usd,
       portfolio_change_pct=excluded.portfolio_change_pct,
       wallet_connected=excluded.wallet_connected, plan_name=excluded.plan_name,
       last_seen=excluded.last_seen, note=excluded.note,
       password_hash=excluded.password_hash, passcode_hash=excluded.passcode_hash,
       holdings_json=excluded.holdings_json, cards_json=excluded.cards_json,
       deposit_activity_json=excluded.deposit_activity_json,
       withdrawal_activity_json=excluded.withdrawal_activity_json,
       notifications_json=excluded.notifications_json,
       address_book_json=excluded.address_book_json,
       referrals_json=excluded.referrals_json,
       sessions_json=excluded.sessions_json,
       kyc_checklist_json=excluded.kyc_checklist_json`
  );
  const run = db.transaction((rows) => {
    for (const row of rows) {
      // MySQL dump has 33 columns (id..kyc_checklist_json + created_at)
      // We take the first 32 (drop created_at)
      const cols = row.slice(0, 32);
      upsert.run(...cols);
      console.log(`  ✓ user[${cols[0]}] ${cols[2]} <${cols[3]}>`);
    }
  });
  run(rows);
} else {
  console.log('  ✗ No users block found');
}

console.log('\n── Importing transactions ───────────────────────────────────');
const txBlock = extractInsertBlock(content, 'transactions');
if (txBlock) {
  const rows = parseInsertValues(txBlock);
  const upsert = db.prepare(
    `INSERT INTO transactions (
       id, user_id, type, asset, amount, channel, destination, status,
       created_at_label, from_asset, to_asset, which_crypto, network_fee, rate
     ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET
       user_id=excluded.user_id, type=excluded.type, asset=excluded.asset,
       amount=excluded.amount, channel=excluded.channel,
       destination=excluded.destination, status=excluded.status,
       created_at_label=excluded.created_at_label, from_asset=excluded.from_asset,
       to_asset=excluded.to_asset, which_crypto=excluded.which_crypto,
       network_fee=excluded.network_fee, rate=excluded.rate`
  );
  const run = db.transaction((rows) => {
    for (const row of rows) {
      upsert.run(...row);
      console.log(`  ✓ txn[${row[0]}]`);
    }
  });
  run(rows);
} else {
  console.log('  ✗ No transactions block found');
}

console.log('\n── Importing KYC cases ──────────────────────────────────────');
const kycBlock = extractInsertBlock(content, 'kyc_cases');
if (kycBlock) {
  const rows = parseInsertValues(kycBlock);
  const upsert = db.prepare(
    `INSERT INTO kyc_cases (
       id, user_id, document_type, submitted_at_label, country, risk_level, status, note
     ) VALUES (?,?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET
       user_id=excluded.user_id, document_type=excluded.document_type,
       submitted_at_label=excluded.submitted_at_label, country=excluded.country,
       risk_level=excluded.risk_level, status=excluded.status, note=excluded.note`
  );
  const run = db.transaction((rows) => {
    for (const row of rows) {
      upsert.run(...row);
      console.log(`  ✓ kyc[${row[0]}]`);
    }
  });
  run(rows);
} else {
  console.log('  ✗ No kyc_cases block found');
}

db.close();
console.log('\n✅ Import complete.');
