import test from 'node:test';
import assert from 'node:assert/strict';
import { buildConfig } from './config-utils.mjs';

test('buildConfig accepts a secure development configuration', () => {
  const config = buildConfig({
    JWT_SECRET: '12345678901234567890123456789012-secure',
  });

  assert.equal(config.apiPort, 4000);
  assert.equal(config.dbUser, 'root');
  assert.equal(config.accessTokenTtl, '12h');
});

test('buildConfig rejects placeholder JWT secrets', () => {
  assert.throws(
    () => buildConfig({ JWT_SECRET: 'change-this-secret' }),
    /JWT_SECRET must be at least 32 characters/,
  );
});

test('buildConfig rejects production root database users', () => {
  assert.throws(
    () => buildConfig({
      NODE_ENV: 'production',
      JWT_SECRET: '12345678901234567890123456789012-secure',
      DB_USER: 'root',
      DB_PASSWORD: 'hard-to-guess-password',
      CLIENT_ORIGIN: 'https://wallet.example.com',
    }),
    /DB_USER must not be root in production/,
  );
});

test('buildConfig rejects empty production database passwords', () => {
  assert.throws(
    () => buildConfig({
      NODE_ENV: 'production',
      JWT_SECRET: '12345678901234567890123456789012-secure',
      DB_USER: 'wallet_app',
      DB_PASSWORD: '',
      CLIENT_ORIGIN: 'https://wallet.example.com',
    }),
    /DB_PASSWORD must be set in production/,
  );
});
