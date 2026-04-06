import Database from 'better-sqlite3';
import { copyFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BUNDLE_DB_PATH = resolve(__dirname, 'data', 'qfs_wallet.db');
const VERCEL_TMP_PATH = '/tmp/qfs_wallet.db';

const resolveDbPath = () => {
  if (process.env.VERCEL) {
    if (!existsSync(VERCEL_TMP_PATH)) {
      copyFileSync(BUNDLE_DB_PATH, VERCEL_TMP_PATH);
    }
    return VERCEL_TMP_PATH;
  }
  if (process.env.SQLITE_DB_PATH) {
    return process.env.SQLITE_DB_PATH;
  }
  return BUNDLE_DB_PATH;
};

let db;

export const getDb = () => {
  if (!db) {
    db = new Database(resolveDbPath());
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
};

function convertNamedParams(sql) {
  return sql.replace(/:([a-zA-Z_]\w*)/g, '@$1');
}

export const query = async (sql, params = {}) => {
  const text = convertNamedParams(sql);
  const stmt = getDb().prepare(text);
  const upper = text.trimStart().toUpperCase();
  if (upper.startsWith('SELECT') || upper.startsWith('WITH')) {
    return stmt.all(params);
  }
  stmt.run(params);
  return [];
};

export const queryOne = async (sql, params = {}) => {
  const text = convertNamedParams(sql);
  const stmt = getDb().prepare(text);
  return stmt.get(params) ?? null;
};

export const closeDb = () => {
  if (db) {
    db.close();
    db = undefined;
  }
};
