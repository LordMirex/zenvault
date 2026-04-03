import Database from 'better-sqlite3';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = resolve(__dirname, 'data', 'qfs_wallet.db');

let db;

export const getDb = () => {
  if (!db) {
    db = new Database(DB_PATH);
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
