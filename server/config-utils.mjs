const insecureJwtSecrets = new Set([
  '',
  'change-this-secret',
  'qfs-wallet-dev-secret',
  'replace-with-your-own-64-character-random-secret',
  'replace-me',
  'dev-secret',
  'secret',
]);

const toTrimmedString = (value, fallback = '') => String(value ?? fallback).trim();

const parsePort = (value, fallback) => {
  const parsed = Number(value ?? fallback);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const buildConfig = (env = process.env) => {
  const nodeEnv = toTrimmedString(env.NODE_ENV, 'development') || 'development';
  const isProduction = nodeEnv === 'production';
  const jwtSecret = toTrimmedString(env.JWT_SECRET);

  if (!jwtSecret) {
    throw new Error('JWT_SECRET must be set before the API starts.');
  }

  if (jwtSecret.length < 32 || insecureJwtSecrets.has(jwtSecret)) {
    throw new Error('JWT_SECRET must be at least 32 characters and must not use a placeholder value.');
  }

  const clientOrigin = toTrimmedString(env.CLIENT_ORIGIN, isProduction ? '' : 'http://localhost:5173');

  if (isProduction && !clientOrigin) {
    throw new Error('CLIENT_ORIGIN must be set in production.');
  }

  return {
    nodeEnv,
    isProduction,
    apiPort: parsePort(env.API_PORT, 4000),
    sqliteDbPath: toTrimmedString(env.SQLITE_DB_PATH, '') || null,
    jwtSecret,
    clientOrigin,
    accessTokenTtl: toTrimmedString(env.ACCESS_TOKEN_TTL, '12h') || '12h',
    pendingTokenTtl: toTrimmedString(env.PENDING_TOKEN_TTL, '10m') || '10m',
  };
};
