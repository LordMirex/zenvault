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

test('buildConfig auto-generates a secret when given a known placeholder JWT', () => {
  const config = buildConfig({ JWT_SECRET: 'change-this-secret' });
  assert.ok(config.jwtSecret, 'jwtSecret should be set');
  assert.ok(config.jwtSecret !== 'change-this-secret', 'placeholder should be replaced');
  assert.ok(config.jwtSecret.length >= 32, 'auto-generated secret should be at least 32 chars');
});

test('buildConfig works in production without CLIENT_ORIGIN set', () => {
  const config = buildConfig({
    NODE_ENV: 'production',
    JWT_SECRET: '12345678901234567890123456789012-secure',
    CLIENT_ORIGIN: '',
  });

  assert.equal(config.isProduction, true);
  assert.equal(config.clientOrigin, '');
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
