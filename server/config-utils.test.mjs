import test from 'node:test';
import assert from 'node:assert/strict';
import { buildConfig } from './config-utils.mjs';

test('buildConfig accepts a secure development configuration', () => {
  const config = buildConfig({
    JWT_SECRET: '12345678901234567890123456789012-secure',
  });

  assert.equal(config.apiPort, 4000);
  assert.equal(config.accessTokenTtl, '12h');
  assert.equal(config.isProduction, false);
});

test('buildConfig rejects placeholder JWT secrets', () => {
  assert.throws(
    () => buildConfig({ JWT_SECRET: 'change-this-secret' }),
    /JWT_SECRET must be at least 32 characters/,
  );
});

test('buildConfig rejects missing CLIENT_ORIGIN in production', () => {
  assert.throws(
    () => buildConfig({
      NODE_ENV: 'production',
      JWT_SECRET: '12345678901234567890123456789012-secure',
      CLIENT_ORIGIN: '',
    }),
    /CLIENT_ORIGIN must be set in production/,
  );
});

test('buildConfig accepts valid production configuration', () => {
  const config = buildConfig({
    NODE_ENV: 'production',
    JWT_SECRET: '12345678901234567890123456789012-secure',
    CLIENT_ORIGIN: 'https://wallet.example.com',
  });

  assert.equal(config.isProduction, true);
  assert.equal(config.clientOrigin, 'https://wallet.example.com');
});
