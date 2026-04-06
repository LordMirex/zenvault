import test from 'node:test';
import assert from 'node:assert/strict';
import {
  describeDevice,
  describeLocation,
  findActiveSession,
  generateRecoveryCodes,
  issueSession,
  normalizeTwoFactorState,
  revokeOtherSessions,
  revokeSession,
} from './session-utils.mjs';

test('generateRecoveryCodes creates non-empty unique looking codes', () => {
  const codes = generateRecoveryCodes(4);

  assert.equal(codes.length, 4);
  assert.equal(new Set(codes).size, 4);
  assert.ok(codes.every((code) => /^[A-F0-9]{4}-[A-F0-9]{4}$/.test(code)));
});

test('normalizeTwoFactorState strips invalid recovery codes', () => {
  const state = normalizeTwoFactorState({
    enabled: true,
    recoveryCodes: ['A1B2-C3D4', '', null, 'E5F6-G7H8'],
  });

  assert.equal(state.enabled, true);
  assert.deepEqual(state.recoveryCodes, ['A1B2-C3D4', 'E5F6-G7H8']);
});

test('issueSession marks the latest session as current and preserves older sessions', () => {
  const sessions = issueSession(
    [{ id: 'older', device: 'Windows Chrome desktop', location: 'Private network', status: 'Current session', lastSeen: 'Yesterday' }],
    { sessionId: 'current', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0', ipAddress: '192.168.1.20', lastSeen: 'Now' },
  );

  assert.equal(sessions[0].id, 'current');
  assert.equal(sessions[0].status, 'Current session');
  assert.equal(sessions[1].status, 'Active');
});

test('revokeSession revokes the targeted session', () => {
  const result = revokeSession(
    [{ id: 'current', device: 'Windows Chrome desktop', location: 'Private network', status: 'Current session', lastSeen: 'Now' }],
    'current',
    'Signed out',
  );

  assert.equal(result.found, true);
  assert.equal(result.sessions[0].status, 'Revoked');
  assert.equal(result.sessions[0].lastSeen, 'Signed out');
});

test('revokeOtherSessions keeps the active session and revokes the rest', () => {
  const sessions = revokeOtherSessions(
    [
      { id: 'current', device: 'Windows Chrome desktop', location: 'Private network', status: 'Current session', lastSeen: 'Now' },
      { id: 'older', device: 'macOS Safari desktop', location: 'Remote network', status: 'Active', lastSeen: 'Yesterday' },
    ],
    'current',
    'Password changed',
  );

  assert.equal(findActiveSession(sessions, 'current')?.status, 'Current session');
  assert.equal(sessions[1].status, 'Revoked');
});

test('device and location descriptions are user friendly', () => {
  assert.equal(describeDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Version/17.0 Mobile/15E148 Safari/604.1'), 'iOS Safari mobile');
  assert.equal(describeLocation('127.0.0.1'), 'Localhost session');
  assert.equal(describeLocation('192.168.10.22'), 'Private network');
  assert.equal(describeLocation('8.8.8.8'), 'Remote network');
});
