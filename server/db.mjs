import pg from 'pg';

const { Pool } = pg;

let pool;

export const getPool = () => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set. Add it to your environment variables.');
    }
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    pool.on('error', (err) => {
      console.error('[db] Unexpected pool error:', err.message);
    });
  }
  return pool;
};

// Convert :named params to $1, $2... positional params for PostgreSQL
const convertNamedParams = (sql, params = {}) => {
  const values = [];
  const seen = {};
  let counter = 0;

  const text = sql.replace(/:([a-zA-Z_]\w*)/g, (_, name) => {
    if (!(name in seen)) {
      seen[name] = ++counter;
      values.push(params[name] ?? null);
    }
    return `$${seen[name]}`;
  });

  return { text, values };
};

export const query = async (sql, params = {}) => {
  const { text, values } = convertNamedParams(sql, params);
  const result = await getPool().query(text, values);
  return result.rows;
};

export const queryOne = async (sql, params = {}) => {
  const { text, values } = convertNamedParams(sql, params);
  const result = await getPool().query(text, values);
  return result.rows[0] ?? null;
};

export const closeDb = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};
