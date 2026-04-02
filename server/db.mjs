import pg from 'pg';

const { Pool } = pg;
let pool;

export const getPool = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
};

function convertNamedParams(sql, params = {}) {
  const values = [];
  const text = sql.replace(/:([a-zA-Z_]\w*)/g, (_, name) => {
    if (!(name in params)) throw new Error(`Missing named param: ${name}`);
    values.push(params[name]);
    return `$${values.length}`;
  });
  return { text, values };
}

export const query = async (sql, params = {}) => {
  const { text, values } = convertNamedParams(sql, params);
  const result = await getPool().query(text, values);
  return result.rows;
};

export const queryOne = async (sql, params = {}) => {
  const rows = await query(sql, params);
  return rows[0] ?? null;
};

export const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
};
